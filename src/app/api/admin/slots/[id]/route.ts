import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireRole, AuthenticationError, AuthorizationError } from '@/lib/auth';
import { successResponse, errorResponse, HttpStatus } from '@/lib/api/response';
import type { SlotStatus } from '@/lib/data/types';

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/admin/slots/[id]
 * Get a single slot by ID
 * Requires admin role
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Require admin role
    await requireRole(supabase, ['admin']);

    const { data, error } = await supabase
      .from('slots')
      .select('*, course:courses(*)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Slot not found', HttpStatus.NOT_FOUND);
      }
      console.error('Error fetching slot:', error);
      return errorResponse('Failed to fetch slot', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return successResponse(data);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResponse(error.message, HttpStatus.UNAUTHORIZED);
    }
    if (error instanceof AuthorizationError) {
      return errorResponse(error.message, HttpStatus.FORBIDDEN);
    }
    console.error('Unexpected error in GET /api/admin/slots/[id]:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * PATCH /api/admin/slots/[id]
 * Update a slot
 * Requires admin role
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Require admin role
    await requireRole(supabase, ['admin']);

    // Check if slot exists
    const { data: existingSlot, error: fetchError } = await supabase
      .from('slots')
      .select('id, current_pax')
      .eq('id', id)
      .single();

    if (fetchError || !existingSlot) {
      return errorResponse('Slot not found', HttpStatus.NOT_FOUND);
    }

    // Parse request body
    const body = await request.json();
    const { courseId, slotDate, slotTime, maxPax, status, suspendedReason } = body;

    // Validate status if provided
    const validStatuses: SlotStatus[] = ['open', 'closed', 'suspended'];
    if (status && !validStatuses.includes(status)) {
      return errorResponse(
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        HttpStatus.BAD_REQUEST
      );
    }

    // Validate maxPax if provided (must be >= current_pax)
    if (maxPax !== undefined && maxPax < existingSlot.current_pax) {
      return errorResponse(
        `maxPax cannot be less than current bookings (${existingSlot.current_pax})`,
        HttpStatus.BAD_REQUEST
      );
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (courseId !== undefined) updateData.course_id = courseId;
    if (slotDate !== undefined) updateData.slot_date = slotDate;
    if (slotTime !== undefined) updateData.slot_time = slotTime;
    if (maxPax !== undefined) updateData.max_pax = maxPax;
    if (status !== undefined) updateData.status = status;
    if (suspendedReason !== undefined) updateData.suspended_reason = suspendedReason;

    // Clear suspended_reason if status is not 'suspended'
    if (status && status !== 'suspended') {
      updateData.suspended_reason = null;
    }

    const { data, error } = await supabase
      .from('slots')
      .update(updateData)
      .eq('id', id)
      .select('*, course:courses(*)')
      .single();

    if (error) {
      console.error('Error updating slot:', error);
      return errorResponse('Failed to update slot', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return successResponse(data);
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
    console.error('Unexpected error in PATCH /api/admin/slots/[id]:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * DELETE /api/admin/slots/[id]
 * Delete a slot
 * Requires admin role
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Require admin role
    await requireRole(supabase, ['admin']);

    // Check if slot exists and has no bookings
    const { data: existingSlot, error: fetchError } = await supabase
      .from('slots')
      .select('id, current_pax')
      .eq('id', id)
      .single();

    if (fetchError || !existingSlot) {
      return errorResponse('Slot not found', HttpStatus.NOT_FOUND);
    }

    // Prevent deletion if there are bookings
    if (existingSlot.current_pax > 0) {
      return errorResponse(
        'Cannot delete slot with existing bookings. Cancel reservations first or set status to closed.',
        HttpStatus.CONFLICT
      );
    }

    // Check for any reservations linked to this slot
    const { data: reservations } = await supabase
      .from('reservations')
      .select('id')
      .eq('slot_id', id)
      .limit(1);

    if (reservations && reservations.length > 0) {
      return errorResponse(
        'Cannot delete slot with linked reservations. Remove reservations first.',
        HttpStatus.CONFLICT
      );
    }

    // Delete the slot
    const { error } = await supabase.from('slots').delete().eq('id', id);

    if (error) {
      console.error('Error deleting slot:', error);
      return errorResponse('Failed to delete slot', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return successResponse({ deleted: true, id });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResponse(error.message, HttpStatus.UNAUTHORIZED);
    }
    if (error instanceof AuthorizationError) {
      return errorResponse(error.message, HttpStatus.FORBIDDEN);
    }
    console.error('Unexpected error in DELETE /api/admin/slots/[id]:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
