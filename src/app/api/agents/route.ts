import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const { rows } = await pool.query(
    `SELECT a.*, p.full_name, p.email, p.phone, p.avatar_url, p.status as user_status
     FROM agents a
     JOIN profiles p ON p.id = a.user_id
     ORDER BY a.created_at DESC`
  );
  return NextResponse.json(rows);
}
