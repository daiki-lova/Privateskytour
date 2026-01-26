import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, HttpStatus } from '@/lib/api/response';
import type { Slot, SlotStatus, Course, CourseType, FlightScheduleItem } from '@/lib/data/types';

/**
 * Convert database row to Slot type
 */
function toSlot(row: Record<string, unknown>): Slot {
  const maxPax = row.max_pax as number;
  const currentPax = row.current_pax as number;
  const slotDate = row.slot_date as string;
  const slotTime = row.slot_time as string;

  return {
    id: row.id as string,
    courseId: row.course_id as string | undefined,
    slotDate,
    slotTime,
    maxPax,
    currentPax,
    status: row.status as SlotStatus,
    suspendedReason: row.suspended_reason as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    availablePax: maxPax - currentPax,
    // Legacy aliases for backward compatibility
    date: slotDate,
    time: slotTime,
    reason: row.suspended_reason as string | undefined,
  };
}

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
  };
}

/**
 * GET /api/public/slots/available
 * Check available slots for a date/course
 *
 * Query params:
 * - date: Date to check (required, format: YYYY-MM-DD)
 * - courseId: Course ID to filter by (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const courseId = searchParams.get('courseId');

    // Validate required date param
    if (!date) {
      return errorResponse('Date parameter is required', HttpStatus.BAD_REQUEST);
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return errorResponse('Invalid date format. Use YYYY-MM-DD', HttpStatus.BAD_REQUEST);
    }

    // Build query - only return open slots with available capacity
    let query = supabase
      .from('slots')
      .select('*, courses(*)')
      .eq('slot_date', date)
      .eq('status', 'open')
      .order('slot_time');

    // Filter by course if provided
    if (courseId) {
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(courseId)) {
        return errorResponse('Invalid courseId format', HttpStatus.BAD_REQUEST);
      }
      query = query.eq('course_id', courseId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching available slots:', error);
      return errorResponse('Failed to fetch available slots', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Filter slots that have available capacity and map to type
    const availableSlots = (data || [])
      .map((row) => {
        const slot = toSlot(row);
        if (row.courses) {
          slot.course = toCourse(row.courses as Record<string, unknown>);
        }
        return slot;
      })
      .filter((slot) => (slot.availablePax ?? 0) > 0);

    return successResponse(availableSlots);
  } catch (error) {
    console.error('Get available slots error:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
