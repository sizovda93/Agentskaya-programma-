import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth-server';
import { toCamelCase } from '@/lib/api-utils';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    const { id } = await params;
    const conversation = await pool.query(
      `SELECT c.*,
         pa.full_name as agent_name,
         pm.full_name as manager_name
       FROM conversations c
       LEFT JOIN agents ag ON ag.id = c.agent_id
       LEFT JOIN profiles pa ON pa.id = ag.user_id
       LEFT JOIN profiles pm ON pm.id = c.manager_id
       WHERE c.id = $1`,
      [id]
    );
    if (conversation.rows.length === 0) return Response.json({ error: 'Не найдено' }, { status: 404 });

    // Агент видит только свои диалоги
    if (user.role === 'agent' && conversation.rows[0].agent_id !== user.agentId) {
      return Response.json({ error: 'Доступ запрещён' }, { status: 403 });
    }

    const messages = await pool.query(
      `SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
      [id]
    );

    const result = { ...conversation.rows[0], messages: messages.rows };
    return Response.json(toCamelCase(result));
  } catch (err) {
    console.error('GET /api/conversations/[id] error:', err);
    return Response.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
