-- ============================================================
-- TeamUp! — Migration 010 : Notifications system
-- ============================================================
-- Table notifications + RLS + triggers automatiques:
--   • Quelqu'un rejoint ton event  → notif organisateur
--   • Quelqu'un rejoint ton équipe → notif propriétaire
--   • Message event_invite posté   → notif membres équipe
-- ============================================================

-- ── Table ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT,
  data       JSONB DEFAULT '{}',
  read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id, created_at DESC);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can mark own notifications read"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── Helper: insert a notification (bypasses RLS) ─────────────
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type    TEXT,
  p_title   TEXT,
  p_body    TEXT DEFAULT NULL,
  p_data    JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.notifications(user_id, type, title, body, data)
  VALUES (p_user_id, p_type, p_title, p_body, p_data);
$$;

-- ── Trigger: someone joins an event → notify organizer ───────
CREATE OR REPLACE FUNCTION public.notify_event_joined()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_organizer UUID;
  v_event_title TEXT;
  v_joiner_name TEXT;
BEGIN
  -- Skip if organizer joins their own event
  SELECT organizer_id, title INTO v_organizer, v_event_title
  FROM public.events WHERE id = NEW.event_id;

  IF v_organizer IS NULL OR v_organizer = NEW.user_id THEN
    RETURN NEW;
  END IF;

  SELECT full_name INTO v_joiner_name
  FROM public.profiles WHERE id = NEW.user_id;

  PERFORM public.create_notification(
    v_organizer,
    'event_joined',
    '🎉 Nouvelle participation',
    COALESCE(v_joiner_name, 'Quelqu''un') || ' a rejoint ' || COALESCE(v_event_title, 'ton événement'),
    jsonb_build_object('event_id', NEW.event_id)
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_event_joined ON public.event_participants;
CREATE TRIGGER trg_notify_event_joined
  AFTER INSERT ON public.event_participants
  FOR EACH ROW EXECUTE FUNCTION public.notify_event_joined();

-- ── Trigger: someone joins a team → notify owner ─────────────
CREATE OR REPLACE FUNCTION public.notify_team_joined()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner UUID;
  v_team_name TEXT;
  v_joiner_name TEXT;
BEGIN
  SELECT owner_id, name INTO v_owner, v_team_name
  FROM public.teams WHERE id = NEW.team_id;

  IF v_owner IS NULL OR v_owner = NEW.user_id THEN
    RETURN NEW;
  END IF;

  SELECT full_name INTO v_joiner_name
  FROM public.profiles WHERE id = NEW.user_id;

  PERFORM public.create_notification(
    v_owner,
    'team_joined',
    '👥 Nouveau membre',
    COALESCE(v_joiner_name, 'Quelqu''un') || ' a rejoint ' || COALESCE(v_team_name, 'ton équipe'),
    jsonb_build_object('team_id', NEW.team_id)
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_team_joined ON public.team_members;
CREATE TRIGGER trg_notify_team_joined
  AFTER INSERT ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.notify_team_joined();

-- ── Trigger: event_invite message → notify team members ──────
CREATE OR REPLACE FUNCTION public.notify_event_invite_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_member RECORD;
  v_sender_name TEXT;
  v_event_title TEXT;
BEGIN
  IF NEW.message_type <> 'event_invite' THEN
    RETURN NEW;
  END IF;

  SELECT full_name INTO v_sender_name
  FROM public.profiles WHERE id = NEW.sender_id;

  v_event_title := NEW.content::jsonb->>'title';

  FOR v_member IN
    SELECT user_id FROM public.team_members
    WHERE team_id = NEW.team_id AND user_id <> NEW.sender_id
  LOOP
    PERFORM public.create_notification(
      v_member.user_id,
      'event_invite',
      '📅 Invitation à un événement',
      COALESCE(v_sender_name, 'Quelqu''un') || ' a partagé "' || COALESCE(v_event_title, 'un événement') || '"',
      jsonb_build_object('event_id', NEW.event_id, 'team_id', NEW.team_id)
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_event_invite ON public.messages;
CREATE TRIGGER trg_notify_event_invite
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_event_invite_message();
