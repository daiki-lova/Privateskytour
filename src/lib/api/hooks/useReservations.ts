'use client';

import useSWR from 'swr';
import { fetcher, paginatedFetcher } from '../client';
import type { Reservation } from '@/lib/data/types';
import type { PaginatedApiResponse } from '../response';

interface UseReservationsParams {
  page?: number;
  pageSize?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export function useReservations(params: UseReservationsParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params.status && params.status !== 'all') searchParams.set('status', params.status);
  if (params.startDate) searchParams.set('startDate', params.startDate);
  if (params.endDate) searchParams.set('endDate', params.endDate);

  const queryString = searchParams.toString();
  const url = `/api/admin/reservations${queryString ? `?${queryString}` : ''}`;

  return useSWR<PaginatedApiResponse<Reservation>>(url, paginatedFetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 10000, // 10秒間の重複リクエスト防止
  });
}

export function useReservation(id: string | null) {
  return useSWR<Reservation>(
    id ? `/api/admin/reservations/${id}` : null,
    (url: string) => fetcher<Reservation>(url)
  );
}
