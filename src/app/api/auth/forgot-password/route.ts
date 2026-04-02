import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { notifyAgent } from "@/lib/telegram";
import { sendResetCode } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Укажите email" }, { status: 400 });
    }

    // Find user
    const { rows: users } = await pool.query(
      `SELECT id, full_name, email, status FROM profiles WHERE LOWER(email) = LOWER($1)`,
      [email.trim()]
    );

    if (users.length === 0) {
      // Don't reveal whether email exists
      return NextResponse.json({ sent: true, channel: "email" });
    }

    const user = users[0];
    if (user.status === "blocked") {
      return NextResponse.json({ error: "Аккаунт заблокирован" }, { status: 403 });
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

    // Try Telegram first
    const { rows: tgRows } = await pool.query(
      `SELECT telegram_chat_id FROM telegram_bindings
       WHERE profile_id = $1 AND is_active = true LIMIT 1`,
      [user.id]
    );

    let channel = "";

    if (tgRows.length > 0) {
      const tgSent = await notifyAgent(
        user.id,
        `🔑 Код для сброса пароля: ${code}\n\nДействителен 15 минут.\nЕсли вы не запрашивали сброс — проигнорируйте это сообщение.`
      );
      if (tgSent) channel = "telegram";
    }

    // If Telegram failed or not linked — send email
    if (!channel) {
      const emailSent = await sendResetCode(user.email, code);
      if (emailSent) {
        channel = "email";
      } else {
        return NextResponse.json({
          sent: false,
          channel: "none",
          message: "Не удалось отправить код. Обратитесь к менеджеру."
        });
      }
    }

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (action, user_email, details, level)
       VALUES ('auth.password_reset_requested', $1, $2, 'info')`,
      [email, `Code sent via ${channel}`]
    );

    return NextResponse.json({ sent: true, channel });
  } catch (err) {
    console.error("forgot-password error:", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
