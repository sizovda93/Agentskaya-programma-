import pool from '@/lib/db';
import { requireAuth, clearAuthCookie } from '@/lib/auth-server';
import { toCamelCase } from '@/lib/api-utils';
import { unlink } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    const { rows } = await pool.query(
      `SELECT p.id, p.role, p.full_name, p.email, p.phone, p.avatar_url, p.status, p.created_at, p.manager_number,
              a.id as agent_id, a.city, a.specialization, a.active_leads, a.total_leads,
              a.total_revenue, a.onboarding_status, a.rating, a.tier, a.manager_id,
              a.partner_number, a.gender, a.birth_year, a.birth_day, a.birth_month, a.profession, a.preferred_messenger,
              pm.full_name as manager_name
       FROM profiles p
       LEFT JOIN agents a ON a.user_id = p.id
       LEFT JOIN profiles pm ON pm.id = a.manager_id
       WHERE p.id = $1`,
      [user.id]
    );

    if (rows.length === 0) {
      return Response.json({ error: 'Профиль не найден' }, { status: 404 });
    }

    return Response.json(toCamelCase(rows[0]));
  } catch (err) {
    console.error('GET /api/profile error:', err);
    return Response.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

// Apple 5.1.1(v): user-initiated permanent account deletion.
// Cascades through profiles → agents → payouts/conversations/leads/etc via FK rules
// added in migration 20260513000001_account_deletion.sql.
export async function DELETE() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { user } = auth;

  if (user.role !== 'agent') {
    return Response.json(
      { error: 'Свяжитесь с поддержкой для удаления служебного аккаунта' },
      { status: 403 }
    );
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: profileRows } = await client.query(
      'SELECT id, email, avatar_url FROM profiles WHERE id = $1 FOR UPDATE',
      [user.id]
    );
    if (profileRows.length === 0) {
      await client.query('ROLLBACK');
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    const profile = profileRows[0];

    const { rows: docRows } = await client.query(
      'SELECT file_url FROM documents WHERE owner_id = $1',
      [user.id]
    );

    await client.query(
      `INSERT INTO audit_logs (action, user_email, details, level)
       VALUES ($1, $2, $3, $4)`,
      [
        'account_deletion',
        profile.email,
        JSON.stringify({ user_id: profile.id, role: user.role }),
        'warning',
      ]
    );

    await client.query('DELETE FROM profiles WHERE id = $1', [user.id]);
    await client.query('COMMIT');

    // Best-effort удаление файлов с диска (после COMMIT — не блокируем транзакцию)
    const urls: string[] = [];
    if (profile.avatar_url) urls.push(profile.avatar_url);
    for (const d of docRows) {
      if (d.file_url) urls.push(d.file_url);
    }
    const uploadDir = path.join(process.cwd(), 'uploads');
    for (const url of urls) {
      const name = url.split('/').pop();
      if (!name || !/^[a-zA-Z0-9._-]+$/.test(name)) continue;
      try {
        await unlink(path.join(uploadDir, name));
      } catch {
        // файл уже отсутствует или нет прав — не критично
      }
    }

    await clearAuthCookie();
    return Response.json({ success: true });
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch {}
    console.error('DELETE /api/profile error:', err);
    return Response.json({ error: 'Failed to delete account' }, { status: 500 });
  } finally {
    client.release();
  }
}
