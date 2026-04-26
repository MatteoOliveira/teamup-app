-- ============================================================
-- TeamUp! — Migration 014 : Notification & privacy preferences
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notif_events   BOOLEAN DEFAULT true  NOT NULL,
  ADD COLUMN IF NOT EXISTS notif_messages BOOLEAN DEFAULT true  NOT NULL,
  ADD COLUMN IF NOT EXISTS notif_reminder BOOLEAN DEFAULT true  NOT NULL,
  ADD COLUMN IF NOT EXISTS notif_team     BOOLEAN DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS show_sports    BOOLEAN DEFAULT true  NOT NULL,
  ADD COLUMN IF NOT EXISTS show_location  BOOLEAN DEFAULT false NOT NULL;
