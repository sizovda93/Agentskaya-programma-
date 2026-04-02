# Агентум Про — Документация проекта

Платформа управления агентской сетью для юридического бизнеса. Агенты находят клиентов (лидов), менеджеры ведут сделки, администратор контролирует систему и выплаты.

---

## Стек технологий

| Слой | Технология |
|------|-----------|
| Фреймворк | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4, Radix UI, Lucide Icons |
| База данных | PostgreSQL 15+ (библиотека `pg`) |
| Аутентификация | JWT (jsonwebtoken + jose), bcrypt |
| Telegram | Bot API (webhook) |
| Деплой | PM2 + Nginx, сервер 5.42.110.182 |
| Язык | TypeScript 5 |

---

## Структура каталогов

```
src/
├── app/
│   ├── api/                  # 30 API-эндпоинтов
│   │   ├── auth/             #   login, register, logout, session
│   │   ├── leads/            #   CRUD + events
│   │   ├── conversations/    #   список + сообщения
│   │   ├── payouts/          #   список + state machine
│   │   ├── documents/        #   CRUD + download
│   │   ├── upload/           #   загрузка файлов
│   │   ├── users/            #   управление пользователями
│   │   ├── agents/           #   список агентов
│   │   ├── profile/          #   профиль текущего пользователя
│   │   ├── telegram/         #   link, status, webhook, setup
│   │   ├── referral/         #   статистика + click tracking
│   │   ├── learning/         #   модули + уроки
│   │   ├── settings/         #   настройки платформы
│   │   ├── stats/            #   статистика по ролям
│   │   ├── logs/             #   аудит-логи
│   │   └── notifications/    #   уведомления
│   ├── admin/                # 10 страниц администратора
│   ├── agent/                # 10 страниц агента
│   ├── manager/              # 12 страниц менеджера
│   ├── login/                # Вход
│   ├── register/             # Регистрация
│   ├── offer/, privacy/, consent/  # Юридические страницы
│   └── page.tsx              # Лендинг
├── components/
│   ├── layout/               # Sidebar, Header, DashboardLayout
│   ├── dashboard/            # Stats, Headers, Loading
│   ├── chat/                 # MessageBubble, ConversationList
│   ├── leads/                # LeadTable, Timeline, Card
│   ├── finance/              # PayoutComponents
│   ├── documents/            # Upload, List
│   ├── telegram/             # LinkButton, Status
│   ├── referral/             # RefCodeCapture
│   └── ui/                   # Radix-UI примитивы
├── lib/
│   ├── db.ts                 # PostgreSQL connection pool
│   ├── auth-server.ts        # JWT, requireAuth, requireRole
│   ├── telegram.ts           # Bot API обёртка
│   ├── telegram-notifications.ts  # 4 типа уведомлений
│   ├── learning-content.ts   # Fetch модулей из БД
│   ├── api-utils.ts          # snake_case ↔ camelCase
│   ├── navigation.ts         # Навигация по ролям
│   └── utils.ts              # Форматирование
├── types/index.ts            # 30+ TypeScript интерфейсов
├── hooks/                    # React хуки
└── middleware.ts             # JWT + role-based routing
supabase/
└── migrations/               # 7 SQL-миграций
```

---

## Роли и доступ

### Agent (Агент)

Находит клиентов, передаёт лиды в работу, получает комиссию за успешные сделки.

| Функция | Доступ |
|---------|--------|
| Лиды | Только свои, не может менять статус на won/lost |
| Финансы | Только просмотр своих выплат |
| Документы | Загрузка и просмотр своих файлов |
| Чат | Переписка с менеджером (Web + Telegram) |
| Telegram | Привязка аккаунта, получение уведомлений |
| Реферал | Свой код, статистика кликов, шаблоны для шеринга |
| Обучение | 5 модулей: Начало, Финансы, Документы, Коммуникации, FAQ |
| Профиль | Редактирование своих данных |

**Страницы:** `/agent/dashboard`, `/agent/leads`, `/agent/leads/[id]`, `/agent/finance`, `/agent/documents`, `/agent/messages`, `/agent/profile`, `/agent/referral`, `/agent/learning`, `/agent/learning/[slug]`

---

### Manager (Менеджер)

Ведёт сделки, управляет агентами, обрабатывает лиды.

