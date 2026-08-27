-- ============================================================
-- 20260827000006_cleanup_iqd_currency.sql
-- Client request: use Iraqi Dinar (د.ع) everywhere + delete the
-- fake/sample programs.
--
-- 1) Removes all sample programs that are NOT real company trips
--    (Turkey, Egypt, Dubai, Malaysia, Lebanon, Tehran/Qeshm,
--    Iraq holy, generic Umrah) — keeps only the 4 Iran programs
--    and the 4 Umrah programs.
-- 2) Removes the orphan sample destinations and hotels that were
--    only used by those fake programs.
-- 3) Normalizes currency to Iraqi Dinar (د.ع) on all remaining
--    programs and existing bookings (old values: SAR, ر.س, ج.د).
--
-- IDEMPOTENT: safe to run once or re-run. Deleting by name will
-- simply match nothing on a second run.
-- Paste into: Supabase Dashboard -> SQL Editor -> New query -> Run.
-- ============================================================

-- ─── 1. Delete fake programs by name ──────────────────────────
DELETE FROM programs
WHERE name IN (
  'رحلة مشاهير طهران وقشم',
  'جولة استانبول السياحية',
  'الجولة المقدسة - لبنان وبيت لحم',
  'زيارة العتبات المقدسة في العراق',
  'عمرة مباركة - مكة والمدينة',
  'جولة أهرامات مصر',
  'عطلة دبي السياحية',
  'جولة ماليزيا الاستوائية'
);

-- ─── 2. Delete orphan sample destinations ─────────────────────
DELETE FROM destinations
WHERE name IN ('تركيا', 'لبنان', 'العراق', 'مصر', 'دبي', 'ماليزيا', 'السعودية')
  AND NOT EXISTS (SELECT 1 FROM programs WHERE programs.destination_id = destinations.id);

-- ─── 3. Delete sample hotels (only used by fake programs) ─────
DELETE FROM program_hotels
WHERE hotel_id IN (SELECT id FROM hotels WHERE name IN (
  'فندق إسبيرانس طهران', 'فندق قصر قشم',
  'فندق هوليداي إين استانبول', 'فندق مارمارا تكسيم',
  'فندق راديسون بلو بيروت', 'فندق أرمونيا بيت لحم',
  'هيلتون جدة', 'فندق أبراج دبي', 'فندق جميرا بيتش',
  'فندق كوالالمبور', 'فندق لانكاوي'
));

DELETE FROM program_day_hotels
WHERE hotel_id IN (SELECT id FROM hotels WHERE name IN (
  'فندق إسبيرانس طهران', 'فندق قصر قشم',
  'فندق هوليداي إين استانبول', 'فندق مارمارا تكسيم',
  'فندق راديسون بلو بيروت', 'فندق أرمونيا بيت لحم',
  'هيلتون جدة', 'فندق أبراج دبي', 'فندق جميرا بيتش',
  'فندق كوالالمبور', 'فندق لانكاوي'
));

DELETE FROM hotels
WHERE name IN (
  'فندق إسبيرانس طهران', 'فندق قصر قشم',
  'فندق هوليداي إين استانبول', 'فندق مارمارا تكسيم',
  'فندق راديسون بلو بيروت', 'فندق أرمونيا بيت لحم',
  'هيلتون جدة', 'فندق أبراج دبي', 'فندق جميرا بيتش',
  'فندق كوالالمبور', 'فندق لانكاوي'
);

-- ─── 4. Normalize currency to Iraqi Dinar (د.ع) ───────────────
UPDATE programs SET currency = 'د.ع' WHERE currency IS DISTINCT FROM 'د.ع';

UPDATE bookings SET currency = 'د.ع'
WHERE currency IS NULL OR currency IN ('SAR', 'ر.س', 'ج.د', '');

-- ============================================================
-- DONE. Refresh the site: only the 4 Iran + 4 Umrah programs
-- remain, all priced in Iraqi Dinar (د.ع).
-- ============================================================