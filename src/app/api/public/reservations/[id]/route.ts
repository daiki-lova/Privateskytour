import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/public/reservations/[id]
 * Get a single reservation by ID (public endpoint for success page)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: reservationId } = await params;

  if (!reservationId) {
    return NextResponse.json(
      { success: false, error: '予約IDが必要です' },
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('reservations')
      .select(`
        id,
        booking_number,
        reservation_date,
        reservation_time,
        pax,
        total_price,
        status,
        payment_status,
        customer:customers!customer_id (
          id,
          name,
          email
        ),
        course:courses!course_id (
          id,
          title,
          heliport:heliports!heliport_id (
            id,
            name,
            address
          )
        )
      `)
      .eq('id', reservationId)
      .single();

    if (error) {
      console.error('Failed to fetch reservation:', error);
      return NextResponse.json(
        { success: false, error: '予約が見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching reservation:', error);
    return NextResponse.json(
      { success: false, error: '予期しないエラーが発生しました' },
      { status: 500 }
    );
  }
}
