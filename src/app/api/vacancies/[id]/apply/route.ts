import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth-server';
import { toCamelCase } from '@/lib/api-utils';

// POST — agent applies to vacancy
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { id } = await params;

    // Check vacancy exists and is active
    const { rows: vac } = await pool.query('SELECT id FROM vacancies WHERE id = $1 AND is_active = true', [id]);
    if (vac.length === 0) return Response.json({ error: 'Вакансия не найдена' }, { status: 404 });

    // Check not already applied
    const { rows: existing } = await pool.query(
      'SELECT id FROM vacancy_applications WHERE vacancy_id = $1 AND user_id = $2', [id, auth.user.id]
    );
    if (existing.length > 0) return Response.json({ error: 'Вы уже откликнулись на эту вакансию' }, { status: 409 });

    const { fullName, phone, message } = await request.json();

    const { rows } = await pool.query(
      `INSERT INTO vacancy_applications (vacancy_id, user_id, full_name, phone, message)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, auth.user.id, fullName || auth.user.fullName, phone || null, message || null]
    );

    return Response.json(toCamelCase(rows[0]), { status: 201 });
  } catch (err) {
    console.error('POST /api/vacancies/[id]/apply error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
