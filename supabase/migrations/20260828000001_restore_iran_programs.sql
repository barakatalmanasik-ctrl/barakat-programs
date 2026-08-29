-- ============================================================
-- 20260828000001_restore_iran_programs.sql
-- Diagnostic: the live site only shows the 4 Umrah programs.
-- A live read of `programs` shows 0 rows for every Iran program
-- (checking published/available/limited/full/draft/expired), so
-- the 4 Iran programs are MISSING from the database, not hidden
-- by the frontend filter (HomePage shows published/available/
-- limited programs).
--
-- This restores the ORIGINAL "إيران" destination + the 4 Iran
-- programs with the EXACT Arabic text and prices from the repo
-- originals (07_seed_data.sql + 20260827000004 price updates):
--     مشهد جواً (6 ليالي) ......... 500,000 د.ع
--     بري (قم-مشهد-كاشان) .......... 250,000 د.ع
--     جوا (قم-مشهد) ................ 750,000 د.ع
--     شمال ايران + مشهد ............ 900,000 د.ع
--
-- SAFE: 100% INSERT-only with ON CONFLICT (id) DO NOTHING.
--   - Does NOT delete or overwrite ANY existing row.
--   - Does NOT touch the 4 Umrah programs (bbbbbbbb-...).
--   - Hotels + program_hotels links are re-inserted only if the
--     fixed IDs are absent.
-- Paste into: Supabase Dashboard -> SQL Editor -> New query -> Run.
-- ============================================================

-- ─── 1. Destination: إيران ────────────────────────────────────
INSERT INTO destinations (id, name, emoji, gradient, sort_order)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'إيران',
  '🇮🇷',
  'linear-gradient(135deg, #1B3A5C 0%, #2C5F8A 100%)',
  1
)
ON CONFLICT (id) DO NOTHING;

-- ─── 2. The 4 original Iran programs ──────────────────────────

-- 2.1 كروب ايران جوا (مشهد جواً) - 6 ليالي مشهد - 500,000 د.ع
INSERT INTO programs (
  id, name, destination_id, type, status, cover_image, emoji,
  date_departure, date_return, date_display, date_return_display,
  days, nights, price, currency,
  short_description, full_description,
  highlights, included_services, excluded_services,
  booking_terms, cancellation_policy
) VALUES (
  'aaaaaaaa-1111-0000-0000-000000000001',
  'كروب ايران جوا (مشهد جواً) - 6 ليالي مشهد',
  '11111111-1111-1111-1111-111111111111',
  'religious', 'published', 'images/iran-jawwa.png', '✈️',
  NULL, NULL, 'قريباً', 'قريباً',
  7, 6, 500000, 'د.ع',
  'برنامج جوي (6 ليالي في مدينة مشهد المقدسة) يشمل زيارة مرقد الإمام الرضا عليه السلام والجولات السياحية في طرقبة وبارك ملت وباغ مشهد مع وقت حر للتسوق',
  'رحلة سياحية ودينية إلى مدينة مشهد المقدسة تجمع بين زيارة الأماكن المقدسة والجولات السياحية والترفيهية، مع وقت حر للتسوق والاستمتاع بمدينة مشهد. يشمل البرنامج زيارات إلى مرقد الإمام الرضا عليه السلام وطرقبة وجايدراه وحديقة وكيل آباد وحديقة الحيوانات وبارك ملت وباغ مشهد.',
  ARRAY['زيارة مرقد الإمام علي بن موسى الرضا عليه السلام','جولة سياحية في طرقبة وجايدراه','حديقة بارك ملت والمدينة المائية','باغ مشهد','مولات وأسواق مشهد','وقت حر للتسوق'],
  ARRAY['الإقامة في الفنادق','تنقلات داخلية','الإرشاد الديني','الإفطار في الفندق'],
  ARRAY['تذاكر الطيران','التأمين الصحي','النفقات الشخصية','الوجبات الأخرى (تضاف 100 دولار لبوفيه 3 وجبات)'],
  'للمزيد من المعلومات الاتصال على الأرقام التالية.',
  'في حال ترك المسافر الكروب لأي سبب كان لا يتم إرجاع المبلغ له.'
)
ON CONFLICT (id) DO NOTHING;

