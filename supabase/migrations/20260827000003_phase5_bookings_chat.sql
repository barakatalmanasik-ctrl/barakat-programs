-- ============================================================
-- PHASE 5: Bookings + Booking Management + In-App Chat Support
-- Adds conversation + message tables, RLS, order-number format
-- update, and notification triggers for chat.
--
-- SAFE: idempotent (CREATE IF NOT EXISTS / DO $$ guards). Does NOT
-- DROP tables or delete data. Only ADDs missing schema.
-- ============================================================

-- ─── 1. Conversation status type ─────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'conversation_status') THEN
    CREATE TYPE conversation_status AS ENUM ('open', 'pending', 'resolved', 'closed');
  END IF;
END $$;

-- ─── 2. Conversations table ──────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id        UUID REFERENCES bookings(id) ON DELETE CASCADE,
  subject           TEXT NOT NULL DEFAULT '',
  status            conversation_status NOT NULL DEFAULT 'open',
  assigned_employee UUID REFERENCES profiles(id) ON DELETE SET NULL,
  -- Denormalized customer info (avoids cross-profile RLS lookups for staff).
  customer_name     TEXT,
  customer_phone    TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_booking ON conversations(booking_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at);

-- Robustness: ensure denormalized columns exist.
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- ─── 3. Messages table ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sender_role     user_role NOT NULL DEFAULT 'customer',
  message         TEXT NOT NULL,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at);

-- ─── 4. Conversations updated_at trigger ─────────────────────
CREATE OR REPLACE FUNCTION update_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_conversations_updated_at ON conversations;
CREATE TRIGGER trigger_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_conversations_updated_at();

-- ─── 5. Touch conversation.updated_at on new message ─────────
CREATE OR REPLACE FUNCTION touch_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations SET updated_at = now() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_touch_conversation_on_message ON messages;
CREATE TRIGGER trigger_touch_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION touch_conversation_on_message();

-- ─── 6. Update order_number generator to BK-YYYY-NNNNN ───────
-- Replaces the ORD-XXXXXX generator. Safe, non-destructive.
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  bok_seq INTEGER;
  bok_year TEXT;
BEGIN
  SELECT to_char(now(), 'YYYY') INTO bok_year;
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(order_number FROM 9) AS INTEGER)
  ), 0) + 1
  INTO bok_seq
  FROM bookings
  WHERE order_number LIKE 'BK-' || bok_year || '-%';

  NEW.order_number = 'BK-' || bok_year || '-' || LPAD(bok_seq::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── 7. Row Level Security ───────────────────────────────────

-- 7a. conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS conversations_select_own ON conversations;
CREATE POLICY conversations_select_own ON conversations
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('employee', 'admin')
    )
  );

DROP POLICY IF EXISTS conversations_insert_own ON conversations;
CREATE POLICY conversations_insert_own ON conversations
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

DROP POLICY IF EXISTS conversations_update_staff ON conversations;
CREATE POLICY conversations_update_staff ON conversations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('employee', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('employee', 'admin')
    )
  );

DROP POLICY IF EXISTS conversations_delete_admin ON conversations;
CREATE POLICY conversations_delete_admin ON conversations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 7b. messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS messages_select ON messages;
CREATE POLICY messages_select ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND (c.user_id = auth.uid()
             OR EXISTS (
               SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('employee', 'admin')
             ))
    )
  );

DROP POLICY IF EXISTS messages_insert ON messages;
CREATE POLICY messages_insert ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND sender_role = (
      SELECT role FROM profiles WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND (
          c.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('employee', 'admin')
          )
        )
    )
  );

-- 7c. bookings: ensure a user can update only their own (already exists, defensively recreated)
DROP POLICY IF EXISTS bookings_update_own_nopk ON bookings;
CREATE POLICY bookings_update_own_nopk ON bookings
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── 8. Chat notification triggers (SECURITY DEFINER) ────────

-- When a customer sends a message, notify the assigned employee (if any).
CREATE OR REPLACE FUNCTION notify_staff_on_customer_message()
RETURNS TRIGGER AS $$
DECLARE
  v_employee UUID;
  v_booking_no TEXT;
  v_conv_subject TEXT;
BEGIN
  IF NEW.sender_role = 'customer' THEN
    SELECT c.assigned_employee, b.order_number, c.subject
      INTO v_employee, v_booking_no, v_conv_subject
      FROM conversations c
      LEFT JOIN bookings b ON b.id = c.booking_id
      WHERE c.id = NEW.conversation_id;

    IF v_employee IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, message, type, is_read)
      VALUES (
        v_employee,
        'رسالة جديدة من عميل',
        'لديك رسالة جديدة بخصوص ' || COALESCE(v_conv_subject, 'المحادثة')
          || CASE WHEN v_booking_no IS NOT NULL THEN ' (حجز ' || v_booking_no || ')' ELSE '' END,
        'order'::notification_type,
        false
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN RAISE WARNING 'notify_staff error: %', SQLERRM; RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_staff_on_customer_message ON messages;
CREATE TRIGGER trigger_notify_staff_on_customer_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION notify_staff_on_customer_message();

-- When staff send a message, notify the customer.
CREATE OR REPLACE FUNCTION notify_customer_on_staff_message()
RETURNS TRIGGER AS $$
DECLARE
  v_customer UUID;
  v_booking_no TEXT;
  v_conv_subject TEXT;
BEGIN
  IF NEW.sender_role IN ('employee', 'admin') THEN
    SELECT c.user_id, b.order_number, c.subject
      INTO v_customer, v_booking_no, v_conv_subject
      FROM conversations c
      LEFT JOIN bookings b ON b.id = c.booking_id
      WHERE c.id = NEW.conversation_id;

    IF v_customer IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, message, type, is_read)
      VALUES (
        v_customer,
        'رسالة جديدة من الدعم',
        'لديك رسالة جديدة من الدعم' || CASE WHEN v_booking_no IS NOT NULL THEN ' بخصوص الحجز ' || v_booking_no ELSE '' END,
        'order'::notification_type,
        false
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN RAISE WARNING 'notify_customer error: %', SQLERRM; RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_customer_on_staff_message ON messages;
CREATE TRIGGER trigger_notify_customer_on_staff_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION notify_customer_on_staff_message();

-- ─── 9. Enable publication for Realtime (conversations + messages) ──
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
