'use client';

import useSWR, { SWRConfiguration } from 'swr';
import type { Slot } from '@/lib/data/types';
import type { ApiSuccessResponse } from '../response';

interface UseSlotsParams {
  startDate?: string;
  endDate?: string;
  heliportId?: string;
  courseId?: string;
}

export function useSlots(
  params: UseSlotsParams = {},
  options: SWRConfiguration<ApiSuccessResponse<Slot[]>> = {}
) {
  const searchParams = new URLSearchParams();
  if (params.startDate) searchParams.set('startDate', params.startDate);
  if (params.endDate) searchParams.set('endDate', params.endDate);
  if (params.heliportId) searchParams.set('heliportId', params.heliportId);
  if (params.courseId) searchParams.set('courseId', params.courseId);

  const queryString = searchParams.toString();
  const url = `/api/admin/slots${queryString ? `?${queryString}` : ''}`;

  return useSWR<ApiSuccessResponse<Slot[]>>(
    url,
    (url) => fetch(url, { credentials: 'include' }).then(r => r.json()),
    { revalidateOnFocus: false, ...options }
  );
}

export function useSlot(id: string | null) {
  return useSWR<ApiSuccessResponse<Slot>>(
    id ? `/api/admin/slots/${id}` : null,
    (url: string) => fetch(url, { credentials: 'include' }).then(r => r.json())
  );
}
