import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const { rows } = await pool.query(
    `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100`
  );
  return NextResponse.json(rows);
}
