import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/auth-server';
import { toCamelCase } from '@/lib/api-utils';

// GET — public (any authed user), returns active tickers
export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { rows } = await pool.query(
      `SELECT id, type, text, is_active, created_at FROM ticker_entries ORDER BY created_at DESC`
    );
    return Response.json(toCamelCase(rows));
  } catch (err) {
    console.error('GET /api/tickers error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST — admin only, create ticker entry
export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole('admin');
    if (auth.error) return auth.error;

    const { type, text } = await request.json();
    if (!type || !text?.trim()) {
      return Response.json({ error: 'Type and text required' }, { status: 400 });
    }
    if (!['payout', 'court'].includes(type)) {
      return Response.json({ error: 'Invalid type' }, { status: 400 });
    }

    const { rows } = await pool.query(
      `INSERT INTO ticker_entries (type, text) VALUES ($1, $2) RETURNING *`,
      [type, text.trim()]
    );

    return Response.json(toCamelCase(rows[0]));
  } catch (err) {
    console.error('POST /api/tickers error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
