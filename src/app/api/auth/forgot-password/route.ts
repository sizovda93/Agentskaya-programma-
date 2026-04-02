import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { notifyAgent } from "@/lib/telegram";
import { sendResetCode } from "@/lib/mailer";

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

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
      return NextResponse.json({ sent: true, channel: "email" });
    }

    const user = users[0];
    if (user.status === "blocked") {
      return NextResponse.json({ error: "Аккаунт заблокирован" }, { status: 403 });
    }

    // Generate temp password and set it
    const tempPassword = generateTempPassword();
    const hash = await bcrypt.hash(tempPassword, 10);

    await pool.query(
      `UPDATE profiles SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
      [hash, user.id]
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
        `🔑 Ваш временный пароль: ${tempPassword}\n\nИспользуйте его для входа. После входа рекомендуем сменить пароль в профиле.\n\nЕсли вы не запрашивали сброс — срочно обратитесь к менеджеру.`
      );
      if (tgSent) channel = "telegram";
    }

    // If Telegram failed or not linked — send email
    if (!channel) {
      const emailSent = await sendResetCode(user.email, tempPassword);
      if (emailSent) {
        channel = "email";
      } else {
        return NextResponse.json({
          sent: false,
          channel: "none",
          message: "Не удалось отправить пароль. Обратитесь к менеджеру."
        });
      }
    }

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (action, user_email, details, level)
       VALUES ('auth.password_reset', $1, $2, 'info')`,
      [email, `Temp password sent via ${channel}`]
    );

    return NextResponse.json({ sent: true, channel });
  } catch (err) {
    console.error("forgot-password error:", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
