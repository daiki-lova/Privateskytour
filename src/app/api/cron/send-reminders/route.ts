import { NextResponse } from 'next/server';

import {
  sendReservationReminder3Days,
  sendReservationReminder1Day,
} from '@/lib/email/client';
import type { ReservationReminderParams } from '@/lib/email/client';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * Vercel Cron: リマインダーメール送信
 * 毎日 09:00 JST (0:00 UTC) に実行
 *
 * - 3日後にフライトがある確認済み予約 -> 3日前リマインダー
 * - 翌日にフライトがある確認済み予約 -> 前日リマインダー
 */
export async function GET(request: Request) {
  // Vercel Cron 認証チェック
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error('[Cron:Reminders] Unauthorized request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const results: {
    type: '3day' | '1day';
    bookingNumber: string;
    email: string;
    success: boolean;
    error?: string;
  }[] = [];

  try {
    // 今日の日付（JST基準: UTC+9）
    const now = new Date();
    const jstOffset = 9 * 60 * 60 * 1000;
    const jstNow = new Date(now.getTime() + jstOffset);
    const todayStr = jstNow.toISOString().split('T')[0];

    // 3日後の日付
    const threeDaysLater = new Date(jstNow);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    const threeDaysStr = threeDaysLater.toISOString().split('T')[0];

    // 翌日の日付
    const tomorrow = new Date(jstNow);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];


    // --- 3日前リマインダー ---
    const { data: threeDayReservations, error: threeDayError } = await supabase
      .from('reservations')
      .select(`
        id,
        booking_number,
        pax,
        customer_id,
        slot_id,
        customers!inner (
          id,
          name,
          email
        ),
        slots!inner (
          id,
          slot_date,
          slot_time,
          course_id,
          courses!inner (
            id,
            title,
            heliport_id,
            heliports (
              id,
              name,
              address,
              google_map_url
            )
          )
        )
      `)
      .eq('status', 'confirmed')
      .eq('slots.slot_date', threeDaysStr);

    if (threeDayError) {
      console.error('[Cron:Reminders] Error fetching 3-day reservations:', threeDayError);
    } else if (threeDayReservations && threeDayReservations.length > 0) {

      for (const reservation of threeDayReservations) {
        const customer = reservation.customers as unknown as { name: string; email: string };
        const slot = reservation.slots as unknown as {
          slot_date: string;
          slot_time: string;
          courses: {
            title: string;
            heliports: { name: string; address: string; google_map_url: string | null } | null;
          };
        };

        const heliport = slot.courses?.heliports;
        const flightDate = formatDateJapanese(slot.slot_date);
        const flightTime = slot.slot_time.slice(0, 5); // HH:mm

        const params: ReservationReminderParams = {
          to: customer.email,
          customerName: customer.name,
          courseName: slot.courses.title,
          flightDate,
          flightTime,
          pax: reservation.pax,
          bookingNumber: reservation.booking_number,
          heliportName: heliport?.name ?? '',
          heliportAddress: heliport?.address ?? '',
          googleMapUrl: heliport?.google_map_url ?? undefined,
        };

        const result = await sendReservationReminder3Days(params);
        results.push({
          type: '3day',
          bookingNumber: reservation.booking_number,
          email: customer.email,
          success: result.success,
          error: result.error,
        });

        if (!result.success) {
          console.error(`[Cron:Reminders] Failed to send 3-day reminder for ${reservation.booking_number}:`, result.error);
        }
      }
    }

    // --- 前日リマインダー ---
    const { data: oneDayReservations, error: oneDayError } = await supabase
      .from('reservations')
      .select(`
        id,
        booking_number,
        pax,
        customer_id,
        slot_id,
        customers!inner (
          id,
          name,
          email
        ),
        slots!inner (
          id,
          slot_date,
          slot_time,
          course_id,
          courses!inner (
            id,
            title,
            heliport_id,
            heliports (
              id,
              name,
              address,
              google_map_url
            )
          )
        )
      `)
      .eq('status', 'confirmed')
      .eq('slots.slot_date', tomorrowStr);

    if (oneDayError) {
      console.error('[Cron:Reminders] Error fetching 1-day reservations:', oneDayError);
    } else if (oneDayReservations && oneDayReservations.length > 0) {

      for (const reservation of oneDayReservations) {
        const customer = reservation.customers as unknown as { name: string; email: string };
        const slot = reservation.slots as unknown as {
          slot_date: string;
          slot_time: string;
          courses: {
            title: string;
            heliports: { name: string; address: string; google_map_url: string | null } | null;
          };
        };

        const heliport = slot.courses?.heliports;
        const flightDate = formatDateJapanese(slot.slot_date);
        const flightTime = slot.slot_time.slice(0, 5);

        const params: ReservationReminderParams = {
          to: customer.email,
          customerName: customer.name,
          courseName: slot.courses.title,
          flightDate,
          flightTime,
          pax: reservation.pax,
          bookingNumber: reservation.booking_number,
          heliportName: heliport?.name ?? '',
          heliportAddress: heliport?.address ?? '',
          googleMapUrl: heliport?.google_map_url ?? undefined,
        };

        const result = await sendReservationReminder1Day(params);
        results.push({
          type: '1day',
          bookingNumber: reservation.booking_number,
          email: customer.email,
          success: result.success,
          error: result.error,
        });

        if (!result.success) {
          console.error(`[Cron:Reminders] Failed to send 1-day reminder for ${reservation.booking_number}:`, result.error);
        }
      }
    }

    const sent = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;


    return NextResponse.json({
      success: true,
      summary: { sent, failed, total: results.length },
      details: results,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Cron:Reminders] Unexpected error:', message);
    return NextResponse.json(
      { success: false, error: message, details: results },
      { status: 500 }
    );
  }
}

/**
 * 日付文字列 (YYYY-MM-DD) を日本語形式 (YYYY年M月D日) に変換
 */
function formatDateJapanese(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${year}年${parseInt(month, 10)}月${parseInt(day, 10)}日`;
}
