import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth-server';
import { toCamelCase } from '@/lib/api-utils';

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { rows } = await pool.query(
      `SELECT id, title, type, content, image_url, created_at
       FROM announcements
       WHERE is_active = true
       ORDER BY created_at DESC
       LIMIT 20`
    );

    return Response.json(toCamelCase(rows));
  } catch (err) {
    console.error('GET /api/announcements error:', err);
    return Response.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
