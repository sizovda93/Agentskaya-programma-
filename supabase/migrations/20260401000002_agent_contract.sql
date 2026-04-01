-- Agent contract document (admin uploads, agents view/download)
CREATE TABLE agent_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
