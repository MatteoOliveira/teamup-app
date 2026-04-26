-- ============================================================
-- TeamUp! — Migration 013 : Profile privacy flag
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false NOT NULL;
