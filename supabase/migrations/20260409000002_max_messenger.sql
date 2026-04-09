-- MAX messenger bindings
CREATE TABLE IF NOT EXISTS max_bindings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  max_user_id BIGINT UNIQUE,
  max_chat_id BIGINT,
  max_username TEXT,
  max_first_name TEXT,
  is_active BOOLEAN DEFAULT true,
  last_conversation_id UUID REFERENCES conversations(id),
  linked_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_max_bind_profile_active
  ON max_bindings(profile_id) WHERE is_active = true;

-- MAX link tokens
CREATE TABLE IF NOT EXISTS max_link_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
