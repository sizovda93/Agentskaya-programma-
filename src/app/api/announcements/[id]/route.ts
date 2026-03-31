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

    if (body.title !== undefined) { updates.push(`title = $${idx}`); values.push(body.title); idx++; }
    if (body.content !== undefined) { updates.push(`content = $${idx}`); values.push(body.content); idx++; }
    if (body.type !== undefined) { updates.push(`type = $${idx}`); values.push(body.type); idx++; }
    if (body.isActive !== undefined) { updates.push(`is_active = $${idx}`); values.push(body.isActive); idx++; }

    if (updates.length === 0) return Response.json({ error: 'Nothing to update' }, { status: 400 });

    values.push(id);
    await pool.query(`UPDATE announcements SET ${updates.join(', ')} WHERE id = $${idx}`, values);

    return Response.json({ ok: true });
  } catch (err) {
    console.error('PATCH /api/announcements/[id] error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireRole('admin');
    if (auth.error) return auth.error;
    const { id } = await params;

    await pool.query('DELETE FROM announcements WHERE id = $1', [id]);
    return Response.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/announcements/[id] error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
