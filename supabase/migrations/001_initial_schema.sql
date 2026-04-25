-- ============================================================
-- TeamUp! — Migration 001 : Schéma initial
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── PROFILES ────────────────────────────────────────────────
-- Extends auth.users (created automatically by Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT UNIQUE,
  full_name     TEXT,
  avatar_url    TEXT,
  bio           TEXT,
  level         TEXT DEFAULT 'beginner' CHECK (level IN ('beginner','intermediate','advanced','expert')),
  location      TEXT,
  sports        TEXT[] DEFAULT '{}',
  points        INT DEFAULT 0,
  events_count  INT DEFAULT 0,
  wins_count    INT DEFAULT 0,
  teams_count   INT DEFAULT 0,
  hours_played  INT DEFAULT 0,
  is_admin      BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── TERRAINS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.terrains (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  sport       TEXT NOT NULL,
  address     TEXT NOT NULL,
  district    TEXT,                         -- ex: "Paris 19e"
  lat         DECIMAL(9,6),
  lng         DECIMAL(9,6),
  price_hour  DECIMAL(6,2) DEFAULT 0,       -- 0 = free
  rating      DECIMAL(3,1) DEFAULT 0,
  image_url   TEXT,
  amenities   TEXT[] DEFAULT '{}',          -- ex: ['lighting','showers']
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── EVENTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  terrain_id      UUID REFERENCES public.terrains(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  sport           TEXT NOT NULL,
  level           TEXT DEFAULT 'all' CHECK (level IN ('all','beginner','intermediate','advanced')),
  description     TEXT,
  event_date      DATE NOT NULL,
  start_time      TIME NOT NULL,
  duration_min    INT NOT NULL DEFAULT 60,
  max_players     INT NOT NULL DEFAULT 10,
  current_players INT DEFAULT 1,
  visibility      TEXT DEFAULT 'public' CHECK (visibility IN ('public','private','invite')),
  status          TEXT DEFAULT 'open' CHECK (status IN ('open','full','cancelled','done')),
  location_text   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── EVENT PARTICIPANTS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.event_participants (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id    UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status      TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed','waitlist','cancelled')),
  joined_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (event_id, user_id)
);

-- Keep current_players in sync
CREATE OR REPLACE FUNCTION public.update_event_player_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
    UPDATE public.events SET current_players = current_players + 1 WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'confirmed' THEN
    UPDATE public.events SET current_players = GREATEST(current_players - 1, 1) WHERE id = OLD.event_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'confirmed' AND NEW.status = 'confirmed' THEN
      UPDATE public.events SET current_players = current_players + 1 WHERE id = NEW.event_id;
    ELSIF OLD.status = 'confirmed' AND NEW.status != 'confirmed' THEN
      UPDATE public.events SET current_players = GREATEST(current_players - 1, 1) WHERE id = NEW.event_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_event_player_count ON public.event_participants;
CREATE TRIGGER trg_event_player_count
  AFTER INSERT OR UPDATE OR DELETE ON public.event_participants
  FOR EACH ROW EXECUTE FUNCTION public.update_event_player_count();

-- Auto-mark event as full
CREATE OR REPLACE FUNCTION public.check_event_full()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.events
  SET status = CASE WHEN current_players >= max_players THEN 'full' ELSE 'open' END
  WHERE id = NEW.id AND status IN ('open','full');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_event_full ON public.events;
CREATE TRIGGER trg_check_event_full
  AFTER UPDATE OF current_players ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.check_event_full();

-- ── TEAMS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.teams (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  sport       TEXT NOT NULL,
  level       TEXT DEFAULT 'all',
  description TEXT,
  avatar_url  TEXT,
  location    TEXT,
  is_public   BOOLEAN DEFAULT TRUE,
  members_count INT DEFAULT 1,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── TEAM MEMBERS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.team_members (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id     UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role        TEXT DEFAULT 'member' CHECK (role IN ('owner','admin','member')),
  joined_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (team_id, user_id)
);

-- Keep members_count in sync
CREATE OR REPLACE FUNCTION public.update_team_member_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.teams SET members_count = members_count + 1 WHERE id = NEW.team_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.teams SET members_count = GREATEST(members_count - 1, 1) WHERE id = OLD.team_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_team_member_count ON public.team_members;
CREATE TRIGGER trg_team_member_count
  AFTER INSERT OR DELETE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.update_team_member_count();

-- ── MESSAGES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id     UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast team message queries
CREATE INDEX IF NOT EXISTS idx_messages_team_created ON public.messages(team_id, created_at DESC);

-- ── BOOKINGS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bookings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  terrain_id  UUID NOT NULL REFERENCES public.terrains(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id    UUID REFERENCES public.events(id) ON DELETE SET NULL,
  date        DATE NOT NULL,
  start_time  TIME NOT NULL,
  end_time    TIME NOT NULL,
  status      TEXT DEFAULT 'confirmed' CHECK (status IN ('pending','confirmed','cancelled')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── UPDATED_AT triggers ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
