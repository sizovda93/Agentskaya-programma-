import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth-server';
import { toCamelCase } from '@/lib/api-utils';

type RouteContext = { params: Promise<{ id: string }> };

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

function cleanText(text: string): string {
  return (text || '').replace(UUID_RE, '').replace(/\s{2,}/g, ' ').replace(/[:\s]+$/, '').trim();
}

function formatDescription(eventType: string, rawDetails: string, leadName: string): string {
  const details = (rawDetails || '').trim();
  const cleaned = cleanText(details);

  switch (eventType) {
    case 'lead_created':
    case 'created':
      return leadName ? `Создан лид: ${leadName}` : 'Создан лид';
    case 'ownership_assigned':
      return 'Назначен исполнитель';
    case 'assigned':
      return 'Назначен менеджер';
    case 'status_changed':
      return cleaned ? `Изменён статус: ${cleaned}` : 'Изменён статус';
    case 'contacted':
      return 'Установлен контакт';
    case 'qualified':
      return 'Лид квалифицирован';
    case 'proposal':
      return 'Отправлено предложение';
    case 'negotiation':
      return 'Идут переговоры';
    case 'won':
      return 'Договор заключён';
    case 'lost':
      return cleaned ? `Лид потерян: ${cleaned}` : 'Лид потерян';
    case 'comment_added':
      return cleaned ? `Комментарий: ${cleaned}` : 'Добавлен комментарий';
    case 'duplicate_detected':
      if (/email/i.test(details)) return 'Совпадение с другим лидом по email';
      if (/phone|телефон/i.test(details)) return 'Совпадение по телефону';
      return 'Обнаружен возможный дубликат';
    case 'note':
      return cleaned ? `Заметка: ${cleaned}` : 'Заметка';
    default:
      if (cleaned) return cleaned;
      return 'Событие';
  }
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;

    const { rows: leadRows } = await pool.query(
      `SELECT full_name FROM leads WHERE id = $1`,
      [id]
    );
    const leadName = leadRows[0]?.full_name || '';

    const { rows } = await pool.query(
      `SELECT id, lead_id, event_type, details, actor_email, created_at
       FROM lead_events WHERE lead_id = $1 ORDER BY created_at ASC`,
      [id]
    );

    const formatted = rows.map((r: any) => ({
      id: r.id,
      lead_id: r.lead_id,
      type: r.event_type,
      description: formatDescription(r.event_type, r.details, leadName),
      actor_email: r.actor_email,
      created_at: r.created_at,
    }));

    return Response.json(toCamelCase(formatted));
  } catch (err) {
    console.error('GET /api/leads/[id]/events error:', err);
    return Response.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
