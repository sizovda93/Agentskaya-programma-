import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireRole } from '@/lib/auth-server';
import { toCamelCase } from '@/lib/api-utils';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const auth = await requireRole('manager', 'admin');
    if (auth.error) return auth.error;
    const { user } = auth;

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const validStatuses = ['pending', 'processing', 'paid', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return Response.json({ error: 'Некорректный статус' }, { status: 400 });
    }

    const existing = await pool.query(`SELECT * FROM payouts WHERE id = $1`, [id]);
    if (existing.rows.length === 0) {
      return Response.json({ error: 'Выплата не найдена' }, { status: 404 });
    }

    const payout = existing.rows[0];

    if (payout.status === 'paid') {
      return Response.json({ error: 'Нельзя изменить уже выплаченную' }, { status: 400 });
    }

    const { rows } = await pool.query(
      `UPDATE payouts SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    await pool.query(
      `INSERT INTO audit_logs (action, user_email, details) VALUES ('payout.status_changed', $1, $2)`,
      [user.email, `Выплата ${id}: ${payout.status} → ${status}`]
    );

    return Response.json(toCamelCase(rows[0]));
  } catch (err) {
    console.error('PATCH /api/payouts/[id] error:', err);
    return Response.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
