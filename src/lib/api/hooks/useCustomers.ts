'use client';

import useSWR from 'swr';
import { paginatedFetcher, fetcher } from '../client';
import type { Customer } from '@/lib/data/types';
import type { PaginatedApiResponse } from '../response';

interface UseCustomersParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export function useCustomers(params: UseCustomersParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params.search) searchParams.set('search', params.search);

  const queryString = searchParams.toString();
  const url = `/api/admin/customers${queryString ? `?${queryString}` : ''}`;

  return useSWR<PaginatedApiResponse<Customer>>(url, paginatedFetcher, {
    revalidateOnFocus: true,
  });
}

export function useCustomer(id: string | null) {
  return useSWR<Customer>(
    id ? `/api/admin/customers/${id}` : null,
    (url: string) => fetcher<Customer>(url)
  );
}
