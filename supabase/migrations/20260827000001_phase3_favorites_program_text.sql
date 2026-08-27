-- ============================================================
-- PHASE 3: Favorites program_id type loosening
-- Mock program data uses integer string ids (1, 2, 3...) while
-- the programs table uses UUIDs. Loosen favorites.program_id to
-- TEXT so the frontend can store either mock ids or real UUIDs
-- without breaking on the FK to programs(id).
-- This is a SAFE, non-destructive migration.
-- ============================================================

-- Enabling the trigger-safe change: drop FK first, then alter type
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_program_id_fkey;

ALTER TABLE favorites ALTER COLUMN program_id TYPE TEXT;

-- Re-create a lightweight index on the now-text program_id
DROP INDEX IF EXISTS idx_favorites_program;
CREATE INDEX idx_favorites_program ON favorites(program_id);
