import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireRole, AuthenticationError, AuthorizationError } from '@/lib/auth';
import { successResponse, errorResponse, HttpStatus } from '@/lib/api/response';
import type { Heliport } from '@/lib/data/types';

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
 * GET /api/admin/heliports
 * List all heliports (including inactive ones for admin)
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Require admin or staff role
    await requireRole(supabase, ['admin', 'staff']);

    const { data, error } = await supabase
      .from('heliports')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching heliports:', error);
      return errorResponse('Failed to fetch heliports', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const heliports = (data || []).map(toHeliport);
    return successResponse(heliports);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResponse(error.message, HttpStatus.UNAUTHORIZED);
    }
    if (error instanceof AuthorizationError) {
      return errorResponse(error.message, HttpStatus.FORBIDDEN);
    }
    console.error('Get heliports error:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * POST /api/admin/heliports
 * Create a new heliport (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Require admin role only
    await requireRole(supabase, ['admin']);

    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return errorResponse('Name is required', HttpStatus.BAD_REQUEST);
    }

    // Prepare insert data
    const insertData: Record<string, unknown> = {
      name: body.name.trim(),
      is_active: body.isActive !== false, // Default to active
    };

    // Optional fields
    if (body.nameEn) insertData.name_en = body.nameEn;
    if (body.nameZh) insertData.name_zh = body.nameZh;
    if (body.postalCode) insertData.postal_code = body.postalCode;
    if (body.address) insertData.address = body.address;
    if (body.addressEn) insertData.address_en = body.addressEn;
    if (body.addressZh) insertData.address_zh = body.addressZh;
    if (body.accessRail) insertData.access_rail = body.accessRail;
    if (body.accessTaxi) insertData.access_taxi = body.accessTaxi;
    if (body.accessCar) insertData.access_car = body.accessCar;
    if (body.googleMapUrl) insertData.google_map_url = body.googleMapUrl;
    if (body.imageUrl) insertData.image_url = body.imageUrl;
    if (body.latitude !== undefined) insertData.latitude = body.latitude;
    if (body.longitude !== undefined) insertData.longitude = body.longitude;

    const { data, error } = await supabase
      .from('heliports')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Error creating heliport:', error);
      return errorResponse('Failed to create heliport', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return successResponse(toHeliport(data), HttpStatus.CREATED);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResponse(error.message, HttpStatus.UNAUTHORIZED);
    }
    if (error instanceof AuthorizationError) {
      return errorResponse(error.message, HttpStatus.FORBIDDEN);
    }
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON body', HttpStatus.BAD_REQUEST);
    }
    console.error('Create heliport error:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
