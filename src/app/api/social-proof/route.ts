import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth-server';

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    // Real payouts (paid, last 90 days)
    const { rows: payouts } = await pool.query(
      `SELECT p.id, p.amount, p.created_at,
              pr.full_name, a.tier, a.partner_number
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
              COUNT(*)::int as total_deals
       FROM payouts WHERE status = 'paid'`
    );

    // Court entries from ticker_entries
    const { rows: courtEntries } = await pool.query(
      `SELECT id, text, created_at FROM ticker_entries
       WHERE type = 'court' AND is_active = true
       ORDER BY created_at DESC LIMIT 10`
    );

    const entries = [
      ...payouts.map((p) => ({
        id: p.id,
        type: 'payout' as const,
        fullName: p.full_name,
        amount: Number(p.amount),
        tier: p.tier,
        partnerNumber: p.partner_number,
        createdAt: p.created_at,
      })),
      ...courtEntries.map((c) => ({
        id: c.id,
        type: 'court' as const,
        text: c.text,
        createdAt: c.created_at,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return Response.json({
      totalPaid: Number(totalRows[0].total_paid),
      totalDeals: totalRows[0].total_deals,
      entries,
    });
  } catch (err) {
    console.error('GET /api/social-proof error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
