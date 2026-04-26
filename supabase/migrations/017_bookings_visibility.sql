-- ============================================================
-- TeamUp! — Migration 017 : Bookings visibility for availability
-- ============================================================
-- Allows any authenticated user to view booking time slots on a
-- terrain (needed to display availability calendar in /fields/[id]).
-- The existing "Users can view own bookings" policy stays in place
-- (combined with OR by Supabase RLS).
-- ============================================================

CREATE POLICY "Authenticated users can view terrain availability"
  ON public.bookings FOR SELECT
  USING (auth.uid() IS NOT NULL);
