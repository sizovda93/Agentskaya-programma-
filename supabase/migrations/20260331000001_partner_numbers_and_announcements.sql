-- Partner numbers starting from 888
CREATE SEQUENCE partner_number_seq START WITH 888;
ALTER TABLE agents ADD COLUMN partner_number INT UNIQUE DEFAULT nextval('partner_number_seq');

-- Backfill existing agents
UPDATE agents SET partner_number = nextval('partner_number_seq') WHERE partner_number IS NULL;

-- Announcements table
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  type VARCHAR(30) NOT NULL DEFAULT 'news' CHECK (type IN ('news', 'giveaway', 'update')),
  content TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_announcements_active ON announcements(is_active, created_at DESC);

-- Seed: BFL news + MacBook giveaway
INSERT INTO announcements (title, type, content) VALUES
(
  'Верховный суд расширил перечень долгов, списываемых при банкротстве',
  'news',
  'В марте 2026 года Верховный суд РФ вынес определение, уточняющее порядок списания задолженности при банкротстве физических лиц. Теперь в процедуре реализации имущества могут быть списаны долги по ряду штрафов ГИБДД, задолженность по взносам на капитальный ремонт, а также некоторые виды задолженности перед микрофинансовыми организациями, ранее вызывавшие споры в судебной практике.

Это означает, что для партнёров платформы расширяется круг потенциальных клиентов — теперь банкротство может быть выгодно ещё большему числу должников.

Рекомендуем обратить внимание на клиентов с комбинированной задолженностью: кредиты + МФО + штрафы. Такие случаи теперь проходят через процедуру значительно проще.'
),
(
  'Розыгрыш MacBook Air среди партнёров',
  'giveaway',
  'Мы разыгрываем MacBook Air M4 среди активных партнёров платформы!

Условия участия:
1. Быть зарегистрированным партнёром платформы
2. Передать минимум 5 лидов до 30 июня 2026 года
3. Хотя бы 2 из них должны дойти до статуса «Договор заключён»

Каждый квалифицированный лид = 1 билет в розыгрыш. Чем больше лидов — тем выше шансы.

Дата розыгрыша: 1 июля 2026 года
Победитель будет объявлен в этом разделе и получит уведомление в Telegram.

Удачи!'
);
