import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const { rows } = await pool.query(
    `SELECT c.*,
       pa.full_name as agent_name,
       pm.full_name as manager_name
     FROM conversations c
     LEFT JOIN agents ag ON ag.id = c.agent_id
     LEFT JOIN profiles pa ON pa.id = ag.user_id
     LEFT JOIN profiles pm ON pm.id = c.manager_id
     ORDER BY c.last_message_at DESC`
  );
  return NextResponse.json(rows);
}
