-- Add link column to notifications so they can deep-link to the relevant page
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link TEXT;

-- Track which announcements each user has read (so "Прочитать все" actually sticks)
CREATE TABLE IF NOT EXISTS announcement_reads (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, announcement_id)
);

CREATE INDEX IF NOT EXISTS idx_announcement_reads_user ON announcement_reads(user_id);
