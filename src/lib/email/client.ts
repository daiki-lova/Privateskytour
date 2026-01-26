import { Resend } from 'resend';

import { reservationConfirmedTemplate } from './templates/reservation-confirmed';
import { reservationReminderTemplate } from './templates/reservation-reminder';

// Resendクライアントの初期化
// 環境変数が未設定の場合は開発モードとして動作
const resendApiKey = process.env.RESEND_API_KEY;

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

// 送信元アドレス（開発中は Resend sandbox を使用）
const FROM_EMAIL = process.env.EMAIL_FROM || 'PrivateSky Tour <onboarding@resend.dev>';

// メール送信結果の型定義
export type EmailResult = {
  success: boolean;
  messageId?: string;
  error?: string;
};

// 予約確認メールのパラメータ
export type ReservationConfirmationParams = {
  to: string;
  customerName: string;
  courseName: string;
  flightDate: string;
  flightTime: string;
  pax: number;
  totalPrice: number;
  bookingNumber: string;
  heliportName: string;
  heliportAddress: string;
  mypageUrl: string;
};

// リマインダーメールのパラメータ
export type ReservationReminderParams = {
  to: string;
  customerName: string;
  courseName: string;
  flightDate: string;
  flightTime: string;
  pax: number;
  bookingNumber: string;
  heliportName: string;
  heliportAddress: string;
  googleMapUrl?: string;
};

/**
 * 予約確認メールを送信
 */
export async function sendReservationConfirmation(
  params: ReservationConfirmationParams
): Promise<EmailResult> {
  if (!resend) {
    console.warn('[Email] Resend API key not configured. Skipping email send.');
    console.log('[Email] Would have sent confirmation email to:', params.to);
    return { success: true, messageId: 'dev-mode-skip' };
  }

  try {
    const { html, text } = reservationConfirmedTemplate(params);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `【予約確認】${params.courseName} - ${params.flightDate}`,
      html,
      text,
    });

    if (error) {
      console.error('[Email] Failed to send confirmation email:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Confirmation email sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Email] Exception while sending confirmation email:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * 予約リマインダーメールを送信（フライト24時間前）
 */
export async function sendReservationReminder(
  params: ReservationReminderParams
): Promise<EmailResult> {
  if (!resend) {
    console.warn('[Email] Resend API key not configured. Skipping email send.');
    console.log('[Email] Would have sent reminder email to:', params.to);
    return { success: true, messageId: 'dev-mode-skip' };
  }

  try {
    const { html, text } = reservationReminderTemplate(params);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `【明日のフライトのご案内】${params.courseName}`,
      html,
      text,
    });

    if (error) {
      console.error('[Email] Failed to send reminder email:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Reminder email sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Email] Exception while sending reminder email:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * 予約確認メールを Resend のスケジュール機能で送信
 */
export async function scheduleReservationReminder(
  params: ReservationReminderParams,
  scheduledAt: Date
): Promise<EmailResult> {
  if (!resend) {
    console.warn('[Email] Resend API key not configured. Skipping scheduled email.');
    console.log('[Email] Would have scheduled reminder for:', scheduledAt.toISOString());
    return { success: true, messageId: 'dev-mode-skip' };
  }

  try {
    const { html, text } = reservationReminderTemplate(params);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `【明日のフライトのご案内】${params.courseName}`,
      html,
      text,
      scheduledAt: scheduledAt.toISOString(),
    });

    if (error) {
      console.error('[Email] Failed to schedule reminder email:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Reminder email scheduled successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Email] Exception while scheduling reminder email:', errorMessage);
    return { success: false, error: errorMessage };
  }
}
