-- ============================================================
-- diagnose_question_marks.sql  (READ-ONLY - nothing is changed)
--
-- Purpose: find WHERE the "????" seen in the admin "البرامج"
-- section comes from. A live anonymous read proved the 4 Umrah
-- programs already store clean Arabic (correct UTF-8), so any
-- "????" rows must be ADDITIONAL rows in the `programs` table
-- that are hidden from the public site (e.g. draft), or another
-- display source. Run each block and copy the results back.
--
-- Run in: Supabase Dashboard -> SQL Editor -> New query -> Run.
-- ============================================================

-- 1) Every program the database actually holds (admin sees all):
SELECT id, status, name, destination_id, price, currency, created_at
FROM programs
ORDER BY created_at, name;

-- 2) Any program whose Arabic text is damaged ('?' sequences,
--    or UTF-8 mojibake). No rows = data is clean:
SELECT id, status, name
FROM programs
WHERE name ~ '\?{2,}'
   OR name ~ 'Ø|Ã|â€|Ø¨'
   OR full_description ~ '\?{2,}';

-- 3) All destinations the database actually holds:
SELECT id, name, emoji FROM destinations ORDER BY sort_order, name;

-- 4) Count sanity check (expect 8 programs total after restore):
SELECT status, count(*) FROM programs GROUP BY status ORDER BY status;

-- ============================================================
-- If block #2 returns damaged rows, do NOT try to fix them by
-- hand. Reply with the rows and we will restore that data from
-- the Git originals instead (deleting only the damaged rows that
-- match NO real company program).
-- ============================================================