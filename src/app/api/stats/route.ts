import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const leadStats = await pool.query(
    `SELECT
       count(*) as total,
       count(*) filter (where status = 'new') as new_count,
       count(*) filter (where status = 'won') as won_count,
       coalesce(sum(estimated_value) filter (where status = 'won'), 0) as total_revenue
     FROM leads`
  );

  const agentStats = await pool.query(
    `SELECT count(*) as total,
       count(*) filter (where onboarding_status = 'completed') as active
     FROM agents`
  );

  const conversationStats = await pool.query(
    `SELECT count(*) as total,
       count(*) filter (where status = 'active') as active,
       count(*) filter (where status = 'escalated') as escalated
     FROM conversations`
  );

  const payoutStats = await pool.query(
    `SELECT
       coalesce(sum(amount) filter (where status = 'paid'), 0) as total_paid,
       coalesce(sum(amount) filter (where status = 'processing'), 0) as processing,
       coalesce(sum(amount) filter (where status = 'pending'), 0) as pending
     FROM payouts`
  );

  return NextResponse.json({
    leads: leadStats.rows[0],
    agents: agentStats.rows[0],
    conversations: conversationStats.rows[0],
    payouts: payoutStats.rows[0],
  });
}
