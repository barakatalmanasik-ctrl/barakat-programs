-- ============================================================
-- 07_seed_data.sql
-- Sample data for programs, destinations, hotels
-- Execute: Run AFTER 06_functions_triggers.sql
-- NOTE: This data mirrors the current mock data for
--       backward compatibility during transition.
-- ============================================================

-- ─── DESTINATIONS ────────────────────────────────────────────

INSERT INTO destinations (name, emoji, gradient, sort_order) VALUES
  ('إيران',    '🇮🇷', 'linear-gradient(135deg, #1B3A5C 0%, #2C5F8A 100%)',  1),
  ('تركيا',    '🇹🇷', 'linear-gradient(135deg, #C4454D 0%, #E06B6B 100%)',  2),
  ('لبنان',    '🇱🇧', 'linear-gradient(135deg, #3A7D6B 0%, #5BA08D 100%)',  3),
  ('العراق',   '🇮🇶', 'linear-gradient(135deg, #C8963E 0%, #D4AB5E 100%)',  4),
  ('السعودية', '🇸🇦', 'linear-gradient(135deg, #4A90B8 0%, #6BA8CE 100%)',  5),
  ('مصر',      '🇪🇬', 'linear-gradient(135deg, #8B6914 0%, #B8941E 100%)',  6),
  ('دبي',      '🇦🇪', 'linear-gradient(135deg, #2C5F8A 0%, #4A90B8 100%)',  7),
  ('ماليزيا',  '🇲🇾', 'linear-gradient(135deg, #1B5E20 0%, #4CAF50 100%)',  8);

-- ─── HOTELS ──────────────────────────────────────────────────

INSERT INTO hotels (name, city, stars, rating, amenities) VALUES
  ('فندق إسبيرانس طهران',     'طهران',     5, 4.5, ARRAY['واي فاي', 'مسبح', 'مطعم', 'صالة رياضية', 'سبا']),
  ('فندق قصر قشم',            'قشم',       4, 4.2, ARRAY['واي فاي', 'مطعم', 'شاطئ خاص', 'مواقف سيارات']),
  ('فندق هوليداي إين استانبول', 'استانبول',  4, 4.3, ARRAY['واي فاي', 'مطعم', 'مركز أعمال']),
  ('فندق مارمارا تكسيم',       'استانبول',  5, 4.6, ARRAY['واي فاي', 'مسبح', 'مطعم', 'سبا', 'صالة ألعاب']),
  ('فندق راديسون بلو بيروت',   'بيروت',     5, 4.4, ARRAY['واي فاي', 'مطعم', 'شرفة', 'موقف سيارات']),
  ('فندق أرمونيا بيت لحم',     'بيت لحم',   4, 4.1, ARRAY['واي فاي', 'مطعم', 'إفطار']),
  ('هيلتون جدة',               'جدة',       5, 4.5, ARRAY['واي فاي', 'مسبح', 'مطعم', 'صالة رياضية', 'سبا']),
  ('فندق أبراج دبي',           'دبي',       5, 4.8, ARRAY['واي فاي', 'مسبح', 'مطعم', 'سبا', 'شرفة']),
  ('فندق جميرا بيتش',          'دبي',       5, 4.7, ARRAY['واي فاي', 'شاطئ خاص', 'مطعم', 'مسبح']),
  ('فندق كوالالمبور',          'كوالالمبور', 4, 4.2, ARRAY['واي فاي', 'مطعم', 'مسبح']),
  ('فندق لانكاوي',              'لانكاوي',   4, 4.3, ARRAY['واي فاي', 'شاطئ', 'مطعم', 'سبا']);

-- ─── PROGRAMS ────────────────────────────────────────────────

