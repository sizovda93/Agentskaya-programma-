import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth-server';

// GET — load chat history
export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { rows } = await pool.query(
      `SELECT role, content FROM ai_chat_messages
       WHERE user_id = $1
       ORDER BY created_at ASC
       LIMIT 50`,
      [auth.user.id]
    );

    return Response.json(rows);
  } catch (err) {
    console.error('GET /api/chat/history error:', err);
    return Response.json([], { status: 500 });
  }
}

// POST — save a message
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { role, content } = await request.json();
    if (!role || !content) {
      return Response.json({ error: 'Missing fields' }, { status: 400 });
    }

    await pool.query(
      `INSERT INTO ai_chat_messages (user_id, role, content) VALUES ($1, $2, $3)`,
      [auth.user.id, role, content]
    );

    return Response.json({ ok: true });
  } catch (err) {
    console.error('POST /api/chat/history error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE — clear chat history
export async function DELETE() {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    await pool.query(
      `DELETE FROM ai_chat_messages WHERE user_id = $1`,
      [auth.user.id]
    );

    return Response.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/chat/history error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
