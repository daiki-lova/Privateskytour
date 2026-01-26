-- ============================================================
-- PRIVATESKY TOUR Seed Data
-- Helicopter tour booking system test data
-- ============================================================

-- ============================================================
-- 1. ADMIN USER
-- ============================================================

-- Create admin user in auth.users
-- Note: In Supabase, we need to use specific approach for auth.users
-- The password 'admin123' is hashed using Supabase's default method

-- First, insert into auth.users (Supabase auth table)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'admin@privatesky.jp',
  -- Password: admin123 (bcrypt hash)
  crypt('admin123', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "管理者"}',
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Insert admin user identity
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '{"sub": "00000000-0000-0000-0000-000000000001", "email": "admin@privatesky.jp"}',
  'email',
  '00000000-0000-0000-0000-000000000001',
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id, provider) DO NOTHING;

-- Insert into public.admin_users table
INSERT INTO admin_users (
  id,
  email,
  name,
  role,
  is_active
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@privatesky.jp',
  '管理者',
  'admin',
  true
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. HELIPORT DATA
-- ============================================================

-- Delete existing heliport if exists (from migration initial data)
DELETE FROM heliports WHERE name = '東京ヘリポート';

-- Insert Tokyo Heliport with specific UUID for foreign key references
INSERT INTO heliports (
  id,
  name,
  name_en,
  name_zh,
  postal_code,
  address,
  address_en,
  address_zh,
  access_rail,
  access_taxi,
  access_car,
  google_map_url,
  image_url,
  latitude,
  longitude,
  is_active
) VALUES (
  '10000000-0000-0000-0000-000000000001',
  '東京ヘリポート',
  'Tokyo Heliport',
  '东京直升机场',
  '136-0082',
  '東京都江東区新木場4-7-28',
  '4-7-28 Shinkiba, Koto-ku, Tokyo 136-0082',
  '东京都江东区新木场4-7-28',
  'JR京葉線・東京メトロ有楽町線・りんかい線「新木場駅」よりタクシー約5分',
  '新木場駅より約5分（約1,000円）',
  '首都高速湾岸線「新木場IC」より約3分。駐車場完備。',
  'https://maps.google.com/?q=35.6329,139.8344',
  '/images/heliports/tokyo-heliport.jpg',
  35.632900,
  139.834400,
  true
);

-- ============================================================
-- 3. COURSE DATA (6 courses)
-- ============================================================

-- Course 1: Standard Tour (15 min)
INSERT INTO courses (
  id,
  heliport_id,
  title,
  title_en,
  title_zh,
  subtitle,
  subtitle_en,
  subtitle_zh,
  description,
  description_en,
  description_zh,
  course_type,
  duration_minutes,
  price,
  max_pax,
  min_pax,
  tags,
  highlights,
  is_active,
  display_order
) VALUES (
  '20000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'スタンダードツアー',
  'Standard Tour',
  '标准之旅',
  '東京の絶景を15分で満喫',
  'Enjoy Tokyo scenery in 15 minutes',
  '15分钟尽享东京美景',
  '東京湾からレインボーブリッジ、東京タワーを一望できるスタンダードコース。初めてのヘリコプター体験に最適です。離陸から着陸まで、東京の象徴的なランドマークを空から楽しめます。',
  'Standard course overlooking Rainbow Bridge and Tokyo Tower from Tokyo Bay. Perfect for first-time helicopter experience. Enjoy iconic Tokyo landmarks from the sky from takeoff to landing.',
  '从东京湾俯瞰彩虹桥和东京塔的标准路线。非常适合首次直升机体验。从起飞到降落，从空中欣赏东京的标志性地标。',
  'standard',
  15,
  35000,
  3,
  1,
  ARRAY['人気', '初心者向け', '東京湾'],
  ARRAY['レインボーブリッジの絶景', '東京タワーを空から鑑賞', '東京湾のパノラマビュー'],
  true,
  1
);

-- Course 2: Premium Tour (30 min)
INSERT INTO courses (
  id,
  heliport_id,
  title,
  title_en,
  title_zh,
  subtitle,
  subtitle_en,
  subtitle_zh,
  description,
  description_en,
  description_zh,
  course_type,
  duration_minutes,
  price,
  max_pax,
  min_pax,
  tags,
  highlights,
  is_active,
  display_order
) VALUES (
  '20000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000001',
  'プレミアムツアー',
  'Premium Tour',
  '豪华之旅',
  '東京の名所を30分でじっくり堪能',
  'Thoroughly enjoy Tokyo attractions in 30 minutes',
  '30分钟尽情欣赏东京名胜',
  '東京スカイツリー、浅草、皇居、新宿など東京の主要スポットを網羅するプレミアムコース。ゆったりとした飛行時間で、東京の魅力を存分にお楽しみいただけます。記念日やプロポーズにも最適です。',
  'Premium course covering major Tokyo spots including Tokyo Skytree, Asakusa, Imperial Palace, and Shinjuku. Enjoy the charm of Tokyo with relaxed flight time. Perfect for anniversaries and proposals.',
  '涵盖东京晴空塔、浅草、皇居、新宿等东京主要景点的豪华路线。在悠闲的飞行时间中尽情享受东京的魅力。非常适合纪念日和求婚。',
  'premium',
  30,
  65000,
  3,
  1,
  ARRAY['おすすめ', '記念日', 'スカイツリー'],
  ARRAY['東京スカイツリーを間近に', '皇居上空を飛行', '新宿の高層ビル群'],
  true,
  2
);

-- Course 3: Sunset Tour (20 min)
INSERT INTO courses (
  id,
  heliport_id,
  title,
  title_en,
  title_zh,
  subtitle,
  subtitle_en,
  subtitle_zh,
  description,
  description_en,
  description_zh,
  course_type,
  duration_minutes,
  price,
  max_pax,
  min_pax,
  tags,
  highlights,
  is_active,
  display_order
) VALUES (
  '20000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000001',
  'サンセットツアー',
  'Sunset Tour',
  '日落之旅',
  '夕暮れの東京を空から眺める特別体験',
  'Special experience viewing Tokyo at sunset from the sky',
  '从空中欣赏东京日落的特别体验',
  '日没前後の時間帯限定のスペシャルツアー。オレンジ色に染まる東京湾と、徐々に灯りが灯り始める街並みのコントラストは息をのむ美しさ。ロマンチックなひとときをお過ごしください。',
  'Special tour limited to the time around sunset. The contrast between Tokyo Bay dyed orange and the cityscape gradually lighting up is breathtaking. Spend a romantic moment.',
  '仅限日落前后时段的特别之旅。被染成橙色的东京湾与逐渐亮起灯光的街景形成的对比美得令人窒息。度过浪漫的时光。',
  'premium',
  20,
  55000,
  3,
  1,
  ARRAY['限定', 'ロマンチック', '夕暮れ'],
  ARRAY['夕日に染まる東京湾', '黄昏時の絶景', 'ロマンチックな雰囲気'],
  true,
  3
);

-- Course 4: Night Tour (25 min)
INSERT INTO courses (
  id,
  heliport_id,
  title,
  title_en,
  title_zh,
  subtitle,
  subtitle_en,
  subtitle_zh,
  description,
  description_en,
  description_zh,
  course_type,
  duration_minutes,
  price,
  max_pax,
  min_pax,
  tags,
  highlights,
  is_active,
  display_order
) VALUES (
  '20000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000001',
  'ナイトツアー',
  'Night Tour',
  '夜景之旅',
  '煌めく東京の夜景を独り占め',
  'Have the glittering Tokyo night view all to yourself',
  '独享闪耀的东京夜景',
  '宝石をちりばめたような東京の夜景を空から楽しむナイトフライト。東京タワー、レインボーブリッジのライトアップ、ビル群の灯りが織りなす光の海は、地上からは見られない特別な景色です。',
  'Night flight to enjoy Tokyo night view from the sky like scattered jewels. The sea of lights created by Tokyo Tower, Rainbow Bridge illumination, and building lights is a special view not seen from the ground.',
  '从空中欣赏如宝石般闪耀的东京夜景。东京塔、彩虹桥的灯光以及楼群的灯火交织而成的光之海，是从地面无法看到的特别景色。',
  'premium',
  25,
  75000,
  3,
  1,
  ARRAY['夜景', 'カップル', '特別'],
  ARRAY['東京タワーのライトアップ', 'レインボーブリッジの夜景', '光の海を空から眺望'],
  true,
  4
);

-- Course 5: Charter Basic (30 min)
INSERT INTO courses (
  id,
  heliport_id,
  title,
  title_en,
  title_zh,
  subtitle,
  subtitle_en,
  subtitle_zh,
  description,
  description_en,
  description_zh,
  course_type,
  duration_minutes,
  price,
  max_pax,
  min_pax,
  tags,
  highlights,
  is_active,
  display_order
) VALUES (
  '20000000-0000-0000-0000-000000000005',
  '10000000-0000-0000-0000-000000000001',
  'チャーターベーシック',
  'Charter Basic',
  '基础包机',
  'プライベートフライトで特別なひとときを',
  'Special moments with private flight',
  '私人飞行中的特别时光',
  '貸切ヘリコプターで、ご希望のルートをご案内。誕生日、プロポーズ、企業イベントなど、特別な日を空の上で過ごしませんか。コース内容はご要望に応じてカスタマイズ可能です。',
  'Private helicopter tour on your desired route. Why not spend special days like birthdays, proposals, and corporate events in the sky? Course content can be customized according to your requests.',
  '乘坐包机直升机，按照您希望的路线游览。生日、求婚、企业活动等特别的日子，何不在天空中度过？路线内容可根据您的要求定制。',
  'charter',
  30,
  150000,
  5,
  1,
  ARRAY['貸切', 'カスタマイズ', 'プライベート'],
  ARRAY['完全プライベート空間', 'ルートカスタマイズ可能', '専属パイロット'],
  true,
  5
);

-- Course 6: Charter Premium (60 min)
INSERT INTO courses (
  id,
  heliport_id,
  title,
  title_en,
  title_zh,
  subtitle,
  subtitle_en,
  subtitle_zh,
  description,
  description_en,
  description_zh,
  course_type,
  duration_minutes,
  price,
  max_pax,
  min_pax,
  tags,
  highlights,
  is_active,
  display_order
) VALUES (
  '20000000-0000-0000-0000-000000000006',
  '10000000-0000-0000-0000-000000000001',
  'チャータープレミアム',
  'Charter Premium',
  '豪华包机',
  '究極のプライベートフライト体験',
  'Ultimate private flight experience',
  '终极私人飞行体验',
  '60分間のロングフライトで、東京から富士山、横浜まで足を伸ばすことも可能。シャンパンサービス付きで、最高級のおもてなしをご提供します。VIPのお客様、海外からのゲストにも好評です。',
  '60-minute long flight allows you to extend to Mt. Fuji and Yokohama from Tokyo. Champagne service included for the finest hospitality. Popular with VIP customers and overseas guests.',
  '60分钟的长途飞行，可以从东京延伸到富士山和横滨。附带香槟服务，提供最高级的款待。深受VIP客户和海外宾客好评。',
  'charter',
  60,
  350000,
  5,
  1,
  ARRAY['VIP', '富士山', 'シャンパン'],
  ARRAY['富士山遊覧可能', 'シャンパンサービス付き', 'VIPおもてなし'],
  true,
  6
);

-- ============================================================
-- 4. SLOT GENERATION (90 days)
-- ============================================================

-- Generate slots for all courses for the next 90 days
-- Time slots: 09:00, 10:00, 11:00, 14:00, 15:00, 16:00
-- Capacity: 4 per slot

DO $$
DECLARE
  course_record RECORD;
  current_date_val DATE;
  end_date_val DATE;
  time_slots TIME[] := ARRAY['09:00:00', '10:00:00', '11:00:00', '14:00:00', '15:00:00', '16:00:00']::TIME[];
  slot_time_val TIME;
BEGIN
  current_date_val := CURRENT_DATE;
  end_date_val := CURRENT_DATE + INTERVAL '90 days';

  -- Loop through each course
  FOR course_record IN SELECT id FROM courses WHERE is_active = true LOOP
    -- Loop through each date
    WHILE current_date_val <= end_date_val LOOP
      -- Loop through each time slot
      FOREACH slot_time_val IN ARRAY time_slots LOOP
        INSERT INTO slots (
          course_id,
          slot_date,
          slot_time,
          max_pax,
          current_pax,
          status
        ) VALUES (
          course_record.id,
          current_date_val,
          slot_time_val,
          4,
          0,
          'open'
        ) ON CONFLICT (course_id, slot_date, slot_time) DO NOTHING;
      END LOOP;

      current_date_val := current_date_val + INTERVAL '1 day';
    END LOOP;

    -- Reset date for next course
    current_date_val := CURRENT_DATE;
  END LOOP;
END $$;

-- ============================================================
-- 5. SAMPLE CUSTOMERS (for testing)
-- ============================================================

INSERT INTO customers (
  id,
  email,
  name,
  name_kana,
  phone,
  preferred_lang,
  notes
) VALUES
(
  '30000000-0000-0000-0000-000000000001',
  'yamada@example.com',
  '山田 太郎',
  'ヤマダ タロウ',
  '090-1234-5678',
  'ja',
  'VIP顧客'
),
(
  '30000000-0000-0000-0000-000000000002',
  'john@example.com',
  'John Smith',
  NULL,
  '+1-555-1234',
  'en',
  'International guest'
),
(
  '30000000-0000-0000-0000-000000000003',
  'tanaka@example.com',
  '田中 花子',
  'タナカ ハナコ',
  '080-9876-5432',
  'ja',
  NULL
)
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- Summary
-- ============================================================
-- Created:
-- - 1 Admin user (admin@privatesky.jp / admin123)
-- - 1 Heliport (Tokyo Heliport)
-- - 6 Courses:
--   1. Standard Tour (15min, 35,000 JPY)
--   2. Premium Tour (30min, 65,000 JPY)
--   3. Sunset Tour (20min, 55,000 JPY)
--   4. Night Tour (25min, 75,000 JPY)
--   5. Charter Basic (30min, 150,000 JPY)
--   6. Charter Premium (60min, 350,000 JPY)
-- - Slots for 90 days (6 time slots per day per course)
-- - 3 Sample customers
