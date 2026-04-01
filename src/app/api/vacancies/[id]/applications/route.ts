import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireRole } from '@/lib/auth-server';
import { toCamelCase } from '@/lib/api-utils';

// GET — admin views applications for a vacancy
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireRole('admin');
    if (auth.error) return auth.error;
    const { id } = await params;

    const { rows } = await pool.query(
      `SELECT va.*, p.email, a.partner_number
       FROM vacancy_applications va
       JOIN profiles p ON p.id = va.user_id
       LEFT JOIN agents a ON a.user_id = va.user_id
       WHERE va.vacancy_id = $1
       ORDER BY va.created_at DESC`,
      [id]
    );

    return Response.json(toCamelCase(rows));
  } catch (err) {
    console.error('GET /api/vacancies/[id]/applications error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH — admin updates application status
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireRole('admin');
    if (auth.error) return auth.error;
    const { id } = await params;

    const { applicationId, status } = await request.json();
    if (!applicationId || !['reviewed', 'accepted', 'rejected'].includes(status)) {
      return Response.json({ error: 'Invalid params' }, { status: 400 });
    }

    await pool.query(
      'UPDATE vacancy_applications SET status = $1 WHERE id = $2 AND vacancy_id = $3',
      [status, applicationId, id]
    );

    return Response.json({ ok: true });
  } catch (err) {
    console.error('PATCH /api/vacancies/[id]/applications error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
