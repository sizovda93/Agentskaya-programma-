import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/auth-server';
import { toCamelCase } from '@/lib/api-utils';

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { user } = auth;
    const isAdmin = user.role === 'admin';

    const { rows } = await pool.query(
      `SELECT id, title, type, content, image_url, is_active, created_at
       FROM announcements
       ${isAdmin ? '' : 'WHERE is_active = true'}
       ORDER BY created_at DESC
       LIMIT 50`
    );

    return Response.json(toCamelCase(rows));
  } catch (err) {
    console.error('GET /api/announcements error:', err);
    return Response.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole('admin');
    if (auth.error) return auth.error;

    const { title, type, content } = await request.json();
    if (!title?.trim() || !content?.trim()) {
      return Response.json({ error: 'Title and content required' }, { status: 400 });
    }
    if (!['news', 'giveaway', 'update'].includes(type)) {
      return Response.json({ error: 'Invalid type' }, { status: 400 });
    }

    const { rows } = await pool.query(
      `INSERT INTO announcements (title, type, content) VALUES ($1, $2, $3) RETURNING *`,
      [title.trim(), type, content.trim()]
    );

    return Response.json(toCamelCase(rows[0]));
  } catch (err) {
    console.error('POST /api/announcements error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
