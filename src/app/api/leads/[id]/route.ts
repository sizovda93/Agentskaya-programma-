import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth-server';
import { toCamelCase } from '@/lib/api-utils';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
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

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    const { id } = await params;

    // Загружаем текущий лид
    const existing = await pool.query('SELECT * FROM leads WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return Response.json({ error: 'Не найдено' }, { status: 404 });
    }
    const lead = existing.rows[0];

    // Агент может менять только свои лиды, и только статус
    if (user.role === 'agent') {
      if (lead.assigned_agent_id !== user.agentId) {
        return Response.json({ error: 'Доступ запрещён' }, { status: 403 });
      }
    }

    const body = await request.json();
    const allowedFields = ['status', 'comment', 'estimated_value', 'assigned_agent_id', 'city', 'full_name', 'phone', 'email', 'source'];
    // Агент может менять только status и comment
    const agentAllowed = ['status', 'comment'];
    // Агент не может ставить финансово значимые статусы
    const agentForbiddenStatuses = ['won', 'lost'];
    if (user.role === 'agent' && body.status && agentForbiddenStatuses.includes(body.status)) {
      return Response.json({ error: 'Агент не может устанавливать статус won/lost' }, { status: 403 });
    }

    const sets: string[] = [];
    const values: (string | number | null)[] = [];
    let paramIdx = 1;

    for (const [key, val] of Object.entries(body)) {
      // camelCase → snake_case
      const snakeKey = key.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase());
      if (!allowedFields.includes(snakeKey)) continue;
      if (user.role === 'agent' && !agentAllowed.includes(snakeKey)) continue;

      sets.push(`${snakeKey} = $${paramIdx}`);
      values.push(val as string | number | null);
      paramIdx++;
    }

    if (sets.length === 0) {
      return Response.json({ error: 'Нет полей для обновления' }, { status: 400 });
    }

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE leads SET ${sets.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
      values
    );

    const updated = rows[0];
    const oldStatus = lead.status;
    const newStatus = updated.status;

    // lead_events: смена статуса
    if (oldStatus !== newStatus) {
      await pool.query(
        `INSERT INTO lead_events (lead_id, event_type, actor_email, details) VALUES ($1, 'status_changed', $2, $3)`,
        [id, user.email, `${oldStatus} → ${newStatus}`]
      );
    }

    // lead_events: переназначение агента
    if (lead.assigned_agent_id !== updated.assigned_agent_id && updated.assigned_agent_id) {
      await pool.query(
        `INSERT INTO lead_events (lead_id, event_type, actor_email, details) VALUES ($1, 'agent_reassigned', $2, $3)`,
        [id, user.email, `Агент: ${lead.assigned_agent_id || 'нет'} → ${updated.assigned_agent_id}`]
      );
    }

    // Auto payout при переходе в won
    if (oldStatus !== 'won' && newStatus === 'won' && updated.assigned_agent_id && updated.estimated_value) {
      const settingsResult = await pool.query("SELECT value FROM settings WHERE key = 'commission_rate'");
      const rate = settingsResult.rows.length > 0 ? parseFloat(settingsResult.rows[0].value) : 0.30;
      const payoutAmount = parseFloat(updated.estimated_value) * rate;

      // Получаем имя агента
      const agentInfo = await pool.query(
        `SELECT a.id, p.full_name FROM agents a JOIN profiles p ON p.id = a.user_id WHERE a.id = $1`,
        [updated.assigned_agent_id]
      );

      if (agentInfo.rows.length > 0) {
        const now = new Date();
        const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        await pool.query(
          `INSERT INTO payouts (agent_id, agent_name, amount, period, description, lead_id)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (agent_id, lead_id) DO NOTHING`,
          [
            updated.assigned_agent_id,
            agentInfo.rows[0].full_name,
            payoutAmount,
            period,
            `Комиссия ${(rate * 100).toFixed(0)}% за лид: ${updated.full_name}`,
            updated.id,
          ]
        );

        // Обновляем total_revenue агента
        await pool.query(
          `UPDATE agents SET total_revenue = (SELECT COALESCE(SUM(amount),0) FROM payouts WHERE agent_id = $1 AND status IN ('pending','processing','paid'))
           WHERE id = $1`,
          [updated.assigned_agent_id]
        );

        // lead_events: автосоздание payout
        await pool.query(
          `INSERT INTO lead_events (lead_id, event_type, actor_email, details) VALUES ($1, 'payout_created', $2, $3)`,
          [id, user.email, `Автовыплата: ${payoutAmount.toFixed(2)} ₽ (${(rate * 100).toFixed(0)}%)`]
        );
      }
    }

    // Обновляем счётчики агента при смене статуса
    if (oldStatus !== newStatus && updated.assigned_agent_id) {
      await pool.query(
        `UPDATE agents SET
           active_leads = (SELECT count(*) FROM leads WHERE assigned_agent_id = $1 AND status NOT IN ('won','lost')),
           total_leads = (SELECT count(*) FROM leads WHERE assigned_agent_id = $1)
         WHERE id = $1`,
        [updated.assigned_agent_id]
      );
    }

    // Пересчитываем и для старого агента если был переназначен
    if (lead.assigned_agent_id && lead.assigned_agent_id !== updated.assigned_agent_id) {
      await pool.query(
        `UPDATE agents SET
           active_leads = (SELECT count(*) FROM leads WHERE assigned_agent_id = $1 AND status NOT IN ('won','lost')),
           total_leads = (SELECT count(*) FROM leads WHERE assigned_agent_id = $1)
         WHERE id = $1`,
        [lead.assigned_agent_id]
      );
    }

    await pool.query(
      `INSERT INTO audit_logs (action, user_email, details) VALUES ('lead.updated', $1, $2)`,
      [user.email, `Лид ${id}: ${JSON.stringify(body)}`]
    );

    return Response.json(toCamelCase(updated));
  } catch (err) {
    console.error('PATCH /api/leads/[id] error:', err);
    return Response.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
