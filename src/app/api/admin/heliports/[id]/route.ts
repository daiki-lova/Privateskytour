import { NextRequest } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import {
  requireRole,
  AuthenticationError,
  AuthorizationError,
} from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  HttpStatus,
} from '@/lib/api/response';
import type { Database } from '@/lib/supabase/database.types';
import type { Heliport } from '@/lib/data/types';

type HeliportUpdate = Database['public']['Tables']['heliports']['Update'];

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
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
 * GET /api/admin/heliports/[id]
 * Get a single heliport by ID with full details
 * Accessible by: admin, staff
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Require admin or staff role
    await requireRole(supabase, ['admin', 'staff']);

    // Fetch heliport
    const { data, error } = await supabase
      .from('heliports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Heliport not found', HttpStatus.NOT_FOUND);
      }
      console.error('Error fetching heliport:', error);
      return errorResponse('Failed to fetch heliport', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return successResponse(toHeliport(data));
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResponse(error.message, HttpStatus.UNAUTHORIZED);
    }
    if (error instanceof AuthorizationError) {
      return errorResponse(error.message, HttpStatus.FORBIDDEN);
    }
    console.error('Unexpected error in GET /api/admin/heliports/[id]:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * PUT /api/admin/heliports/[id]
 * Update a heliport's details
 * Accessible by: admin only
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Require admin role for updating heliports
    await requireRole(supabase, ['admin']);

    // Check if heliport exists
    const { data: existingHeliport, error: fetchError } = await supabase
      .from('heliports')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingHeliport) {
      return errorResponse('Heliport not found', HttpStatus.NOT_FOUND);
    }

    // Parse request body
    const body = await request.json();

    // Validate name if provided
    if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim() === '')) {
      return errorResponse('Name cannot be empty', HttpStatus.BAD_REQUEST);
    }

    // Prepare update data (only include fields that are provided)
    const updateData: HeliportUpdate = {};

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.nameEn !== undefined) updateData.name_en = body.nameEn || null;
    if (body.nameZh !== undefined) updateData.name_zh = body.nameZh || null;
    if (body.postalCode !== undefined) updateData.postal_code = body.postalCode || null;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.addressEn !== undefined) updateData.address_en = body.addressEn || null;
    if (body.addressZh !== undefined) updateData.address_zh = body.addressZh || null;
    if (body.accessRail !== undefined) updateData.access_rail = body.accessRail || null;
    if (body.accessTaxi !== undefined) updateData.access_taxi = body.accessTaxi || null;
    if (body.accessCar !== undefined) updateData.access_car = body.accessCar || null;
    if (body.googleMapUrl !== undefined) updateData.google_map_url = body.googleMapUrl || null;
    if (body.imageUrl !== undefined) updateData.image_url = body.imageUrl || null;
    if (body.latitude !== undefined) updateData.latitude = body.latitude;
    if (body.longitude !== undefined) updateData.longitude = body.longitude;
    if (body.isActive !== undefined) updateData.is_active = body.isActive;

    // Check if there are any fields to update
    if (Object.keys(updateData).length === 0) {
      return errorResponse('No fields to update', HttpStatus.BAD_REQUEST);
    }

    // Update the heliport
    const { data, error } = await supabase
      .from('heliports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating heliport:', error);
      return errorResponse('Failed to update heliport', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return successResponse(toHeliport(data));
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
    console.error('Unexpected error in PUT /api/admin/heliports/[id]:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * DELETE /api/admin/heliports/[id]
 * Delete a heliport (soft delete by default, hard delete with ?hard=true)
 * Accessible by: admin only
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Require admin role for deleting heliports
    await requireRole(supabase, ['admin']);

    // Check if heliport exists
    const { data: existingHeliport, error: fetchError } = await supabase
      .from('heliports')
      .select('id, name')
      .eq('id', id)
      .single();

    if (fetchError || !existingHeliport) {
      return errorResponse('Heliport not found', HttpStatus.NOT_FOUND);
    }

    // Check for hard delete flag
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get('hard') === 'true';

    // Check for associated courses (both soft and hard delete need this check)
    const { count: courseCount } = await supabase
      .from('courses')
      .select('id', { count: 'exact', head: true })
      .eq('heliport_id', id);

    if (courseCount && courseCount > 0) {
      return errorResponse(
        `Cannot delete heliport with ${courseCount} associated course(s). Remove or reassign courses first.`,
        HttpStatus.CONFLICT
      );
    }

    if (hardDelete) {
      // Hard delete
      const { error } = await supabase
        .from('heliports')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error hard deleting heliport:', error);
        return errorResponse('Failed to delete heliport', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return successResponse({
        message: 'Heliport permanently deleted',
        id,
        name: existingHeliport.name,
      });
    } else {
      // Soft delete (set is_active = false)
      const { data, error } = await supabase
        .from('heliports')
        .update({ is_active: false })
        .eq('id', id)
        .select('id, name, is_active')
        .single();

      if (error) {
        console.error('Error soft deleting heliport:', error);
        return errorResponse('Failed to deactivate heliport', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return successResponse({
        message: 'Heliport deactivated',
        id: data.id,
        name: data.name,
        isActive: data.is_active,
      });
    }
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResponse(error.message, HttpStatus.UNAUTHORIZED);
    }
    if (error instanceof AuthorizationError) {
      return errorResponse(error.message, HttpStatus.FORBIDDEN);
    }
    console.error('Unexpected error in DELETE /api/admin/heliports/[id]:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
