-- ============================================================
-- Add LP (Landing Page) display fields to courses table
-- ============================================================

-- Add new columns for LP display
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS category TEXT CHECK (category IN ('sightseeing', 'transfer')),
  ADD COLUMN IF NOT EXISTS area TEXT,
  ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1) DEFAULT 5.0 CHECK (rating >= 0.0 AND rating <= 5.0),
  ADD COLUMN IF NOT EXISTS popular BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS route_map_url TEXT,
  ADD COLUMN IF NOT EXISTS return_price INTEGER;

-- Create index for category filtering on LP
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);

-- Create index for popular courses filtering
CREATE INDEX IF NOT EXISTS idx_courses_popular ON courses(popular) WHERE popular = true;

-- Create index for area filtering
CREATE INDEX IF NOT EXISTS idx_courses_area ON courses(area);

-- ============================================================
-- Update existing data based on tags
-- ============================================================

-- Set category based on tags
-- If tags contain 'transfer' related keywords, set as 'transfer', otherwise 'sightseeing'
UPDATE courses
SET category = CASE
  WHEN tags && ARRAY['送迎', 'transfer', 'トランスファー', 'エアポート', 'airport'] THEN 'transfer'
  ELSE 'sightseeing'
END
WHERE category IS NULL;

-- Set area based on tags
-- Extract area information from tags
UPDATE courses
SET area = CASE
  WHEN tags && ARRAY['東京', 'tokyo', 'Tokyo'] THEN '東京'
  WHEN tags && ARRAY['横浜', 'yokohama', 'Yokohama'] THEN '横浜'
  WHEN tags && ARRAY['湘南', 'shonan', 'Shonan'] THEN '湘南'
  WHEN tags && ARRAY['富士山', 'fuji', 'Fuji', 'Mt.Fuji'] THEN '富士山'
  WHEN tags && ARRAY['箱根', 'hakone', 'Hakone'] THEN '箱根'
  WHEN tags && ARRAY['鎌倉', 'kamakura', 'Kamakura'] THEN '鎌倉'
  WHEN tags && ARRAY['お台場', 'odaiba', 'Odaiba'] THEN 'お台場'
  WHEN tags && ARRAY['新宿', 'shinjuku', 'Shinjuku'] THEN '新宿'
  WHEN tags && ARRAY['渋谷', 'shibuya', 'Shibuya'] THEN '渋谷'
  WHEN tags && ARRAY['六本木', 'roppongi', 'Roppongi'] THEN '六本木'
  ELSE NULL
END
WHERE area IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN courses.category IS 'Course category: sightseeing (観光) or transfer (送迎)';
COMMENT ON COLUMN courses.area IS 'Main area/destination of the course';
COMMENT ON COLUMN courses.rating IS 'Course rating (0.0-5.0)';
COMMENT ON COLUMN courses.popular IS 'Whether this course is featured as popular';
COMMENT ON COLUMN courses.route_map_url IS 'URL to the route map image';
COMMENT ON COLUMN courses.return_price IS 'Price for round-trip (if applicable)';