-- Program 1: Iran
INSERT INTO programs (
  name, destination_id, type, status, emoji, gradient,
  date_departure, date_return, date_display, date_return_display,
  days, nights, price, currency,
  short_description, full_description,
  included_services, excluded_services,
  booking_terms, cancellation_policy,
  highlights
) VALUES (
  'رحلة مشاهير طهران وقشم',
  (SELECT id FROM destinations WHERE name = 'إيران'),
  'tourism', 'available', '🏔️',
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  '2026-09-15', '2026-09-20',
  '15 سبتمبر 2026', '20 سبتمبر 2026',
  6, 5, 3200, 'SAR',
  'رحلة سياحية مميزة تشمل زيارة معالم طهران واستجمام جزيرة قشم',
  'رحلة سياحية شاملة تأخذك في جولة مميزة بين أجمل المعالم في طهران وجزيرة قشم. ستتمتع بزيارة برج ميلاد الشهير وقصر غلستان التاريخي، ثم ننتقل إلى جزيرة قشم للاستمتاع بجمالها الطبيعي الخلاب والكهوف العجيبة والتسوق في المنطقة الحرة.',
  ARRAY['الطيران الدولي والداخلي', 'الفندق 5 نجوم', 'الوجبات اليومية', 'التنقلات الداخلية', 'المرشد السياحي', 'التأشيرات'],
  ARRAY['التأمين الصحي', 'النفقات الشخصية', 'الإكراميات', 'المشروبات غير المشمولة'],
  'يجب دفع دفعة مقدمة 30% عند الحجز. يُطلب سداد المبلغ كاملاً قبل 14 يوم من تاريخ السفر. يجب تقديم جواز سفر ساري المفعول لمدة لا تقل عن 6 أشهر.',
  'إلغاء مجاني قبل 14 يوم من تاريخ الرحلة. خصم 25% عند الإلغاء خلال 7-14 يوم. لا يوجد استرداد خلال أقل من 7 أيام.',
  ARRAY['زيارة برج ميلاد', 'جولة في جزيرة قشم', 'التسوق في المنطقة الحرة', 'الكهوف الطبيعية']
);

-- Program 2: Istanbul
INSERT INTO programs (
  name, destination_id, type, status, emoji, gradient,
  date_departure, date_return, date_display, date_return_display,
  days, nights, price, currency,
  short_description, full_description,
  included_services, excluded_services,
  booking_terms, cancellation_policy,
  highlights
) VALUES (
  'جولة استانبول السياحية',
  (SELECT id FROM destinations WHERE name = 'تركيا'),
  'tourism', 'available', '🕌',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  '2026-10-01', '2026-10-07',
  '1 أكتوبر 2026', '7 أكتوبر 2026',
  7, 6, 4500, 'SAR',
  'جولة شاملة في أجمل معالم استانبول التاريخية والحديثة',
  'استمتع بجولة مميزة في مدينة استانبول التاريخية التي تجمع بين الشرق والغرب. زُر المساجد العريقة والأسواق الشعبية واستمتع بالطعام التركي الأصيل.',
  ARRAY['الطيران الدولي', 'الفندق 4 نجوم', 'الإفطار', 'التنقلات', 'المرشد السياحي'],
  ARRAY['الغداء', 'العشاء', 'التأمين الصحي', 'التأشيرات'],
  'يجب دفع 50% مقدماً. ساري الجواز لمدة 6 أشهر على الأقل.',
  'استرداد 80% قبل 21 يوم. 50% قبل 14 يوم. لا استرداد بعد ذلك.',
  ARRAY['قصر توبكابي', 'المسجد الأزرق', 'البازار الكبير', 'برج خلودا']
);

-- Program 3: Lebanon Holy Land
INSERT INTO programs (
  name, destination_id, type, status, emoji, gradient,
  date_departure, date_return, date_display, date_return_display,
  days, nights, price, currency,
  short_description, full_description,
  included_services, excluded_services,
  booking_terms, cancellation_policy,
  highlights
) VALUES (
  'الجولة المقدسة - لبنان وبيت لحم',
  (SELECT id FROM destinations WHERE name = 'لبنان'),
  'religious', 'available', '⛪',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  '2026-11-01', '2026-11-08',
  '1 نوفمبر 2026', '8 نوفمبر 2026',
  8, 7, 5200, 'SAR',
  'رحلة دينية مقدسة تشمل الأماكن المقدسة في لبنان وبيت لحم',
  'رحلة روحانية مميزة تأخذك إلى أقدس الأماكن المسيحية في لبنان وبيت لحم. ستحضر القداس في كنائس تاريخية وتهبط إلى المغارات المقدسة وتزور الأماكن المقدسة التي ورد ذكرها في الكتاب المقدس.',
  ARRAY['الطيران', 'الفندق 4 نجوم', 'الوجبات', 'التنقلات', 'المرشد الديني', 'التأشيرات'],
  ARRAY['التأمين الصحي', 'النفقات الشخصية'],
  'يجب دفع 40% عند الحجز. ساري الجواز.',
  'استرداد 70% قبل 21 يوم. لا استرداد بعد 14 يوم من السفر.',
  ARRAY['كنيسة مار يعقوب', 'مغارة المهد', 'بعلبك', 'الب试ة التاريخية']
);

