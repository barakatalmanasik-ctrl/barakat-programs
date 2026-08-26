# بركات المناسك - Supabase Database

## نظرة عامة

هذا المجلد يحتوي على ملفات SQL اللازمة لإعداد قاعدة البيانات لمشروع بركات المناسك باستخدام **Supabase PostgreSQL**.

---

## الجداول

| # | الجدول | الوصف |
|---|--------|-------|
| 1 | `profiles` | ملفات المستخدمين المرتبطة بـ auth.users |
| 2 | `destinations` | الوجهات السياحية |
| 3 | `programs` | البرامج والرحلات |
| 4 | `program_days` | أيام البرنامج (البرنامج اليومي) |
| 5 | `hotels` | الفنادق |
| 6 | `program_day_hotels` | ربط أيام البرنامج بالفنادق |
| 7 | `program_hotels` | ربط البرامج بالفنادق |
| 8 | `bookings` | الحجوزات |
| 9 | `booking_travelers` | المسافرون داخل الحجز |
| 10 | `favorites` | المفضلة |
| 11 | `notifications` | الإشعارات |

---

## العلاقات

```
auth.users ──(1:1)──> profiles
                          │
                          ├── bookings ──> booking_travelers
                          ├── favorites ──> programs
                          └── notifications

programs ──(M:1)──> destinations
programs ──(1:N)──> program_days
programs ──(M:N)──> hotels (via program_hotels)
program_days ──(M:N)──> hotels (via program_day_hotels)
bookings ──(M:1)──> programs
bookings ──(M:1)──> profiles (assigned employee)
```

---

## ترتيب تنفيذ ملفات SQL

```
01_schema.sql                  ← ENUM types
02_profiles.sql                ← profiles + triggers
03_programs.sql                ← destinations, programs, program_days, hotels
04_bookings.sql                ← bookings, booking_travelers, favorites, notifications
05_rls.sql                     ← Row Level Security policies
06_functions_triggers.sql      ← Helper functions + triggers
07_seed_data.sql               ← بيانات تجريبية
```

**يجب تنفيذ الملفات بالترتيب من 01 إلى 07.**

---

## طريقة الإعداد

### 1. إنشاء مشروع Supabase

1. اذهب إلى [supabase.com](https://supabase.com)
2. أنشئ حساباً أو سجّل الدخول
3. أنشئ مشروع جديد
4. اختر المنطقة الأقرب (East US أو EU West)
5. اختر كلمة مرور لقاعدة البيانات

### 2. تفعيل Authentication

1. في Supabase Dashboard، اذهب إلى **Authentication > Providers**
2. تأكد من تفعيل **Email** provider (مفعّل افتراضياً)
3. يمكنك تفعيل **Phone** provider إذا أردت تسجيل الدخول بالهاتف
4. في **Authentication > Settings**، عدّل:
   - **Site URL**: رابط موقعك
   - **Redirect URLs**: أضف روابط إعادة التوجيه

### 3. تشغيل ملفات SQL

1. اذهب إلى **SQL Editor** في Supabase Dashboard
2. انسخ محتوى كل ملف بالترتيب وأjalishه
3. أو استخدم **Upload file** لرفع الملفات

### 4. الاتصال بالـ Frontend

أنشئ ملف `js/services/supabase-config.js`:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

**مهم**: لا تضع Service Role Key في الـ Frontend أبداً!

### 5. تفعيل RLS

 جميع Policies موجودة في ملف `05_rls.sql`. تأكد من تنفيذها.

---

## ملاحظات أمنية

- **لا تستخدم** `USING (true)` على جداول حساسة
- **لا تضع** Service Role Key في الـ Frontend
- **لا تحفظ** كلمات مرور في قاعدة البيانات (Supabase Auth يتعامل مع ذلك)
- RLS مفعّل على جميع الجداول

---

## Enums المستخدمة

| Enum | القيم |
|------|-------|
| `user_role` | customer, employee, admin |
| `program_status` | draft, published, available, limited, full, expired |
| `program_type` | tourism, religious, adventure, family, flight, special |
| `booking_status` | pending, reviewing, confirmed, payment_pending, completed, cancelled |
| `notification_type` | welcome, promo, update, order, system |

---

## Troubleshooting

### الخطأ: "permission denied for table profiles"
- تأكد من تنفيذ ملف `05_rls.sql`

### الخطأ: "new row violates row-level security policy"
- تأكد من أن المستخدم مسجّل الدخول
- تأكد من أن RLS policies صحيحة

### الخطأ: "relation does not exist"
- تأكد من تنفيذ الملفات بالترتيب الصحيح من 01 إلى 07
