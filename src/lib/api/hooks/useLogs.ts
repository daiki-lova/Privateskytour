'use client';

import useSWR from 'swr';
import type { AuditLog } from '@/lib/data/types';
import type { PaginatedApiResponse } from '../response';
import { paginatedFetcher } from '../client';

interface UseLogsParams {
  page?: number;
  pageSize?: number;
  action?: string;
  startDate?: string;
  endDate?: string;
}

export function useLogs(params: UseLogsParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params.action) searchParams.set('action', params.action);
  if (params.startDate) searchParams.set('startDate', params.startDate);
  if (params.endDate) searchParams.set('endDate', params.endDate);

  const queryString = searchParams.toString();
  const url = `/api/admin/logs${queryString ? `?${queryString}` : ''}`;

  return useSWR<PaginatedApiResponse<AuditLog>>(url, paginatedFetcher, {
    revalidateOnFocus: true,
  });
}
