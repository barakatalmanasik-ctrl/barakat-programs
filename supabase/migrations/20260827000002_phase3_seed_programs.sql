-- ============================================================
-- PHASE 3: Seed programs + destination for public site
-- Seeds the "Iran" destination and the 4 tour programs into the
-- Supabase `programs` table so the admin panel can edit them and
-- the public site reflects those changes (site reads from Supabase
-- via ProgramsService, falling back to MockData only when the
-- table is empty/unavailable).
--
-- SAFE: idempotent (ON CONFLICT DO NOTHING). Does NOT delete or
-- overwrite existing records. Fixed UUIDs keep the seed stable.
-- ============================================================

-- ─── DESTINATION: إيران ────────────────────────────────────────
INSERT INTO destinations (id, name, emoji, gradient, sort_order)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'إيران',
  '🇮🇷',
  'linear-gradient(135deg, #1B3A5C 0%, #2C5F8A 100%)',
  1
)
ON CONFLICT (id) DO NOTHING;

-- ─── PROGRAM 1: كروب ايران جوا (مشهد جواً) - 6 ليالي مشهد ─────
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

-- ─── PROGRAM 2: كروب ايران البري (قم - مشهد - كاشان) ───────────
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
  12, 11, 0, 'د.ع',
  'برنامج ديني سياحي شامل (3 ليالي قم - 4 ليالي مشهد) يشمل زيارة كاشان وشلالات نياسر والمزارات الدينية',
  'برنامج ديني سياحي شامل في إيران يأخذك في جولة مميزة بين قم ومشهد وكاشان. يشمل زيارة مرقد السيدة معصومة وبيت النور وأربعين علوية وجامع جمكران في قم، ثم زيارة مرقد الإمام الرضا عليه السلام ومشهد والجولات الدينية والسياحية.',
  ARRAY['زيارة مرقد السيدة معصومة','بيت النور وأربعين علوية','جامع جمكران','زيارة شلالات نياسر في كاشان','زيارة مرقد الإمام الرضا عليه السلام','جولة في مشهد الدينية'],
  ARRAY['تنقلات داخلية','الفنادق','الإرشاد الديني'],
  ARRAY['تذاكر الطيران','التأمين الصحي','النفقات الشخصية','الوجبات (بوفيه إيراني داخل الفندق عند الرغبة)'],
  'للمزيد من المعلومات الاتصال على الأرقام التالية.',
  'في حال ترك المسافر الكروب لأي سبب كان لا يتم إرجاع المبلغ له.'
)
ON CONFLICT (id) DO NOTHING;

-- ─── PROGRAM 3: كروب ايران جوا (قم - مشهد) ──────────────────────
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
  6, 5, 0, 'د.ع',
  'برنامج جوي (2 ليالي قم / 5 ليالي مشهد) يشمل المزارات الدينية والجولات السياحية والتسوق في مشهد',
  'برنامج جوي مميز يأخذك في جولة بين قم ومشهد. يشمل زيارة المزارات الدينية في قم وجولات سياحية في مشهد تشمل طرقبة وجايدراه وحديقة وكيل آباد وحديقة الحيوانات وحديقة بارك ملت وحديقة باغ مشهد والمولات.',
  ARRAY['زيارة السيدة معصومة','بيت النور وأربعين علوية','جامع جمكران','زيارة الإمام الرضا عليه السلام','جولة في طرقبة وجايدراه','حديقة باغ مشهد'],
  ARRAY['تنقلات داخلية','الفنادق','الإرشاد الديني'],
  ARRAY['تذاكر الطيران','التأمين الصحي','النفقات الشخصية','الوجبات (تضاف 100 دولار للبوفيه)'],
  'للمزيد من المعلومات الاتصال على الأرقام التالية.',
  'في حال ترك المسافر الكروب لأي سبب كان لا يتم إرجاع المبلغ له.'
)
ON CONFLICT (id) DO NOTHING;

-- ─── PROGRAM 4: كروب ايران جوا (شمال ايران + مشهد) ──────────────
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
  7, 6, 0, 'د.ع',
  'برنامج سياحي ديني (3 ليالي شمال ايران + 4 ليالي مشهد) يشمل رشت وفومن وقلعة رودخان وماسولة وبندر انزلي',
  'برنامج سياحي ديني مميز يأخذك في جولة رائعة بين شمال إيران ومشهد. يشمل زيارة رشت وفومن وقلعة رودخان وقرية ماسولة الجبلية وبندر انزلي السياحية وركوب القارب في مستنقع انزلي لرؤية زهور اللوتس والطيور المهاجرة، ثم الانتقال إلى مشهد لزيارة الإمام الرضا عليه السلام والجولات السياحية.',
  ARRAY['قلعة رودخان وصعود القلعة','قرية ماسولة الجبلية','ركوب القارب في مستنقع انزلي','زهور اللوتس والطيور المهاجرة','زيارة الإمام الرضا عليه السلام','حديقة باغ مشهد'],
  ARRAY['تنقلات داخلية','الفنادق','الإرشاد السياحي والديني'],
  ARRAY['تذاكر الطيران','التأمين الصحي','النفقات الشخصية','الوجبات (تضاف 100 دولار للبوفيه)'],
  'للمزيد من المعلومات الاتصال على الأرقام التالية.',
  'في حال ترك المسافر الكروب لأي سبب كان لا يتم إرجاع المبلغ له.'
)
ON CONFLICT (id) DO NOTHING;
