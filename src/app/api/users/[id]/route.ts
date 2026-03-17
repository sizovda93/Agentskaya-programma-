import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth-server';
import { toCamelCase } from '@/lib/api-utils';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    const { id } = await params;

    const isAdmin = user.role === 'admin';
    const isSelf = user.id === id;

    if (!isAdmin && !isSelf) {
      return Response.json({ error: 'Доступ запрещён' }, { status: 403 });
    }

    const existing = await pool.query(`SELECT * FROM profiles WHERE id = $1`, [id]);
    if (existing.rows.length === 0) {
      return Response.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    const body = await request.json();
    const updates: string[] = [];
    const values: (string | null)[] = [];
    let idx = 1;

    // Поля, которые может менять сам пользователь
    const selfFields: Record<string, string> = {
      fullName: 'full_name',
      phone: 'phone',
      avatarUrl: 'avatar_url',
    };

    // Поля, которые может менять только админ
    const adminFields: Record<string, string> = {
      role: 'role',
      status: 'status',
    };

    const allowedFields = isAdmin ? { ...selfFields, ...adminFields } : selfFields;

    for (const [camelKey, dbCol] of Object.entries(allowedFields)) {
      if (body[camelKey] !== undefined) {
        updates.push(`${dbCol} = $${idx}`);
        values.push(body[camelKey]);
        idx++;
      }
    }

    if (updates.length === 0) {
      return Response.json({ error: 'Нет полей для обновления' }, { status: 400 });
    }

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE profiles SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, role, full_name, email, phone, avatar_url, status, created_at`,
      values
    );

    await pool.query(
      `INSERT INTO audit_logs (action, user_email, details) VALUES ('user.updated', $1, $2)`,
      [user.email, `Пользователь ${id}: ${updates.map(u => u.split(' = ')[0]).join(', ')}`]
    );

    return Response.json(toCamelCase(rows[0]));
  } catch (err) {
    console.error('PUT /api/users/[id] error:', err);
    return Response.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
