import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, HttpStatus } from '@/lib/api/response';

/**
 * 公開設定を取得するAPI
 * RLSポリシーで許可された設定のみ取得可能
 */

export type PublicSettings = {
  company_info?: {
    name_ja: string;
    name_en: string;
    name_zh: string;
    representative: string;
    postal_code: string;
    address_ja: string;
    address_en: string;
    address_zh: string;
    business_description_ja: string;
    business_description_en: string;
    bank: string;
  };
  brand_info?: {
    service_name: string;
    service_name_short: string;
    tagline_ja: string;
    tagline_en: string;
    tagline_zh: string;
    about_ja: string;
    about_en: string;
    about_zh: string;
    copyright_holder: string;
    copyright_year_start: number;
  };
  contact_info?: {
    phone: string;
    phone_display: string;
    email: string;
    emergency_phone: string;
    emergency_hours: string;
  };
  business_hours_display?: {
    weekday_start: string;
    weekday_end: string;
    weekend_closed: boolean;
    holiday_closed: boolean;
    display_ja: string;
    display_en: string;
    display_zh: string;
  };
  cancellation_policy_display?: {
    tiers: Array<{
      days_before_min: number;
      days_before_max: number | null;
      fee_percentage: number;
      label_ja: string;
      label_en: string;
    }>;
    weather_cancel_refund: number;
    self_cancel_deadline_days: number;
    late_payment_fee_percentage: number;
    summary_ja: string;
    summary_en: string;
  };
  site_meta?: {
    title_ja: string;
    title_en: string;
    title_zh: string;
    description_ja: string;
    description_en: string;
    description_zh: string;
    og_image: string;
    twitter_handle: string;
  };
};

const PUBLIC_SETTING_KEYS = [
  'company_info',
  'brand_info',
  'contact_info',
  'business_hours_display',
  'cancellation_policy_display',
  'site_meta',
] as const;

/**
 * GET /api/public/settings
 *
 * Query Parameters:
 * - keys: カンマ区切りで取得したい設定キーを指定（省略時は全て取得）
 *   例: ?keys=company_info,brand_info
 *
 * Response:
 * - 200: { company_info: {...}, brand_info: {...}, ... }
 * - 500: Internal server error
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keysParam = searchParams.get('keys');

    // リクエストされたキーをフィルタ（指定がなければ全て）
    let requestedKeys: string[] = PUBLIC_SETTING_KEYS.slice();
    if (keysParam) {
      const requested = keysParam.split(',').map(k => k.trim());
      requestedKeys = requested.filter(k =>
        PUBLIC_SETTING_KEYS.includes(k as typeof PUBLIC_SETTING_KEYS[number])
      );
    }

    if (requestedKeys.length === 0) {
      return successResponse<PublicSettings>({});
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', requestedKeys);

    if (error) {
      console.error('Failed to fetch public settings:', error);
      return errorResponse('Failed to fetch settings', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // キーをオブジェクトのプロパティとして整形
    const settings: PublicSettings = {};
    for (const row of data ?? []) {
      (settings as Record<string, unknown>)[row.key] = row.value;
    }

    return successResponse<PublicSettings>(settings);
  } catch (error) {
    console.error('Public settings API error:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
