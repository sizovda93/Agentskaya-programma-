import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth-server";

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Заполните все поля" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Новый пароль минимум 6 символов" }, { status: 400 });
    }

    // Verify current password
    const { rows } = await pool.query(
      `SELECT password_hash FROM profiles WHERE id = $1`,
      [user.id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Неверный текущий пароль" }, { status: 400 });
    }

    // Update password
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      `UPDATE profiles SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
      [hash, user.id]
    );

    await pool.query(
      `INSERT INTO audit_logs (action, user_email, details, level)
       VALUES ('auth.password_changed', $1, 'Password changed by user', 'info')`,
      [user.email]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("change-password error:", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
