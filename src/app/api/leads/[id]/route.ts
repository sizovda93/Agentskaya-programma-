import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { rows } = await pool.query(
    `SELECT l.*,
       ag.id as agent_uuid,
       pa.full_name as agent_name,
       pm.full_name as manager_name
     FROM leads l
     LEFT JOIN agents ag ON ag.id = l.assigned_agent_id
     LEFT JOIN profiles pa ON pa.id = ag.user_id
     LEFT JOIN profiles pm ON pm.id = l.assigned_manager_id
     WHERE l.id = $1`,
    [id]
  );
  if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(rows[0]);
}
