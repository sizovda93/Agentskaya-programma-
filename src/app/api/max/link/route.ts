import crypto from 'crypto';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth-server';
import { toCamelCase } from '@/lib/api-utils';

const BOT_NAME = 'id645211616449_bot';
const TOKEN_TTL_MINUTES = 15;

// POST — generate a link token + deep link for MAX
export async function POST() {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    // Check if already linked
    const existing = await pool.query(
      `SELECT id FROM max_bindings WHERE profile_id = $1 AND is_active = true LIMIT 1`,
      [user.id]
    );
    if (existing.rows.length > 0) {
      return Response.json(
        { error: 'MAX уже подключён. Сначала отключите текущую привязку.' },
        { status: 409 }
      );
    }

    // Invalidate old tokens
    await pool.query(
      `UPDATE max_link_tokens SET used = true WHERE profile_id = $1 AND used = false`,
      [user.id]
    );

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

    await pool.query(
      `INSERT INTO max_link_tokens (profile_id, token, expires_at) VALUES ($1, $2, $3)`,
      [user.id, token, expiresAt.toISOString()]
    );

    const deepLink = `https://max.ru/${BOT_NAME}?start=${token}`;

    await pool.query(
      `INSERT INTO audit_logs (action, user_email, details)
       VALUES ('max.link_requested', $1, $2)`,
      [user.email, `Token generated, expires ${expiresAt.toISOString()}`]
    );

    return Response.json({ deepLink, token, expiresAt: expiresAt.toISOString() }, { status: 201 });
  } catch (err) {
    console.error('POST /api/max/link error:', err);
    return Response.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// DELETE — unlink MAX
export async function DELETE() {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    const { rows } = await pool.query(
      `UPDATE max_bindings SET is_active = false
       WHERE profile_id = $1 AND is_active = true RETURNING *`,
      [user.id]
    );

    if (rows.length === 0) {
      return Response.json({ error: 'MAX не подключён' }, { status: 404 });
    }

    return Response.json(toCamelCase({ success: true }));
  } catch (err) {
    console.error('DELETE /api/max/link error:', err);
    return Response.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
