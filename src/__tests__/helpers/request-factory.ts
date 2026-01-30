// ============================================================
// NextRequest Factory - Helpers for creating test requests
// ============================================================

import { NextRequest } from 'next/server';

const BASE_URL = 'http://localhost:3000';

// ============================================================
// POST Request
// ============================================================

/**
 * Creates a POST NextRequest with a JSON body.
 *
 * Usage:
 * ```ts
 * const request = createPostRequest('/api/public/reservations', {
 *   courseId: '...',
 *   slotId: '...',
 * });
 * const response = await POST(request);
 * ```
 */
export function createPostRequest(
  path: string,
  body: Record<string, unknown>,
  headers?: Record<string, string>,
): NextRequest {
  return new NextRequest(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

// ============================================================
// GET Request
// ============================================================

/**
 * Creates a GET NextRequest with optional URL search parameters.
 *
 * Usage:
 * ```ts
 * const request = createGetRequest('/api/public/courses');
 *
 * const request = createGetRequest('/api/public/slots', {
 *   courseId: 'abc-123',
 *   date: '2024-06-15',
 * });
 *
 * const request = createGetRequest('/api/admin/reservations', undefined, {
 *   Authorization: 'Bearer token',
 * });
 * ```
 */
export function createGetRequest(
  path: string,
  searchParams?: Record<string, string>,
  headers?: Record<string, string>,
): NextRequest {
  const url = new URL(path, BASE_URL);

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, value);
    }
  }

  return new NextRequest(url.toString(), {
    method: 'GET',
    headers: headers ? new Headers(headers) : undefined,
  });
}
