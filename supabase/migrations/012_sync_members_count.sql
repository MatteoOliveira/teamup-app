-- ============================================================
-- TeamUp! — Migration 012 : Auto-sync teams.members_count
-- ============================================================
-- members_count was set manually and never included the owner.
-- Fix: trigger that increments/decrements on team_members changes
-- + recalculate all existing counts from real data.
-- ============================================================

-- Trigger function
CREATE OR REPLACE FUNCTION sync_team_members_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.teams SET members_count = members_count + 1 WHERE id = NEW.team_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.teams SET members_count = GREATEST(0, members_count - 1) WHERE id = OLD.team_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_team_members_count ON public.team_members;

CREATE TRIGGER trg_sync_team_members_count
  AFTER INSERT OR DELETE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION sync_team_members_count();

-- Recalculate all existing counts from real membership data
UPDATE public.teams t
SET members_count = (
  SELECT COUNT(*) FROM public.team_members tm WHERE tm.team_id = t.id
);
