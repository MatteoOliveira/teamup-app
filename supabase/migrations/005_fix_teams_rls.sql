-- ============================================================
-- TeamUp! — Migration 005 : Fix teams RLS + Realtime
-- ============================================================

-- ── TEAMS : allow members to see their teams (incl. private) ─
DROP POLICY IF EXISTS "Public teams visible to all" ON public.teams;

CREATE POLICY "Teams visible to members and public"
  ON public.teams FOR SELECT
  USING (
    is_public = TRUE
    OR owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = teams.id
        AND team_members.user_id = auth.uid()
    )
  );

-- ── REALTIME : enable publication for messages table ─────────
-- Run this so supabase.channel postgres_changes work on messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
