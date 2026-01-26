// src/lib/api/client.ts
import type { ApiSuccessResponse, ApiErrorResponse, PaginatedApiResponse } from './response';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = await response.json();

  if (!response.ok || data.success === false) {
    const errorData = data as ApiErrorResponse;
    throw new ApiError(
      response.status,
      errorData.error || 'Request failed',
      undefined
    );
  }

  return data;
}

// SWR fetcher
export const fetcher = <T>(url: string) =>
  apiFetch<ApiSuccessResponse<T>>(url).then((res) => res.data);

// Paginated fetcher
export const paginatedFetcher = <T>(url: string) =>
  apiFetch<PaginatedApiResponse<T>>(url);

// Mutation helpers
export async function apiPost<T, R = T>(url: string, data: T): Promise<R> {
  const response = await apiFetch<ApiSuccessResponse<R>>(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function apiPut<T, R = T>(url: string, data: T): Promise<R> {
  const response = await apiFetch<ApiSuccessResponse<R>>(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function apiPatch<T, R = T>(url: string, data: T): Promise<R> {
  const response = await apiFetch<ApiSuccessResponse<R>>(url, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function apiDelete(url: string): Promise<void> {
  await apiFetch<ApiSuccessResponse<null>>(url, {
    method: 'DELETE',
  });
}
