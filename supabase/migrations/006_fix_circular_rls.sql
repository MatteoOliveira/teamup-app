-- ============================================================
-- TeamUp! — Migration 006 : Fix circular RLS (teams ↔ team_members)
-- ============================================================
-- Migration 005 created a circular dependency:
--   teams policy  → checks team_members
--   team_members policy → checks teams
-- → infinite recursion → 500 errors on ALL teams queries
--
-- Fix: use a SECURITY DEFINER function that bypasses RLS
-- when checking team membership from within the teams policy.
-- ============================================================

-- ── Step 1 : drop the circular policy from migration 005 ─────
DROP POLICY IF EXISTS "Teams visible to members and public" ON public.teams;

-- ── Step 2 : helper function (bypasses RLS for team_members) ─
CREATE OR REPLACE FUNCTION public.check_team_membership(
  p_team_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = p_team_id
      AND user_id = p_user_id
  );
$$;

-- ── Step 3 : recreate the policy using the function ──────────
CREATE POLICY "Teams visible to members and public"
  ON public.teams FOR SELECT
  USING (
    is_public = TRUE
    OR owner_id = auth.uid()
    OR public.check_team_membership(id, auth.uid())
  );