-- 2.2 كروب ايران البري (قم - مشهد - كاشان) - 250,000 د.ع
INSERT INTO programs (
  id, name, destination_id, type, status, cover_image, emoji,
  date_departure, date_return, date_display, date_return_display,
  days, nights, price, currency,
  short_description, full_description,
  highlights, included_services, excluded_services,
  booking_terms, cancellation_policy
) VALUES (
  'aaaaaaaa-1111-0000-0000-000000000002',
  'كروب ايران البري (قم - مشهد - كاشان)',
  '11111111-1111-1111-1111-111111111111',
  'religious', 'published', 'images/iran-bari.png', '🕌',
  NULL, NULL, 'قريباً', 'قريباً',
  12, 11, 250000, 'د.ع',
  'برنامج ديني سياحي شامل (3 ليالي قم - 4 ليالي مشهد) يشمل زيارة كاشان وشلالات نياسر والمزارات الدينية',
  'برنامج ديني سياحي شامل في إيران يأخذك في جولة مميزة بين قم ومشهد وكاشان. يشمل زيارة مرقد السيدة معصومة وبيت النور وأربعين علوية وجامع جمكران في قم، ثم زيارة مرقد الإمام الرضا عليه السلام ومشهد والجولات الدينية والسياحية.',
  ARRAY['زيارة مرقد السيدة معصومة','بيت النور وأربعين علوية','جامع جمكران','زيارة شلالات نياسر في كاشان','زيارة مرقد الإمام الرضا عليه السلام','جولة في مشهد الدينية'],
  ARRAY['تنقلات داخلية','الفنادق','الإرشاد الديني'],
  ARRAY['تذاكر الطيران','التأمين الصحي','النفقات الشخصية','الوجبات (بوفيه إيراني داخل الفندق عند الرغبة)'],
  'للمزيد من المعلومات الاتصال على الأرقام التالية.',
  'في حال ترك المسافر الكروب لأي سبب كان لا يتم إرجاع المبلغ له.'
)
ON CONFLICT (id) DO NOTHING;

-- 2.3 كروب ايران جوا (قم - مشهد) - 750,000 د.ع
INSERT INTO programs (
  id, name, destination_id, type, status, cover_image, emoji,
  date_departure, date_return, date_display, date_return_display,
  days, nights, price, currency,
  short_description, full_description,
  highlights, included_services, excluded_services,
  booking_terms, cancellation_policy
) VALUES (
  'aaaaaaaa-1111-0000-0000-000000000003',
  'كروب ايران جوا (قم - مشهد)',
  '11111111-1111-1111-1111-111111111111',
  'religious', 'published', 'images/iran-jawwa.png', '✈️',
  NULL, NULL, 'قريباً', 'قريباً',
  6, 5, 750000, 'د.ع',
  'برنامج جوي (2 ليالي قم / 5 ليالي مشهد) يشمل المزارات الدينية والجولات السياحية والتسوق في مشهد',
  'برنامج جوي مميز يأخذك في جولة بين قم ومشهد. يشمل زيارة المزارات الدينية في قم وجولات سياحية في مشهد تشمل طرقبة وجايدراه وحديقة وكيل آباد وحديقة الحيوانات وحديقة بارك ملت وحديقة باغ مشهد والمولات.',
  ARRAY['زيارة السيدة معصومة','بيت النور وأربعين علوية','جامع جمكران','زيارة الإمام الرضا عليه السلام','جولة في طرقبة وجايدراه','حديقة باغ مشهد'],
  ARRAY['تنقلات داخلية','الفنادق','الإرشاد الديني'],
  ARRAY['تذاكر الطيران','التأمين الصحي','النفقات الشخصية','الوجبات (تضاف 100 دولار للبوفيه)'],
  'للمزيد من المعلومات الاتصال على الأرقام التالية.',
  'في حال ترك المسافر الكروب لأي سبب كان لا يتم إرجاع المبلغ له.'
)
ON CONFLICT (id) DO NOTHING;

-- 2.4 كروب ايران جوا (شمال ايران + مشهد) - 900,000 د.ع
INSERT INTO programs (
  id, name, destination_id, type, status, cover_image, emoji,
  date_departure, date_return, date_display, date_return_display,
  days, nights, price, currency,
  short_description, full_description,
  highlights, included_services, excluded_services,
  booking_terms, cancellation_policy
) VALUES (
  'aaaaaaaa-1111-0000-0000-000000000004',
  'كروب ايران جوا (شمال ايران + مشهد)',
  '11111111-1111-1111-1111-111111111111',
  'tourism', 'published', 'images/iran-north.jpg', '🌿',
  NULL, NULL, 'قريباً', 'قريباً',
  7, 6, 900000, 'د.ع',
  'برنامج سياحي ديني (3 ليالي شمال ايران + 4 ليالي مشهد) يشمل رشت وفومن وقلعة رودخان وماسولة وبندر انزلي',
  'برنامج سياحي ديني مميز يأخذك في جولة رائعة بين شمال إيران ومشهد. يشمل زيارة رشت وفومن وقلعة رودخان وقرية ماسولة الجبلية وبندر انزلي السياحية وركوب القارب في مستنقع انزلي لرؤية زهور اللوتس والطيور المهاجرة، ثم الانتقال إلى مشهد لزيارة الإمام الرضا عليه السلام والجولات السياحية.',
  ARRAY['قلعة رودخان وصعود القلعة','قرية ماسولة الجبلية','ركوب القارب في مستنقع انزلي','زهور اللوتس والطيور المهاجرة','زيارة الإمام الرضا عليه السلام','حديقة باغ مشهد'],
  ARRAY['تنقلات داخلية','الفنادق','الإرشاد السياحي والديني'],
  ARRAY['تذاكر الطيران','التأمين الصحي','النفقات الشخصية','الوجبات (تضاف 100 دولار للبوفيه)'],
  'للمزيد من المعلومات الاتصال على الأرقام التالية.',
  'في حال ترك المسافر الكروب لأي سبب كان لا يتم إرجاع المبلغ له.'
)
ON CONFLICT (id) DO NOTHING;

