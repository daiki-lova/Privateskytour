-- Migration: Add name_romaji column to passengers table
-- This allows storing passenger names in romaji (Latin alphabet) for flight manifests

ALTER TABLE passengers
ADD COLUMN name_romaji TEXT;

-- Add comment for documentation
COMMENT ON COLUMN passengers.name_romaji IS 'Passenger name in romaji (Latin alphabet), e.g., YAMADA TARO';
