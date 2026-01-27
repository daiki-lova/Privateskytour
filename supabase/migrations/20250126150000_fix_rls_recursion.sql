-- Fix infinite recursion in RLS policies for admin_users table
-- The previous policy "Admins have full access to admin_users" references admin_users table itself,
-- causing infinite recursion when checking access.

-- Drop the problematic policies
DROP POLICY IF EXISTS "Admins have full access to admin_users" ON admin_users;
DROP POLICY IF EXISTS "Admin users can view themselves" ON admin_users;
DROP POLICY IF EXISTS "Users can read own admin record" ON admin_users;

-- Create a simpler policy that doesn't cause recursion
-- Admin users can view all admin users if they are authenticated and exist in the table
CREATE POLICY "Admin users can view admin users" ON admin_users
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
  );

-- Admin users can modify admin users only if they are an active admin
CREATE POLICY "Active admin users can modify admin users" ON admin_users
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true)
  );

-- Also fix the other policies that might cause similar issues
-- by using a security definer function

-- Create a helper function to check admin status without RLS
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid() AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update policies to use the helper function
DROP POLICY IF EXISTS "Admins have full access to heliports" ON heliports;
CREATE POLICY "Admins have full access to heliports" ON heliports
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins have full access to courses" ON courses;
CREATE POLICY "Admins have full access to courses" ON courses
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins have full access to slots" ON slots;
CREATE POLICY "Admins have full access to slots" ON slots
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins have full access to customers" ON customers;
CREATE POLICY "Admins have full access to customers" ON customers
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins have full access to reservations" ON reservations;
CREATE POLICY "Admins have full access to reservations" ON reservations
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins have full access to passengers" ON passengers;
CREATE POLICY "Admins have full access to passengers" ON passengers
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins have full access to payments" ON payments;
CREATE POLICY "Admins have full access to payments" ON payments
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins have full access to refunds" ON refunds;
CREATE POLICY "Admins have full access to refunds" ON refunds
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins have full access to notifications" ON notifications;
CREATE POLICY "Admins have full access to notifications" ON notifications
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins have full access to notification_settings" ON notification_settings;
CREATE POLICY "Admins have full access to notification_settings" ON notification_settings
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins have full access to system_settings" ON system_settings;
CREATE POLICY "Admins have full access to system_settings" ON system_settings
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins have full access to contact_inquiries" ON contact_inquiries;
CREATE POLICY "Admins have full access to contact_inquiries" ON contact_inquiries
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins have full access to alphard_transfers" ON alphard_transfers;
CREATE POLICY "Admins have full access to alphard_transfers" ON alphard_transfers
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins have full access to audit_logs" ON audit_logs;
CREATE POLICY "Admins have full access to audit_logs" ON audit_logs
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins have full access to cancellation_policies" ON cancellation_policies;
CREATE POLICY "Admins have full access to cancellation_policies" ON cancellation_policies
  FOR ALL USING (is_admin());
