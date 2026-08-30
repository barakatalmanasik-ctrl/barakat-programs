-- ============================================================
-- 06_functions_triggers.sql
-- Helper functions and triggers
-- Execute: Run AFTER 05_rls.sql
-- ============================================================

-- ─── GENERATE BOOKING ORDER NUMBER ───────────────────────────
-- Generated from a SEQUENCE (atomic, race-free) as BK-YYYY-NNNNN.

DO $$
DECLARE current_max INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 9) AS INTEGER)), 0) + 1
    INTO current_max
    FROM bookings
    WHERE order_number ~ '^BK-[0-9]{4}-[0-9]+$';

  EXECUTE format(
    'CREATE SEQUENCE IF NOT EXISTS bookings_order_number_seq START WITH %s',
    current_max
  );
END $$;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  bok_year TEXT;
  bok_seq  INTEGER;
BEGIN
  SELECT to_char(now(), 'YYYY') INTO bok_year;
  bok_seq := nextval('bookings_order_number_seq');
  NEW.order_number := 'BK-' || bok_year || '-' || LPAD(bok_seq::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_order_number
  BEFORE INSERT ON bookings
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION generate_order_number();

-- ─── AUTO-ASSIGN TRAVELERS COUNT FROM booking_travelers ──────

CREATE OR REPLACE FUNCTION update_travelers_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE bookings
  SET travelers_count = (
    SELECT COUNT(*) FROM booking_travelers WHERE booking_id = NEW.booking_id
  )
  WHERE id = NEW.booking_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_travelers_count_insert
  AFTER INSERT OR DELETE ON booking_travelers
  FOR EACH ROW
  EXECUTE FUNCTION update_travelers_count();

-- ─── SEND WELCOME NOTIFICATION ON SIGNUP ─────────────────────

CREATE OR REPLACE FUNCTION send_welcome_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, title, message, type)
  VALUES (
    NEW.id,
    'مرحباً بك في بركات المناسك',
    'اكتشف أجمل البرامج السياحية والدينية معنا. نتمنى لك رحلة ممتعة!',
    'welcome'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_welcome
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION send_welcome_notification();

-- ─── HELPER: Check if user is admin ──────────────────────────

CREATE OR REPLACE FUNCTION is_admin(uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = uid AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── HELPER: Check if user is employee or admin ──────────────

CREATE OR REPLACE FUNCTION is_employee_or_admin(uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = uid AND role IN ('employee', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
