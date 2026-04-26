-- ============================================================
-- TeamUp! — Migration 011 : Owner can kick team members
-- ============================================================
-- Current DELETE policy only allows self-removal.
-- Add: team owner can remove any member.
-- ============================================================

DROP POLICY IF EXISTS "Members can leave teams" ON public.team_members;

CREATE POLICY "Members can leave or owner can kick"
  ON public.team_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.teams
      WHERE id = team_id AND owner_id = auth.uid()
    )
  );
