-- Force re-create reservations insert policy
DROP POLICY IF EXISTS "Public can create reservations" ON reservations;
CREATE POLICY "Public can create reservations" ON reservations
  FOR INSERT WITH CHECK (true);

-- Also ensure reservation SELECT works for the response
DROP POLICY IF EXISTS "Public can view own reservations" ON reservations;
CREATE POLICY "Public can view own reservations" ON reservations
  FOR SELECT USING (true);
