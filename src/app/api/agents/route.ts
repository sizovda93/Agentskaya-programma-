import pool from '@/lib/db';
import { requireRole } from '@/lib/auth-server';
import { toCamelCase } from '@/lib/api-utils';

export async function GET() {
  try {
    const auth = await requireRole('manager', 'admin');
    if (auth.error) return auth.error;

    const { rows } = await pool.query(
      `SELECT a.*, p.full_name, p.email, p.phone, p.avatar_url, p.status as user_status
       FROM agents a
       JOIN profiles p ON p.id = a.user_id
       ORDER BY a.created_at DESC`
    );
    return Response.json(toCamelCase(rows));
  } catch (err) {
    console.error('GET /api/agents error:', err);
    return Response.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
