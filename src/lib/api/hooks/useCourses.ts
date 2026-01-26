'use client';

import useSWR from 'swr';
import { fetcher } from '../client';
import type { Course } from '@/lib/data/types';
import type { ApiSuccessResponse } from '../response';

export function useCourses() {
  return useSWR<ApiSuccessResponse<Course[]>>(
    '/api/admin/courses',
    (url) => fetch(url, { credentials: 'include' }).then(r => r.json()),
    { revalidateOnFocus: false }
  );
}

export function useCourse(id: string | null) {
  return useSWR<Course>(
    id ? `/api/admin/courses/${id}` : null,
    (url: string) => fetcher<Course>(url)
  );
}
