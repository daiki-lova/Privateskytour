import { apiPost, apiPut, apiDelete } from '../client';
import type { Course } from '@/lib/data/types';

export interface CreateCourseInput {
  name: string;
  description?: string;
  durationMinutes: number;
  basePrice: number;
  maxPassengers: number;
  heliportId: string;
  isActive?: boolean;
}

export interface UpdateCourseInput {
  name?: string;
  description?: string;
  durationMinutes?: number;
  basePrice?: number;
  maxPassengers?: number;
  isActive?: boolean;
}

export async function createCourse(data: CreateCourseInput): Promise<Course> {
  return apiPost<CreateCourseInput, Course>('/api/admin/courses', data);
}

export async function updateCourse(id: string, data: UpdateCourseInput): Promise<Course> {
  return apiPut<UpdateCourseInput, Course>(`/api/admin/courses/${id}`, data);
}

export async function deleteCourse(id: string): Promise<void> {
  return apiDelete(`/api/admin/courses/${id}`);
}
