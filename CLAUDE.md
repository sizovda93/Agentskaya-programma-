# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run

```bash
npm run dev          # Dev server on port 3015
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
```

Production deploy (server **72.56.237.53**, SSH port **2222** — old `5.42.110.182` was compromised, do not use):
```bash
ssh -p 2222 root@72.56.237.53
cd /var/www/pravotech       # ← live directory for app.agentum.club (port 3000)
git pull origin main && rm -rf .next && npm run build && pm2 restart pravotech
```

`rm -rf .next` matters — stale Next.js cache regularly causes `ENOTEMPTY` mid-build.

Env files on prod are **split**: `.env.local` holds DB/JWT/Telegram/Anthropic; `.env` holds MAX + OpenAI. `.env.local` wins on conflicts (Next.js loading order). When adding a new env var, check both files before adding.

## Architecture

**Агентум Про** — SaaS platform for a legal bankruptcy partner network. Three roles:
- **Agent** (партнёр): finds clients with debts, earns commission
- **Manager**: manages agents and leads, processes payouts
- **Admin**: system-wide settings, user management

### Stack
- Next.js 16 (App Router), React 19, TypeScript 5
- PostgreSQL via `pg` Pool — raw SQL, no ORM
- JWT auth with httpOnly cookies (jsonwebtoken + jose)
- Tailwind CSS 4, Radix UI (shadcn/ui), Lucide Icons
- Telegram + MAX messenger bot integrations
- PM2 + Nginx on VPS

### Key Patterns

**Database**: All queries use parameterized `pool.query('SELECT ... WHERE id = $1', [id])` from `src/lib/db.ts`. Convention: `snake_case` in DB, `camelCase` in TypeScript — convert with `toCamelCase()` / `toSnakeCase()` from `src/lib/api-utils.ts`.

**Auth**: Every API route starts with `const auth = await requireAuth()` or `requireRole('admin', 'manager')` from `src/lib/auth-server.ts`. Returns `{ user }` or `{ error: Response }`.

Token is read from `Authorization: Bearer <jwt>` (mobile clients) **with fallback to httpOnly cookie** (web). Bearer wins if both are present. Same logic lives in `src/middleware.ts` and `getSession()` — keep them in sync. `setAuthCookie()` returns the JWT so `/api/auth/login` and `/api/auth/register` can also return `{ user, token }` in the response body for mobile use.

**Manager-scoped data access**: managers see only their own records. Authorization filters live inside each route — e.g. conversations/leads list routes have `else if (user.role === 'manager') WHERE ... = $1` branches, and individual GET/PATCH routes (`leads/[id]`, `conversations/[id]`, `leads/[id]/events`) re-check `assigned_manager_id === user.id` after fetching the row. Skipping this leaks data across managers. Admin bypasses all filters.

**API routes**: Located at `src/app/api/[resource]/route.ts`. Export `GET`, `POST`, `PATCH`, `DELETE`. Always return `Response.json(...)`.

**Pages**: Role-scoped under `src/app/agent/`, `src/app/manager/`, `src/app/admin/`. Each wraps content in `DashboardLayout` via the layout file.

**Middleware** (`src/middleware.ts`): Validates JWT, enforces role-based access. Public paths: `/`, `/login`, `/register`, `/forgot-password`, `/offer`, `/privacy`, `/consent`, `/support`. Bypassed (handled internally): `/api/telegram/webhook`, `/api/max/webhook`, `/api/leads/public`, `POST /api/referral`, `/avatar/*`.

**Webhook secret validation** (`src/lib/telegram.ts`, `src/lib/max-messenger.ts`): fail-closed in production. If `TELEGRAM_WEBHOOK_SECRET` / `MAX_WEBHOOK_SECRET` is unset in prod, the validator returns `false` and the webhook returns 403. Set both before deploying, and reset bots' webhook URLs whenever the prod domain changes — Telegram remembers the old URL via Bot API (`setWebhook`), not from env. To re-register: `POST /api/telegram/setup` as admin.

**Uploads**: written to `process.cwd()/uploads/` by `/api/upload`, but served back to clients **only** through the auth-gated `GET /api/files/[name]` route — which validates the filename against `^[a-zA-Z0-9._-]+$` to block path traversal. Direct `/uploads/*` access is denied by nginx on prod. Never hand a raw `/uploads/...` link to a client.

**HTML sanitization**: rich-text/learning content rendered via `dangerouslySetInnerHTML` must go through `sanitizeLearningHtml()` from `src/lib/sanitize.ts` (DOMPurify, allows only `<strong>` and `<code>`).

**Static avatar voice**: the "Котофей" helper plays pre-recorded `/public/avatar/q1.mp3`…`q8.mp3` rather than calling ElevenLabs at runtime — ElevenLabs is geo-blocked from Russia at the Cloudflare layer, so live TTS doesn't work on prod. If you add new questions, ship the MP3 alongside.

### Types

All shared types in `src/types/index.ts`: `User`, `Lead`, `Conversation`, `Message`, `Payout`, `Document`, `Notification`, enums for statuses/roles.

### Navigation

Role-based nav defined in `src/lib/navigation.ts`. Sidebar renders items from `getNavByRole(role)`.

### Notifications cascade

When notifying an agent: try Telegram first (`src/lib/telegram.ts` → `notifyAgent()`), fallback to MAX (`src/lib/max-messenger.ts`), then email (`src/lib/mailer.ts`).

### UI conventions

- All monetary values in rubles (₽), use `formatCurrency()` from `src/lib/utils.ts`
- In UI, use "партнёр" instead of "агент" (rebrand)
- Font: Inter + JetBrains Mono, sidebar nav in UPPERCASE
- Dark theme by default, toggle via `useTheme()` from `src/components/layout/theme-provider.tsx`
- Tables support `hideOnMobile` column flag for responsive design

### Env variables

Required: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`. Optional: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `MAX_BOT_TOKEN`, `MAX_WEBHOOK_SECRET`, `SMTP_HOST/USER/PASS`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `OPENAI_BASE_URL`. Sample template in [`README.md`](README.md).

### Manager onboarding

Managers carry a unique `manager_number` (sequence starts at 100). New agent registrations link to a manager via `?manager=NNN` URL param or the form's "Код менеджера" field, which is matched against `profiles.manager_number`. On successful link the API auto-creates a `conversations` row between the new agent and the manager. To promote an existing profile to manager: `UPDATE profiles SET role='manager', manager_number=nextval('manager_number_seq') WHERE id=$1`.

### Email lookups

`profiles.email` is stored as-typed (mixed case in old rows), but **all auth lookups** (`login`, `register`, `forgot-password`) compare with `LOWER(email) = LOWER($1)`. Preserve this when adding new email-keyed queries — case-sensitive comparison will lock out users with capitalized addresses.
