import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth-server';
import { toCamelCase } from '@/lib/api-utils';

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    let query = `SELECT * FROM documents`;
    const params: string[] = [];

    if (user.role === 'agent') {
      query += ` WHERE owner_id = $1`;
      params.push(user.id);
    }

    query += ` ORDER BY created_at DESC`;

    const { rows } = await pool.query(query, params);
    return Response.json(toCamelCase(rows));
  } catch (err) {
    console.error('GET /api/documents error:', err);
    return Response.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user } = auth;

    const body = await request.json();
    const { title, type, fileUrl, fileSize } = body;

    if (!title) {
      return Response.json({ error: 'Название документа обязательно' }, { status: 400 });
    }

    const validTypes = ['contract', 'invoice', 'act', 'agreement', 'power_of_attorney', 'other'];
    const docType = validTypes.includes(type) ? type : 'other';

    const { rows } = await pool.query(
      `INSERT INTO documents (owner_id, owner_name, title, type, file_url, file_size)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [user.id, user.fullName, title, docType, fileUrl || null, fileSize || null]
    );

    await pool.query(
      `INSERT INTO audit_logs (action, user_email, details) VALUES ('document.created', $1, $2)`,
      [user.email, `Документ: ${title}, тип: ${docType}`]
    );

    return Response.json(toCamelCase(rows[0]), { status: 201 });
  } catch (err) {
    console.error('POST /api/documents error:', err);
    return Response.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
