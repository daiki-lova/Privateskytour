-- Add RLS policy for admin_users table
-- Allow authenticated users to read their own admin record
CREATE POLICY "Users can read own admin record" ON admin_users
  FOR SELECT
  USING (auth.uid() = id);
