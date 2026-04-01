import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/auth-server';
import { toCamelCase } from '@/lib/api-utils';

// GET — list vacancies (agent: active only, admin: all)
export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const isAdmin = auth.user.role === 'admin';
    const { rows } = await pool.query(
      `SELECT * FROM vacancies ${isAdmin ? '' : 'WHERE is_active = true'} ORDER BY created_at DESC`
    );
    return Response.json(toCamelCase(rows));
  } catch (err) {
    console.error('GET /api/vacancies error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST — admin creates vacancy
export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole('admin');
    if (auth.error) return auth.error;

    const { title, description, requirements, conditions, salaryFrom, salaryTo, isRemote } = await request.json();
    if (!title?.trim() || !description?.trim()) {
      return Response.json({ error: 'Title and description required' }, { status: 400 });
    }

    const { rows } = await pool.query(
      `INSERT INTO vacancies (title, description, requirements, conditions, salary_from, salary_to, is_remote)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title.trim(), description.trim(), requirements || null, conditions || null, salaryFrom || null, salaryTo || null, isRemote ?? false]
    );

    return Response.json(toCamelCase(rows[0]));
  } catch (err) {
    console.error('POST /api/vacancies error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