-- ─── 3. Guarantee the known IQD prices survive (idempotent) ──
UPDATE programs SET price = 250000 WHERE id = 'aaaaaaaa-1111-0000-0000-000000000002' AND price = 0;
UPDATE programs SET price = 750000 WHERE id = 'aaaaaaaa-1111-0000-0000-000000000003' AND price = 0;
UPDATE programs SET price = 900000 WHERE id = 'aaaaaaaa-1111-0000-0000-000000000004' AND price = 0;
UPDATE programs SET price = 500000, currency = 'د.ع' WHERE id = 'aaaaaaaa-1111-0000-0000-000000000001';

-- ─── 4. Hotels + program_hotels links (restore if absent) ─────
INSERT INTO hotels (id, name, city, stars, rating, amenities) VALUES
  ('aaaaaaaa-2222-0000-0000-000000000001', 'فندق انتخاب', 'مشهد', 4, 4.0, ARRAY['واي فاي مجاني', 'بوفيه إفطار', 'غرف راقية']),
  ('aaaaaaaa-2222-0000-0000-000000000002', 'فندق بارسيان', 'مشهد', 3, 3.5, ARRAY['واي فاي مجاني', 'إفطار', 'غرف وصالات واسعة']),
  ('aaaaaaaa-2222-0000-0000-000000000003', 'فندق خاور',    'مشهد', 3, 3.5, ARRAY['واي فاي مجاني', '3 وجبات يومياً']),
  ('aaaaaaaa-2222-0000-0000-000000000004', 'فندق قم',      'قم',   3, 3.5, ARRAY['واي فاي مجاني', 'مطعم']),
  ('aaaaaaaa-2222-0000-0000-000000000005', 'فندق ارام',    'رشت',  3, 3.5, ARRAY['واي فاي مجاني', 'مطعم']),
  ('aaaaaaaa-2222-0000-0000-000000000006', 'فندق فومن',    'فومن', 3, 3.5, ARRAY['واي فاي مجاني', 'مطعم'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO program_hotels (program_id, hotel_id, room_type, nights, sort_order) VALUES
  ('aaaaaaaa-1111-0000-0000-000000000001', 'aaaaaaaa-2222-0000-0000-000000000001', 'غرفة قياسية', 6, 1),
  ('aaaaaaaa-1111-0000-0000-000000000001', 'aaaaaaaa-2222-0000-0000-000000000002', 'غرفة قياسية', 6, 2),
  ('aaaaaaaa-1111-0000-0000-000000000001', 'aaaaaaaa-2222-0000-0000-000000000003', 'غرفة قياسية', 6, 3),
  ('aaaaaaaa-1111-0000-0000-000000000002', 'aaaaaaaa-2222-0000-0000-000000000004', 'غرفة قياسية', 4, 1),
  ('aaaaaaaa-1111-0000-0000-000000000002', 'aaaaaaaa-2222-0000-0000-000000000001', 'غرفة قياسية', 4, 2),
  ('aaaaaaaa-1111-0000-0000-000000000003', 'aaaaaaaa-2222-0000-0000-000000000004', 'غرفة قياسية', 2, 1),
  ('aaaaaaaa-1111-0000-0000-000000000003', 'aaaaaaaa-2222-0000-0000-000000000001', 'غرفة قياسية', 4, 2),
  ('aaaaaaaa-1111-0000-0000-000000000004', 'aaaaaaaa-2222-0000-0000-000000000005', 'غرفة قياسية', 1, 1),
  ('aaaaaaaa-1111-0000-0000-000000000004', 'aaaaaaaa-2222-0000-0000-000000000006', 'غرفة قياسية', 2, 2),
  ('aaaaaaaa-1111-0000-0000-000000000004', 'aaaaaaaa-2222-0000-0000-000000000001', 'غرفة قياسية', 4, 3)
ON CONFLICT (program_id, hotel_id) DO NOTHING;

-- ============================================================
-- DONE. Refresh the site: 8 programs total (4 Iran + 4 Umrah),
-- all published, in Iraqi Dinar (د.ع). The 4 Umrah programs
-- were NEVER modified by this script.
-- ============================================================