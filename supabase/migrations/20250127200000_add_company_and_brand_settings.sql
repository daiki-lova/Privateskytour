-- ============================================================
-- 会社情報・ブランド設定のデータベース化
-- ハードコードされた値をsystem_settingsテーブルに移行
-- ============================================================

-- 公開ページからも会社情報を読み取れるようにRLSポリシーを追加
CREATE POLICY "Public can read company and brand settings" ON system_settings
  FOR SELECT USING (
    key IN (
      'company_info',
      'brand_info',
      'contact_info',
      'business_hours_display',
      'cancellation_policy_display',
      'site_meta'
    )
  );

-- ============================================================
-- 会社情報
-- ============================================================
INSERT INTO system_settings (key, value, description) VALUES
(
  'company_info',
  '{
    "name_ja": "株式会社PrivateSky",
    "name_en": "PrivateSky Inc.",
    "name_zh": "PrivateSky株式会社",
    "representative": "中村 和真",
    "postal_code": "104-0061",
    "address_ja": "東京都中央区銀座1丁目15-4 銀座一丁目ビル 7階",
    "address_en": "Ginza 1-Chome Building 7F, 1-15-4 Ginza, Chuo-ku, Tokyo 104-0061, Japan",
    "address_zh": "东京都中央区银座1丁目15-4 银座一丁目大厦 7楼",
    "business_description_ja": "航空運送代理店業、上記に付帯関連するサービス提供",
    "business_description_en": "Aviation transportation agency, related services",
    "bank": "みずほ銀行"
  }'::jsonb,
  '会社情報'
)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- ============================================================
-- ブランド情報
-- ============================================================
INSERT INTO system_settings (key, value, description) VALUES
(
  'brand_info',
  '{
    "service_name": "PRIVATESKY TOUR",
    "service_name_short": "PrivateSky",
    "tagline_ja": "上質な空の旅を、あなたに。",
    "tagline_en": "Premium Sky Experience, Just for You.",
    "tagline_zh": "为您提供优质的空中之旅。",
    "about_ja": "PRIVATESKY TOURは、プライベートヘリコプターで東京の空を楽しむ、上質な空の旅をお届けします。",
    "about_en": "PRIVATESKY TOUR offers premium private helicopter experiences over Tokyo skies.",
    "about_zh": "PRIVATESKY TOUR提供私人直升机体验，让您尽享东京上空的优质空中之旅。",
    "copyright_holder": "株式会社PrivateSky",
    "copyright_year_start": 2024
  }'::jsonb,
  'ブランド・サービス名情報'
)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- ============================================================
-- 連絡先情報
-- ============================================================
INSERT INTO system_settings (key, value, description) VALUES
(
  'contact_info',
  '{
    "phone": "03-4446-6125",
    "phone_display": "03-4446-6125",
    "email": "info@privatesky.co.jp",
    "emergency_phone": "090-XXXX-XXXX",
    "emergency_hours": "フライト当日のみ"
  }'::jsonb,
  '連絡先情報'
)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- ============================================================
-- 営業時間表示用（オフィス営業時間）
-- ============================================================
INSERT INTO system_settings (key, value, description) VALUES
(
  'business_hours_display',
  '{
    "weekday_start": "10:00",
    "weekday_end": "18:00",
    "weekend_closed": true,
    "holiday_closed": true,
    "display_ja": "10:00 - 18:00（土日祝休み）",
    "display_en": "10:00 - 18:00 (Closed on weekends & holidays)",
    "display_zh": "10:00 - 18:00（周末及节假日休息）"
  }'::jsonb,
  'オフィス営業時間（表示用）'
)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- ============================================================
-- キャンセルポリシー表示用
-- ============================================================
INSERT INTO system_settings (key, value, description) VALUES
(
  'cancellation_policy_display',
  '{
    "tiers": [
      {"days_before_min": 7, "days_before_max": null, "fee_percentage": 0, "label_ja": "7日前まで", "label_en": "7+ days before"},
      {"days_before_min": 4, "days_before_max": 6, "fee_percentage": 30, "label_ja": "4〜6日前", "label_en": "4-6 days before"},
      {"days_before_min": 2, "days_before_max": 3, "fee_percentage": 50, "label_ja": "2〜3日前", "label_en": "2-3 days before"},
      {"days_before_min": 1, "days_before_max": 1, "fee_percentage": 80, "label_ja": "前日", "label_en": "Day before"},
      {"days_before_min": 0, "days_before_max": 0, "fee_percentage": 100, "label_ja": "当日", "label_en": "Same day"}
    ],
    "weather_cancel_refund": 100,
    "self_cancel_deadline_days": 7,
    "late_payment_fee_percentage": 14.6,
    "summary_ja": "7日前まで無料、4〜6日前30%、2〜3日前50%、前日80%、当日100%",
    "summary_en": "Free until 7 days before, 30% 4-6 days, 50% 2-3 days, 80% day before, 100% same day"
  }'::jsonb,
  'キャンセルポリシー表示用設定'
)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- ============================================================
-- サイトメタ情報
-- ============================================================
INSERT INTO system_settings (key, value, description) VALUES
(
  'site_meta',
  '{
    "title_ja": "PRIVATESKY TOUR | プライベートヘリコプター遊覧",
    "title_en": "PRIVATESKY TOUR | Private Helicopter Tours",
    "title_zh": "PRIVATESKY TOUR | 私人直升机观光",
    "description_ja": "東京の空をプライベートヘリコプターで楽しむ、上質な遊覧体験。",
    "description_en": "Premium private helicopter tour experience over Tokyo.",
    "description_zh": "在东京上空享受私人直升机的优质观光体验。",
    "og_image": "/images/og-default.jpg",
    "twitter_handle": "@privatesky_tour"
  }'::jsonb,
  'サイトメタ情報（SEO用）'
)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- ============================================================
-- フライト運行時間帯（管理画面で設定変更可能）
-- ============================================================
INSERT INTO system_settings (key, value, description) VALUES
(
  'flight_hours',
  '{
    "start": "09:00",
    "end": "19:00",
    "interval_minutes": 30,
    "default_slots": ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00"]
  }'::jsonb,
  'フライト運行時間帯'
)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- ============================================================
-- 重複するbusiness_hoursを更新（既存のものを拡張）
-- ============================================================
UPDATE system_settings
SET value = '{
  "start": "09:00",
  "end": "19:00",
  "interval_minutes": 30,
  "office_start": "10:00",
  "office_end": "18:00"
}'::jsonb,
updated_at = NOW()
WHERE key = 'business_hours';
