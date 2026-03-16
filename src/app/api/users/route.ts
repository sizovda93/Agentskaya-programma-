import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const { rows } = await pool.query(
    `SELECT p.*, a.id as agent_id, a.city, a.specialization, a.active_leads, a.total_leads, a.total_revenue, a.onboarding_status, a.rating
     FROM profiles p
     LEFT JOIN agents a ON a.user_id = p.id
     ORDER BY p.created_at DESC`
  );
  return NextResponse.json(rows);
}
