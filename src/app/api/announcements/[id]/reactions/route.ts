import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth-server';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user } = auth;
    const { id } = await params;

    // Get reaction counts grouped by emoji
    const { rows: counts } = await pool.query(
      `SELECT emoji, COUNT(*)::int as count
       FROM announcement_reactions WHERE announcement_id = $1
       GROUP BY emoji ORDER BY count DESC`,
      [id]
    );

    // Get current user's reactions
    const { rows: mine } = await pool.query(
      `SELECT emoji FROM announcement_reactions WHERE announcement_id = $1 AND user_id = $2`,
      [id, user.id]
    );

    return Response.json({
      counts,
      myReactions: mine.map((r) => r.emoji),
    });
  } catch (err) {
    console.error('GET reactions error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user } = auth;
    const { id } = await params;

    const { emoji } = await request.json();
    const validEmojis = ['👍', '❤️', '🔥', '👏', '😊', '💪'];
    if (!validEmojis.includes(emoji)) {
      return Response.json({ error: 'Invalid emoji' }, { status: 400 });
    }

    // Toggle: if exists — remove, if not — add
    const { rows: existing } = await pool.query(
      `SELECT id FROM announcement_reactions WHERE announcement_id = $1 AND user_id = $2 AND emoji = $3`,
      [id, user.id, emoji]
    );

    if (existing.length > 0) {
      await pool.query(`DELETE FROM announcement_reactions WHERE id = $1`, [existing[0].id]);
      return Response.json({ action: 'removed' });
    } else {
      await pool.query(
        `INSERT INTO announcement_reactions (announcement_id, user_id, emoji) VALUES ($1, $2, $3)`,
        [id, user.id, emoji]
      );
      return Response.json({ action: 'added' });
    }
  } catch (err) {
    console.error('POST reactions error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
