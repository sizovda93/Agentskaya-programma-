import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/auth-server';
import { toCamelCase } from '@/lib/api-utils';

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    let query = `SELECT l.*,
       ag.id as agent_uuid,
       pa.full_name as agent_name,
       pm.full_name as manager_name
     FROM leads l
     LEFT JOIN agents ag ON ag.id = l.assigned_agent_id
     LEFT JOIN profiles pa ON pa.id = ag.user_id
     LEFT JOIN profiles pm ON pm.id = l.assigned_manager_id`;
    const params: string[] = [];

    if (user.role === 'agent' && user.agentId) {
      query += ` WHERE l.assigned_agent_id = $1`;
      params.push(user.agentId);
    }

    query += ` ORDER BY l.created_at DESC`;

    const { rows } = await pool.query(query, params);
    return Response.json(toCamelCase(rows));
  } catch (err) {
    console.error('GET /api/leads error:', err);
    return Response.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole('manager', 'admin');
    if (auth.error) return auth.error;
    const { user } = auth;

    const body = await request.json();
    const { fullName, phone, email, city, source, assignedAgentId, comment, estimatedValue } = body;

    if (!fullName || !phone) {
      return Response.json({ error: 'ФИО и телефон обязательны' }, { status: 400 });
    }

    const validSources = ['website', 'telegram', 'whatsapp', 'referral', 'cold', 'partner'];
    const leadSource = validSources.includes(source) ? source : 'website';

    // Если назначен агент — проверяем что он существует
    if (assignedAgentId) {
      const agentCheck = await pool.query('SELECT id FROM agents WHERE id = $1', [assignedAgentId]);
      if (agentCheck.rows.length === 0) {
        return Response.json({ error: 'Агент не найден' }, { status: 400 });
      }
    }

    const { rows } = await pool.query(
      `INSERT INTO leads (full_name, phone, email, city, source, assigned_agent_id, assigned_manager_id, comment, estimated_value)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        fullName,
        phone,
        email || null,
        city || '',
        leadSource,
        assignedAgentId || null,
        user.id,
        comment || null,
        estimatedValue || null,
      ]
    );

    // Обновляем active_leads у агента
    if (assignedAgentId) {
      await pool.query(
        `UPDATE agents SET active_leads = (SELECT count(*) FROM leads WHERE assigned_agent_id = $1 AND status NOT IN ('won','lost'))
         WHERE id = $1`,
        [assignedAgentId]
      );
    }

    await pool.query(
      `INSERT INTO audit_logs (action, user_email, details) VALUES ('lead.created', $1, $2)`,
      [user.email, `Лид: ${fullName}, телефон: ${phone}`]
    );

    return Response.json(toCamelCase(rows[0]), { status: 201 });
  } catch (err) {
    console.error('POST /api/leads error:', err);
    return Response.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
