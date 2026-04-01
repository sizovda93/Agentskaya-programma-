import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/auth-server';
import { toCamelCase } from '@/lib/api-utils';

// GET — any authed user sees active contracts
export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const isAdmin = auth.user.role === 'admin';
    const { rows } = await pool.query(
      `SELECT * FROM agent_contracts ${isAdmin ? '' : 'WHERE is_active = true'} ORDER BY created_at DESC`
    );
    return Response.json(toCamelCase(rows));
  } catch (err) {
    console.error('GET /api/contracts error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST — admin uploads contract (file_url from /api/upload)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole('admin');
    if (auth.error) return auth.error;

    const { title, fileUrl } = await request.json();
    if (!title?.trim() || !fileUrl?.trim()) {
      return Response.json({ error: 'Title and fileUrl required' }, { status: 400 });
    }

    const { rows } = await pool.query(
      `INSERT INTO agent_contracts (title, file_url, uploaded_by) VALUES ($1, $2, $3) RETURNING *`,
      [title.trim(), fileUrl.trim(), auth.user.id]
    );

    return Response.json(toCamelCase(rows[0]));
  } catch (err) {
    console.error('POST /api/contracts error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
