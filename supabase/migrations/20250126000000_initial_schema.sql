-- ============================================================
-- PRIVATESKY TOUR Database Schema
-- Comprehensive helicopter tour booking system
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM ('admin', 'staff', 'viewer');
CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'partial_refund');
CREATE TYPE supported_lang AS ENUM ('ja', 'en', 'zh');
CREATE TYPE slot_status AS ENUM ('open', 'closed', 'suspended');
CREATE TYPE course_type AS ENUM ('standard', 'premium', 'charter');
CREATE TYPE log_type AS ENUM ('stripe', 'crm', 'system', 'operation', 'auth');
CREATE TYPE log_status AS ENUM ('success', 'failure', 'warning', 'info');
CREATE TYPE notification_type AS ENUM ('booking_confirmation', 'payment_received', 'reminder', 'cancellation', 'refund', 'custom');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed', 'cancelled');
CREATE TYPE refund_reason AS ENUM ('customer_request', 'weather', 'mechanical', 'operator_cancel', 'other');
CREATE TYPE inquiry_status AS ENUM ('new', 'in_progress', 'resolved', 'closed');
CREATE TYPE transfer_status AS ENUM ('pending', 'approved', 'rejected', 'completed');

-- ============================================================
-- CORE TABLES
-- ============================================================

-- Heliports
CREATE TABLE heliports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_en TEXT,
  name_zh TEXT,
  postal_code TEXT,
  address TEXT NOT NULL,
  address_en TEXT,
  address_zh TEXT,
  access_rail TEXT,
  access_taxi TEXT,
  access_car TEXT,
  google_map_url TEXT,
  image_url TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses (Tour packages)
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heliport_id UUID REFERENCES heliports(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  title_en TEXT,
  title_zh TEXT,
  subtitle TEXT,
  subtitle_en TEXT,
  subtitle_zh TEXT,
  description TEXT,
  description_en TEXT,
  description_zh TEXT,
  course_type course_type DEFAULT 'standard',
  duration_minutes INTEGER NOT NULL,
  price INTEGER NOT NULL, -- in JPY
  max_pax INTEGER DEFAULT 3 CHECK (max_pax > 0 AND max_pax <= 5),
  min_pax INTEGER DEFAULT 1 CHECK (min_pax > 0),
  tags TEXT[],
  images TEXT[],
  flight_schedule JSONB, -- [{time, title, description}]
  highlights TEXT[],
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_pax_range CHECK (min_pax <= max_pax)
);

-- Slots (Available time slots)
CREATE TABLE slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  slot_time TIME NOT NULL,
  max_pax INTEGER NOT NULL DEFAULT 3 CHECK (max_pax > 0),
  current_pax INTEGER NOT NULL DEFAULT 0 CHECK (current_pax >= 0),
  status slot_status DEFAULT 'open',
  suspended_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_slot_time CHECK (
    slot_time >= '09:00:00' AND
    slot_time <= '19:00:00' AND
    EXTRACT(MINUTE FROM slot_time) IN (0, 30)
  ),
  CONSTRAINT valid_pax CHECK (current_pax <= max_pax),
  UNIQUE (course_id, slot_date, slot_time)
);

-- ============================================================
-- USER TABLES
-- ============================================================

-- Customers (Auto-created on booking)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  name_kana TEXT,
  phone TEXT,
  preferred_lang supported_lang DEFAULT 'ja',
  total_spent INTEGER DEFAULT 0,
  booking_count INTEGER DEFAULT 0,
  first_booking_date DATE,
  last_booking_date DATE,
  notes TEXT,
  tags TEXT[],
  mypage_token TEXT UNIQUE,
  mypage_token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (email)
);

-- Admin Users (Linked to Supabase Auth)
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role user_role DEFAULT 'staff',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BOOKING TABLES
-- ============================================================

-- Reservations
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number TEXT UNIQUE NOT NULL, -- RES-YYMM-NNN format
  customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT,
  course_id UUID REFERENCES courses(id) ON DELETE RESTRICT,
  slot_id UUID REFERENCES slots(id) ON DELETE RESTRICT,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  pax INTEGER NOT NULL CHECK (pax > 0 AND pax <= 5),
  subtotal INTEGER NOT NULL, -- Base price
  tax INTEGER NOT NULL DEFAULT 0,
  total_price INTEGER NOT NULL,
  status reservation_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,

  -- Health & consent
  health_confirmed BOOLEAN DEFAULT false,
  terms_accepted BOOLEAN DEFAULT false,
  privacy_accepted BOOLEAN DEFAULT false,

  -- Cancellation tracking
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES admin_users(id),
  cancellation_reason TEXT,
  cancellation_fee INTEGER DEFAULT 0,

  -- Customer notes
  customer_notes TEXT,
  admin_notes TEXT,

  -- Metadata
  booked_via TEXT DEFAULT 'web', -- web, admin, phone
  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Passengers (Per reservation, up to 5)
