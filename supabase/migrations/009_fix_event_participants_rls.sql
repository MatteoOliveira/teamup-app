-- ============================================================
-- TeamUp! — Migration 009 : Fix circular RLS events ↔ event_participants
-- ============================================================
-- events SELECT policy → queries event_participants (RLS applies)
-- event_participants SELECT policy → queries events (RLS applies)
-- → infinite recursion → 500 on all events queries.
--
-- Fix: SECURITY DEFINER function that checks event visibility
-- without triggering RLS, breaking the cycle.
-- ============================================================

-- ── Helper: check if event is public or invite (no RLS) ──────
CREATE OR REPLACE FUNCTION public.check_event_is_public_or_invite(p_event_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT visibility IN ('public', 'invite') FROM public.events WHERE id = p_event_id),
    FALSE
  );
$$;

-- ── Fix event_participants SELECT policy ─────────────────────
DROP POLICY IF EXISTS "Participants visible to event members" ON public.event_participants;

CREATE POLICY "Participants visible to event members"
  ON public.event_participants FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.check_event_is_public_or_invite(event_id)
  );
