import pool from '@/lib/db';
import { requireRole } from '@/lib/auth-server';
import { toCamelCase } from '@/lib/api-utils';
import { computeLifecycle } from '@/lib/lifecycle';
import type { UserStatus, OnboardingStatus } from '@/types';

export async function GET() {
  try {
    const auth = await requireRole('manager', 'admin');
    if (auth.error) return auth.error;

    const { rows } = await pool.query(
      `SELECT a.*, p.full_name, p.email, p.phone, p.avatar_url, p.status as user_status
       FROM agents a
       JOIN profiles p ON p.id = a.user_id
       ORDER BY a.created_at DESC`
    );

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
