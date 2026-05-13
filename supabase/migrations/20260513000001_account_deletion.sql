-- =============================================
-- Account deletion: enable cascading from profiles
-- =============================================
-- Apple 5.1.1(v) compliance: hard delete of a user account requires the
-- DELETE on profiles to cascade through every table that referenced the user.
-- Most FKs to profiles/agents already have ON DELETE CASCADE / SET NULL,
-- but a few were created without any rule (= NO ACTION) and would block
-- account deletion. This migration adds CASCADE / SET NULL to those.
-- =============================================

-- broadcast_recipients.profile_id (NOT NULL, was NO ACTION) → CASCADE
ALTER TABLE public.broadcast_recipients
  DROP CONSTRAINT broadcast_recipients_profile_id_fkey,
  ADD CONSTRAINT broadcast_recipients_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- broadcast_recipients.agent_id (NOT NULL, was NO ACTION) → CASCADE
ALTER TABLE public.broadcast_recipients
  DROP CONSTRAINT broadcast_recipients_agent_id_fkey,
  ADD CONSTRAINT broadcast_recipients_agent_id_fkey
    FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE CASCADE;

-- max_link_tokens.profile_id (NOT NULL, was NO ACTION) → CASCADE
ALTER TABLE public.max_link_tokens
  DROP CONSTRAINT max_link_tokens_profile_id_fkey,
  ADD CONSTRAINT max_link_tokens_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- agent_contracts.uploaded_by (nullable, was NO ACTION) → SET NULL
-- Service table for contract templates; uploader is normally admin/manager
-- and account deletion blocks them via 403. Setting SET NULL as belt-and-braces.
ALTER TABLE public.agent_contracts
  DROP CONSTRAINT agent_contracts_uploaded_by_fkey,
  ADD CONSTRAINT agent_contracts_uploaded_by_fkey
    FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
