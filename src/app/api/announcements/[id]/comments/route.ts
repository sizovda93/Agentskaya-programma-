import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth-server';
import { toCamelCase } from '@/lib/api-utils';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user } = auth;
    const { id } = await params;

    const { rows } = await pool.query(
      `SELECT ac.id, ac.announcement_id, ac.user_id, ac.user_name, ac.user_role, ac.text, ac.created_at
       FROM announcement_comments ac
       WHERE ac.announcement_id = $1
       ORDER BY ac.created_at ASC`,
      [id]
    );

    // For agents viewing other agents' comments: show initials only for "foreign" agents
    const result = rows.map((r) => {
      const comment = toCamelCase(r) as Record<string, unknown>;
      // If viewer is agent and comment is from a different agent — show initials
      if (user.role === 'agent' && r.user_role === 'agent' && r.user_id !== user.id) {
        const parts = (r.user_name as string).split(' ');
        const masked = parts[0] + (parts[1] ? ' ' + parts[1][0] + '.' : '') + (parts[2] ? parts[2][0] + '.' : '');
        comment.userName = masked;
      }
      return comment;
    });

    return Response.json(result);
  } catch (err) {
    console.error('GET comments error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user } = auth;
    const { id } = await params;

    const { text } = await request.json();
    if (!text?.trim()) {
      return Response.json({ error: 'Текст обязателен' }, { status: 400 });
    }

    const { rows } = await pool.query(
      `INSERT INTO announcement_comments (announcement_id, user_id, user_name, user_role, text)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, user.id, user.fullName, user.role, text.trim()]
    );

    return Response.json(toCamelCase(rows[0]), { status: 201 });
  } catch (err) {
    console.error('POST comments error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
