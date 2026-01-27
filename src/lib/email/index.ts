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
  type EmailResult,
  type ReservationConfirmationParams,
  type ReservationReminderParams,
  type CancellationConfirmationParams,
  type RefundNotificationParams,
  type MypageAccessEmailParams,
} from './client';

// メールテンプレート
export { reservationConfirmedTemplate } from './templates/reservation-confirmed';
export { reservationReminderTemplate } from './templates/reservation-reminder';
export { reservationReminder3DaysTemplate } from './templates/reservation-reminder-3days';
export { reservationCancelledTemplate } from './templates/reservation-cancelled';
export { refundCompletedTemplate } from './templates/refund-completed';
export { mypageAccessTemplate } from './templates/mypage-access';
