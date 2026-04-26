-- ============================================================
-- TeamUp! — Migration 007 : Fix messages RLS + team_members RLS
-- ============================================================
-- team_members SELECT policy had a self-referential subquery
-- that caused infinite recursion when accessed from messages INSERT.
--
-- Fix: replace all circular checks with SECURITY DEFINER functions.
-- ============================================================

-- ── Helper : check if a team is public (bypasses RLS) ────────
CREATE OR REPLACE FUNCTION public.check_team_is_public(p_team_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_public FROM public.teams WHERE id = p_team_id),
    FALSE
  );
$$;

-- ── Fix team_members SELECT (remove self-referential subquery) ─
DROP POLICY IF EXISTS "Team members visible to team participants" ON public.team_members;

CREATE POLICY "Team members visible to team participants"
  ON public.team_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.check_team_is_public(team_id)
  );

-- ── Fix messages policies (use existing check_team_membership) ─
DROP POLICY IF EXISTS "Team members can read messages" ON public.messages;
DROP POLICY IF EXISTS "Team members can send messages" ON public.messages;

CREATE POLICY "Team members can read messages"
  ON public.messages FOR SELECT
  USING (
    public.check_team_membership(team_id, auth.uid())
  );

CREATE POLICY "Team members can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND sender_id = auth.uid()
    AND public.check_team_membership(team_id, auth.uid())
  );
