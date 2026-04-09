import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/auth-server';
import { toCamelCase } from '@/lib/api-utils';

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { user } = auth;
    const isAdmin = user.role === 'admin' || user.role === 'manager';

    const { rows } = await pool.query(
      `SELECT a.id, a.title, a.type, a.content, a.image_url, a.is_active, a.created_at,
              a.author_name, a.author_id,
              (SELECT COUNT(*)::int FROM announcement_comments ac WHERE ac.announcement_id = a.id) as comment_count
       FROM announcements a
       ${isAdmin ? '' : 'WHERE a.is_active = true'}
       ORDER BY a.created_at DESC
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
    const auth = await requireRole('admin', 'manager');
    if (auth.error) return auth.error;
    const { user } = auth;

    const { title, type, content, imageUrl } = await request.json();
    if (!title?.trim() || !content?.trim()) {
      return Response.json({ error: 'Title and content required' }, { status: 400 });
    }
    if (!['news', 'giveaway', 'update'].includes(type)) {
      return Response.json({ error: 'Invalid type' }, { status: 400 });
    }

    const { rows } = await pool.query(
      `INSERT INTO announcements (title, type, content, image_url, author_id, author_name)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title.trim(), type, content.trim(), imageUrl || null, user.id, user.fullName]
    );

    return Response.json(toCamelCase(rows[0]));
  } catch (err) {
    console.error('POST /api/announcements error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
