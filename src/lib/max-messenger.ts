import pool from './db';

const MAX_API = 'https://platform-api.max.ru';

function getMaxToken(): string {
  return process.env.MAX_BOT_TOKEN || '';
}

interface MaxResponse {
  success?: boolean;
  message?: { body?: { mid?: string }; recipient?: { chat_id?: number } };
  error?: string;
  code?: string;
  [key: string]: unknown;
}

async function callMaxApi(method: string, endpoint: string, body?: Record<string, unknown>): Promise<MaxResponse> {
  const token = getMaxToken();
  if (!token) throw new Error('MAX_BOT_TOKEN not configured');

  const res = await fetch(`${MAX_API}${endpoint}`, {
    method,
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  return res.json() as Promise<MaxResponse>;
}

// ==================== Public API ====================

export async function sendMaxMessage(chatId: number | string, text: string): Promise<MaxResponse> {
  return callMaxApi('POST', '/messages', {
    chat_id: chatId,
    text: { body: text },
  });
}

export async function getMaxMe(): Promise<MaxResponse> {
  return callMaxApi('GET', '/me');
}

export async function setMaxWebhook(url: string): Promise<MaxResponse> {
  const secret = process.env.MAX_WEBHOOK_SECRET || '';
  const body: Record<string, unknown> = {
    url,
    update_types: ['message_created', 'bot_started'],
  };
  if (secret) body.secret = secret;
  return callMaxApi('POST', '/subscriptions', body);
}

export async function deleteMaxWebhook(): Promise<MaxResponse> {
  return callMaxApi('DELETE', '/subscriptions');
}

export function validateMaxWebhookSecret(headerValue: string | null): boolean {
  const secret = process.env.MAX_WEBHOOK_SECRET || '';
  if (!secret) {
    // Fail-closed in production: reject if secret is not configured
    if (process.env.NODE_ENV === 'production') return false;
    return true; // dev convenience only
  }
  return headerValue === secret;
}

// ==================== Notification helper ====================

export async function notifyAgentViaMax(profileId: string, text: string): Promise<boolean> {
  try {
    const { rows } = await pool.query(
      `SELECT max_chat_id FROM max_bindings
       WHERE profile_id = $1 AND is_active = true LIMIT 1`,
      [profileId]
    );
    if (rows.length === 0) return false;

    const result = await sendMaxMessage(rows[0].max_chat_id, text);

    if (result.code === 'attachment.not.ready' || result.error) {
      await pool.query(
        `INSERT INTO audit_logs (action, user_email, details, level)
         VALUES ('max.send_error', NULL, $1, 'warning')`,
        [`Profile ${profileId}: ${result.error || result.code}`]
      );
      return false;
    }

    return true;
  } catch (err) {
    console.error('notifyAgentViaMax error:', err);
    return false;
  }
}