-- Program 4: Iraq Holy
INSERT INTO programs (
  name, destination_id, type, status, emoji, gradient,
  date_departure, date_return, date_display, date_return_display,
  days, nights, price, currency,
  short_description, full_description,
  included_services, excluded_services,
  booking_terms, cancellation_policy,
  highlights
) VALUES (
  'زيارة العتبات المقدسة في العراق',
  (SELECT id FROM destinations WHERE name = 'العراق'),
  'religious', 'limited', '🕋',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  '2026-10-15', '2026-10-22',
  '15 أكتوبر 2026', '22 أكتوبر 2026',
  8, 7, 3800, 'SAR',
  'زيارة الأماكن المقدسة والعتبات في العراق',
  'رحلة دينية إلى العتبات المقدسة في العراق. سيزور المشاركون مرقد الإمام علي والعتبات المقدسة في كربلاء والنجف.',
  ARRAY['الطيران', 'الفندق 4 نجوم', 'الوجبات', 'التنقلات', 'المرشد الديني', 'التأشيرة'],
  ARRAY['التأمين الصحي', 'النفقات الشخصية', 'الإكراميات'],
  'يجب الحصول على التأشيرة قبل السفر. دفع 50% مقدماً.',
  'استرداد 60% قبل 14 يوم. لا استرداد خلال 7 أيام.',
  ARRAY['مرقد الإمام علي', 'حرم الإمام الحسين', 'العتبة العباسية', ' sucees']
);

-- Program 5: Umrah
INSERT INTO programs (
  name, destination_id, type, status, emoji, gradient,
  date_departure, date_return, date_display, date_return_display,
  days, nights, price, currency,
  short_description, full_description,
  included_services, excluded_services,
  booking_terms, cancellation_policy,
  highlights
) VALUES (
  'عمرة مباركة - مكة والمدينة',
  (SELECT id FROM destinations WHERE name = 'السعودية'),
  'religious', 'available', '🕋',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  '2026-09-20', '2026-09-27',
  '20 سبتمبر 2026', '27 سبتمبر 2026',
  8, 7, 4200, 'SAR',
  'عمرة مباركة شاملة مع الإقامة الفاخرة بالقرب من الحرم',
  'برنامج عمرة متكامل يوفر لك الراحة والطمأنينة. الإقامة في فنادق فاخرة بالقرب من الحرم الشريف في مكة والمدينة المنورة.',
  ARRAY['الطيران', 'الفندق 5 نجوم', 'الوجبات', 'النقل', 'المرشد الديني'],
  ARRAY['التأمين الصحي', 'النفقات الشخصية', 'الإكراميات'],
  'يجب الحصول على تأشيرة عمرة. دفع كامل المبلغ عند الحجز.',
  'لا يوجد استرداد بعد إصدار التأشيرة.',
  ARRAY['الحرم المكي', 'الحرم النبوي', 'جبل النور', 'سوقenef']
);

-- Program 6: Egypt
INSERT INTO programs (
  name, destination_id, type, status, emoji, gradient,
  date_departure, date_return, date_display, date_return_display,
  days, nights, price, currency,
  short_description, full_description,
  included_services, excluded_services,
  booking_terms, cancellation_policy,
  highlights
) VALUES (
  'جولة أهرامات مصر',
  (SELECT id FROM destinations WHERE name = 'مصر'),
  'tourism', 'soon', '🏛️',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  '2026-12-01', '2026-12-06',
  '1 ديسمبر 2026', '6 ديسمبر 2026',
  6, 5, 2800, 'SAR',
  'جولة في أهرامات الجيزة ومعالم القاهرة التاريخية',
  'اكتشف عظمة الحضارة المصرية القديمة بزيارة أهرامات الجيزة وأبو الهول. ثم تعرف على معالم القاهرة الحديثة والقديمة ومتاحفها العالمية الشهيرة.',
  ARRAY['الطيران الجوي', 'الفندق 4 نجوم', 'الإفطار', 'التنقلات', 'المرشد السياحي', 'التأشيرة'],
  ARRAY['الغداء', 'العشاء', 'التأمين الصحي'],
  'يجب الحصول على تأشيرة مصرية. دفع 50% مقدماً.',
  'استرداد 70% قبل 21 يوم.',
  ARRAY['أهرامات الجيزة', 'أبو الهول', 'المتحف المصري', 'خان الخليلي']
);

