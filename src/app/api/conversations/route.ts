import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth-server';
import { toCamelCase } from '@/lib/api-utils';

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    let query = `SELECT c.*,
       pa.full_name as agent_name,
       pm.full_name as manager_name
     FROM conversations c
     LEFT JOIN agents ag ON ag.id = c.agent_id
     LEFT JOIN profiles pa ON pa.id = ag.user_id
     LEFT JOIN profiles pm ON pm.id = c.manager_id`;
    const params: string[] = [];

    if (user.role === 'agent' && user.agentId) {
      query += ` WHERE c.agent_id = $1`;
      params.push(user.agentId);
    } else if (user.role === 'manager') {
      query += ` WHERE c.manager_id = $1`;
      params.push(user.id);
    }

    query += ` ORDER BY c.last_message_at DESC`;

    const { rows } = await pool.query(query, params);
    return Response.json(toCamelCase(rows));
  } catch (err) {
    console.error('GET /api/conversations error:', err);
    return Response.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    if (user.role !== 'agent' || !user.agentId) {
      return Response.json({ error: 'Только партнёр может создать диалог' }, { status: 403 });
    }

    // Get agent's assigned manager
    const { rows: agentRows } = await pool.query(
      `SELECT manager_id FROM agents WHERE id = $1`,
      [user.agentId]
    );

    if (agentRows.length === 0 || !agentRows[0].manager_id) {
      return Response.json({ error: 'За вами не закреплён менеджер' }, { status: 400 });
    }

    const managerId = agentRows[0].manager_id;

    // Check if conversation already exists
    const { rows: existing } = await pool.query(
      `SELECT c.*, pa.full_name as agent_name, pm.full_name as manager_name
       FROM conversations c
       LEFT JOIN agents ag ON ag.id = c.agent_id
       LEFT JOIN profiles pa ON pa.id = ag.user_id
       LEFT JOIN profiles pm ON pm.id = c.manager_id
       WHERE c.agent_id = $1 AND c.manager_id = $2
       LIMIT 1`,
      [user.agentId, managerId]
    );

    if (existing.length > 0) {
      return Response.json(toCamelCase(existing[0]));
    }

    // Create new conversation
    const { rows: created } = await pool.query(
      `INSERT INTO conversations (agent_id, manager_id, status, channel)
       VALUES ($1, $2, 'active', 'web')
       RETURNING *`,
      [user.agentId, managerId]
    );

    // Fetch with names
    const { rows: full } = await pool.query(
      `SELECT c.*, pa.full_name as agent_name, pm.full_name as manager_name
       FROM conversations c
       LEFT JOIN agents ag ON ag.id = c.agent_id
       LEFT JOIN profiles pa ON pa.id = ag.user_id
       LEFT JOIN profiles pm ON pm.id = c.manager_id
       WHERE c.id = $1`,
      [created[0].id]
    );

    return Response.json(toCamelCase(full[0]), { status: 201 });
  } catch (err) {
    console.error('POST /api/conversations error:', err);
    return Response.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
