import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: "Заполните все поля" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Пароль минимум 6 символов" }, { status: 400 });
    }

    // Find user
    const { rows: users } = await pool.query(
      `SELECT id FROM profiles WHERE LOWER(email) = LOWER($1)`,
      [email.trim()]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: "Неверный код" }, { status: 400 });
    }

    const userId = users[0].id;

    // Validate token
    const { rows: tokens } = await pool.query(
      `SELECT id FROM password_reset_tokens
       WHERE profile_id = $1 AND code = $2 AND used = false AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [userId, code.trim()]
    );

    if (tokens.length === 0) {
      return NextResponse.json({ error: "Неверный или просроченный код" }, { status: 400 });
    }

    // Mark token as used
    await pool.query(
      `UPDATE password_reset_tokens SET used = true WHERE id = $1`,
      [tokens[0].id]
    );

    // Update password
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      `UPDATE profiles SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
      [hash, userId]
    );

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (action, user_email, details, level)
       VALUES ('auth.password_reset_completed', $1, 'Password changed via reset code', 'info')`,
      [email]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("reset-password error:", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
