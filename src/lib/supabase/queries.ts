import { createClient } from './server';
import type { Course, CourseCategory } from '@/lib/data/types';

// ============================================================
// Type Converters (snake_case to camelCase)
// ============================================================

function toCourse(row: Record<string, unknown>): Course {
  return {
    id: row.id as string,
    heliportId: row.heliport_id as string | undefined,
    title: row.title as string,
    titleEn: row.title_en as string | undefined,
    titleZh: row.title_zh as string | undefined,
    subtitle: row.subtitle as string | undefined,
    subtitleEn: row.subtitle_en as string | undefined,
    subtitleZh: row.subtitle_zh as string | undefined,
    description: row.description as string | undefined,
    descriptionEn: row.description_en as string | undefined,
    descriptionZh: row.description_zh as string | undefined,
    courseType: row.course_type as Course['courseType'],
    durationMinutes: row.duration_minutes as number,
    price: row.price as number,
    maxPax: row.max_pax as number,
    minPax: row.min_pax as number,
    tags: row.tags as string[] | undefined,
    images: row.images as string[] | undefined,
    flightSchedule: row.flight_schedule as Course['flightSchedule'],
    highlights: row.highlights as string[] | undefined,
    isActive: row.is_active as boolean,
    displayOrder: row.display_order as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    // LP display fields
    category: row.category as CourseCategory | undefined,
    area: row.area as string | undefined,
    rating: row.rating as number | undefined,
    popular: row.popular as boolean | undefined,
    routeMapUrl: row.route_map_url as string | undefined,
    returnPrice: row.return_price as number | undefined,
  };
}

// ============================================================
// Public Course Queries (for Server Components)
// ============================================================

/**
 * Get all active courses for public display
 * Used in Server Components (no "use client")
 */
export async function getPublicCourses(): Promise<Course[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  if (error) {
    console.error('Error fetching public courses:', error);
    return [];
  }

  return (data || []).map(toCourse);
}

/**
 * Get a single course by ID for public display
 * Used in Server Components
 */
export async function getPublicCourseById(id: string): Promise<Course | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching course:', error);
    return null;
  }

  return toCourse(data);
}

/**
 * Get courses by category for public display
 * Used in Server Components
 */
export async function getPublicCoursesByCategory(category: CourseCategory): Promise<Course[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('is_active', true)
    .eq('category', category)
    .order('display_order');

  if (error) {
    console.error('Error fetching courses by category:', error);
    return [];
  }

  return (data || []).map(toCourse);
}
