import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conversation = await pool.query(
    `SELECT c.*,
       pa.full_name as agent_name,
       pm.full_name as manager_name
     FROM conversations c
     LEFT JOIN agents ag ON ag.id = c.agent_id
     LEFT JOIN profiles pa ON pa.id = ag.user_id
     LEFT JOIN profiles pm ON pm.id = c.manager_id
     WHERE c.id = $1`,
    [id]
  );
  if (conversation.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const messages = await pool.query(
    `SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
    [id]
  );

  return NextResponse.json({ ...conversation.rows[0], messages: messages.rows });
}
