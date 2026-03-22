import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireRole } from '@/lib/auth-server';
import { toCamelCase } from '@/lib/api-utils';
import { computeLifecycle } from '@/lib/lifecycle';
import type { UserStatus, OnboardingStatus } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole('manager', 'admin');
    if (auth.error) return auth.error;
    const { user } = auth;

    // ?unassigned=true — show agents without manager (for "claim" UI)
    const showUnassigned = request.nextUrl.searchParams.get('unassigned') === 'true';

    let query = `SELECT a.*, p.full_name, p.email, p.phone, p.avatar_url, p.status as user_status,
                        pm.full_name as manager_name
                 FROM agents a
                 JOIN profiles p ON p.id = a.user_id
                 LEFT JOIN profiles pm ON pm.id = a.manager_id`;
    const params: string[] = [];

    if (showUnassigned) {
      // Any manager/admin can see unassigned agents
      query += ` WHERE a.manager_id IS NULL`;
    } else if (user.role === 'manager') {
      // Manager sees only their agents
      query += ` WHERE a.manager_id = $1`;
      params.push(user.id);
    }
    // Admin sees all agents (no filter)

    query += ` ORDER BY a.created_at DESC`;

    const { rows } = await pool.query(query, params);

    const result = rows.map((row) => {
      const lifecycle = computeLifecycle(
        row.user_status as UserStatus,
        row.onboarding_status as OnboardingStatus,
        row.total_leads
      );
      return { ...(toCamelCase(row) as Record<string, unknown>), lifecycle };
    });

    return Response.json(result);
  } catch (err) {
    console.error('GET /api/agents error:', err);
    return Response.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
