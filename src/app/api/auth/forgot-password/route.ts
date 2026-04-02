import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { notifyAgent } from "@/lib/telegram";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Укажите email" }, { status: 400 });
    }

    // Find user
    const { rows: users } = await pool.query(
      `SELECT id, full_name, status FROM profiles WHERE LOWER(email) = LOWER($1)`,
      [email.trim()]
    );

    if (users.length === 0) {
      // Don't reveal whether email exists
      return NextResponse.json({ sent: true, channel: "telegram" });
    }

    const user = users[0];
    if (user.status === "blocked") {
      return NextResponse.json({ error: "Аккаунт заблокирован" }, { status: 403 });
    }

    // Check if Telegram is linked
    const { rows: tgRows } = await pool.query(
      `SELECT telegram_chat_id FROM telegram_bindings
       WHERE profile_id = $1 AND is_active = true LIMIT 1`,
      [user.id]
    );

    if (tgRows.length === 0) {
      return NextResponse.json({
        sent: false,
        channel: "none",
        message: "Telegram не привязан. Обратитесь к менеджеру для сброса пароля."
      });
    }

    // Invalidate old tokens
    await pool.query(
      `UPDATE password_reset_tokens SET used = true WHERE profile_id = $1 AND used = false`,
      [user.id]
    );

    // Generate 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));

    // Save token (15 min expiry)
    await pool.query(
      `INSERT INTO password_reset_tokens (profile_id, code, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '15 minutes')`,
      [user.id, code]
    );

    // Send via Telegram
    const sent = await notifyAgent(
      user.id,
      `🔑 Код для сброса пароля: ${code}\n\nДействителен 15 минут.\nЕсли вы не запрашивали сброс — проигнорируйте это сообщение.`
    );

    if (!sent) {
      return NextResponse.json({
        sent: false,
        channel: "none",
        message: "Не удалось отправить код в Telegram. Обратитесь к менеджеру."
      });
    }

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (action, user_email, details, level)
       VALUES ('auth.password_reset_requested', $1, 'Code sent via Telegram', 'info')`,
      [email]
    );

    return NextResponse.json({ sent: true, channel: "telegram" });
  } catch (err) {
    console.error("forgot-password error:", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
