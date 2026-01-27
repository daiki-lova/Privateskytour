import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireRole, AuthenticationError, AuthorizationError } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  HttpStatus,
} from '@/lib/api/response';

// Type for manifest slot data
interface ManifestPassenger {
  id: string;
  name: string;
  nameKana: string | null;
  nameRomaji: string | null;
  weightKg: number | null;
  specialRequirements: string | null;
  isChild: boolean | null;
  isInfant: boolean | null;
  seatNumber: number | null;
}

interface ManifestCustomer {
  id: string;
  name: string;
  phone: string | null;
  email: string;
}

interface ManifestReservation {
  id: string;
  bookingNumber: string;
  pax: number;
  status: string;
  customer: ManifestCustomer | null;
  passengers: ManifestPassenger[];
}

interface ManifestCourse {
  id: string;
  title: string;
}

interface ManifestSlot {
  id: string;
  slotTime: string;
  slotDate: string;
  maxPax: number;
  currentPax: number;
  course: ManifestCourse | null;
  reservations: ManifestReservation[];
}

/**
 * GET /api/admin/manifest?date=2025-01-27
 * Get manifest (flight passenger list) for a specific date
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    await requireRole(supabase, ['admin', 'staff']);

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return errorResponse('Date is required', HttpStatus.BAD_REQUEST);
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return errorResponse('Invalid date format. Use YYYY-MM-DD', HttpStatus.BAD_REQUEST);
    }

    // Fetch slots for the date with related reservations, passengers, customers, and courses
    const { data: slots, error } = await supabase
      .from('slots')
      .select(`
        id,
        slot_time,
        slot_date,
        max_pax,
        current_pax,
        courses(id, title),
        reservations!inner(
          id,
          booking_number,
          pax,
          status,
          customers(id, name, phone, email),
          passengers(id, name, name_kana, name_romaji, weight_kg, special_requirements, is_child, is_infant, seat_number)
        )
      `)
      .eq('slot_date', date)
      .in('reservations.status', ['confirmed', 'completed'])
      .order('slot_time');

    if (error) {
      console.error('Error fetching manifest:', error);
      return errorResponse('Failed to fetch manifest', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Transform database response to camelCase
    const transformedSlots: ManifestSlot[] = (slots ?? []).map((slot) => {
      // Supabase returns joined data as objects (single relation) or arrays (multiple)
      // courses is a single object (FK), reservations is an array
      const courseData = slot.courses as Record<string, unknown> | null;

      return {
        id: slot.id,
        slotTime: slot.slot_time,
        slotDate: slot.slot_date,
        maxPax: slot.max_pax,
        currentPax: slot.current_pax,
        course: courseData ? {
          id: courseData.id as string,
          title: courseData.title as string,
        } : null,
        reservations: ((slot.reservations as Array<Record<string, unknown>>) ?? []).map((res) => {
          const customerData = res.customers as Record<string, unknown> | null;

          return {
            id: res.id as string,
            bookingNumber: res.booking_number as string,
            pax: res.pax as number,
            status: res.status as string,
            customer: customerData ? {
              id: customerData.id as string,
              name: customerData.name as string,
              phone: customerData.phone as string | null,
              email: customerData.email as string,
            } : null,
            passengers: ((res.passengers as Array<Record<string, unknown>>) ?? []).map((p) => ({
              id: p.id as string,
              name: p.name as string,
              nameKana: p.name_kana as string | null,
              nameRomaji: p.name_romaji as string | null,
              weightKg: p.weight_kg as number | null,
              specialRequirements: p.special_requirements as string | null,
              isChild: p.is_child as boolean | null,
              isInfant: p.is_infant as boolean | null,
              seatNumber: p.seat_number as number | null,
            })),
          };
        }),
      };
    });

    return successResponse(transformedSlots);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResponse(error.message, HttpStatus.UNAUTHORIZED);
    }
    if (error instanceof AuthorizationError) {
      return errorResponse(error.message, HttpStatus.FORBIDDEN);
    }

    console.error('Unexpected error in GET /api/admin/manifest:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
