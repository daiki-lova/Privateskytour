import { NextRequest } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { requireRole, AuthenticationError, AuthorizationError } from '@/lib/auth';
import { successResponse, errorResponse, HttpStatus } from '@/lib/api/response';

/**
 * POST /api/admin/slots/generate
 * Generate slots for a date range
 * Requires admin role
 *
 * Request body:
 * {
 *   startDate: string (YYYY-MM-DD),
 *   endDate: string (YYYY-MM-DD),
 *   courseId?: string,
 *   times: string[] (e.g., ["09:00", "10:30", "14:00"]),
 *   maxPax?: number (default: 4)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Require admin role
    await requireRole(supabase, ['admin']);

    // Use admin client for database operations (bypasses RLS)
    const adminClient = createAdminClient();

    // Parse request body
    const body = await request.json();
    const { startDate, endDate, courseId, times, maxPax = 4 } = body;

    // Validate required fields
    if (!startDate || !endDate) {
      return errorResponse('startDate and endDate are required', HttpStatus.BAD_REQUEST);
    }

    if (!times || !Array.isArray(times) || times.length === 0) {
      return errorResponse('times array is required and must not be empty', HttpStatus.BAD_REQUEST);
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return errorResponse('Dates must be in YYYY-MM-DD format', HttpStatus.BAD_REQUEST);
    }

    // Validate time format (HH:mm)
    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
    for (const time of times) {
      if (!timeRegex.test(time)) {
        return errorResponse(
          `Invalid time format: ${time}. Must be in HH:mm format (24-hour)`,
          HttpStatus.BAD_REQUEST
        );
      }
    }

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return errorResponse('Invalid date values', HttpStatus.BAD_REQUEST);
    }

    if (start > end) {
      return errorResponse('startDate must be before or equal to endDate', HttpStatus.BAD_REQUEST);
    }

    // Limit the range to prevent excessive slot generation (max 90 days)
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 90) {
      return errorResponse(
        'Date range cannot exceed 90 days',
        HttpStatus.BAD_REQUEST
      );
    }

    // Verify course exists if courseId provided
    if (courseId) {
      const { data: course, error: courseError } = await adminClient
        .from('courses')
        .select('id')
        .eq('id', courseId)
        .single();

      if (courseError || !course) {
        return errorResponse('Course not found', HttpStatus.NOT_FOUND);
      }
    }

    // Generate slots
    const slotsToInsert: {
      course_id: string | null;
      slot_date: string;
      slot_time: string;
      max_pax: number;
      current_pax: number;
      status: 'open';
    }[] = [];

    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0];

      for (const time of times) {
        slotsToInsert.push({
          course_id: courseId || null,
          slot_date: dateStr,
          slot_time: time,
          max_pax: maxPax,
          current_pax: 0,
          status: 'open',
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Check for existing slots to avoid duplicates
    const { data: existingSlots } = await adminClient
      .from('slots')
      .select('slot_date, slot_time, course_id')
      .gte('slot_date', startDate)
      .lte('slot_date', endDate)
      .eq('course_id', courseId || null);

    // Create a set of existing slot keys for fast lookup
    const existingKeys = new Set(
      (existingSlots || []).map(
        (s) => `${s.slot_date}|${s.slot_time}|${s.course_id}`
      )
    );

    // Filter out duplicates
    const newSlots = slotsToInsert.filter(
      (slot) =>
        !existingKeys.has(`${slot.slot_date}|${slot.slot_time}|${slot.course_id}`)
    );

    if (newSlots.length === 0) {
      return successResponse({
        message: 'No new slots to create - all slots already exist',
        created: 0,
        skipped: slotsToInsert.length,
      });
    }

    // Insert slots in batches (Supabase has a limit)
    const batchSize = 100;
    let totalCreated = 0;
    const errors: string[] = [];

    for (let i = 0; i < newSlots.length; i += batchSize) {
      const batch = newSlots.slice(i, i + batchSize);
      const { data, error } = await adminClient.from('slots').insert(batch).select();

      if (error) {
        console.error('Error inserting batch:', error);
        errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
      } else {
        totalCreated += data?.length || 0;
      }
    }

    if (errors.length > 0 && totalCreated === 0) {
      return errorResponse(
        `Failed to create slots: ${errors.join('; ')}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    return successResponse(
      {
        message: `Successfully generated ${totalCreated} slots`,
        created: totalCreated,
        skipped: slotsToInsert.length - newSlots.length,
        dateRange: { startDate, endDate },
        times,
        courseId: courseId || null,
        ...(errors.length > 0 && { warnings: errors }),
      },
      HttpStatus.CREATED
    );
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResponse(error.message, HttpStatus.UNAUTHORIZED);
    }
    if (error instanceof AuthorizationError) {
      return errorResponse(error.message, HttpStatus.FORBIDDEN);
    }
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', HttpStatus.BAD_REQUEST);
    }
    console.error('Unexpected error in POST /api/admin/slots/generate:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
