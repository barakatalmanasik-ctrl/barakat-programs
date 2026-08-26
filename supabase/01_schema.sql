-- ============================================================
-- 01_schema.sql
-- Enum types and foundational schema for Barakat Al-Manasik
-- Execute: Run this file FIRST before any other SQL file
-- ============================================================

-- ─── ENUM TYPES ──────────────────────────────────────────────

-- User roles
CREATE TYPE user_role AS ENUM ('customer', 'employee', 'admin');

-- Program status
CREATE TYPE program_status AS ENUM (
  'draft',
  'published',
  'available',
  'limited',
  'full',
  'expired'
);

-- Program type
CREATE TYPE program_type AS ENUM (
  'tourism',
  'religious',
  'adventure',
  'family',
  'flight',
  'special'
);

-- Booking status
CREATE TYPE booking_status AS ENUM (
  'pending',
  'reviewing',
  'confirmed',
  'payment_pending',
  'completed',
  'cancelled'
);

-- Notification type
CREATE TYPE notification_type AS ENUM (
  'welcome',
  'promo',
  'update',
  'order',
  'system'
);
