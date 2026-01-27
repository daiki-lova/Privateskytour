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

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/public/courses/[id]
 * Get a single active course by ID for public display
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return errorResponse('Invalid course ID format', HttpStatus.BAD_REQUEST);
    }

    const supabase = await createClient();

    // Fetch course with heliport, only if active
    const { data, error } = await supabase
      .from('courses')
      .select('*, heliports(*)')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      // PGRST116 means no rows returned
      if (error.code === 'PGRST116') {
        return errorResponse('Course not found', HttpStatus.NOT_FOUND);
      }
      console.error('Error fetching course:', error);
      return errorResponse('Failed to fetch course', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (!data) {
      return errorResponse('Course not found', HttpStatus.NOT_FOUND);
    }

    const course = toCourse(data);
    if (data.heliports) {
      course.heliport = toHeliport(data.heliports as Record<string, unknown>);
    }

    return successResponse(course);
  } catch (error) {
    console.error('Get public course error:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
