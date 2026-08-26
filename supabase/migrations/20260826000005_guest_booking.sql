-- ============================================================
-- GUEST BOOKING: Allow bookings without auth
-- Makes user_id nullable + adds customer info columns
-- ============================================================

-- 1. Make user_id nullable (was NOT NULL REFERENCES profiles)
ALTER TABLE bookings ALTER COLUMN user_id DROP NOT NULL;

-- 2. Add customer info columns for guest bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_city TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rooms_count INTEGER DEFAULT 1;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS room_type TEXT;

-- 3. Add guest INSERT policy (anonymous can create bookings)
DO $$ BEGIN
  DROP POLICY IF EXISTS bookings_insert_guest ON bookings;
  CREATE POLICY bookings_insert_guest
    ON bookings FOR INSERT
    WITH CHECK (
      user_id IS NULL AND
      customer_name IS NOT NULL AND
      customer_phone IS NOT NULL AND
      LENGTH(customer_name) > 0 AND
      LENGTH(customer_phone) > 0
    );
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 4. Allow anonymous INSERT on booking_travelers
DO $$ BEGIN
  DROP POLICY IF EXISTS booking_travelers_insert_guest ON booking_travelers;
  CREATE POLICY booking_travelers_insert_guest
    ON booking_travelers FOR INSERT
    WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
