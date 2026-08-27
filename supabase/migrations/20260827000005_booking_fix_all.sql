-- ============================================================
-- 20260827000005_booking_fix_all.sql
-- ONE-PASTE FIX for: "تعذر إرسال طلب الحجز" (booking send failed)
--
-- Why bookings fail today:
--   1. bookings.user_id is STILL NOT NULL -> guest bookings (user
--      not logged in) are rejected by the DB.
--   2. Guest INSERT policies (bookings_insert_guest, travelers
--      guest) are missing -> anonymous inserts blocked by RLS.
--   3. conversations/messages tables missing -> chat/booking-detail
--      pages cannot load.
--   4. order_number generator may be missing -> insert fails before
--      returning an order number.
--
-- This file is fully IDEMPOTENT (safe to run once or run again).
-- Paste it into: Supabase Dashboard -> SQL Editor -> New query -> Run.
-- ============================================================

-- ─── 0. Ensure enums exist ────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='booking_status') THEN
    CREATE TYPE booking_status AS ENUM ('pending','reviewing','confirmed','cancelled','completed');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='notification_type') THEN
    CREATE TYPE notification_type AS ENUM ('welcome','promo','update','alert','order');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='user_role') THEN
    CREATE TYPE user_role AS ENUM ('customer','employee','admin');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='conversation_status') THEN
    CREATE TYPE conversation_status AS ENUM ('open','pending','resolved','closed');
  END IF;
END $$;

-- ─── 1. bookings table (create if missing) ────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number      TEXT NOT NULL UNIQUE,
  user_id           UUID REFERENCES profiles(id) ON DELETE RESTRICT,
  program_id        UUID NOT NULL REFERENCES programs(id) ON DELETE RESTRICT,
  status            booking_status NOT NULL DEFAULT 'pending',
  travelers_count   INTEGER NOT NULL DEFAULT 1 CHECK (travelers_count > 0),
  total_price       NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency          TEXT NOT NULL DEFAULT 'ج.د',
  customer_notes    TEXT DEFAULT '',
  employee_notes    TEXT DEFAULT '',
  assigned_employee UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_name     TEXT,
  customer_phone    TEXT,
  customer_email    TEXT,
  customer_city     TEXT,
  rooms_count       INTEGER DEFAULT 1,
  room_type         TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Make user_id nullable (THE key fix for guest bookings)
ALTER TABLE bookings ALTER COLUMN user_id DROP NOT NULL;

-- Add customer info columns if not present (re-run safety)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_city TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rooms_count INTEGER DEFAULT 1;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS room_type TEXT;