CREATE TABLE passengers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  name_kana TEXT,
  weight_kg DECIMAL(5, 2), -- For safety requirements
  is_child BOOLEAN DEFAULT false, -- 3-11 years
  is_infant BOOLEAN DEFAULT false, -- Under 3 years
  seat_number INTEGER CHECK (seat_number > 0 AND seat_number <= 5),
  special_requirements TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PAYMENT TABLES
-- ============================================================

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES reservations(id) ON DELETE RESTRICT NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  amount INTEGER NOT NULL, -- in JPY
  currency TEXT DEFAULT 'jpy',
  status payment_status DEFAULT 'pending',
  payment_method TEXT, -- card, bank_transfer, etc.
  card_last4 TEXT,
  card_brand TEXT,
  receipt_url TEXT,
  paid_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Refunds
CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id) ON DELETE RESTRICT NOT NULL,
  reservation_id UUID REFERENCES reservations(id) ON DELETE RESTRICT NOT NULL,
  stripe_refund_id TEXT UNIQUE,
  amount INTEGER NOT NULL,
  reason refund_reason NOT NULL,
  reason_detail TEXT,
  processed_by UUID REFERENCES admin_users(id),
  processed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending', -- pending, succeeded, failed
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cancellation Policies
CREATE TABLE cancellation_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  days_before INTEGER NOT NULL, -- Days before reservation
  fee_percentage INTEGER NOT NULL CHECK (fee_percentage >= 0 AND fee_percentage <= 100),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (days_before)
);

-- ============================================================
-- NOTIFICATION TABLES
-- ============================================================

-- Notifications (Email queue)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  notification_type notification_type NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  body_text TEXT NOT NULL,
  body_html TEXT,
  lang supported_lang DEFAULT 'ja',
  status notification_status DEFAULT 'pending',
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  resend_message_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification Settings
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SYSTEM TABLES
-- ============================================================

-- System Settings
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact Inquiries
CREATE TABLE contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  lang supported_lang DEFAULT 'ja',
  status inquiry_status DEFAULT 'new',
  assigned_to UUID REFERENCES admin_users(id),
  resolved_at TIMESTAMPTZ,
  response TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alphard Transfers (VIP transport service)
CREATE TABLE alphard_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  pickup_location TEXT NOT NULL,
  pickup_datetime TIMESTAMPTZ NOT NULL,
  dropoff_location TEXT,
  passengers INTEGER DEFAULT 1 CHECK (passengers > 0 AND passengers <= 6),
  status transfer_status DEFAULT 'pending',
  notes TEXT,
  approved_by UUID REFERENCES admin_users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_type log_type NOT NULL,
  action TEXT NOT NULL,
  status log_status DEFAULT 'info',
  message TEXT,
  user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  user_email TEXT,
  target_table TEXT,
  target_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Heliports
CREATE INDEX idx_heliports_active ON heliports(is_active);

-- Courses
CREATE INDEX idx_courses_heliport ON courses(heliport_id);
CREATE INDEX idx_courses_active ON courses(is_active);
CREATE INDEX idx_courses_type ON courses(course_type);

-- Slots
CREATE INDEX idx_slots_date ON slots(slot_date);
CREATE INDEX idx_slots_course_date ON slots(course_id, slot_date);
CREATE INDEX idx_slots_status ON slots(status);
CREATE INDEX idx_slots_available ON slots(slot_date, status) WHERE status = 'open' AND current_pax < max_pax;

-- Customers
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_mypage_token ON customers(mypage_token) WHERE mypage_token IS NOT NULL;

