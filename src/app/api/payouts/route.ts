import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/auth-server';
import { toCamelCase } from '@/lib/api-utils';

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    let query = `SELECT * FROM payouts`;
    const params: string[] = [];

    if (user.role === 'agent' && user.agentId) {
      query += ` WHERE agent_id = $1`;
      params.push(user.agentId);
    }

    query += ` ORDER BY created_at DESC`;

    const { rows } = await pool.query(query, params);
    return Response.json(toCamelCase(rows));
  } catch (err) {
    console.error('GET /api/payouts error:', err);
    return Response.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