-- Indexes (safe)
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_program ON bookings(program_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- ─── 2. booking_travelers table ───────────────────────────────
CREATE TABLE IF NOT EXISTS booking_travelers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  phone           TEXT,
  date_of_birth   DATE,
  passport_number TEXT,
  nationality     TEXT,
  notes           TEXT DEFAULT '',
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_travelers_booking ON booking_travelers(booking_id);

-- ─── 3. conversations + messages tables ───────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id        UUID REFERENCES bookings(id) ON DELETE CASCADE,
  subject           TEXT NOT NULL DEFAULT '',
  status            conversation_status NOT NULL DEFAULT 'open',
  assigned_employee UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_name     TEXT,
  customer_phone    TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_booking ON conversations(booking_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);

CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sender_role     user_role NOT NULL DEFAULT 'customer',
  message         TEXT NOT NULL,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- ─── 4. RLS ───────────────────────────────────────────────────
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_travelers ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- bookings: owner read/insert/update
  DROP POLICY IF EXISTS bookings_select_own ON bookings;
  CREATE POLICY bookings_select_own ON bookings FOR SELECT USING (user_id = auth.uid());

  DROP POLICY IF EXISTS bookings_insert_own ON bookings;
  CREATE POLICY bookings_insert_own ON bookings FOR INSERT WITH CHECK (user_id = auth.uid());

  DROP POLICY IF EXISTS bookings_cancel_own ON bookings;
  CREATE POLICY bookings_cancel_own ON bookings FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

  -- bookings: GUEST insert (THE key fix)
  DROP POLICY IF EXISTS bookings_insert_guest ON bookings;
  CREATE POLICY bookings_insert_guest ON bookings FOR INSERT
    WITH CHECK (
      user_id IS NULL AND
      customer_name IS NOT NULL AND
      customer_phone IS NOT NULL AND
      LENGTH(customer_name) > 0 AND
      LENGTH(customer_phone) > 0
    );

  -- bookings: staff read/update
  DROP POLICY IF EXISTS bookings_select_employee ON bookings;
  CREATE POLICY bookings_select_employee ON bookings FOR SELECT
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('employee','admin')));

  DROP POLICY IF EXISTS bookings_update_employee ON bookings;
  CREATE POLICY bookings_update_employee ON bookings FOR UPDATE
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('employee','admin')));

  -- travelers: owner + guest + staff
  DROP POLICY IF EXISTS booking_travelers_select_own ON booking_travelers;
  CREATE POLICY booking_travelers_select_own ON booking_travelers FOR SELECT
    USING (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_travelers.booking_id AND bookings.user_id = auth.uid()));

  DROP POLICY IF EXISTS booking_travelers_insert_own ON booking_travelers;
  CREATE POLICY booking_travelers_insert_own ON booking_travelers FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_travelers.booking_id AND bookings.user_id = auth.uid()));

  DROP POLICY IF EXISTS booking_travelers_insert_guest ON booking_travelers;
  CREATE POLICY booking_travelers_insert_guest ON booking_travelers FOR INSERT WITH CHECK (true);

  DROP POLICY IF EXISTS booking_travelers_manage_employee ON booking_travelers;
  CREATE POLICY booking_travelers_manage_employee ON booking_travelers FOR ALL
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('employee','admin')));

  -- conversations + messages (chat)
  DROP POLICY IF EXISTS conversations_select_own ON conversations;
  CREATE POLICY conversations_select_own ON conversations FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('employee','admin'))
  );
  DROP POLICY IF EXISTS conversations_insert_own ON conversations;
  CREATE POLICY conversations_insert_own ON conversations FOR INSERT WITH CHECK (user_id = auth.uid());
  DROP POLICY IF EXISTS conversations_update_staff ON conversations;
  CREATE POLICY conversations_update_staff ON conversations FOR UPDATE
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('employee','admin')))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('employee','admin')));

  DROP POLICY IF EXISTS messages_select ON messages;
  CREATE POLICY messages_select ON messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id
      AND (c.user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('employee','admin'))))
  );
  DROP POLICY IF EXISTS messages_insert ON messages;
  CREATE POLICY messages_insert ON messages FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id
      AND (c.user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('employee','admin'))))
  );
END $$;

-- ─── 5. order_number generator (BK-YYYY-NNNNN) ────────────────
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  bok_seq INTEGER;
  bok_year TEXT;
BEGIN
  SELECT to_char(now(), 'YYYY') INTO bok_year;
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 9) AS INTEGER)), 0) + 1
    INTO bok_seq
    FROM bookings
    WHERE order_number LIKE 'BK-' || bok_year || '-%';
  NEW.order_number = 'BK-' || bok_year || '-' || LPAD(bok_seq::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_order_number ON bookings;
CREATE TRIGGER trigger_generate_order_number
  BEFORE INSERT ON bookings
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION generate_order_number();

-- ─── 6. updated_at trigger ────────────────────────────────────
CREATE OR REPLACE FUNCTION update_bookings_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trigger_bookings_updated_at ON bookings;
CREATE TRIGGER trigger_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_bookings_updated_at();

-- ─── 7. Realtime for chat ─────────────────────────────────────
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE conversations; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE messages; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- ============================================================
-- DONE. Try booking again (from the app). Order numbers will
-- now look like BK-2026-00001.
-- ============================================================
