-- Fix public insert policies for booking flow
-- These policies allow anonymous users to create bookings

-- Recreate public insert policies (in case they were overwritten)
DROP POLICY IF EXISTS "Public can create customers" ON customers;
CREATE POLICY "Public can create customers" ON customers
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can create reservations" ON reservations;
CREATE POLICY "Public can create reservations" ON reservations
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can create passengers" ON passengers;
CREATE POLICY "Public can create passengers" ON passengers
  FOR INSERT WITH CHECK (true);

-- Also need public SELECT on certain tables for the booking flow
DROP POLICY IF EXISTS "Public can view slots" ON slots;
CREATE POLICY "Public can view slots" ON slots
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view courses" ON courses;
CREATE POLICY "Public can view courses" ON courses
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view customers by email" ON customers;
CREATE POLICY "Public can view customers by email" ON customers
  FOR SELECT USING (true);

-- Allow public to update slot counts (for booking)
DROP POLICY IF EXISTS "Public can update slot counts" ON slots;
CREATE POLICY "Public can update slot counts" ON slots
  FOR UPDATE USING (true) WITH CHECK (true);
