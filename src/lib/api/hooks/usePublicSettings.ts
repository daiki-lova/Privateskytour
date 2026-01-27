import useSWR from 'swr';
import type { PublicSettings } from '@/app/api/public/settings/route';

const fetcher = async (url: string): Promise<PublicSettings> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch settings');
  }
  const json = await res.json();
  return json.data ?? {};
};

/**
 * 公開設定を取得するフック
 *
 * @param keys 取得したい設定キーの配列（省略時は全て）
 * @returns { data, error, isLoading }
 *
 * @example
 * // 会社情報とブランド情報のみ取得
 * const { data } = usePublicSettings(['company_info', 'brand_info']);
 *
 * // 全設定を取得
 * const { data } = usePublicSettings();
 */
export function usePublicSettings(keys?: string[]) {
  const queryString = keys?.length ? `?keys=${keys.join(',')}` : '';
  const url = `/api/public/settings${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<PublicSettings>(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1分間はキャッシュを使用
  });

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

/**
 * 特定の設定キーのみ取得するユーティリティフック
 */
export function useCompanyInfo() {
  const { data, ...rest } = usePublicSettings(['company_info']);
  return { data: data?.company_info, ...rest };
}

export function useBrandInfo() {
  const { data, ...rest } = usePublicSettings(['brand_info']);
  return { data: data?.brand_info, ...rest };
}

export function useContactInfo() {
  const { data, ...rest } = usePublicSettings(['contact_info']);
  return { data: data?.contact_info, ...rest };
}

export function useSiteMeta() {
  const { data, ...rest } = usePublicSettings(['site_meta']);
  return { data: data?.site_meta, ...rest };
}

export function useCancellationPolicyDisplay() {
  const { data, ...rest } = usePublicSettings(['cancellation_policy_display']);
  return { data: data?.cancellation_policy_display, ...rest };
}

export function useBusinessHoursDisplay() {
  const { data, ...rest } = usePublicSettings(['business_hours_display']);
  return { data: data?.business_hours_display, ...rest };
}
