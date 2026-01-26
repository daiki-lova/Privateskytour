// Resend メールクライアントと送信関数
export {
  resend,
  sendReservationConfirmation,
  sendReservationReminder,
  scheduleReservationReminder,
  type EmailResult,
  type ReservationConfirmationParams,
  type ReservationReminderParams,
} from './client';

// メールテンプレート
export { reservationConfirmedTemplate } from './templates/reservation-confirmed';
export { reservationReminderTemplate } from './templates/reservation-reminder';
