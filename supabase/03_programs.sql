-- ============================================================
-- 03_programs.sql
-- Programs, destinations, program days, hotels
-- Execute: Run AFTER 02_profiles.sql
-- ============================================================

-- ─── DESTINATIONS ────────────────────────────────────────────

CREATE TABLE destinations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  emoji         TEXT,
  gradient      TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_destinations_sort ON destinations(sort_order);

-- ─── PROGRAMS ────────────────────────────────────────────────

CREATE TABLE programs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  destination_id      UUID NOT NULL REFERENCES destinations(id) ON DELETE RESTRICT,
  type                program_type NOT NULL DEFAULT 'tourism',
  status              program_status NOT NULL DEFAULT 'draft',
  cover_image         TEXT,
  emoji               TEXT,
  gradient            TEXT,

  date_departure      DATE,
  date_return         DATE,
  date_display        TEXT,
  date_return_display  TEXT,
  days                INTEGER NOT NULL DEFAULT 0,
  nights              INTEGER NOT NULL DEFAULT 0,

  price               NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency            TEXT NOT NULL DEFAULT 'د.ع',

  short_description   TEXT,
  full_description    TEXT,

  highlights          TEXT[] DEFAULT '{}',
  included_services   TEXT[] DEFAULT '{}',
  excluded_services   TEXT[] DEFAULT '{}',

  booking_terms       TEXT,
  cancellation_policy TEXT,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_programs_destination ON programs(destination_id);
CREATE INDEX idx_programs_type ON programs(type);
CREATE INDEX idx_programs_status ON programs(status);
CREATE INDEX idx_programs_date_departure ON programs(date_departure);
CREATE INDEX idx_programs_price ON programs(price);
CREATE INDEX idx_programs_created_at ON programs(created_at);

-- ─── PROGRAM DAYS (Itinerary) ────────────────────────────────

CREATE TABLE program_days (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id      UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  day_number      INTEGER NOT NULL,
  title           TEXT NOT NULL,
  city            TEXT,
  description     TEXT,
  notes           TEXT,

  meals_breakfast BOOLEAN NOT NULL DEFAULT false,
  meals_lunch     BOOLEAN NOT NULL DEFAULT false,
  meals_dinner    BOOLEAN NOT NULL DEFAULT false,

  visits          TEXT[] DEFAULT '{}',
  activities      TEXT[] DEFAULT '{}',

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraint: one day number per program
ALTER TABLE program_days
  ADD CONSTRAINT program_days_unique_day UNIQUE (program_id, day_number);

CREATE INDEX idx_program_days_program ON program_days(program_id);

-- ─── HOTELS ──────────────────────────────────────────────────

CREATE TABLE hotels (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  city            TEXT NOT NULL,
  stars           INTEGER NOT NULL DEFAULT 3 CHECK (stars BETWEEN 1 AND 5),
  rating          NUMERIC(2,1) CHECK (rating BETWEEN 1.0 AND 5.0),
  image_url       TEXT,
  address         TEXT,
  description     TEXT,
  amenities       TEXT[] DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hotels_city ON hotels(city);

-- ─── PROGRAM DAY HOTELS (link days to hotels) ────────────────

CREATE TABLE program_day_hotels (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_day_id  UUID NOT NULL REFERENCES program_days(id) ON DELETE CASCADE,
  hotel_id        UUID NOT NULL REFERENCES hotels(id) ON DELETE RESTRICT,
  room_type       TEXT,
  nights          INTEGER NOT NULL DEFAULT 1,
  sort_order      INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_program_day_hotels_day ON program_day_hotels(program_day_id);

-- ─── PROGRAM HOTELS (link programs to hotels directly) ───────

CREATE TABLE program_hotels (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id      UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  hotel_id        UUID NOT NULL REFERENCES hotels(id) ON DELETE RESTRICT,
  room_type       TEXT,
  nights          INTEGER NOT NULL DEFAULT 0,
  amenities       TEXT[] DEFAULT '{}',
  sort_order      INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_program_hotels_program ON program_hotels(program_id);

-- ─── UPDATED_AT TRIGGERS ─────────────────────────────────────

CREATE OR REPLACE FUNCTION update_destinations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_destinations_updated_at
  BEFORE UPDATE ON destinations
  FOR EACH ROW EXECUTE FUNCTION update_destinations_updated_at();

CREATE OR REPLACE FUNCTION update_programs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION update_programs_updated_at();

CREATE OR REPLACE FUNCTION update_hotels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_hotels_updated_at
  BEFORE UPDATE ON hotels
  FOR EACH ROW EXECUTE FUNCTION update_hotels_updated_at();
