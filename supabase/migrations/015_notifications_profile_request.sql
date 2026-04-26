-- ============================================================
-- TeamUp! — Migration 015 : Allow profile request notifications
-- ============================================================
-- The current INSERT policy only lets users insert notifications
-- for themselves (user_id = auth.uid()).
-- Profile request feature needs to insert a notification for
-- another user. Add a narrow policy limited to type='profile_request'.
-- ============================================================

CREATE POLICY "Authenticated users can send profile request notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND type = 'profile_request'
  );
