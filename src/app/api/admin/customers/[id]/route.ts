import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireRole, AuthenticationError, AuthorizationError } from '@/lib/auth';
import { successResponse, errorResponse, HttpStatus } from '@/lib/api/response';
import type { Customer, SupportedLang } from '@/lib/data/types';
import type { Database } from '@/lib/supabase/database.types';

type CustomerUpdate = Database['public']['Tables']['customers']['Update'];

/**
 * Convert database row to Customer type
 */
function toCustomer(row: Record<string, unknown>): Customer {
  return {
    id: row.id as string,
    email: row.email as string,
    name: row.name as string,
    nameKana: row.name_kana as string | undefined,
    phone: row.phone as string | undefined,
    preferredLang: row.preferred_lang as SupportedLang,
    totalSpent: row.total_spent as number,
    bookingCount: row.booking_count as number,
    firstBookingDate: row.first_booking_date as string | undefined,
    lastBookingDate: row.last_booking_date as string | undefined,
    notes: row.notes as string | undefined,
    tags: row.tags as string[] | undefined,
    mypageToken: row.mypage_token as string | undefined,
    mypageTokenExpiresAt: row.mypage_token_expires_at as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/admin/customers/[id]
 * Get a specific customer by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();

    // Require admin or staff role
    await requireRole(supabase, ['admin', 'staff']);

    const { id } = await params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return errorResponse('Invalid customer ID format', HttpStatus.BAD_REQUEST);
    }

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Customer not found', HttpStatus.NOT_FOUND);
      }
      console.error('Error fetching customer:', error);
      return errorResponse('Failed to fetch customer', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return successResponse(toCustomer(data));
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResponse(error.message, HttpStatus.UNAUTHORIZED);
    }
    if (error instanceof AuthorizationError) {
      return errorResponse(error.message, HttpStatus.FORBIDDEN);
    }
    console.error('Get customer error:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * PUT /api/admin/customers/[id]
 * Update a specific customer by ID
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();

    // Require admin role only for updates
    await requireRole(supabase, ['admin']);

    const { id } = await params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return errorResponse('Invalid customer ID format', HttpStatus.BAD_REQUEST);
    }

    // Parse request body
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON body', HttpStatus.BAD_REQUEST);
    }

    // Check if customer exists
    const { data: existing, error: fetchError } = await supabase
      .from('customers')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return errorResponse('Customer not found', HttpStatus.NOT_FOUND);
    }

    // Prepare update data with field mapping (camelCase to snake_case)
    const updateData: CustomerUpdate = {};
    if (body.name !== undefined) updateData.name = body.name as string;
    if (body.nameKana !== undefined) updateData.name_kana = body.nameKana as string | null;
    if (body.email !== undefined) updateData.email = body.email as string;
    if (body.phone !== undefined) updateData.phone = body.phone as string | null;
    if (body.preferredLang !== undefined) updateData.preferred_lang = body.preferredLang as SupportedLang;
    if (body.notes !== undefined) updateData.notes = body.notes as string | null;
    if (body.tags !== undefined) updateData.tags = body.tags as string[] | null;

    if (Object.keys(updateData).length === 0) {
      return errorResponse('No fields to update', HttpStatus.BAD_REQUEST);
    }

    // Check for email uniqueness if email is being updated
    if (updateData.email) {
      const { data: existingEmail, error: emailCheckError } = await supabase
        .from('customers')
        .select('id')
        .eq('email', updateData.email)
        .neq('id', id)
        .single();

      if (!emailCheckError && existingEmail) {
        return errorResponse('Email already in use by another customer', HttpStatus.CONFLICT);
      }
    }

    // Perform update
    const { data, error } = await supabase
      .from('customers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating customer:', error);
      return errorResponse('Failed to update customer', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return successResponse(toCustomer(data));
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResponse(error.message, HttpStatus.UNAUTHORIZED);
    }
    if (error instanceof AuthorizationError) {
      return errorResponse(error.message, HttpStatus.FORBIDDEN);
    }
    console.error('Update customer error:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * DELETE /api/admin/customers/[id]
 * Delete a specific customer by ID
 * Note: Cannot delete customers with reservation history
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();

    // Require admin role only for deletions
    await requireRole(supabase, ['admin']);

    const { id } = await params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return errorResponse('Invalid customer ID format', HttpStatus.BAD_REQUEST);
    }

    // Check if customer exists
    const { data: existing, error: fetchError } = await supabase
      .from('customers')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return errorResponse('Customer not found', HttpStatus.NOT_FOUND);
    }

    // Check for reservation history
    const { count: reservationCount, error: countError } = await supabase
      .from('reservations')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', id);

    if (countError) {
      console.error('Error checking reservations:', countError);
      return errorResponse('Failed to check reservation history', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (reservationCount && reservationCount > 0) {
      return errorResponse(
        'Cannot delete customer with reservation history. Consider anonymizing instead.',
        HttpStatus.CONFLICT
      );
    }

    // Perform deletion
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting customer:', error);
      return errorResponse('Failed to delete customer', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return successResponse({ message: 'Customer deleted successfully', id });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResponse(error.message, HttpStatus.UNAUTHORIZED);
    }
    if (error instanceof AuthorizationError) {
      return errorResponse(error.message, HttpStatus.FORBIDDEN);
    }
    console.error('Delete customer error:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
