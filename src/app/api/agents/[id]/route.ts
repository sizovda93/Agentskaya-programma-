import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { rows } = await pool.query(
    `SELECT a.*, p.full_name, p.email, p.phone, p.avatar_url, p.status as user_status
     FROM agents a
     JOIN profiles p ON p.id = a.user_id
     WHERE a.id = $1`,
    [id]
  );
  if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(rows[0]);
}
