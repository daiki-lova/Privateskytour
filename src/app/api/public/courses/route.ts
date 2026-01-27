import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, HttpStatus } from '@/lib/api/response';
import type { Course, CourseType, FlightScheduleItem, Heliport } from '@/lib/data/types';

/**
 * Convert database row to Course type
 */
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
    courseType: row.course_type as CourseType,
    durationMinutes: row.duration_minutes as number,
    price: row.price as number,
    maxPax: row.max_pax as number,
    minPax: row.min_pax as number,
    tags: row.tags as string[] | undefined,
    images: row.images as string[] | undefined,
    flightSchedule: row.flight_schedule as FlightScheduleItem[] | undefined,
    highlights: row.highlights as string[] | undefined,
    isActive: row.is_active as boolean,
    displayOrder: row.display_order as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    // LP表示用フィールド
    category: row.category as 'sightseeing' | 'transfer' | undefined,
    area: row.area as string | undefined,
    rating: row.rating as number | undefined,
    popular: row.popular as boolean | undefined,
    routeMapUrl: row.route_map_url as string | undefined,
    returnPrice: row.return_price as number | undefined,
  };
}

/**
 * Convert database row to Heliport type
 */
function toHeliport(row: Record<string, unknown>): Heliport {
  return {
    id: row.id as string,
    name: row.name as string,
    nameEn: row.name_en as string | undefined,
    nameZh: row.name_zh as string | undefined,
    postalCode: row.postal_code as string | undefined,
    address: row.address as string,
    addressEn: row.address_en as string | undefined,
    addressZh: row.address_zh as string | undefined,
    accessRail: row.access_rail as string | undefined,
    accessTaxi: row.access_taxi as string | undefined,
    accessCar: row.access_car as string | undefined,
    googleMapUrl: row.google_map_url as string | undefined,
    imageUrl: row.image_url as string | undefined,
    latitude: row.latitude as number | undefined,
    longitude: row.longitude as number | undefined,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/**
 * GET /api/public/courses
 * List active courses for public display
 *
 * Query params:
 * - heliport_id: Filter by heliport ID (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const heliportId = searchParams.get('heliport_id');

    // Build query - only return active courses
    let query = supabase
      .from('courses')
      .select('*, heliports(*)')
      .eq('is_active', true)
      .order('display_order');

    // Filter by heliport if provided
    if (heliportId) {
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(heliportId)) {
        query = query.eq('heliport_id', heliportId);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching courses:', error.message, error.code, error.details);
      return errorResponse(`Failed to fetch courses: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const courses = (data || []).map((row) => {
      const course = toCourse(row);
      if (row.heliports) {
        course.heliport = toHeliport(row.heliports as Record<string, unknown>);
      }
      return course;
    });

    return successResponse(courses);
  } catch (error) {
    console.error('Get public courses error:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