-- Reservations
CREATE INDEX idx_reservations_customer ON reservations(customer_id);
CREATE INDEX idx_reservations_course ON reservations(course_id);
CREATE INDEX idx_reservations_slot ON reservations(slot_id);
CREATE INDEX idx_reservations_date ON reservations(reservation_date);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_booking_number ON reservations(booking_number);
CREATE INDEX idx_reservations_stripe_intent ON reservations(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;

-- Passengers
CREATE INDEX idx_passengers_reservation ON passengers(reservation_id);

-- Payments
CREATE INDEX idx_payments_reservation ON payments(reservation_id);
CREATE INDEX idx_payments_stripe_intent ON payments(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;
CREATE INDEX idx_payments_status ON payments(status);

-- Refunds
CREATE INDEX idx_refunds_payment ON refunds(payment_id);
CREATE INDEX idx_refunds_reservation ON refunds(reservation_id);

-- Notifications
CREATE INDEX idx_notifications_reservation ON notifications(reservation_id);
CREATE INDEX idx_notifications_customer ON notifications(customer_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_at) WHERE status = 'pending';

-- Contact Inquiries
CREATE INDEX idx_inquiries_status ON contact_inquiries(status);
CREATE INDEX idx_inquiries_assigned ON contact_inquiries(assigned_to);

-- Alphard Transfers
CREATE INDEX idx_transfers_reservation ON alphard_transfers(reservation_id);
CREATE INDEX idx_transfers_status ON alphard_transfers(status);
CREATE INDEX idx_transfers_datetime ON alphard_transfers(pickup_datetime);

-- Audit Logs
CREATE INDEX idx_audit_logs_type ON audit_logs(log_type);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_target ON audit_logs(target_table, target_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE heliports ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE cancellation_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE alphard_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Public read access (for customer-facing pages)
CREATE POLICY "Public can view active heliports" ON heliports
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active courses" ON courses
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view available slots" ON slots
  FOR SELECT USING (status = 'open');

CREATE POLICY "Public can view cancellation policies" ON cancellation_policies
  FOR SELECT USING (is_active = true);

-- Customer access via MyPage token (handled in application layer)
-- Reservations are accessed via mypage_token through customers table

-- Admin full access
CREATE POLICY "Admins have full access to heliports" ON heliports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins have full access to courses" ON courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins have full access to slots" ON slots
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins have full access to customers" ON customers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins have full access to reservations" ON reservations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins have full access to passengers" ON passengers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins have full access to payments" ON payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins have full access to refunds" ON refunds
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins have full access to notifications" ON notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins have full access to notification_settings" ON notification_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins have full access to system_settings" ON system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins have full access to contact_inquiries" ON contact_inquiries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins have full access to alphard_transfers" ON alphard_transfers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins have full access to audit_logs" ON audit_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins have full access to cancellation_policies" ON cancellation_policies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admin users can view themselves" ON admin_users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Admins have full access to admin_users" ON admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND is_active = true AND role = 'admin'
    )
  );

-- Public insert for bookings (web reservations)
CREATE POLICY "Public can create reservations" ON reservations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can create customers" ON customers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can create passengers" ON passengers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can create contact inquiries" ON contact_inquiries
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- TRIGGER FUNCTIONS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generate booking number (RES-YYMM-NNN)
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TRIGGER AS $$
DECLARE
  year_month TEXT;
  seq_num INTEGER;
  new_booking_number TEXT;
BEGIN
  year_month := TO_CHAR(NOW(), 'YYMM');

  SELECT COALESCE(MAX(
    CAST(SUBSTRING(booking_number FROM 10) AS INTEGER)
  ), 0) + 1
  INTO seq_num
  FROM reservations
  WHERE booking_number LIKE 'RES-' || year_month || '-%';

  new_booking_number := 'RES-' || year_month || '-' || LPAD(seq_num::TEXT, 3, '0');
  NEW.booking_number := new_booking_number;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Sync slot current_pax when reservation changes
CREATE OR REPLACE FUNCTION sync_slot_pax()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE slots
    SET current_pax = current_pax + NEW.pax
    WHERE id = NEW.slot_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.slot_id IS DISTINCT FROM NEW.slot_id OR OLD.pax IS DISTINCT FROM NEW.pax THEN
      -- Decrease old slot
      IF OLD.slot_id IS NOT NULL THEN
        UPDATE slots
        SET current_pax = current_pax - OLD.pax
        WHERE id = OLD.slot_id;
      END IF;
      -- Increase new slot
      IF NEW.slot_id IS NOT NULL THEN
        UPDATE slots
        SET current_pax = current_pax + NEW.pax
        WHERE id = NEW.slot_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE slots
    SET current_pax = current_pax - OLD.pax
    WHERE id = OLD.slot_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Sync customer statistics
CREATE OR REPLACE FUNCTION sync_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status IN ('confirmed', 'completed') THEN
    UPDATE customers SET
      booking_count = booking_count + 1,
      total_spent = total_spent + NEW.total_price,
      first_booking_date = COALESCE(first_booking_date, NEW.reservation_date),
      last_booking_date = NEW.reservation_date
    WHERE id = NEW.customer_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle status change to confirmed/completed
    IF OLD.status NOT IN ('confirmed', 'completed') AND NEW.status IN ('confirmed', 'completed') THEN
      UPDATE customers SET
        booking_count = booking_count + 1,
        total_spent = total_spent + NEW.total_price,
        first_booking_date = COALESCE(first_booking_date, NEW.reservation_date),
        last_booking_date = NEW.reservation_date
      WHERE id = NEW.customer_id;
    -- Handle status change from confirmed/completed to cancelled
    ELSIF OLD.status IN ('confirmed', 'completed') AND NEW.status = 'cancelled' THEN
      UPDATE customers SET
        booking_count = GREATEST(0, booking_count - 1),
        total_spent = GREATEST(0, total_spent - OLD.total_price)
      WHERE id = NEW.customer_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generate MyPage token for customer
CREATE OR REPLACE FUNCTION generate_mypage_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.mypage_token IS NULL THEN
    NEW.mypage_token := encode(gen_random_bytes(32), 'hex');
    NEW.mypage_token_expires_at := NOW() + INTERVAL '1 year';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- updated_at triggers
CREATE TRIGGER update_heliports_updated_at BEFORE UPDATE ON heliports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_slots_updated_at BEFORE UPDATE ON slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_passengers_updated_at BEFORE UPDATE ON passengers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_refunds_updated_at BEFORE UPDATE ON refunds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cancellation_policies_updated_at BEFORE UPDATE ON cancellation_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON notification_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_inquiries_updated_at BEFORE UPDATE ON contact_inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alphard_transfers_updated_at BEFORE UPDATE ON alphard_transfers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Booking number generation
CREATE TRIGGER generate_reservation_booking_number
  BEFORE INSERT ON reservations
  FOR EACH ROW
  WHEN (NEW.booking_number IS NULL)
  EXECUTE FUNCTION generate_booking_number();

-- Slot pax sync
CREATE TRIGGER sync_slot_pax_on_reservation
  AFTER INSERT OR UPDATE OR DELETE ON reservations
  FOR EACH ROW EXECUTE FUNCTION sync_slot_pax();

-- Customer stats sync
CREATE TRIGGER sync_customer_stats_on_reservation
  AFTER INSERT OR UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION sync_customer_stats();

-- MyPage token generation
CREATE TRIGGER generate_customer_mypage_token
  BEFORE INSERT ON customers
  FOR EACH ROW EXECUTE FUNCTION generate_mypage_token();

-- ============================================================
-- UTILITY FUNCTIONS
-- ============================================================

-- Calculate cancellation fee based on policy
CREATE OR REPLACE FUNCTION calculate_cancellation_fee(
  p_reservation_id UUID,
  p_cancellation_date DATE DEFAULT CURRENT_DATE
)
RETURNS INTEGER AS $$
DECLARE
  v_reservation RECORD;
  v_days_before INTEGER;
  v_fee_percentage INTEGER;
BEGIN
  SELECT reservation_date, total_price
  INTO v_reservation
  FROM reservations
  WHERE id = p_reservation_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  v_days_before := v_reservation.reservation_date - p_cancellation_date;

  SELECT COALESCE(fee_percentage, 100)
  INTO v_fee_percentage
  FROM cancellation_policies
  WHERE is_active = true AND days_before <= v_days_before
  ORDER BY days_before DESC
  LIMIT 1;

  IF v_fee_percentage IS NULL THEN
    v_fee_percentage := 100; -- Default: full charge if no policy matches
  END IF;

  RETURN (v_reservation.total_price * v_fee_percentage / 100)::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- Generate slots for a date range
CREATE OR REPLACE FUNCTION generate_slots_for_date_range(
  p_course_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_start_time TIME DEFAULT '09:00',
  p_end_time TIME DEFAULT '19:00',
  p_interval_minutes INTEGER DEFAULT 30,
  p_max_pax INTEGER DEFAULT 3
)
RETURNS INTEGER AS $$
DECLARE
  v_current_date DATE;
  v_current_time TIME;
  v_count INTEGER := 0;
BEGIN
  v_current_date := p_start_date;

  WHILE v_current_date <= p_end_date LOOP
    v_current_time := p_start_time;

    WHILE v_current_time <= p_end_time LOOP
      INSERT INTO slots (course_id, slot_date, slot_time, max_pax, status)
      VALUES (p_course_id, v_current_date, v_current_time, p_max_pax, 'open')
      ON CONFLICT (course_id, slot_date, slot_time) DO NOTHING;

      v_count := v_count + 1;
      v_current_time := v_current_time + (p_interval_minutes || ' minutes')::INTERVAL;
    END LOOP;

    v_current_date := v_current_date + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Get available slots for a course and date
CREATE OR REPLACE FUNCTION get_available_slots(
  p_course_id UUID,
  p_date DATE
)
RETURNS TABLE (
  slot_id UUID,
  slot_time TIME,
  max_pax INTEGER,
  current_pax INTEGER,
  available_pax INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.slot_time,
    s.max_pax,
    s.current_pax,
    (s.max_pax - s.current_pax) AS available_pax
  FROM slots s
  WHERE s.course_id = p_course_id
    AND s.slot_date = p_date
    AND s.status = 'open'
    AND s.current_pax < s.max_pax
  ORDER BY s.slot_time;
END;
$$ LANGUAGE plpgsql;

-- Create audit log entry
CREATE OR REPLACE FUNCTION create_audit_log(
  p_log_type log_type,
  p_action TEXT,
  p_status log_status DEFAULT 'info',
  p_message TEXT DEFAULT NULL,
  p_target_table TEXT DEFAULT NULL,
  p_target_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
  v_user_id UUID;
  v_user_email TEXT;
BEGIN
  -- Get current user if authenticated
  v_user_id := auth.uid();

  IF v_user_id IS NOT NULL THEN
    SELECT email INTO v_user_email FROM admin_users WHERE id = v_user_id;
  END IF;

  INSERT INTO audit_logs (
    log_type, action, status, message,
    user_id, user_email,
    target_table, target_id,
    old_values, new_values, metadata
  ) VALUES (
    p_log_type, p_action, p_status, p_message,
    v_user_id, v_user_email,
    p_target_table, p_target_id,
    p_old_values, p_new_values, p_metadata
  ) RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- INITIAL DATA
-- ============================================================

-- Default cancellation policies
INSERT INTO cancellation_policies (name, days_before, fee_percentage, display_order) VALUES
  ('7日以上前', 7, 0, 1),
  ('4-6日前', 4, 30, 2),
  ('2-3日前', 2, 50, 3),
  ('前日', 1, 80, 4),
  ('当日', 0, 100, 5);

-- System settings
INSERT INTO system_settings (key, value, description) VALUES
  ('business_hours', '{"start": "09:00", "end": "19:00"}', '営業時間'),
  ('slot_interval_minutes', '30', 'スロット間隔（分）'),
  ('max_pax_per_slot', '3', '1スロットあたり最大人数'),
  ('booking_deadline_hours', '24', '予約締切（フライト前の時間）'),
  ('tax_rate', '10', '消費税率（%）');

-- Notification settings
INSERT INTO notification_settings (key, value, description) VALUES
  ('admin_email', 'admin@example.com', '管理者通知先メール'),
  ('from_email', 'noreply@example.com', '送信元メールアドレス'),
  ('from_name', 'PRIVATESKY TOUR', '送信者名'),
  ('reminder_hours_before', '24', 'リマインダー送信時間（フライト前の時間）');

-- Default heliport (Tokyo Heliport)
INSERT INTO heliports (
  name, name_en,
  postal_code, address, address_en,
  access_rail, access_taxi, access_car,
  google_map_url,
  latitude, longitude
) VALUES (
  '東京ヘリポート', 'Tokyo Heliport',
  '136-0082', '東京都江東区新木場4-7-28', '4-7-28 Shinkiba, Koto-ku, Tokyo',
  'JR京葉線・東京メトロ有楽町線・りんかい線「新木場駅」よりタクシー約5分',
  '新木場駅より約5分（約1,000円）',
  '首都高速湾岸線「新木場IC」より約3分',
  'https://maps.google.com/?q=35.6329,139.8344',
  35.6329, 139.8344
);
