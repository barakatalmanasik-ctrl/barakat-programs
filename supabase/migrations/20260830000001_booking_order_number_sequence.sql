-- ============================================================
-- 20260830000001_booking_order_number_sequence.sql
-- FIX: "duplicate key value violates unique constraint
--       bookings_order_number_key" عند إرسال طلب الحجز.
--
-- السبب: الدالة الحالية تولّد رقم الطلب بـ MAX+1 (SELECT MAX(..)+1)
-- وهذا ليس منفّذاً بشكل ذرّي — عند قدوم حجزين متزامنين (عميلان، أو
-- محاولتان متقاربتان) يتحصلان على نفس الرقم فيرفض الثاني بسبب
-- القيد UNIQUE.
--
-- الحل: توليد الرقم من SEQUENCE (ذرّي وآمن بالتزامن).
--
-- الفحص: افتح Supabase Dashboard -> SQL Editor -> New query -> Run.
-- آمن إعادة تشغيله (idempotent). لا يغيّر أرقام الطلبات السابقة.
-- ============================================================

-- ─── 1. أنشئ دار التسلسل بدءاً من آخر رقم مستخدم ───────────────
DO $$
DECLARE current_max INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 9) AS INTEGER)), 0) + 1
    INTO current_max
    FROM bookings
    WHERE order_number ~ '^BK-[0-9]{4}-[0-9]+$';

  EXECUTE format(
    'CREATE SEQUENCE IF NOT EXISTS bookings_order_number_seq START WITH %s',
    current_max
  );
END $$;

-- ─── 2. استبدل دالة التوليد لتعتمد على nextval (ذرّي) ──────────
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  bok_year TEXT;
  bok_seq  INTEGER;
BEGIN
  SELECT to_char(now(), 'YYYY') INTO bok_year;
  bok_seq := nextval('bookings_order_number_seq');
  NEW.order_number := 'BK-' || bok_year || '-' || LPAD(bok_seq::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_order_number ON bookings;
CREATE TRIGGER trigger_generate_order_number
  BEFORE INSERT ON bookings
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION generate_order_number();

-- ============================================================
-- تذكير: بعد تشغيل السطرين أعلاه جرّب إرسال حجزين في نفس اللحظة
-- من تبويبين مختلفين — لن يتكرر الرقم بعد الآن.
-- ============================================================