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
    const { rows } = await pool.query(
      `SELECT l.*,
         ag.id as agent_uuid,
         pa.full_name as agent_name,
         pm.full_name as manager_name
       FROM leads l
       LEFT JOIN agents ag ON ag.id = l.assigned_agent_id
       LEFT JOIN profiles pa ON pa.id = ag.user_id
       LEFT JOIN profiles pm ON pm.id = l.assigned_manager_id
       WHERE l.id = $1`,
      [id]
    );
    if (rows.length === 0) return Response.json({ error: 'Не найдено' }, { status: 404 });

    // Агент видит только свои лиды
    if (user.role === 'agent' && rows[0].assigned_agent_id !== user.agentId) {
      return Response.json({ error: 'Доступ запрещён' }, { status: 403 });
    }

    return Response.json(toCamelCase(rows[0]));
  } catch (err) {
    console.error('GET /api/leads/[id] error:', err);
    return Response.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
