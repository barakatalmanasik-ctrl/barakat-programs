-- ============================================================
-- 04_bookings.sql
-- Bookings, travelers, favorites, notifications
-- Execute: Run AFTER 03_programs.sql
-- ============================================================

-- ─── BOOKINGS ────────────────────────────────────────────────

CREATE TABLE bookings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number      TEXT NOT NULL UNIQUE,
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  program_id        UUID NOT NULL REFERENCES programs(id) ON DELETE RESTRICT,
  status            booking_status NOT NULL DEFAULT 'pending',
  travelers_count   INTEGER NOT NULL DEFAULT 1 CHECK (travelers_count > 0),
  total_price       NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency          TEXT NOT NULL DEFAULT 'SAR',

  customer_notes    TEXT DEFAULT '',
  employee_notes    TEXT DEFAULT '',
  assigned_employee UUID REFERENCES profiles(id) ON DELETE SET NULL,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_program ON bookings(program_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
CREATE INDEX idx_bookings_employee ON bookings(assigned_employee);

-- ─── BOOKING TRAVELERS ───────────────────────────────────────

CREATE TABLE booking_travelers (
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

-- Indexes
CREATE INDEX idx_booking_travelers_booking ON booking_travelers(booking_id);

-- ─── FAVORITES ───────────────────────────────────────────────

CREATE TABLE favorites (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  program_id    UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT favorites_unique_user_program UNIQUE (user_id, program_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);

-- ─── NOTIFICATIONS ───────────────────────────────────────────

CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  message       TEXT NOT NULL,
  type          notification_type NOT NULL DEFAULT 'system',
  is_read       BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read);

-- ─── UPDATED_AT TRIGGERS ─────────────────────────────────────

CREATE OR REPLACE FUNCTION update_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_bookings_updated_at();
