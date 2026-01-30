import { describe, it, expect, vi, beforeEach } from 'vitest';

// Set env BEFORE importing the module so the Resend client is instantiated
process.env.RESEND_API_KEY = 'test-api-key';

const { mockSend } = vi.hoisted(() => {
  const mockSend = vi.fn();
  return { mockSend };
});

vi.mock('resend', () => {
  return {
    Resend: class MockResend {
      emails = { send: mockSend };
    },
  };
});

vi.mock('@/lib/email/templates/reservation-confirmed', () => ({
  reservationConfirmedTemplate: vi.fn(() => ({ html: '<p>confirmed</p>', text: 'confirmed' })),
}));
vi.mock('@/lib/email/templates/reservation-reminder', () => ({
  reservationReminderTemplate: vi.fn(() => ({ html: '<p>reminder</p>', text: 'reminder' })),
}));
vi.mock('@/lib/email/templates/reservation-reminder-3days', () => ({
  reservationReminder3DaysTemplate: vi.fn(() => ({ html: '<p>reminder-3d</p>', text: 'reminder-3d' })),
}));
vi.mock('@/lib/email/templates/reservation-reminder-1day', () => ({
  reservationReminder1DayTemplate: vi.fn(() => ({ html: '<p>reminder-1d</p>', text: 'reminder-1d' })),
}));
vi.mock('@/lib/email/templates/reservation-cancelled', () => ({
  reservationCancelledTemplate: vi.fn(() => ({ html: '<p>cancelled</p>', text: 'cancelled' })),
}));
vi.mock('@/lib/email/templates/refund-completed', () => ({
  refundCompletedTemplate: vi.fn(() => ({ html: '<p>refund</p>', text: 'refund' })),
}));
vi.mock('@/lib/email/templates/mypage-access', () => ({
  mypageAccessTemplate: vi.fn(() => ({ html: '<p>mypage</p>', text: 'mypage' })),
}));
vi.mock('@/lib/email/templates/reservation-thankyou', () => ({
  reservationThankYouTemplate: vi.fn(() => ({ html: '<p>thankyou</p>', text: 'thankyou' })),
}));
vi.mock('@/lib/email/templates/admin-new-booking', () => ({
  adminNewBookingTemplate: vi.fn(() => ({ html: '<p>admin-booking</p>', text: 'admin-booking' })),
}));
vi.mock('@/lib/email/templates/admin-contact-inquiry', () => ({
  adminContactInquiryTemplate: vi.fn(() => ({ html: '<p>admin-inquiry</p>', text: 'admin-inquiry' })),
}));
vi.mock('@/lib/email/templates/admin-cancellation-notice', () => ({
  adminCancellationNoticeTemplate: vi.fn(() => ({ html: '<p>admin-cancel</p>', text: 'admin-cancel' })),
}));
vi.mock('@/lib/email/templates/contact-confirmation', () => ({
  contactConfirmationTemplate: vi.fn(() => ({ html: '<p>contact-confirm</p>', text: 'contact-confirm' })),
}));

import {
  sendReservationConfirmation,
  sendReservationReminder3Days,
  sendCancellationConfirmation,
  sendRefundNotification,
  sendMypageAccessEmail,
  sendThankYouEmail,
  sendAdminNewBookingNotification,
  sendAdminContactInquiryNotification,
  sendContactConfirmation,
  scheduleReservationReminder,
  scheduleReservationReminder1Day,
  scheduleThankYouEmail,
  type ReservationConfirmationParams,
  type ReservationReminderParams,
  type CancellationConfirmationParams,
  type RefundNotificationParams,
  type MypageAccessEmailParams,
  type AdminNewBookingParams,
  type AdminContactInquiryParams,
  type ContactConfirmationParams,
} from '@/lib/email/client';
import type { ThankYouEmailParams } from '@/lib/email/templates/reservation-thankyou';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const confirmationParams: ReservationConfirmationParams = {
  to: 'customer@example.com',
  customerName: 'Test Customer',
  courseName: 'Tokyo Sky Cruise',
  flightDate: '2024年6月15日',
  flightTime: '10:00',
  pax: 2,
  totalPrice: 110000,
  bookingNumber: 'HF-20240615-0001',
  heliportName: 'Tokyo Heliport',
  heliportAddress: '1-1 Shin-Kiba, Koto-ku',
  mypageUrl: 'https://example.com/mypage?token=abc',
};

const reminderParams: ReservationReminderParams = {
  to: 'customer@example.com',
  customerName: 'Test Customer',
  courseName: 'Tokyo Sky Cruise',
  flightDate: '2024年6月15日',
  flightTime: '10:00',
  pax: 2,
  bookingNumber: 'HF-20240615-0001',
  heliportName: 'Tokyo Heliport',
  heliportAddress: '1-1 Shin-Kiba, Koto-ku',
};

