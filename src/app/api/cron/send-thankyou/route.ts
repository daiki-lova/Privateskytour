import { NextResponse } from 'next/server';

import { sendThankYouEmail } from '@/lib/email/client';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * Vercel Cron: お礼メール送信
 * 毎日 10:00 JST (1:00 UTC) に実行
 *
 * 前日にフライトがあった確認済み予約に対してお礼メールを送信し、
 * ステータスを completed に更新する
 */
export async function GET(request: Request) {
  // Vercel Cron 認証チェック
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error('[Cron:ThankYou] Unauthorized request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const results: {
    bookingNumber: string;
    email: string;
    emailSent: boolean;
    statusUpdated: boolean;
    error?: string;
  }[] = [];

  try {
    // 昨日の日付（JST基準: UTC+9）
    const now = new Date();
    const jstOffset = 9 * 60 * 60 * 1000;
    const jstNow = new Date(now.getTime() + jstOffset);
    const yesterday = new Date(jstNow);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];


    // 昨日フライトがあった確認済み予約を取得
    const { data: reservations, error: fetchError } = await supabase
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
          email,
          mypage_token
        ),
        slots!inner (
          id,
          slot_date,
          slot_time,
          course_id,
          courses!inner (
            id,
            title
          )
        )
      `)
      .eq('status', 'confirmed')
      .eq('slots.slot_date', yesterdayStr);

    if (fetchError) {
      console.error('[Cron:ThankYou] Error fetching reservations:', fetchError);
      return NextResponse.json(
        { success: false, error: fetchError.message },
        { status: 500 }
      );
    }

    if (!reservations || reservations.length === 0) {
      return NextResponse.json({
        success: true,
        summary: { sent: 0, failed: 0, total: 0 },
        details: [],
      });
    }


    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tour.privatesky.co.jp';

    for (const reservation of reservations) {
      const customer = reservation.customers as unknown as {
        name: string;
        email: string;
        mypage_token: string | null;
      };
      const slot = reservation.slots as unknown as {
        slot_date: string;
        courses: { title: string };
      };

      const flightDate = formatDateJapanese(slot.slot_date);
      const mypageUrl = customer.mypage_token
        ? `${appUrl}/mypage?token=${customer.mypage_token}`
        : undefined;

      // お礼メール送信
      const emailResult = await sendThankYouEmail({
        to: customer.email,
        customerName: customer.name,
        courseName: slot.courses.title,
        flightDate,
        bookingNumber: reservation.booking_number,
        mypageUrl,
      });

      // ステータスを completed に更新
      let statusUpdated = false;
      if (emailResult.success) {
        const { error: updateError } = await supabase
          .from('reservations')
          .update({ status: 'completed' })
          .eq('id', reservation.id);

        if (updateError) {
          console.error(
            `[Cron:ThankYou] Failed to update status for ${reservation.booking_number}:`,
            updateError
          );
        } else {
          statusUpdated = true;
        }
      }

      results.push({
        bookingNumber: reservation.booking_number,
        email: customer.email,
        emailSent: emailResult.success,
        statusUpdated,
        error: emailResult.error,
      });

      if (!emailResult.success) {
        console.error(
          `[Cron:ThankYou] Failed to send thank-you email for ${reservation.booking_number}:`,
          emailResult.error
        );
      }
    }

    const sent = results.filter((r) => r.emailSent).length;
    const failed = results.filter((r) => !r.emailSent).length;
    const updated = results.filter((r) => r.statusUpdated).length;


    return NextResponse.json({
      success: true,
      summary: { sent, failed, statusUpdated: updated, total: results.length },
      details: results,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Cron:ThankYou] Unexpected error:', message);
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