| Функция | Доступ |
|---------|--------|
| Лиды | Все лиды, смена статусов, назначение агентов |
| Агенты | Список, статистика, карточки агентов |
| Финансы | Просмотр выплат (не может ставить «Оплачено») |
| Чат | Переписка с агентами, авто-отправка в Telegram |
| Рассылки | Массовые сообщения (placeholder) |
| Документы | Документы от привязанных агентов |
| Рефералы | Лидерборд по реферальным лидам |
| Обучение | 5 модулей: Начало, Лиды, Коммуникации, Финансы, FAQ |

**Страницы:** `/manager/dashboard`, `/manager/agents`, `/manager/agents/[id]`, `/manager/leads`, `/manager/leads/[id]`, `/manager/conversations`, `/manager/conversations/[id]`, `/manager/finance`, `/manager/documents`, `/manager/broadcasts`, `/manager/referrals`, `/manager/learning`, `/manager/learning/[slug]`

---

### Admin (Администратор)

Полный контроль над платформой.

| Функция | Доступ |
|---------|--------|
| Пользователи | CRUD, смена роли, блокировка |
| Финансы | Полный state machine: pending → processing → **paid** / rejected |
| Настройки | commission_rate, platform_name, support_email, support_phone |
| Интеграции | Telegram webhook, статус бота |
| Логи | Аудит всех действий в системе |
| Рефералы | Лидерборд |
| Обучение | 3 модуля: Управление, Интеграции, FAQ |

**Страницы:** `/admin/dashboard`, `/admin/users`, `/admin/users/[id]`, `/admin/finance`, `/admin/finance/[id]`, `/admin/settings`, `/admin/integrations`, `/admin/logs`, `/admin/roles`, `/admin/referrals`, `/admin/learning`, `/admin/learning/[slug]`

---

## База данных

Сервер: `5.42.110.182:5432`, база `pravotech_agent`, пользователь `pravotech`.

### Таблицы

| Таблица | Назначение | Ключевые поля |
|---------|-----------|---------------|
| `profiles` | Пользователи | id, auth_id, role, full_name, email, password_hash, phone, status |
| `agents` | Расширение профиля агента | user_id → profiles, city, specialization, active_leads, total_leads, total_revenue, ref_code, onboarding_status, rating |
| `leads` | Потенциальные клиенты | full_name, phone, status, source, assigned_agent_id, assigned_manager_id, estimated_value, ref_code |
| `lead_events` | Хронология лида | lead_id, event_type, actor_email, details |
| `conversations` | Диалоги agent↔manager | agent_id, manager_id, client_name, mode, channel, unread_count, last_message |
| `messages` | Сообщения | conversation_id, sender_type, text, channel (web/telegram), external_id |
| `payouts` | Выплаты агентам | agent_id, amount, status, period, rejection_reason |
| `documents` | Загруженные файлы | owner_id, title, type, status, file_url, file_size |
| `notifications` | Уведомления | user_id, title, message, read, type |
| `audit_logs` | Лог действий | action, user_email, details, level |
| `settings` | Настройки (key/value) | key, value |
| `telegram_bindings` | Привязка Telegram | profile_id, telegram_user_id, telegram_chat_id, is_active |
| `telegram_link_tokens` | Одноразовые токены | profile_id, token, expires_at, used |
| `referral_clicks` | Клики по реф-ссылкам | ref_code, ip_hash, is_unique |
| `learning_modules` | Учебные модули | id, role, title, description, icon, sort_order |
| `learning_lessons` | Уроки | module_id, slug, title, duration, sections (JSONB) |

### Перечисления (ENUM)

| Тип | Значения |
|-----|---------|
| `user_role` | agent, manager, admin |
| `user_status` | active, inactive, blocked |
| `lead_status` | new, contacted, qualified, proposal, negotiation, won, lost |
| `lead_source` | website, telegram, whatsapp, referral, cold, partner |
| `conversation_mode` | ai, manual, semi-auto |
| `conversation_status` | active, waiting, closed, escalated |
| `message_sender_type` | agent, manager, client, ai, system |
| `payout_status` | pending, processing, paid, rejected |
| `document_type` | contract, invoice, act, agreement, power_of_attorney, other |
| `document_status` | draft, pending_signature, signed, expired, rejected |
| `message_channel` | web, telegram |
| `onboarding_status` | pending, in_progress, completed, rejected |

### Миграции (7 файлов)

