-- ============================================================
-- Migration 018 — Sports table + Sport proposals
-- ============================================================

-- 1. Table des sports (gérée par les admins)
CREATE TABLE IF NOT EXISTS public.sports (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug       text        NOT NULL UNIQUE,
  name       text        NOT NULL,
  emoji      text        NOT NULL DEFAULT '🏅',
  color      text        NOT NULL DEFAULT '#8A93A6',
  is_active  boolean     NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Seed avec les sports existants
INSERT INTO public.sports (slug, name, emoji, color) VALUES
  ('basket',  'Basketball', '🏀', '#FF6B35'),
  ('foot',    'Football',   '⚽', '#2EC4B6'),
  ('tennis',  'Tennis',     '🎾', '#F4B43A'),
  ('running', 'Running',    '🏃', '#7B61FF'),
  ('volley',  'Volleyball', '🏐', '#EC4899'),
  ('padel',   'Padel',      '🏓', '#3B82F6'),
  ('velo',    'Vélo',       '🚴', '#06B6D4'),
  ('yoga',    'Yoga',       '🧘', '#14B8A6')
ON CONFLICT (slug) DO NOTHING;

-- RLS sports
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sports visible to all"
  ON public.sports FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage sports"
  ON public.sports FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- ============================================================

-- 2. Table des propositions de sport (soumises par les users)
CREATE TABLE IF NOT EXISTS public.sport_proposals (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  emoji       text        NOT NULL DEFAULT '🏅',
  description text,
  status      text        NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note  text,
  created_at  timestamptz DEFAULT now()
);

-- RLS sport_proposals
ALTER TABLE public.sport_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own proposals, admins see all"
  ON public.sport_proposals FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Users can submit proposals"
  ON public.sport_proposals FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update proposals"
  ON public.sport_proposals FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Users can delete own pending proposals"
  ON public.sport_proposals FOR DELETE
  USING (user_id = auth.uid() AND status = 'pending');