-- Program 7: Dubai
INSERT INTO programs (
  name, destination_id, type, status, emoji, gradient,
  date_departure, date_return, date_display, date_return_display,
  days, nights, price, currency,
  short_description, full_description,
  included_services, excluded_services,
  booking_terms, cancellation_policy,
  highlights
) VALUES (
  'عطلة دبي السياحية',
  (SELECT id FROM destinations WHERE name = 'دبي'),
  'family', 'available', '🏙️',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  '2026-10-20', '2026-10-25',
  '20 أكتوبر 2026', '25 أكتوبر 2026',
  6, 5, 5800, 'SAR',
  'عطلة عائلية ممتعة في دبي مع أنشطة ترفيهية متنوعة',
  'استمتع بعطلة عائلية مميزة في مدينة دبي. تشمل الزيارة أجمل المعالم الترفيهية والتسوق في أشهر المولات.',
  ARRAY['الطيران', 'الفندق 5 نجوم', 'الإفطار', 'التنقلات', 'تذاكر المواقع السياحية'],
  ARRAY['الغداء', 'العشاء', 'التأمين الصحي'],
  'دفعة مقدمة 30%. بطاقة ائتمان أو تحويل بنكي.',
  'استرداد 80% قبل 14 يوم.',
  ARRAY['برج خليفة', 'دبي مول', 'لو دبي', 'حديقة الأزهار']
);

-- Program 8: Malaysia
INSERT INTO programs (
  name, destination_id, type, status, emoji, gradient,
  date_departure, date_return, date_display, date_return_display,
  days, nights, price, currency,
  short_description, full_description,
  included_services, excluded_services,
  booking_terms, cancellation_policy,
  highlights
) VALUES (
  'جولة ماليزيا الاستوائية',
  (SELECT id FROM destinations WHERE name = 'ماليزيا'),
  'tourism', 'available', '🌴',
  'linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)',
  '2026-11-10', '2026-11-18',
  '10 نوفمبر 2026', '18 نوفمبر 2026',
  9, 8, 5500, 'SAR',
  'جولة استوائية في أجمل مناطق ماليزيا الطبيعية',
  'استمتع بالطبيعة الخلابة في ماليزيا. زُر كوالالمبور ولانكاوي وغنتينغ. استمتع بالغابات الاستوائية والشواطئ الجميلة والمطاعم العالمية.',
  ARRAY['الطيران الجوي', 'الفندق 4 نجوم', 'الإفطار', 'التنقلات', 'المرشد السياحي'],
  ARRAY['الغداء', 'العشاء', 'التأمين الصحي', 'التأشيرة'],
  'يجب الحصول على تأشيرة ماليزية. دفع 40% مقدماً.',
  'استرداد 70% قبل 21 يوم.',
  ARRAY['كوالالمبور', 'لانكاوي', 'غنتينغ', 'الغابات المطيرة']
);

-- ─── PROGRAM DAYS (Sample for Iran program) ─────────────────

DO $$
DECLARE
  prog_id UUID;
BEGIN
  SELECT id INTO prog_id FROM programs WHERE name = 'رحلة مشاهير طهران وقشم' LIMIT 1;

  IF prog_id IS NOT NULL THEN
    INSERT INTO program_days (program_id, day_number, title, city, notes, meals_breakfast, meals_lunch, meals_dinner, visits, activities)
    VALUES
      (prog_id, 1, 'الوصول إلى طهران', 'طهران', 'الوصول في المساء. استلام الغرف في تمام الساعة 3 عصراً.', false, false, true,
        ARRAY['الوصول إلى مطار طهران الدولي', 'الانتقال إلى الفندق'], ARRAY['استراحة في الفندق']),
      (prog_id, 2, 'جولة طهران الثقافية', 'طهران', NULL, true, true, true,
        ARRAY['برج ميلاد', 'قصر غلستان', 'متحف جيهان نما'], ARRAY['التسوق في سوق تجري', 'جولة في وسط المدينة']),
      (prog_id, 3, 'جولة قشم', 'قشم', 'الانتقال إلى قشم بالطائرة المحلية.', true, true, true,
        ARRAY['الكهوف الطبيعية', 'المنطقة الحرة', 'شاطئ خلدة'], ARRAY['جولة بالسيارة']),
      (prog_id, 4, 'استجمام في قشم', 'قشم', NULL, true, true, true,
        ARRAY['منطقة الطيور', 'قرية الزراعة'], ARRAY['وقت حر', 'التسوق']),
      (prog_id, 5, 'العودة إلى طهران', 'طهران', NULL, true, true, true,
        ARRAY['التسوق الحر'], ARRAY['وقت حر']),
      (prog_id, 6, 'المغادرة', 'طهران', 'تسليم الغرف قبل الساعة 12 ظهراً.', true, false, false,
        ARRAY['المغادرة إلى المطار'], ARRAY['المغادرة']);
  END IF;
END $$;