const cancellationParams: CancellationConfirmationParams = {
  to: 'customer@example.com',
  customerName: 'Test Customer',
  courseName: 'Tokyo Sky Cruise',
  flightDate: '2024年6月15日',
  flightTime: '10:00',
  bookingNumber: 'HF-20240615-0001',
  cancellationFee: 5000,
  refundAmount: 105000,
  originalAmount: 110000,
};

const refundParams: RefundNotificationParams = {
  to: 'customer@example.com',
  customerName: 'Test Customer',
  courseName: 'Tokyo Sky Cruise',
  bookingNumber: 'HF-20240615-0001',
  refundAmount: 105000,
  refundDate: '2024年6月16日',
};

const mypageParams: MypageAccessEmailParams = {
  to: 'customer@example.com',
  customerName: 'Test Customer',
  mypageUrl: 'https://example.com/mypage?token=abc',
  expiresAt: '2024年6月16日 10:00',
};

const thankYouParams: ThankYouEmailParams & { to: string } = {
  to: 'customer@example.com',
  customerName: 'Test Customer',
  courseName: 'Tokyo Sky Cruise',
  flightDate: '2024年6月15日',
  bookingNumber: 'HF-20240615-0001',
};

const adminBookingParams: AdminNewBookingParams = {
  to: 'admin@example.com',
  customerName: 'Test Customer',
  customerEmail: 'customer@example.com',
  customerPhone: '090-1234-5678',
  courseName: 'Tokyo Sky Cruise',
  flightDate: '2024年6月15日',
  flightTime: '10:00',
  pax: 2,
  totalPrice: 110000,
  bookingNumber: 'HF-20240615-0001',
};

const adminInquiryParams: AdminContactInquiryParams = {
  to: 'admin@example.com',
  customerName: 'Test Customer',
  customerEmail: 'customer@example.com',
  subject: 'Question about booking',
  message: 'I would like to reschedule my flight.',
};

