-- ============================================================
-- TeamUp! — Migration 004 : Security Hardening
-- ============================================================

-- ── 1. Fix is_admin self-escalation ──────────────────────────
-- The previous policy allowed any user to set is_admin = true on their own profile.
-- The WITH CHECK now enforces that is_admin cannot be elevated by a non-admin.

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (
      -- Either the is_admin value is unchanged
      is_admin = (SELECT p.is_admin FROM public.profiles p WHERE p.id = auth.uid())
      -- Or the requester is already an admin (admins can promote others)
      OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE)
    )
  );

-- ── 2. Admins can see ALL events (including private/invite) ──
CREATE POLICY "Admins can see all events"
  ON public.events FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- ── 3. Admins can update any event ───────────────────────────
CREATE POLICY "Admins can update any event"
  ON public.events FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- ── 4. Admins can delete any event ───────────────────────────
CREATE POLICY "Admins can delete any event"
  ON public.events FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- ── 5. Admins can update any team ────────────────────────────
CREATE POLICY "Admins can update any team"
  ON public.teams FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- ── 6. Admins can delete any team ────────────────────────────
CREATE POLICY "Admins can delete any team"
  ON public.teams FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- ── 7. Admins can see all participants ───────────────────────
CREATE POLICY "Admins can see all participants"
  ON public.event_participants FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- ── 8. Admins can update any profile (for admin flag management) ──
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));
