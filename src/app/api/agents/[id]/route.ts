import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireRole } from '@/lib/auth-server';
import { toCamelCase } from '@/lib/api-utils';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireRole('manager', 'admin');
    if (auth.error) return auth.error;

    const { id } = await params;
    const { rows } = await pool.query(
      `SELECT a.*, p.full_name, p.email, p.phone, p.avatar_url, p.status as user_status
       FROM agents a
       JOIN profiles p ON p.id = a.user_id
       WHERE a.id = $1`,
      [id]
    );
    if (rows.length === 0) return Response.json({ error: 'Не найдено' }, { status: 404 });
    return Response.json(toCamelCase(rows[0]));
  } catch (err) {
    console.error('GET /api/agents/[id] error:', err);
    return Response.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
