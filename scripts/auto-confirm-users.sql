-- =============================================
-- AUTO-CONFIRM NEW USERS (skip email verification)
-- Run this ONCE in your Supabase SQL Editor
-- https://supabase.com/dashboard/project/qbsylqashtvdbizzmkoa/sql/new
-- =============================================

CREATE OR REPLACE FUNCTION auto_confirm_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE auth.users
  SET
    email_confirmed_at = NOW(),
    confirmed_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_user_created_auto_confirm ON auth.users;
CREATE TRIGGER on_user_created_auto_confirm
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_confirm_new_user();
