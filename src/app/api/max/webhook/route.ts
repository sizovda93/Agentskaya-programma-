import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { sendMaxMessage, validateMaxWebhookSecret } from '@/lib/max-messenger';

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function POST(request: NextRequest) {
  try {
    // Validate secret
    const secretHeader = request.headers.get('x-max-bot-api-secret');
    if (!validateMaxWebhookSecret(secretHeader)) {
      return new Response('Forbidden', { status: 403 });
    }

    const update = await request.json();
    const updateType = update.update_type;

    // ==================== bot_started — linking ====================
    if (updateType === 'bot_started') {
      const payload = update.payload;
      const chatId = update.chat?.chat_id;
      const user = update.user;
      if (payload && chatId && user) {
        await handleStartCommand(chatId, user.user_id, user, payload);
      }
      return new Response('OK', { status: 200 });
    }

    // ==================== message_created — inbound message ====================
    if (updateType === 'message_created') {
      const msg = update.message;
      if (!msg?.body?.text || !msg?.sender) {
        return new Response('OK', { status: 200 });
      }

      const chatId = msg.recipient?.chat_id;
      const userId = msg.sender.user_id;
      const text = msg.body.text.trim();
      const messageId = msg.body.mid || String(Date.now());

      if (!chatId || !userId || !text) {
        return new Response('OK', { status: 200 });
      }

      // /unlink command
      if (text === '/unlink') {
        await handleUnlink(chatId, userId);
        return new Response('OK', { status: 200 });
      }

      // Regular message — inbound to conversation
      await handleInboundMessage(chatId, userId, text, messageId, msg.sender);

      return new Response('OK', { status: 200 });
    }

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('MAX webhook error:', err);
    await pool.query(
      `INSERT INTO audit_logs (action, details, level) VALUES ('max.webhook_error', $1, 'error')`,
      [String(err)]
    ).catch(() => {});
    return new Response('OK', { status: 200 });
  }
}

// ==================== Handlers ====================

async function handleStartCommand(chatId: number, maxUserId: number, user: any, token: string) {
  // Find valid token
  const { rows: tokenRows } = await pool.query(
    `SELECT * FROM max_link_tokens
     WHERE token = $1 AND used = false AND expires_at > NOW() LIMIT 1`,
    [token]
  );

  if (tokenRows.length === 0) {
    await sendMaxMessage(chatId, 'Ссылка недействительна или истекла. Запросите новую в кабинете платформы.');
    return;
  }

  const linkToken = tokenRows[0];

  // Check if this max_user_id is already linked to another profile
  const { rows: existingBind } = await pool.query(
    `SELECT profile_id FROM max_bindings WHERE max_user_id = $1 AND is_active = true LIMIT 1`,
    [maxUserId]
  );

  if (existingBind.length > 0 && existingBind[0].profile_id !== linkToken.profile_id) {
    await sendMaxMessage(chatId, 'Этот аккаунт MAX уже привязан к другому пользователю. Отвяжите командой /unlink.');
    return;
  }

  // Deactivate old binding for this profile
  await pool.query(
    `UPDATE max_bindings SET is_active = false WHERE profile_id = $1 AND is_active = true`,
    [linkToken.profile_id]
  );

  // Remove stale inactive bindings
  await pool.query(
    `DELETE FROM max_bindings WHERE max_user_id = $1 AND is_active = false`,
    [maxUserId]
  );

  // Create binding
  await pool.query(
    `INSERT INTO max_bindings (profile_id, max_user_id, max_chat_id, max_username, max_first_name)
     VALUES ($1, $2, $3, $4, $5)`,
    [linkToken.profile_id, maxUserId, chatId, user.username || null, user.name || null]
  );

  // Mark token as used
  await pool.query(`UPDATE max_link_tokens SET used = true WHERE id = $1`, [linkToken.id]);

  // Get user name
  const { rows: profileRows } = await pool.query(
    `SELECT full_name FROM profiles WHERE id = $1`,
    [linkToken.profile_id]
  );
  const userName = profileRows[0]?.full_name || 'пользователь';

  await sendMaxMessage(chatId,
    `Привязка выполнена! Аккаунт "${userName}" подключён.\n\nТеперь вы будете получать уведомления в MAX.\n\nОтключить: /unlink`
  );

  await pool.query(
    `INSERT INTO audit_logs (action, details)
     VALUES ('max.linked', $1)`,
    [`Profile ${linkToken.profile_id} linked to max_user_id ${maxUserId}`]
  );
}

async function handleUnlink(chatId: number, maxUserId: number) {
  const { rows } = await pool.query(
    `UPDATE max_bindings SET is_active = false
     WHERE max_user_id = $1 AND is_active = true RETURNING profile_id`,
    [maxUserId]
  );

  if (rows.length === 0) {
    await sendMaxMessage(chatId, 'Ваш MAX не привязан ни к какому аккаунту.');
    return;
  }

  await sendMaxMessage(chatId, 'Привязка отключена. Вы больше не будете получать уведомления.');
}

async function handleInboundMessage(chatId: number, maxUserId: number, text: string, messageId: string, sender: any) {
  // Find binding
  const { rows: bindRows } = await pool.query(
    `SELECT mb.profile_id, mb.last_conversation_id, p.full_name, a.id as agent_id
     FROM max_bindings mb
     JOIN profiles p ON p.id = mb.profile_id
     LEFT JOIN agents a ON a.user_id = mb.profile_id
     WHERE mb.max_user_id = $1 AND mb.is_active = true LIMIT 1`,
    [maxUserId]
  );

  if (bindRows.length === 0) {
    await sendMaxMessage(chatId, 'Ваш MAX не привязан к аккаунту. Привяжите через кабинет платформы.');
    return;
  }

  const binding = bindRows[0];

  // Dedup
  const { rows: dupCheck } = await pool.query(
    `SELECT id FROM messages WHERE external_id = $1 LIMIT 1`,
    [`max_${messageId}`]
  );
  if (dupCheck.length > 0) return;

  // Find conversation
  let conversationId = binding.last_conversation_id;

  if (conversationId) {
    const { rows: convCheck } = await pool.query(
      `SELECT id FROM conversations WHERE id = $1 AND status IN ('active', 'waiting')`,
      [conversationId]
    );
    if (convCheck.length === 0) conversationId = null;
  }

  if (!conversationId && binding.agent_id) {
    const { rows: recentConv } = await pool.query(
      `SELECT id FROM conversations
       WHERE agent_id = $1 AND status IN ('active', 'waiting')
       ORDER BY last_message_at DESC NULLS LAST LIMIT 1`,
      [binding.agent_id]
    );
    if (recentConv.length > 0) conversationId = recentConv[0].id;
  }

  if (!conversationId) {
    await sendMaxMessage(chatId, 'Нет активных диалогов. Дождитесь сообщения от менеджера или откройте платформу.');
    return;
  }

  // Insert message
  await pool.query(
    `INSERT INTO messages (conversation_id, sender_type, sender_name, text, channel, external_id, status)
     VALUES ($1, 'agent', $2, $3, 'web', $4, 'delivered')`,
    [conversationId, binding.full_name, text, `max_${messageId}`]
  );

  await pool.query(
    `UPDATE conversations SET last_message = $1, last_message_at = NOW(), unread_count = unread_count + 1
     WHERE id = $2`,
    [text.substring(0, 255), conversationId]
  );

  await pool.query(
    `UPDATE max_bindings SET last_conversation_id = $1
     WHERE max_user_id = $2 AND is_active = true`,
    [conversationId, maxUserId]
  );
}
