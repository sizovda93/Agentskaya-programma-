import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth-server';
import { toCamelCase } from '@/lib/api-utils';

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    // Personal notifications
    const { rows: personal } = await pool.query(
      `SELECT id, title, message, type, read, created_at, 'notification' as source
       FROM notifications WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 20`,
      [user.id]
    );

    // Announcements (news/giveaways) — unread if created after user's last read
    const { rows: announcements } = await pool.query(
      `SELECT id, title, content as message, type, created_at, 'announcement' as source
       FROM announcements
       WHERE is_active = true
       ORDER BY created_at DESC LIMIT 10`
    );

    // Merge and sort
    const all = [
      ...personal.map((r: Record<string, unknown>) => toCamelCase(r)),
      ...announcements.map((r: Record<string, unknown>) => ({
        ...(toCamelCase(r) as Record<string, unknown>),
        read: false,
      })),
    ] as Record<string, unknown>[];

    all.sort((a, b) =>
      new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime()
    );

    return Response.json(all);
  } catch (err) {
    console.error('GET /api/notifications error:', err);
    return Response.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    const { id } = await request.json();

    if (id === 'all') {
      await pool.query(
        `UPDATE notifications SET read = true WHERE user_id = $1 AND read = false`,
        [user.id]
      );
    } else if (id) {
      await pool.query(
        `UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2`,
        [id, user.id]
      );
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error('PATCH /api/notifications error:', err);
    return Response.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
