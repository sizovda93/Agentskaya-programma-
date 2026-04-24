# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run

```bash
npm run dev          # Dev server on port 3015
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
```

Production deploy (server 5.42.110.182):
```bash
ssh root@5.42.110.182
cd /var/www/pravotech       # ← this is the live directory for app.agentum.club (port 3000)
git pull origin main && npm run build && pm2 restart pravotech
```

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

**API routes**: Located at `src/app/api/[resource]/route.ts`. Export `GET`, `POST`, `PATCH`, `DELETE`. Always return `Response.json(...)`.

**Pages**: Role-scoped under `src/app/agent/`, `src/app/manager/`, `src/app/admin/`. Each wraps content in `DashboardLayout` via the layout file.

**Middleware** (`src/middleware.ts`): Validates JWT, enforces role-based access. Public paths: `/`, `/login`, `/register`, `/forgot-password`, `/offer`, `/privacy`, `/consent`. Webhook paths bypassed: `/api/telegram/webhook`, `/api/max/webhook`.

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

Required in `.env`: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`. Optional: `TELEGRAM_BOT_TOKEN`, `MAX_BOT_TOKEN`, `SMTP_HOST/USER/PASS`, `ANTHROPIC_API_KEY`.