```
supabase/migrations/
├── 20260316000001_init_schema.sql          # Базовые таблицы
├── 20260317000001_lead_events.sql          # Хронология лидов
├── 20260317000002_payout_rejection_and_settings.sql  # Отклонение выплат + настройки
├── 20260317000003_telegram_support.sql     # Telegram-интеграция
├── 20260318000001_referral_layer.sql       # Реферальная система
├── 20260318000002_data_fix_seed_consistency.sql  # Пересчёт счётчиков
└── 20260319000001_learning_content.sql     # Учебный контент
```

---

## API-эндпоинты (30)

### Аутентификация

| Метод | Путь | Доступ | Описание |
|-------|------|--------|---------|
| POST | `/api/auth/login` | Публичный | Вход по email/password, возвращает JWT cookie |
| POST | `/api/auth/register` | Публичный | Регистрация агента + согласия |
| POST | `/api/auth/logout` | Авторизован | Выход, очистка cookie |
| GET | `/api/auth/session` | Авторизован | Текущая сессия пользователя |

### Лиды

| Метод | Путь | Доступ | Описание |
|-------|------|--------|---------|
| GET | `/api/leads` | Авторизован | Agent: свои; Manager/Admin: все |
| POST | `/api/leads` | Manager/Admin | Создать лид |
| GET | `/api/leads/[id]` | Авторизован | Детали лида |
| PATCH | `/api/leads/[id]` | Авторизован | Обновить (agent: status/comment; manager/admin: всё) |
| GET | `/api/leads/[id]/events` | Авторизован | Хронология лида |

### Переписки

| Метод | Путь | Доступ | Описание |
|-------|------|--------|---------|
| GET | `/api/conversations` | Авторизован | Список диалогов |
| GET | `/api/conversations/[id]` | Авторизован | Диалог + сообщения |
| POST | `/api/conversations/[id]` | Авторизован | Отправить сообщение (авто-Telegram) |

### Выплаты

| Метод | Путь | Доступ | Описание |
|-------|------|--------|---------|
| GET | `/api/payouts` | Авторизован | Список выплат (по роли) |
| PATCH | `/api/payouts/[id]` | Manager/Admin | Сменить статус (state machine) |

### Документы

| Метод | Путь | Доступ | Описание |
|-------|------|--------|---------|
| GET | `/api/documents` | Авторизован | Список документов |
| POST | `/api/documents` | Авторизован | Создать документ |
| GET | `/api/documents/[id]` | Авторизован | Метаданные документа |
| PATCH | `/api/documents/[id]` | Авторизован | Обновить документ |
| GET | `/api/documents/[id]/download` | Авторизован | Безопасное скачивание |

### Загрузка файлов

| Метод | Путь | Доступ | Описание |
|-------|------|--------|---------|
| POST | `/api/upload` | Авторизован | Загрузка файла (макс 10 МБ) |

### Пользователи и агенты

| Метод | Путь | Доступ | Описание |
|-------|------|--------|---------|
| GET | `/api/users` | Admin | Список пользователей |
| GET | `/api/users/[id]` | Admin | Детали пользователя |
| GET | `/api/agents` | Manager/Admin | Список агентов |
| GET | `/api/agents/[id]` | Manager/Admin | Детали агента |
| GET | `/api/profile` | Авторизован | Профиль текущего пользователя |

### Telegram

| Метод | Путь | Доступ | Описание |
|-------|------|--------|---------|
| POST | `/api/telegram/link` | Авторизован | Генерация deep link для привязки |
| DELETE | `/api/telegram/link` | Авторизован | Отвязать Telegram |
| GET | `/api/telegram/status` | Авторизован | Статус привязки |
| POST | `/api/telegram/webhook` | Публичный | Приём обновлений от Telegram |
| POST | `/api/telegram/setup` | Admin | Установить webhook |
| GET | `/api/telegram/setup` | Admin | Инфо о webhook |
| DELETE | `/api/telegram/setup` | Admin | Удалить webhook |

### Рефералы

| Метод | Путь | Доступ | Описание |
|-------|------|--------|---------|
| GET | `/api/referral` | Авторизован | Agent: свой код + статистика; Manager/Admin: лидерборд |
| POST | `/api/referral` | Публичный | Трекинг кликов |

### Обучение

| Метод | Путь | Доступ | Описание |
|-------|------|--------|---------|
| GET | `/api/learning` | Авторизован | Модули + уроки для роли |
| GET | `/api/learning/[slug]` | Авторизован | Один урок по slug |

