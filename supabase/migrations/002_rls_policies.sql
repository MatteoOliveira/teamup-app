-- ============================================================
-- TeamUp! — Migration 002 : Row Level Security
-- ============================================================

-- ── Enable RLS on all tables ─────────────────────────────────
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terrains          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings          ENABLE ROW LEVEL SECURITY;

-- ── PROFILES ────────────────────────────────────────────────
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (TRUE);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ── TERRAINS ────────────────────────────────────────────────
CREATE POLICY "Terrains are viewable by everyone"
  ON public.terrains FOR SELECT USING (TRUE);

CREATE POLICY "Only admins can manage terrains"
  ON public.terrains FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- ── EVENTS ──────────────────────────────────────────────────
CREATE POLICY "Public events visible to all"
  ON public.events FOR SELECT USING (visibility = 'public' OR organizer_id = auth.uid());

CREATE POLICY "Authenticated users can create events"
  ON public.events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND organizer_id = auth.uid());

CREATE POLICY "Organizer can update their event"
  ON public.events FOR UPDATE USING (organizer_id = auth.uid());

CREATE POLICY "Organizer can delete their event"
  ON public.events FOR DELETE USING (organizer_id = auth.uid());

-- ── EVENT PARTICIPANTS ───────────────────────────────────────
CREATE POLICY "Participants visible to event members"
  ON public.event_participants FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND visibility = 'public')
    OR user_id = auth.uid()
  );

CREATE POLICY "Authenticated users can join events"
  ON public.event_participants FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can leave events"
  ON public.event_participants FOR DELETE USING (user_id = auth.uid());

-- ── TEAMS ────────────────────────────────────────────────────
CREATE POLICY "Public teams visible to all"
  ON public.teams FOR SELECT USING (is_public = TRUE OR owner_id = auth.uid());

CREATE POLICY "Authenticated users can create teams"
  ON public.teams FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());

CREATE POLICY "Owner can update their team"
  ON public.teams FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Owner can delete their team"
  ON public.teams FOR DELETE USING (owner_id = auth.uid());

-- ── TEAM MEMBERS ─────────────────────────────────────────────
CREATE POLICY "Team members visible to team participants"
  ON public.team_members FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND is_public = TRUE)
    OR user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = team_members.team_id AND tm.user_id = auth.uid())
  );

CREATE POLICY "Authenticated users can join public teams"
  ON public.team_members FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Members can leave teams"
  ON public.team_members FOR DELETE USING (user_id = auth.uid());

-- ── MESSAGES ────────────────────────────────────────────────
CREATE POLICY "Team members can read messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = messages.team_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = messages.team_id AND user_id = auth.uid()
    )
  );

-- ── BOOKINGS ────────────────────────────────────────────────
CREATE POLICY "Users can view own bookings"
  ON public.bookings FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can create bookings"
  ON public.bookings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can cancel own bookings"
  ON public.bookings FOR UPDATE USING (user_id = auth.uid());
