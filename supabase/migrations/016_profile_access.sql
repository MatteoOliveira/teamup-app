-- ============================================================
-- TeamUp! — Migration 016 : Profile access control
-- ============================================================
-- Stores who has been granted access to a private profile.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profile_access (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewer_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  granted_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (profile_id, viewer_id)
);

ALTER TABLE public.profile_access ENABLE ROW LEVEL SECURITY;

-- Profile owner can see all accesses to their profile and manage them
CREATE POLICY "Owner manages their profile access list"
  ON public.profile_access FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Viewer can check if they have access
CREATE POLICY "Viewer can see their own access"
  ON public.profile_access FOR SELECT
  USING (viewer_id = auth.uid());
