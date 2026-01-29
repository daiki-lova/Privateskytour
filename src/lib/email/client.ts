import { Resend } from 'resend';

import { reservationCancelledTemplate } from './templates/reservation-cancelled';
import { reservationConfirmedTemplate } from './templates/reservation-confirmed';
import { reservationReminderTemplate } from './templates/reservation-reminder';
import { reservationReminder3DaysTemplate } from './templates/reservation-reminder-3days';
import { reservationReminder1DayTemplate } from './templates/reservation-reminder-1day';
import { reservationThankYouTemplate, type ThankYouEmailParams } from './templates/reservation-thankyou';
import { refundCompletedTemplate } from './templates/refund-completed';
import { mypageAccessTemplate, type MypageAccessParams } from './templates/mypage-access';
import { adminNewBookingTemplate } from './templates/admin-new-booking';
import { adminContactInquiryTemplate } from './templates/admin-contact-inquiry';
import { adminCancellationNoticeTemplate } from './templates/admin-cancellation-notice';
import { contactConfirmationTemplate } from './templates/contact-confirmation';

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
  emergencyPhone?: string;
};

// キャンセル確認メールのパラメータ
export type CancellationConfirmationParams = {
  to: string;
  customerName: string;
  courseName: string;
  flightDate: string;
  flightTime: string;
  bookingNumber: string;
  cancellationFee: number;
  refundAmount: number;
  originalAmount: number;
};

// 返金完了メールのパラメータ
export type RefundNotificationParams = {
  to: string;
  customerName: string;
  courseName: string;
  bookingNumber: string;
  refundAmount: number;
  cardLast4?: string;
  refundDate: string;
};

// マイページアクセスメールのパラメータ
export type MypageAccessEmailParams = {
  to: string;
} & MypageAccessParams;

// 管理者向け新規予約通知のパラメータ
export type AdminNewBookingParams = {
  to: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  courseName: string;
  flightDate: string;
  flightTime: string;
  pax: number;
  totalPrice: number;
  bookingNumber: string;
};

// 管理者向けお問い合わせ通知のパラメータ
export type AdminContactInquiryParams = {
  to: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  subject: string;
  message: string;
};

// 運営側キャンセル通知のパラメータ（お客様宛）
export type AdminCancellationNoticeParams = {
  to: string;
  customerName: string;
  courseName: string;
  flightDate: string;
  flightTime: string;
  bookingNumber: string;
  reason?: string;
  refundAmount?: number;
};

