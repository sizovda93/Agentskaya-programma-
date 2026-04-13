import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth-server';

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    // Recent payouts with per-partner total earnings
    const { rows: payouts } = await pool.query(
      `SELECT p.id, p.amount, p.created_at,
              pr.full_name, a.tier, a.partner_number,
              a.total_revenue as partner_total_earned,
              (SELECT COUNT(*)::int FROM payouts p2 WHERE p2.agent_id = p.agent_id AND p2.status = 'paid') as partner_deal_count
       FROM payouts p
       JOIN agents a ON a.id = p.agent_id
       JOIN profiles pr ON pr.id = a.user_id
       WHERE p.status = 'paid' AND p.created_at > NOW() - INTERVAL '90 days'
       ORDER BY p.created_at DESC
       LIMIT 20`
    );

    // Total paid out to all partners
    const { rows: totalRows } = await pool.query(
      `SELECT COALESCE(SUM(amount), 0)::numeric as total_paid,
              COUNT(*)::int as total_deals,
              COUNT(DISTINCT agent_id)::int as total_partners
       FROM payouts WHERE status = 'paid'`
    );

    const entries = payouts.map((p) => ({
      id: p.id,
      fullName: p.full_name,
      lastPayout: Number(p.amount),
      totalEarned: Number(p.partner_total_earned || 0),
      dealCount: p.partner_deal_count || 0,
      tier: p.tier,
      partnerNumber: p.partner_number,
      createdAt: p.created_at,
    }));

    return Response.json({
      totalPaid: Number(totalRows[0].total_paid),
      totalDeals: totalRows[0].total_deals,
      totalPartners: totalRows[0].total_partners,
      entries,
    });
  } catch (err) {
    console.error('GET /api/social-proof error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
