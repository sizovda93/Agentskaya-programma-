# Агентум Про

SaaS-платформа партнёрской сети по банкротству физических лиц (БФЛ). Домен: [app.agentum.club](https://app.agentum.club).

## Роли

- **Партнёр (agent)** — находит клиентов с долгами, передаёт в платформу, получает комиссию.
- **Менеджер (manager)** — ведёт закреплённых партнёров, обрабатывает лиды, управляет выплатами.
- **Администратор (admin)** — системные настройки, управление пользователями.

## Стек

- **Next.js 16** (App Router) + React 19 + TypeScript 5
- **PostgreSQL** через `pg` Pool — raw SQL, без ORM
- **JWT-auth** с httpOnly cookies (jsonwebtoken + jose)
- **Tailwind CSS 4** + Radix UI (shadcn/ui) + Lucide Icons
- Интеграции: **Telegram Bot** + **MAX Messenger** + SMTP (nodemailer)
- AI: **Anthropic API** (voidai.app) для классификации, авто-ответов, драфтов
- Деплой: **PM2** + **Nginx** на VPS

## Локальная разработка

### Требования

- Node.js 20+
- PostgreSQL 14+ (локальный инстанс или удалённый)

### Установка

```bash
npm install
```

### Переменные окружения

Создать `.env.local` на основе того, что ниже:

```bash
# Database (required)
DB_HOST=localhost
DB_PORT=5432
DB_USER=pravotech
DB_PASSWORD=<your-password>
DB_NAME=pravotech_agent

# Auth (required)
JWT_SECRET=<random-32-chars>

# Telegram (optional)
TELEGRAM_BOT_TOKEN=<bot-token>
TELEGRAM_WEBHOOK_SECRET=<random-32-chars>

# MAX Messenger (optional)
MAX_BOT_TOKEN=<token>
MAX_WEBHOOK_SECRET=<random-32-chars>

# SMTP for password reset / feedback (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=<email>
SMTP_PASS=<password>

# AI (optional — for auto-reply, draft, classify)
ANTHROPIC_API_KEY=<voidai.app key>
OPENAI_BASE_URL=https://aspbllm.online/v1
OPENAI_API_KEY=<key>

# ElevenLabs TTS for Котофей avatar (optional)
ELEVENLABS_API_KEY=<sk_...>
ELEVENLABS_VOICE_ID=yl2ZDV1MzN4HbQJbMihG
```

### Миграции БД

Миграции лежат в [`supabase/migrations/`](supabase/migrations/). Накатывать вручную через `psql`:

```bash
psql -h localhost -U pravotech -d pravotech_agent -f supabase/migrations/20260316000001_init_schema.sql
# ...и так далее по всем файлам в хронологическом порядке
```

Начальные данные (роли, менеджеры-сиды): [`supabase/seed.sql`](supabase/seed.sql).

### Запуск

```bash
npm run dev          # dev-сервер на http://localhost:3015
npm run build        # production build
npm run start        # запуск production-бандла
npm run lint         # ESLint
```

## Структура

- [`src/app/`](src/app) — страницы и API-роуты (Next App Router)
  - [`agent/`](src/app/agent), [`manager/`](src/app/manager), [`admin/`](src/app/admin) — ролевые кабинеты
  - [`api/`](src/app/api) — серверные эндпоинты
- [`src/components/`](src/components) — React-компоненты (включая shadcn/ui)
- [`src/lib/`](src/lib) — утилиты: `db.ts` (pg), `auth-server.ts` (JWT), `telegram.ts`, `max-messenger.ts`, `ai/`, и др.
- [`src/types/`](src/types) — общие TypeScript-типы
- [`supabase/migrations/`](supabase/migrations) — SQL-миграции

## Ключевые паттерны

- **SQL**: параметризованные запросы `pool.query('SELECT ... WHERE id = $1', [id])`. В БД `snake_case`, в TS `camelCase` — конверсия через `toCamelCase()` / `toSnakeCase()` из [`src/lib/api-utils.ts`](src/lib/api-utils.ts).
- **Auth**: каждый API-роут начинается с `const auth = await requireAuth()` или `requireRole('admin', 'manager')` из [`src/lib/auth-server.ts`](src/lib/auth-server.ts).
- **Middleware** ([`src/middleware.ts`](src/middleware.ts)): проверка JWT и ролей на уровне маршрутизатора. Public: `/`, `/login`, `/register`, `/forgot-password`, `/offer`, `/privacy`, `/consent`. Webhook-пути обходятся (`/api/telegram/webhook`, `/api/max/webhook`).
- **Нотификации**: каскад Telegram → MAX → email (см. [`src/lib/telegram.ts`](src/lib/telegram.ts)).
- **Uploads**: файлы пишутся в `uploads/` и раздаются через защищённый эндпоинт `/api/files/[name]` (проверка auth). Прямой доступ `/uploads/*` заблокирован в nginx.

## Деплой

Продакшен работает на **72.56.237.53:2222** (порт SSH). Директория: `/var/www/pravotech` (порт приложения 3000).

```bash
ssh -p 2222 root@72.56.237.53
cd /var/www/pravotech
git pull origin main
NODE_OPTIONS='--max-old-space-size=1024' npm run build
pm2 restart pravotech
```

Миграции на проде накатываются вручную через `sudo -u postgres psql -d pravotech_agent -f <файл>`.

## Безопасность

- Webhook-секреты (`TELEGRAM_WEBHOOK_SECRET`, `MAX_WEBHOOK_SECRET`) обязательны в production — без них webhook-эндпоинты возвращают 403.
- Пароли хэшируются через `bcryptjs` (12 rounds).
- Авторизационные фильтры разделяют данные между менеджерами (каждый видит только своих партнёров, лидов, диалоги).
- Секретные ключи (ElevenLabs, Anthropic) хранятся только на сервере.

## Лицензия

Проприетарная. Все права защищены.
