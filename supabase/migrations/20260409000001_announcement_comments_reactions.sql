-- Comments on announcements
CREATE TABLE IF NOT EXISTS announcement_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL DEFAULT 'agent',
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ann_comments_ann ON announcement_comments(announcement_id, created_at);

-- Reactions on announcements (one reaction type per user per announcement)
CREATE TABLE IF NOT EXISTS announcement_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL DEFAULT '👍',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(announcement_id, user_id, emoji)
);

CREATE INDEX idx_ann_reactions_ann ON announcement_reactions(announcement_id);

-- Add author_id and author_role to announcements
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES profiles(id);
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS author_name TEXT;