const contactConfirmationParams: ContactConfirmationParams = {
  to: 'customer@example.com',
  customerName: 'Test Customer',
  subject: 'Question about booking',
  message: 'I would like to reschedule my flight.',
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Email Client', () => {
  beforeEach(() => {
    mockSend.mockReset();
  });

  // -------------------------------------------------------------------------
  // Dev mode: resend is null
  // We test this by dynamically re-importing the module without the API key.
  // -------------------------------------------------------------------------
  describe('Dev mode (no API key)', () => {
    it('sendReservationConfirmation returns dev-mode-skip when resend is null', async () => {
      const originalKey = process.env.RESEND_API_KEY;
      delete process.env.RESEND_API_KEY;

      vi.resetModules();
      const { sendReservationConfirmation: fn } = await import('@/lib/email/client');

      const result = await fn(confirmationParams);
      expect(result).toEqual({ success: true, messageId: 'dev-mode-skip' });
      expect(mockSend).not.toHaveBeenCalled();

      process.env.RESEND_API_KEY = originalKey;
    });

    it('sendCancellationConfirmation returns dev-mode-skip when resend is null', async () => {
      const originalKey = process.env.RESEND_API_KEY;
      delete process.env.RESEND_API_KEY;

      vi.resetModules();
      const { sendCancellationConfirmation: fn } = await import('@/lib/email/client');

      const result = await fn(cancellationParams);
      expect(result).toEqual({ success: true, messageId: 'dev-mode-skip' });
      expect(mockSend).not.toHaveBeenCalled();

      process.env.RESEND_API_KEY = originalKey;
    });

    it('scheduleReservationReminder returns dev-mode-skip when resend is null', async () => {
      const originalKey = process.env.RESEND_API_KEY;
      delete process.env.RESEND_API_KEY;

      vi.resetModules();
      const { scheduleReservationReminder: fn } = await import('@/lib/email/client');

      const scheduledAt = new Date('2024-06-14T10:00:00Z');
      const result = await fn(reminderParams, scheduledAt);
      expect(result).toEqual({ success: true, messageId: 'dev-mode-skip' });
      expect(mockSend).not.toHaveBeenCalled();

      process.env.RESEND_API_KEY = originalKey;
    });

    it('sendAdminNewBookingNotification returns dev-mode-skip when resend is null', async () => {
      const originalKey = process.env.RESEND_API_KEY;
      delete process.env.RESEND_API_KEY;

      vi.resetModules();
      const { sendAdminNewBookingNotification: fn } = await import('@/lib/email/client');

      const result = await fn(adminBookingParams);
      expect(result).toEqual({ success: true, messageId: 'dev-mode-skip' });
      expect(mockSend).not.toHaveBeenCalled();

      process.env.RESEND_API_KEY = originalKey;
    });
  });

  // -------------------------------------------------------------------------
  // Standard email functions: success / Resend error / exception
  // -------------------------------------------------------------------------
  describe.each([
    {
      name: 'sendReservationConfirmation',
      fn: () => sendReservationConfirmation(confirmationParams),
    },
    {
      name: 'sendReservationReminder3Days',
      fn: () => sendReservationReminder3Days(reminderParams),
    },
    {
      name: 'sendCancellationConfirmation',
      fn: () => sendCancellationConfirmation(cancellationParams),
    },
    {
      name: 'sendRefundNotification',
      fn: () => sendRefundNotification(refundParams),
    },
    {
      name: 'sendMypageAccessEmail',
      fn: () => sendMypageAccessEmail(mypageParams),
    },
    {
      name: 'sendThankYouEmail',
      fn: () => sendThankYouEmail(thankYouParams),
    },
    {
      name: 'sendAdminNewBookingNotification',
      fn: () => sendAdminNewBookingNotification(adminBookingParams),
    },
    {
      name: 'sendAdminContactInquiryNotification',
      fn: () => sendAdminContactInquiryNotification(adminInquiryParams),
    },
    {
      name: 'sendContactConfirmation',
      fn: () => sendContactConfirmation(contactConfirmationParams),
    },
  ])('$name', ({ fn }) => {
    it('returns success with messageId on successful send', async () => {
      mockSend.mockResolvedValueOnce({
        data: { id: 'msg_test_123' },
        error: null,
      });

      const result = await fn();

      expect(result).toEqual({ success: true, messageId: 'msg_test_123' });
      expect(mockSend).toHaveBeenCalledOnce();
    });

    it('returns failure when Resend returns an error', async () => {
      mockSend.mockResolvedValueOnce({
        data: null,
        error: { message: 'Rate limit exceeded', name: 'rate_limit_exceeded' },
      });

      const result = await fn();

      expect(result).toEqual({ success: false, error: 'Rate limit exceeded' });
      expect(mockSend).toHaveBeenCalledOnce();
    });
  });

  // -------------------------------------------------------------------------
  // Exception handling (tested on a subset to keep test count reasonable)
  // -------------------------------------------------------------------------
  describe.each([
    {
      name: 'sendReservationConfirmation',
      fn: () => sendReservationConfirmation(confirmationParams),
    },
    {
      name: 'sendCancellationConfirmation',
      fn: () => sendCancellationConfirmation(cancellationParams),
    },
    {
      name: 'sendContactConfirmation',
      fn: () => sendContactConfirmation(contactConfirmationParams),
    },
  ])('$name - exception handling', ({ fn }) => {
    it('catches thrown Error and returns failure', async () => {
      mockSend.mockRejectedValueOnce(new Error('Network timeout'));

      const result = await fn();

      expect(result).toEqual({ success: false, error: 'Network timeout' });
    });

    it('handles non-Error thrown values', async () => {
      mockSend.mockRejectedValueOnce('unexpected string error');

      const result = await fn();

      expect(result).toEqual({ success: false, error: 'Unknown error' });
    });
  });

  // -------------------------------------------------------------------------
  // Scheduled email functions: verify scheduledAt is passed through
  // -------------------------------------------------------------------------
  describe('Scheduled email functions', () => {
    const scheduledAt = new Date('2024-06-14T10:00:00Z');

    it('scheduleReservationReminder passes scheduledAt to Resend', async () => {
      mockSend.mockResolvedValueOnce({
        data: { id: 'msg_scheduled_1' },
        error: null,
      });

      const result = await scheduleReservationReminder(reminderParams, scheduledAt);

      expect(result).toEqual({ success: true, messageId: 'msg_scheduled_1' });
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          scheduledAt: '2024-06-14T10:00:00.000Z',
        })
      );
    });

    it('scheduleReservationReminder1Day passes scheduledAt to Resend', async () => {
      mockSend.mockResolvedValueOnce({
        data: { id: 'msg_scheduled_2' },
        error: null,
      });

      const result = await scheduleReservationReminder1Day(reminderParams, scheduledAt);

      expect(result).toEqual({ success: true, messageId: 'msg_scheduled_2' });
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          scheduledAt: '2024-06-14T10:00:00.000Z',
        })
      );
    });

    it('scheduleThankYouEmail passes scheduledAt to Resend', async () => {
      mockSend.mockResolvedValueOnce({
        data: { id: 'msg_scheduled_3' },
        error: null,
      });

      const result = await scheduleThankYouEmail(thankYouParams, scheduledAt);

      expect(result).toEqual({ success: true, messageId: 'msg_scheduled_3' });
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          scheduledAt: '2024-06-14T10:00:00.000Z',
        })
      );
    });
  });
});
