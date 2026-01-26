'use client';

import useSWR from 'swr';
import type { Heliport } from '@/lib/data/types';
import type { ApiSuccessResponse } from '../response';

export function useHeliports() {
  return useSWR<ApiSuccessResponse<Heliport[]>>(
    '/api/admin/heliports',
    (url) => fetch(url, { credentials: 'include' }).then(r => r.json()),
    { revalidateOnFocus: false }
  );
}
