-- ============================================================
-- TeamUp! — Migration 008 : Events team_id + invite + messages typing
-- ============================================================
-- Adds:
--   events.team_id        — links a "team" event to a specific team
--   messages.message_type — 'text' | 'event_invite'
--   messages.event_id     — FK to events (for event_invite cards)
-- Updates events SELECT RLS to cover invite + private team events.
-- ============================================================

-- ── Schema changes ───────────────────────────────────────────
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS message_type TEXT NOT NULL DEFAULT 'text';

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.events(id) ON DELETE SET NULL;

-- ── Events SELECT policy — extend to cover all visibility types
DROP POLICY IF EXISTS "Public events visible to all" ON public.events;
DROP POLICY IF EXISTS "Events visible by visibility rules" ON public.events;

CREATE POLICY "Events visible by visibility rules"
  ON public.events FOR SELECT
  USING (
    -- Public events: anyone
    visibility = 'public'
    -- Organizer always sees own events
    OR organizer_id = auth.uid()
    -- Invite events: any authenticated user (UUID is the "secret")
    OR visibility = 'invite'
    -- Participant in the event
    OR EXISTS (
      SELECT 1 FROM public.event_participants
      WHERE event_id = events.id AND user_id = auth.uid()
    )
    -- Team events: members of the linked team
    OR (
      visibility = 'private'
      AND team_id IS NOT NULL
      AND public.check_team_membership(team_id, auth.uid())
    )
  );

-- ── Event participants SELECT — extend to cover invite + team events
DROP POLICY IF EXISTS "Participants visible to event members" ON public.event_participants;

CREATE POLICY "Participants visible to event members"
  ON public.event_participants FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.events
      WHERE id = event_id
        AND (
          visibility IN ('public', 'invite')
          OR organizer_id = auth.uid()
        )
    )
  );
