import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { readFile, stat } from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Only allow safe filenames: alnum, dash, underscore, dot. Blocks path traversal.
const SAFE_NAME_RE = /^[a-zA-Z0-9._-]+$/;

const MIME_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.txt': 'text/plain; charset=utf-8',
};

type RouteContext = { params: Promise<{ name: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { name } = await params;

    if (!name || !SAFE_NAME_RE.test(name)) {
      return new Response('Bad filename', { status: 400 });
    }

    const filePath = path.join(UPLOAD_DIR, name);

    // Defence-in-depth: ensure resolved path is still within UPLOAD_DIR
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(path.resolve(UPLOAD_DIR) + path.sep)) {
      return new Response('Forbidden', { status: 403 });
    }

    try {
      await stat(resolved);
    } catch {
      return new Response('Not found', { status: 404 });
    }

    const buffer = await readFile(resolved);
    const ext = path.extname(name).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=3600',
        'Content-Disposition': 'inline',
      },
    });
  } catch (err) {
    console.error('GET /api/files/[name] error:', err);
    return new Response('Internal server error', { status: 500 });
  }
}
