import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireRole, AuthenticationError, AuthorizationError } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  HttpStatus,
} from '@/lib/api/response';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Response type for passenger
interface PassengerResponse {
  id: string;
  reservationId: string;
  name: string;
  nameKana: string | null;
  weightKg: number | null;
  specialRequirements: string | null;
  isChild: boolean | null;
  isInfant: boolean | null;
  seatNumber: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

/**
 * GET /api/admin/passengers/[id]
 * Get a single passenger by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    await requireRole(supabase, ['admin', 'staff']);

    const { id } = await params;

    const { data, error } = await supabase
      .from('passengers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Passenger not found', HttpStatus.NOT_FOUND);
      }
      console.error('Error fetching passenger:', error);
      return errorResponse('Failed to fetch passenger', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const passenger: PassengerResponse = {
      id: data.id,
      reservationId: data.reservation_id,
      name: data.name,
      nameKana: data.name_kana,
      weightKg: data.weight_kg,
      specialRequirements: data.special_requirements,
      isChild: data.is_child,
      isInfant: data.is_infant,
      seatNumber: data.seat_number,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return successResponse(passenger);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResponse(error.message, HttpStatus.UNAUTHORIZED);
    }
    if (error instanceof AuthorizationError) {
      return errorResponse(error.message, HttpStatus.FORBIDDEN);
    }

    console.error('Unexpected error in GET /api/admin/passengers/[id]:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * PUT /api/admin/passengers/[id]
 * Update passenger information (weight, special requirements, etc.)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    await requireRole(supabase, ['admin', 'staff']);

    const { id } = await params;
    const body = await request.json();

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};

    if (body.weightKg !== undefined) {
      // Validate weight if provided
      if (body.weightKg !== null && (typeof body.weightKg !== 'number' || body.weightKg < 0 || body.weightKg > 500)) {
        return errorResponse('Weight must be a number between 0 and 500 kg', HttpStatus.BAD_REQUEST);
      }
      updateData.weight_kg = body.weightKg;
    }

    if (body.specialRequirements !== undefined) {
      // Validate special requirements length
      if (body.specialRequirements !== null && typeof body.specialRequirements !== 'string') {
        return errorResponse('Special requirements must be a string', HttpStatus.BAD_REQUEST);
      }
      if (body.specialRequirements && body.specialRequirements.length > 1000) {
        return errorResponse('Special requirements must be 1000 characters or less', HttpStatus.BAD_REQUEST);
      }
      updateData.special_requirements = body.specialRequirements;
    }

    if (body.name !== undefined) {
      if (!body.name || typeof body.name !== 'string') {
        return errorResponse('Name is required and must be a string', HttpStatus.BAD_REQUEST);
      }
      updateData.name = body.name;
    }

    if (body.nameKana !== undefined) {
      updateData.name_kana = body.nameKana;
    }

    if (body.isChild !== undefined) {
      updateData.is_child = body.isChild;
    }

    if (body.isInfant !== undefined) {
      updateData.is_infant = body.isInfant;
    }

    if (body.seatNumber !== undefined) {
      updateData.seat_number = body.seatNumber;
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return errorResponse('No valid fields to update', HttpStatus.BAD_REQUEST);
    }

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('passengers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Passenger not found', HttpStatus.NOT_FOUND);
      }
      console.error('Error updating passenger:', error);
      return errorResponse('Failed to update passenger', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const passenger: PassengerResponse = {
      id: data.id,
      reservationId: data.reservation_id,
      name: data.name,
      nameKana: data.name_kana,
      weightKg: data.weight_kg,
      specialRequirements: data.special_requirements,
      isChild: data.is_child,
      isInfant: data.is_infant,
      seatNumber: data.seat_number,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return successResponse(passenger);
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

    console.error('Unexpected error in PUT /api/admin/passengers/[id]:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
