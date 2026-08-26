-- ============================================================
-- 05_rls.sql
-- Row Level Security policies for all tables
-- Execute: Run AFTER 04_bookings.sql
-- ============================================================

-- ─── PROFILES ────────────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY profiles_select_own
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY profiles_update_own
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Admins can read all profiles
CREATE POLICY profiles_select_admin
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ─── DESTINATIONS ────────────────────────────────────────────

ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;

-- Everyone can read destinations (public data)
CREATE POLICY destinations_select_public
  ON destinations FOR SELECT
  USING (true);

-- ─── PROGRAMS ────────────────────────────────────────────────

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

-- Everyone can read published/available programs
CREATE POLICY programs_select_public
  ON programs FOR SELECT
  USING (status IN ('published', 'available', 'limited', 'full'));

-- Admins can manage all programs
CREATE POLICY programs_manage_admin
  ON programs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ─── PROGRAM DAYS ────────────────────────────────────────────

ALTER TABLE program_days ENABLE ROW LEVEL SECURITY;

-- Read access matches program visibility
CREATE POLICY program_days_select_public
  ON program_days FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM programs
      WHERE programs.id = program_days.program_id
        AND programs.status IN ('published', 'available', 'limited', 'full')
    )
  );

-- Admins can manage
CREATE POLICY program_days_manage_admin
  ON program_days FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ─── HOTELS ──────────────────────────────────────────────────

ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;

-- Everyone can read hotels (public data)
CREATE POLICY hotels_select_public
  ON hotels FOR SELECT
  USING (true);

-- Admins can manage
CREATE POLICY hotels_manage_admin
  ON hotels FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ─── PROGRAM DAY HOTELS ──────────────────────────────────────

ALTER TABLE program_day_hotels ENABLE ROW LEVEL SECURITY;

CREATE POLICY program_day_hotels_select_public
  ON program_day_hotels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM program_days
      JOIN programs ON programs.id = program_days.program_id
      WHERE program_days.id = program_day_hotels.program_day_id
        AND programs.status IN ('published', 'available', 'limited', 'full')
    )
  );

CREATE POLICY program_day_hotels_manage_admin
  ON program_day_hotels FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ─── PROGRAM HOTELS ──────────────────────────────────────────

ALTER TABLE program_hotels ENABLE ROW LEVEL SECURITY;

CREATE POLICY program_hotels_select_public
  ON program_hotels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM programs
      WHERE programs.id = program_hotels.program_id
        AND programs.status IN ('published', 'available', 'limited', 'full')
    )
  );

CREATE POLICY program_hotels_manage_admin
  ON program_hotels FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ─── BOOKINGS ────────────────────────────────────────────────

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Users can read their own bookings
CREATE POLICY bookings_select_own
  ON bookings FOR SELECT
  USING (user_id = auth.uid());

-- Users can create bookings for themselves
CREATE POLICY bookings_insert_own
  ON bookings FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can cancel their own bookings (if pending)
CREATE POLICY bookings_cancel_own
  ON bookings FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Employees and admins can read all bookings
CREATE POLICY bookings_select_employee
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('employee', 'admin')
    )
  );

-- Employees and admins can update bookings
CREATE POLICY bookings_update_employee
  ON bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('employee', 'admin')
    )
  );

-- ─── BOOKING TRAVELERS ───────────────────────────────────────

ALTER TABLE booking_travelers ENABLE ROW LEVEL SECURITY;

-- Users can read travelers for their own bookings
CREATE POLICY booking_travelers_select_own
  ON booking_travelers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_travelers.booking_id
        AND bookings.user_id = auth.uid()
    )
  );

-- Users can add travelers to their own bookings
CREATE POLICY booking_travelers_insert_own
  ON booking_travelers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_travelers.booking_id
        AND bookings.user_id = auth.uid()
    )
  );

-- Employees can manage travelers
CREATE POLICY booking_travelers_manage_employee
  ON booking_travelers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('employee', 'admin')
    )
  );

-- ─── FAVORITES ───────────────────────────────────────────────

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Users can read their own favorites
CREATE POLICY favorites_select_own
  ON favorites FOR SELECT
  USING (user_id = auth.uid());

-- Users can add to their own favorites
CREATE POLICY favorites_insert_own
  ON favorites FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can remove from their own favorites
CREATE POLICY favorites_delete_own
  ON favorites FOR DELETE
  USING (user_id = auth.uid());

-- ─── NOTIFICATIONS ───────────────────────────────────────────

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
CREATE POLICY notifications_select_own
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY notifications_update_own
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY notifications_delete_own
  ON notifications FOR DELETE
  USING (user_id = auth.uid());

-- Admins can create notifications
CREATE POLICY notifications_insert_admin
  ON notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );
