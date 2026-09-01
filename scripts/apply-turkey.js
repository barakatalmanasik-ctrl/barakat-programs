#!/usr/bin/env node
// apply_turkey.js - Inserts the Turkey program into live Supabase via REST
// using the SERVICE ROLE key (SECRET). Local-only, never deployed.
// Reads env from ".env" in the current working directory.
// 100% INSERT-only + idempotent (checks existence before inserting).

const fs = require('fs');
const path = require('path');

function loadEnv(file) {
  const env = {};
  if (!fs.existsSync(file)) return env;
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx < 0) continue;
    const k = line.slice(0, idx).trim();
    let v = line.slice(idx + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[k] = v;
  }
  return env;
}

const env = loadEnv(path.join(process.cwd(), '.env'));
const url = (process.env.SUPABASE_URL || env.SUPABASE_URL || '').replace(/\/+$/, '');
const serviceKey = process.env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_KEY;

function fail(msg) {
  console.error('[turkey] ERROR: ' + msg);
  process.exit(1);
}
if (!url) fail('SUPABASE_URL not set');
if (!serviceKey) fail('SUPABASE_SERVICE_KEY not set');

const headers = {
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
  'Authorization': 'Bearer ' + serviceKey,
  'apikey': serviceKey
};

// ---- Turkey data ----
const DEST_ID = '33333333-3333-3333-3333-333333333333';
const PROG_ID = 'aaaaaaaa-1111-0000-0000-000000000009';
const HOTEL_IDS = [
  'cccccccc-2222-0000-0000-000000000001',
  'cccccccc-2222-0000-0000-000000000002',
  'cccccccc-2222-0000-0000-000000000003',
  'cccccccc-2222-0000-0000-000000000004',
  'cccccccc-2222-0000-0000-000000000005'
];

const program = {
  id: PROG_ID,
  name: 'أحلام معلقة برج غلطة - إسطنبول تركيا',
  destination_id: DEST_ID,
  type: 'tourism',
  status: 'published',
  cover_image: 'images/turkey/cover.webp',
  emoji: '🇹🇷',
  gradient: 'linear-gradient(135deg, #C0392B 0%, #E67E22 100%)',
  date_departure: '2026-09-03',
  date_return: '2026-09-10',
  date_display: '2026/09/03',
  date_return_display: '2026/09/10',
  days: 8,
  nights: 7,
  price: 900000,
  currency: 'د.ع',
  short_description: 'برنامج سياحي بمدينة إسطنبول التركية لمدة 8 أيام و7 ليالٍ يشمل الإقامة الفندقية مع الإفطار والنقل وخدمات الاستقبال والتوصيل و5 جولات سياحية يومية في إسطنبول',
  full_description: 'رحلة مميزة إلى إسطنبول حيث يلتقي الشرق بالغرب، مدينة تجمع التاريخ والثقافة والرفاهية والحديثة. اكتشف جمال إسطنبول واختر المغامرة عبر جولاتنا الجماعية المصممة بعناية مع خدمتنا المريحة وإقاماتنا المميزة. يشمل البرنامج الإقامة الفندقية في فنادق مختارة مع الإفطار، والنقل من وإلى المطار، وخدمات الاستقبال والتوصيل ووزن الأمتعة المسجلة، وتوفير المواصلات داخل المدينة، بالإضافة إلى 5 جولات سياحية يومية في إسطنبول تشمل جولة بورصة وجولة سبانجا ومعشوقية وجولة شيلي وأغفا وجولة جزر الأمراء وعشاء البوسفور الليلي.',
  highlights: ['الإقامة الفندقية في فنادق مختارة مع الإفطار','النقل من وإلى المطار بالخطوط الجوية العراقية','جولة بورصة التاريخية والطبيعية','جولة سبانجا ومعشوقية','جولة شيلي وأغفا على ساحل البحر الأسود','جولة جزر الأمراء البحرية','عشاء البوسفور الليلي مع العروض'],
  included_services: ['الإقامة الفندقية في فنادق مختارة','النقل من وإلى المطار','خدمات الاستقبال والتوصيل','وزن الأمتعة المسجلة','النقل المحلي وتوفير المواصلات داخل المدينة','5 جولات سياحية يومية في إسطنبول','الإفطار في الفندق'],
  excluded_services: ['رسوم الرحلات اليومية غير المشمولة (اختيارية)','التأمين الصحي','النفقات الشخصية','التأشيرة (المسافر مسؤول عن الحصول عليها)'],
  booking_terms: 'تنطلق جميع الرحلات من مطار بغداد. النقل ذهاب: الخطوط الجوية العراقية من مطار بغداد الساعة 11:00 صباحاً إلى إسطنبول مطار صبيحة كوكجين الساعة 14:45. النقل عودة: الخطوط الجوية العراقية من مطار صبيحة كوكجين إسطنبول الساعة 14:45 إلى مطار بغداد الساعة 17:30. الباقة تشمل 5 جولات سياحية محددة في إسطنبول فقط، وأي جولات إضافية تتطلب ترتيباً مسبقاً ودفعاً إضافياً مع ممثل الشركة. رسوم الرحلات اليومية غير المشمولة في سعر الباقة اختيارية وتُدفع مباشرة للدليل/الممثل في إسطنبول لمن يرغب بالانضمام. تسجيل الدخول إلى الفندق متاح ابتداءً من الساعة 14:00، والإخلاء قبل الساعة 12:00 ظهراً. للمزيد من المعلومات الاتصال على الأرقام التالية.',
  cancellation_policy: 'في حال ترك المسافر الكروب لأي سبب كان لا يتم إرجاع المبلغ له. يجب تقديم طلب الإلغاء رسمياً عبر منصة الدعم داخل النظام لمعالجته. جميع طلبات الإلغاء تخضع لشروط مزودي الخدمات بما في ذلك شركات الطيران والفنادق.'
};

const hotels = [
  { id: HOTEL_IDS[0], name: 'فندق جولدين تايم', city: 'إسطنبول - الفاتح', stars: 4, rating: 4.0, amenities: ['واي فاي مجاني','بوفيه إفطار','غرف راقية'] },
  { id: HOTEL_IDS[1], name: 'فندق كيجيج', city: 'إسطنبول - الفاتح', stars: 4, rating: 4.0, amenities: ['واي فاي مجاني','بوفيه إفطار','مطعم'] },
  { id: HOTEL_IDS[2], name: 'فندق ميديا جراند', city: 'إسطنبول - شارع فتيح بك، الفاتح', stars: 3, rating: 3.5, amenities: ['واي فاي مجاني','بوفيه إفطار','مطعم'] },
  { id: HOTEL_IDS[3], name: 'فندق أكغون بيازيت', city: 'إسطنبول - لالالي', stars: 3, rating: 3.5, amenities: ['واي فاي مجاني','بوفيه إفطار','مطعم'] },
  { id: HOTEL_IDS[4], name: 'فندق أكغون فاتان', city: 'إسطنبول - توبكابي، الفاتح', stars: 4, rating: 4.0, amenities: ['واي فاي مجاني','بوفيه إفطار','غرف وصالات واسعة'] }
];

const days = [
  { day_number: 1, title: 'الوصول إلى إسطنبول', city: 'إسطنبول', notes: 'مجاناً. وقت حر للمسافر في المساء.', meals_breakfast: false, meals_lunch: false, meals_dinner: false, visits: [], activities: ['الاستقبال والترحيب من قبل ممثل الشركة','الانتقال إلى الفندق لتسجيل الدخول','الإقامة في الفندق المختار','وقت حر للمسافر في المساء'] },
  { day_number: 2, title: 'جولة بورصة', city: 'بورصة', notes: 'مشمول في الجولة: الغداء + تذاكر العبّارة + الانتقالات من وإلى الفندق. الجلوس على التلفريك وقطار التليسيج إلى القمة اختياري.', meals_breakfast: true, meals_lunch: true, meals_dinner: false, visits: ['ريف يالوفا','الشجرة التاريخية','مصنع الحلقوم التركي','بيت المربى العثماني','جبل أولوداغ','مركز PAULMARK للتسوق'], activities: ['جولة مريحة عبر طبيعة يالوفا الريفية مع خيار تجربة المغامرة بالدراجات الرباعية','زيارة الشجرة التاريخية أحد أقدم المعالم الطبيعية في المنطقة','محطة خاصة للتعرف على طريقة صنع الحلقوم التركي الشهير وتذوق النكهات المتنوعة','تجربة فريدة لتذوق وشراء المربيات والمنتجات العضوية المصنوعة بوصفات عثمانية أصيلة','جبل أولوداغ مع خيار ركوب التلفريك للوصول إلى القمة والاستمتاع بالمناظر البانورامية والهواء الجبلي النقي','زيارة مركز PAULMARK للتسوق مع وقت حر للتسوق','الغداء والعبّارة والانتقالات مشمولة في الجولة'] },
  { day_number: 3, title: 'جولة سبانجا ومعشوقية', city: 'سبانجا / معشوقية', notes: 'مشمول في الجولة: الغداء. خيار الزيب لاين في شلالات محمودية وسفاري ATV في غابات معشوقية وركوب التلفريك في جبل كارتية اختيارية.', meals_breakfast: true, meals_lunch: true, meals_dinner: false, visits: ['الأكواريوم','شلالات محمودية','غابات معشوقية','جبل كارتية','الشرفة الزجاجية (تيراس جام)','مصانع الحلقوم والعسل'], activities: ['زيارة الأكواريوم والاستمتاع بمشاهدة الحياة المائية المتنوعة','الاستمتاع بجمال الجداول العذبة والشلالات الخلابة مع خيار تجربة الزيب لاين','جولة ممتعة وسط الأشجار الكثيفة والغابات مع خيار القيام برحلة سفاري بالدراجات الرباعية ATV','ركوب التلفريك على جبل كارتية للاستمتاع بإطلالات خلابة على الجبال والسهول المحيطة','الوقوف على منصة المشاهدة الزجاجية (تيراس جام) لإطلالات مباشرة وشاملة على بحيرة سبانجا والوديان','محطات تذوق الحلويات التركية التقليدية واكتشاف العسل الطبيعي الفاخر المنتج في المنطقة','الغداء بوجبة شهية في قلب طبيعة معشوقية'] },
  { day_number: 4, title: 'جولة شيلي وأغفا', city: 'شيلي / أغفا', notes: 'جولة ساحلية هادئة بعيداً عن صخب المدينة على طول البحر الأسود. سفاري الغابات وجولة القوارب وزيارة زوبارك اختيارية.', meals_breakfast: true, meals_lunch: false, meals_dinner: false, visits: ['البحيرة المخفية (ساكلي جول)','غابات أغفا','زوبارك','ساحل أغفا','منارة شيلي التاريخية'], activities: ['الاسترخاء وسط الطبيعة البكر في البحيرة المخفية (ساكلي جول) وهي من أهدأ البقع الطبيعية المحاطة بالجبال والأشجار والمثالية للتصوير','جولة سفاري بالدراجات الرباعية عبر الغابات الخضراء الكثيفة (اختياري)','زيارة اختيارية لحديقة الحيوان لعشاق الحياة البرية','الاستمتاع بالساحل على طول النهر وسط المناظر الطبيعية مع خيار القيام بجولة قوارب هادئة','الاستمتاع بإطلالات مباشرة على أمواج البحر الأسود وزيارة المنارة التاريخية الأيقونية شيلي وهي من أقدم المنارات على الساحل','وقت حر'] },
  { day_number: 5, title: 'جولة جزر الأمراء', city: 'جزر الأمراء', notes: 'مشمول في الجولة: الغداء + الانتقالات من وإلى الفندق.', meals_breakfast: true, meals_lunch: true, meals_dinner: false, visits: ['رحلة بحرية في البوسفور','جزيرة كيناليادا','الجزيرة الكبرى (بويوكادا)'], activities: ['رحلة بحرية ممتعة عبر مضيق البوسفور إلى جزر الأمراء الشهيرة','الإبحار عبر الماء مستمتعاً بالهواء النقي والمناظر الخلابة والمسابقات والألعاب والعروض الترفيهية والموسيقى الحية خلال الرحلة','التوقف للتجول والمشي واكتشاف جزيرة كيناليادا الساحرة الصغيرة','زيارة الجزيرة الكبرى (بويوكادا) واستكشاف شوارعها الهادئة الخالية من السيارات والمزينة بالزهور والقصور العثمانية التاريخية','الغداء'] },
  { day_number: 6, title: 'عشاء البوسفور الليلي', city: 'إسطنبول', notes: 'رحلة بحرية ليلية مع عشاء بوفيه وعروض ترفيهية حية.', meals_breakfast: true, meals_lunch: false, meals_dinner: true, visits: ['رحلة بحرية ليلية في البوسفور'], activities: ['الإبحار عبر مضيق البوسفور ليلاً والاستمتاع بمشاهدة قصور ومساكن وجسور إسطنبول المضاءة','عشاء بوفيه فاخر مفتوح يضم مجموعة متنوعة من الأطباق الشهية والمقبلات','عروض ترفيهية حية'] },
  { day_number: 7, title: 'المغادرة', city: 'إسطنبول', notes: 'مجاناً. تسجيل الخروج من الفندق حسب وقت الفندق ثم الانتقال إلى المطار.', meals_breakfast: true, meals_lunch: false, meals_dinner: false, visits: [], activities: ['وجبة الإفطار في الفندق','تسجيل الخروج من الفندق','الانتقال إلى مطار إسطنبول','المغادرة بذكريات لا تُنسى من رحلتك إلى إسطنبول'] }
];

async function getRow(table, id) {
  const res = await fetch(url + '/rest/v1/' + table + '?id=eq.' + id + '&select=*', { method: 'GET', headers: headers });
  if (!res.ok) throw new Error('GET ' + table + ' status ' + res.status);
  return res.json();
}

async function insert(table, rows) {
  const res = await fetch(url + '/rest/v1/' + table, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(rows)
  });
  if (!res.ok && res.status !== 201) {
    const t = await res.text().catch(() => '');
    throw new Error('POST ' + table + ' status ' + res.status + ' ' + t.slice(0, 300));
  }
  return res.json();
}

async function main() {
  // 1) Destination
  let dest = await getRow('destinations', DEST_ID);
  if (!dest || !dest.length) {
    await insert('destinations', [{ id: DEST_ID, name: 'تركيا', emoji: '🇹🇷', gradient: 'linear-gradient(135deg, #C0392B 0%, #E67E22 100%)', sort_order: 3 }]);
    console.log('[turkey] destination inserted');
  } else {
    console.log('[turkey] destination exists');
  }

  // 2) Program
  let prog = await getRow('programs', PROG_ID);
  if (!prog || !prog.length) {
    await insert('programs', [program]);
    console.log('[turkey] program inserted');
  } else {
    console.log('[turkey] program exists');
  }

  // 3) Hotels
  for (const h of hotels) {
    let existing = await getRow('hotels', h.id);
    if (!existing || !existing.length) {
      await insert('hotels', [h]);
      console.log('[turkey] hotel inserted: ' + h.name);
    } else {
      console.log('[turkey] hotel exists: ' + h.name);
    }
  }

  // 4) program_hotels
  const phRows = hotels.map((h, i) => ({ program_id: PROG_ID, hotel_id: h.id, room_type: 'غرفة قياسية', nights: 7, sort_order: i + 1 }));
  const phRes = await fetch(url + '/rest/v1/program_hotels?program_id=eq.' + PROG_ID + '&select=hotel_id', { method: 'GET', headers });
  const phData = await phRes.json();
  const haveHotelIds = new Set((phData || []).map(r => r.hotel_id));
  for (const row of phRows) {
    if (!haveHotelIds.has(row.hotel_id)) {
      await insert('program_hotels', [row]);
      console.log('[turkey] program_hotel inserted: ' + row.hotel_id);
    }
  }

  // 5) program_days
  for (const d of days) {
    const res = await fetch(url + '/rest/v1/program_days?program_id=eq.' + PROG_ID + '&day_number=eq.' + d.day_number + '&select=id', { method: 'GET', headers });
    const data = await res.json();
    if (!data || !data.length) {
      await insert('program_days', [{ program_id: PROG_ID, ...d }]);
      console.log('[turkey] day inserted: ' + d.day_number);
    } else {
      console.log('[turkey] day exists: ' + d.day_number);
    }
  }

  // 6) Verify price
  let verify = await getRow('programs', PROG_ID);
  if (verify && verify.length) {
    console.log('[turkey] FINAL price=' + verify[0].price + ' currency=' + verify[0].currency + ' status=' + verify[0].status);
  }
  console.log('[turkey] DONE');
}

main().catch((e) => { console.error('[turkey]', e); process.exit(1); });