// お問い合わせ受付確認のパラメータ（お客様宛）
export type ContactConfirmationParams = {
  to: string;
  customerName: string;
  subject: string;
  message: string;
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
 * 予約リマインダーメールを送信（フライト3日前）
 */
export async function sendReservationReminder3Days(
  params: ReservationReminderParams
): Promise<EmailResult> {
  if (!resend) {
    console.warn('[Email] Resend API key not configured. Skipping email send.');
    console.log('[Email] Would have sent 3-day reminder email to:', params.to);
    return { success: true, messageId: 'dev-mode-skip' };
  }

  try {
    const { html, text } = reservationReminder3DaysTemplate(params);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `【3日後のフライトのご案内】${params.courseName}`,
      html,
      text,
    });

    if (error) {
      console.error('[Email] Failed to send 3-day reminder email:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] 3-day reminder email sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Email] Exception while sending 3-day reminder email:', errorMessage);
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

/**
 * キャンセル確認メールを送信
 */
export async function sendCancellationConfirmation(
  params: CancellationConfirmationParams
): Promise<EmailResult> {
  if (!resend) {
    console.warn('[Email] Resend API key not configured. Skipping email send.');
    console.log('[Email] Would have sent cancellation email to:', params.to);
    return { success: true, messageId: 'dev-mode-skip' };
  }

  try {
    const { html, text } = reservationCancelledTemplate(params);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `【予約キャンセル完了】${params.courseName} - ${params.bookingNumber}`,
      html,
      text,
    });

    if (error) {
      console.error('[Email] Failed to send cancellation email:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Cancellation email sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Email] Exception while sending cancellation email:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * 返金完了通知メールを送信
 */
export async function sendRefundNotification(
  params: RefundNotificationParams
): Promise<EmailResult> {
  if (!resend) {
    console.warn('[Email] Resend API key not configured. Skipping email send.');
    console.log('[Email] Would have sent refund notification to:', params.to);
    return { success: true, messageId: 'dev-mode-skip' };
  }

  try {
    const { html, text } = refundCompletedTemplate(params);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `【返金完了のお知らせ】${params.courseName} - ${params.bookingNumber}`,
      html,
      text,
    });

    if (error) {
      console.error('[Email] Failed to send refund notification:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Refund notification sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Email] Exception while sending refund notification:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * マイページアクセス用メールを送信
 * メールアドレスからマイページにアクセスするためのトークン付きURLを送信
 */
export async function sendMypageAccessEmail(
  params: MypageAccessEmailParams
): Promise<EmailResult> {
  if (!resend) {
    console.warn('[Email] Resend API key not configured. Skipping email send.');
    console.log('[Email] Would have sent mypage access email to:', params.to);
    console.log('[Email] Mypage URL:', params.mypageUrl);
    return { success: true, messageId: 'dev-mode-skip' };
  }

  try {
    const { html, text } = mypageAccessTemplate(params);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: '【マイページアクセス】PrivateSky Tour',
      html,
      text,
    });

    if (error) {
      console.error('[Email] Failed to send mypage access email:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Mypage access email sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Email] Exception while sending mypage access email:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

// お礼メールのパラメータを再エクスポート
export type { ThankYouEmailParams };

/**
 * 前日リマインダーメールを送信（フライト前日送信）
 * 天候情報、集合場所・時間、緊急連絡先、持ち物、キャンセルポリシーを含む
 */
export async function sendReservationReminder1Day(
  params: ReservationReminderParams
): Promise<EmailResult> {
  if (!resend) {
    console.warn('[Email] Resend API key not configured. Skipping email send.');
    console.log('[Email] Would have sent 1-day reminder email to:', params.to);
    return { success: true, messageId: 'dev-mode-skip' };
  }

  try {
    const { html, text } = reservationReminder1DayTemplate(params);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `【明日のフライトのご案内】${params.courseName}`,
      html,
      text,
    });

    if (error) {
      console.error('[Email] Failed to send 1-day reminder email:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] 1-day reminder email sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Email] Exception while sending 1-day reminder email:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * 搭乗翌日お礼メールを送信
 * お礼メッセージ、次回予約の案内、SNSシェアの案内を含む
 */
export async function sendThankYouEmail(
  params: ThankYouEmailParams & { to: string }
): Promise<EmailResult> {
  if (!resend) {
    console.warn('[Email] Resend API key not configured. Skipping email send.');
    console.log('[Email] Would have sent thank you email to:', params.to);
    return { success: true, messageId: 'dev-mode-skip' };
  }

  try {
    const { html, text } = reservationThankYouTemplate(params);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `【ご搭乗ありがとうございました】${params.courseName}`,
      html,
      text,
    });

    if (error) {
      console.error('[Email] Failed to send thank you email:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Thank you email sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Email] Exception while sending thank you email:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * 前日リマインダーメールをスケジュール送信
 */
export async function scheduleReservationReminder1Day(
  params: ReservationReminderParams,
  scheduledAt: Date
): Promise<EmailResult> {
  if (!resend) {
    console.warn('[Email] Resend API key not configured. Skipping scheduled email.');
    console.log('[Email] Would have scheduled 1-day reminder for:', scheduledAt.toISOString());
    return { success: true, messageId: 'dev-mode-skip' };
  }

  try {
    const { html, text } = reservationReminder1DayTemplate(params);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `【明日のフライトのご案内】${params.courseName}`,
      html,
      text,
      scheduledAt: scheduledAt.toISOString(),
    });

    if (error) {
      console.error('[Email] Failed to schedule 1-day reminder email:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] 1-day reminder email scheduled successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Email] Exception while scheduling 1-day reminder email:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * お礼メールをスケジュール送信（搭乗翌日送信用）
 */
export async function scheduleThankYouEmail(
  params: ThankYouEmailParams & { to: string },
  scheduledAt: Date
): Promise<EmailResult> {
  if (!resend) {
    console.warn('[Email] Resend API key not configured. Skipping scheduled email.');
    console.log('[Email] Would have scheduled thank you email for:', scheduledAt.toISOString());
    return { success: true, messageId: 'dev-mode-skip' };
  }

  try {
    const { html, text } = reservationThankYouTemplate(params);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `【ご搭乗ありがとうございました】${params.courseName}`,
      html,
      text,
      scheduledAt: scheduledAt.toISOString(),
    });

    if (error) {
      console.error('[Email] Failed to schedule thank you email:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Thank you email scheduled successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Email] Exception while scheduling thank you email:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * 管理者向け新規予約通知メールを送信
 */
export async function sendAdminNewBookingNotification(
  params: AdminNewBookingParams
): Promise<EmailResult> {
  if (!resend) {
    console.warn('[Email] Resend API key not configured. Skipping email send.');
    console.log('[Email] Would have sent admin new booking notification to:', params.to);
    return { success: true, messageId: 'dev-mode-skip' };
  }

  try {
    const { html, text } = adminNewBookingTemplate(params);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `【新規予約】${params.courseName} - ${params.bookingNumber}`,
      html,
      text,
    });

    if (error) {
      console.error('[Email] Failed to send admin new booking notification:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Admin new booking notification sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Email] Exception while sending admin new booking notification:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * 管理者向けお問い合わせ通知メールを送信
 */
export async function sendAdminContactInquiryNotification(
  params: AdminContactInquiryParams
): Promise<EmailResult> {
  if (!resend) {
    console.warn('[Email] Resend API key not configured. Skipping email send.');
    console.log('[Email] Would have sent admin contact inquiry notification to:', params.to);
    return { success: true, messageId: 'dev-mode-skip' };
  }

  try {
    const { html, text } = adminContactInquiryTemplate(params);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `【お問い合わせ】${params.subject}`,
      html,
      text,
    });

    if (error) {
      console.error('[Email] Failed to send admin contact inquiry notification:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Admin contact inquiry notification sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Email] Exception while sending admin contact inquiry notification:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * 運営側キャンセル通知メールを送信（お客様宛）
 * 天候・運航上の理由で管理者がキャンセルした場合
 */
export async function sendAdminCancellationNotice(
  params: AdminCancellationNoticeParams
): Promise<EmailResult> {
  if (!resend) {
    console.warn('[Email] Resend API key not configured. Skipping email send.');
    console.log('[Email] Would have sent admin cancellation notice to:', params.to);
    return { success: true, messageId: 'dev-mode-skip' };
  }

  try {
    const { html, text } = adminCancellationNoticeTemplate(params);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `【予約キャンセルのお知らせ】${params.courseName} - ${params.bookingNumber}`,
      html,
      text,
    });

    if (error) {
      console.error('[Email] Failed to send admin cancellation notice:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Admin cancellation notice sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Email] Exception while sending admin cancellation notice:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * お問い合わせ受付確認メールを送信（お客様宛）
 */
export async function sendContactConfirmation(
  params: ContactConfirmationParams
): Promise<EmailResult> {
  if (!resend) {
    console.warn('[Email] Resend API key not configured. Skipping email send.');
    console.log('[Email] Would have sent contact confirmation to:', params.to);
    return { success: true, messageId: 'dev-mode-skip' };
  }

  try {
    const { html, text } = contactConfirmationTemplate(params);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `【お問い合わせ受付】${params.subject}`,
      html,
      text,
    });

    if (error) {
      console.error('[Email] Failed to send contact confirmation:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Contact confirmation sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Email] Exception while sending contact confirmation:', errorMessage);
    return { success: false, error: errorMessage };
  }
}
