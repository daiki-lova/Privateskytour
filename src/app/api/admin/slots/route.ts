import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireRole, AuthenticationError, AuthorizationError } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  HttpStatus,
} from '@/lib/api/response';
import { transformKeysToCamelCase } from '@/lib/api/transform';
import type { SlotStatus, Slot } from '@/lib/data/types';

/**
 * GET /api/admin/slots
 * List slots with optional filters (date, status, courseId)
 * Requires admin or staff role
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Require admin or staff role
    await requireRole(supabase, ['admin', 'staff']);

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status') as SlotStatus | null;
    const courseId = searchParams.get('courseId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '100', 10);

    // Build query - include reservations with customer info
    let query = supabase
      .from('slots')
      .select('*, course:courses(*), reservations(*, customer:customers(*))', { count: 'exact' });

    // Apply filters
    if (date) {
      query = query.eq('slot_date', date);
    }

    // Date range filter (startDate to endDate)
    if (startDate) {
      query = query.gte('slot_date', startDate);
    }
    if (endDate) {
      query = query.lte('slot_date', endDate);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    // Order by date and time
    query = query
      .order('slot_date', { ascending: true })
      .order('slot_time', { ascending: true });

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching slots:', error);
      return errorResponse('Failed to fetch slots', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Transform snake_case keys to camelCase for frontend compatibility
    const transformedData = transformKeysToCamelCase<Slot[]>(data || []);
    return paginatedResponse(transformedData, count || 0, page, pageSize);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResponse(error.message, HttpStatus.UNAUTHORIZED);
    }
    if (error instanceof AuthorizationError) {
      return errorResponse(error.message, HttpStatus.FORBIDDEN);
    }
    console.error('Unexpected error in GET /api/admin/slots:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * POST /api/admin/slots
 * Create a new slot
 * Requires admin role
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Require admin role for creating slots
    await requireRole(supabase, ['admin']);

    // Parse request body
    const body = await request.json();
    const { courseId, slotDate, slotTime, maxPax, status } = body;

    // Validate required fields
    if (!slotDate || !slotTime) {
      return errorResponse('slotDate and slotTime are required', HttpStatus.BAD_REQUEST);
    }

    // Validate status if provided
    const validStatuses: SlotStatus[] = ['open', 'closed', 'suspended'];
    if (status && !validStatuses.includes(status)) {
      return errorResponse(
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        HttpStatus.BAD_REQUEST
      );
    }

    // Check for duplicate slot (same course, date, and time)
    const { data: existingSlot } = await supabase
      .from('slots')
      .select('id')
      .eq('slot_date', slotDate)
      .eq('slot_time', slotTime)
      .eq('course_id', courseId || null)
      .maybeSingle();

    if (existingSlot) {
      return errorResponse(
        'A slot already exists for this course, date, and time',
        HttpStatus.CONFLICT
      );
    }

    // Create the slot
    const { data, error } = await supabase
      .from('slots')
      .insert({
        course_id: courseId || null,
        slot_date: slotDate,
        slot_time: slotTime,
        max_pax: maxPax || 4,
        current_pax: 0,
        status: status || 'open',
      })
      .select('*, course:courses(*)')
      .single();

    if (error) {
      console.error('Error creating slot:', error);
      return errorResponse('Failed to create slot', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Transform snake_case keys to camelCase for frontend compatibility
    const transformedData = transformKeysToCamelCase<Slot>(data);
    return successResponse(transformedData, HttpStatus.CREATED);
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
    console.error('Unexpected error in POST /api/admin/slots:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
