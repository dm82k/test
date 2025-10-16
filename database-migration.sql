-- Phase 2: Multi-user Database Migration
-- Run these commands in your Supabase SQL Editor

-- 1. Add user_id column to addresses table
ALTER TABLE addresses 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Create index for better performance
CREATE INDEX idx_addresses_user_id ON addresses(user_id);

-- 3. Create unique constraint for conflict resolution
CREATE UNIQUE INDEX idx_addresses_unique_per_user 
ON addresses(house_number, street, city, user_id);

-- 4. Enable Row Level Security on addresses table
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for addresses table

-- Policy: Users can only view their own addresses
CREATE POLICY "Users can view own addresses" ON addresses
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only insert their own addresses
CREATE POLICY "Users can insert own addresses" ON addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own addresses
CREATE POLICY "Users can update own addresses" ON addresses
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can only delete their own addresses
CREATE POLICY "Users can delete own addresses" ON addresses
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Optional: Assign existing addresses to a default user
-- (Run this ONLY if you have existing data and want to preserve it)
-- Replace 'your-user-id-here' with an actual user ID from auth.users table

-- First, create a default admin user if needed:
-- You can do this through the Supabase Auth interface or:
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
-- VALUES (gen_random_uuid(), 'admin@example.com', crypt('your-password', gen_salt('bf')), now(), now(), now());

-- Then assign existing addresses to that user:
-- UPDATE addresses 
-- SET user_id = 'your-user-id-here' 
-- WHERE user_id IS NULL;

-- 7. Make user_id NOT NULL after migration (optional, for data integrity)
-- ALTER TABLE addresses ALTER COLUMN user_id SET NOT NULL;
