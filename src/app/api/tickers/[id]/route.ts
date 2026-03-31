import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireRole } from '@/lib/auth-server';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireRole('admin');
    if (auth.error) return auth.error;
    const { id } = await params;

    const body = await request.json();
    const updates: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (body.text !== undefined) { updates.push(`text = $${idx}`); values.push(body.text); idx++; }
    if (body.isActive !== undefined) { updates.push(`is_active = $${idx}`); values.push(body.isActive); idx++; }

    if (updates.length === 0) return Response.json({ error: 'Nothing to update' }, { status: 400 });

    values.push(id);
    await pool.query(`UPDATE ticker_entries SET ${updates.join(', ')} WHERE id = $${idx}`, values);

    return Response.json({ ok: true });
  } catch (err) {
    console.error('PATCH /api/tickers/[id] error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireRole('admin');
    if (auth.error) return auth.error;
    const { id } = await params;

    await pool.query('DELETE FROM ticker_entries WHERE id = $1', [id]);
    return Response.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/tickers/[id] error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