### Администрирование

| Метод | Путь | Доступ | Описание |
|-------|------|--------|---------|
| GET | `/api/settings` | Admin | Настройки платформы |
| PATCH | `/api/settings` | Admin | Обновить настройки |
| GET | `/api/stats` | Авторизован | Статистика (по роли) |
| GET | `/api/logs` | Admin | Аудит-лог (последние 100) |
| GET | `/api/notifications` | Авторизован | Уведомления пользователя |

---

## Telegram-интеграция

Бот: `@Agent_BFL_bot`

### Привязка аккаунта

```
Агент нажимает «Привязать» → POST /api/telegram/link → генерация токена (15 мин)
→ Deep link: https://t.me/Agent_BFL_bot?start={token}
→ Агент переходит → Telegram отправляет /start {token} → Webhook
→ Проверка токена → Создание telegram_bindings → Подтверждение
```

### Уведомления (4 типа)

1. **Смена статуса лида** — менеджер меняет статус → агент получает в Telegram
2. **Новая выплата** — лид переходит в «won» → уведомление о сумме
3. **Смена статуса выплаты** — processing/paid/rejected → уведомление
4. **Сообщение от менеджера** — менеджер пишет в чате → авто-отправка в Telegram

### Обработка ошибок

- Бот заблокирован (403) или чат не найден (400) → привязка деактивируется
- Ошибки логируются в `audit_logs`
- Ошибки Telegram не блокируют веб-ответ

---

## Реферальная система

### Механика

1. Каждый агент получает уникальный 8-символьный код (`agents.ref_code`)
2. Ссылка: `{APP_URL}/?ref={CODE}`
3. При переходе — `POST /api/referral` (публичный) трекает клик
4. Дедупликация: SHA256(IP + refCode), окно 1 час
5. Менеджер создаёт лид с `ref_code` → лид привязывается к агенту
6. Конверсия = (totalLeads / uniqueClicks) × 100%

### Представления

- **Агент:** свой код, ссылка, статистика, шаблоны для мессенджеров
- **Менеджер/Админ:** лидерборд по реферальным лидам

---

## Обучение

Контент хранится в БД (таблицы `learning_modules`, `learning_lessons`).

| Роль | Модулей | Тематика |
|------|---------|---------|
| Agent | 5 | Начало работы, Финансы, Документы, Коммуникации, FAQ |
| Manager | 5 | Начало, Лиды, Коммуникации, Финансы/Документы, FAQ |
| Admin | 3 | Управление, Интеграции, FAQ |

Каждый урок содержит: заголовок, длительность, секции (heading + body в JSONB), CTA-кнопка.

---

## Безопасность

| Аспект | Реализация |
|--------|-----------|
| Пароли | bcrypt, 12 раундов |
| Токен | JWT в httpOnly cookie, TTL 7 дней |
| Маршрутизация | middleware.ts — проверка JWT + роли |
| SQL | Параметризованные запросы (pg) |
| Файлы | Whitelist расширений (PDF, DOC, JPG...), макс 10 МБ |
| Скачивание | Path traversal protection + проверка владельца |
| Аудит | Все действия логируются в audit_logs |

---

## Переменные окружения (.env)

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=<random-256-bit-hex>
NEXT_PUBLIC_APP_URL=http://localhost:3000
TELEGRAM_BOT_TOKEN=<bot-token>      # опционально
```

---

## Запуск проекта

```bash
# 1. Клонировать
git clone https://github.com/sizovda93/Agentskaya-programma-.git
cd Agentskaya-programma-

# 2. Установить зависимости
npm install

# 3. Создать .env (см. выше)

# 4. Применить миграции (последовательно)
for f in supabase/migrations/*.sql; do psql $DATABASE_URL -f "$f"; done

# 5. Запустить
npm run dev          # разработка
npm run build && npm start  # продакшен
```

### Продакшен (PM2)

```bash
npm run build
pm2 start npm --name pravotech -- start
pm2 save
```

---

## Итого

| Метрика | Значение |
|---------|---------|
| Страницы | 39 (6 публичных, 10 agent, 12 manager, 10 admin) |
| API-эндпоинты | 30 |
| Таблицы БД | 15 основных + индексы |
| SQL-миграции | 7 |
| React-компоненты | 20+ |
| TypeScript-типы | 30+ интерфейсов |
| Исходных файлов | ~118 TS/TSX |
