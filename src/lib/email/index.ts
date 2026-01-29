// Resend メールクライアントと送信関数
export {
  resend,
  sendReservationConfirmation,
  sendReservationReminder,
  sendReservationReminder3Days,
  scheduleReservationReminder,
  sendCancellationConfirmation,
  sendRefundNotification,
  sendMypageAccessEmail,
  sendAdminNewBookingNotification,
  sendAdminContactInquiryNotification,
  sendAdminCancellationNotice,
  sendContactConfirmation,
  type EmailResult,
  type ReservationConfirmationParams,
  type ReservationReminderParams,
  type CancellationConfirmationParams,
  type RefundNotificationParams,
  type MypageAccessEmailParams,
  type AdminNewBookingParams,
  type AdminContactInquiryParams,
  type AdminCancellationNoticeParams,
  type ContactConfirmationParams,
} from './client';

// メールテンプレート
export { reservationConfirmedTemplate } from './templates/reservation-confirmed';
export { reservationReminderTemplate } from './templates/reservation-reminder';
export { reservationReminder3DaysTemplate } from './templates/reservation-reminder-3days';
export { reservationCancelledTemplate } from './templates/reservation-cancelled';
export { refundCompletedTemplate } from './templates/refund-completed';
export { mypageAccessTemplate } from './templates/mypage-access';
export { adminNewBookingTemplate } from './templates/admin-new-booking';
export { adminContactInquiryTemplate } from './templates/admin-contact-inquiry';
export { adminCancellationNoticeTemplate } from './templates/admin-cancellation-notice';
export { contactConfirmationTemplate } from './templates/contact-confirmation';
