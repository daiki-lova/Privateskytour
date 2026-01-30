import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mock setup (vi.hoisted) ---

const mockAdminClient = vi.hoisted(() => ({
  from: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: vi.fn(() => mockAdminClient),
}));

const mockSendThankYouEmail = vi.hoisted(() =>
  vi.fn(() => Promise.resolve({ success: true } as { success: boolean; error?: string }))
);

vi.mock('@/lib/email/client', () => ({
  sendThankYouEmail: mockSendThankYouEmail,
}));

// --- Import AFTER mocks ---

import { GET } from '@/app/api/cron/send-thankyou/route';

// --- Environment ---

process.env.CRON_SECRET = 'test-cron-secret';
process.env.NEXT_PUBLIC_APP_URL = 'https://tour.privatesky.co.jp';

// --- Helpers ---

function createRequest(authHeader?: string): Request {
  return new Request('http://localhost:3000/api/cron/send-thankyou', {
    headers: authHeader ? { authorization: authHeader } : {},
  });
}

function createReservationData(overrides: Record<string, unknown> = {}) {
  return {
    id: 'res-1',
    booking_number: 'HF-20240614-0001',
    pax: 2,
    customer_id: 'cust-1',
    slot_id: 'slot-1',
    customers: {
      id: 'cust-1',
      name: 'Test Customer',
      email: 'test@example.com',
      mypage_token: 'abc123',
    },
    slots: {
      id: 'slot-1',
      slot_date: '2024-06-14',
      slot_time: '10:00:00',
      course_id: 'course-1',
      courses: { id: 'course-1', title: 'Test Course' },
    },
    ...overrides,
  };
}

/**
 * Supabase select chain: .from().select().eq().eq()
 */
function mockSelectChain(resolvedValue: { data: unknown; error: unknown }) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue(resolvedValue),
      }),
    }),
  };
}

/**
 * Supabase update chain: .from().update().eq()
 */
function mockUpdateChain(resolvedValue: { error: unknown }) {
  return {
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue(resolvedValue),
    }),
  };
}

// --- Tests ---

describe('GET /api/cron/send-thankyou', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =====================
  // Auth
  // =====================
  describe('Authentication', () => {
    it('returns 401 when no authorization header is provided', async () => {
      const request = createRequest();
      const response = await GET(request);

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe('Unauthorized');
    });

    it('returns 401 when the secret is incorrect', async () => {
      const request = createRequest('Bearer wrong-secret');
      const response = await GET(request);

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe('Unauthorized');
    });
  });

  // =====================
  // No reservations
  // =====================
  describe('No reservations', () => {
    it('returns empty summary when no reservations found', async () => {
      mockAdminClient.from.mockReturnValue(
        mockSelectChain({ data: [], error: null })
      );

      const request = createRequest('Bearer test-cron-secret');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.summary).toEqual({ sent: 0, failed: 0, total: 0 });
      expect(body.details).toEqual([]);
      expect(mockSendThankYouEmail).not.toHaveBeenCalled();
    });
  });

  // =====================
  // Email + status update
  // =====================
  describe('Email sending and status update', () => {
    it('sends thank-you emails and updates status to completed', async () => {
      const reservations = [createReservationData()];

      let fromCallIndex = 0;
      mockAdminClient.from.mockImplementation(() => {
        fromCallIndex++;
        if (fromCallIndex === 1) {
          // Select query for reservations
          return mockSelectChain({ data: reservations, error: null });
        }
        // Update query for status
        return mockUpdateChain({ error: null });
      });

      const request = createRequest('Bearer test-cron-secret');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.summary.sent).toBe(1);
      expect(body.summary.statusUpdated).toBe(1);
      expect(body.summary.total).toBe(1);
      expect(mockSendThankYouEmail).toHaveBeenCalledTimes(1);
      expect(mockSendThankYouEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          customerName: 'Test Customer',
          courseName: 'Test Course',
          bookingNumber: 'HF-20240614-0001',
          mypageUrl: 'https://tour.privatesky.co.jp/mypage?token=abc123',
        })
      );
    });

    it('sends emails for multiple reservations', async () => {
      const reservations = [
        createReservationData(),
        createReservationData({
          id: 'res-2',
          booking_number: 'HF-20240614-0002',
          customers: {
            id: 'cust-2',
            name: 'Customer 2',
            email: 'cust2@example.com',
            mypage_token: null,
          },
        }),
      ];

      let fromCallIndex = 0;
      mockAdminClient.from.mockImplementation(() => {
        fromCallIndex++;
        if (fromCallIndex === 1) {
          return mockSelectChain({ data: reservations, error: null });
        }
        return mockUpdateChain({ error: null });
      });

      const request = createRequest('Bearer test-cron-secret');
      const response = await GET(request);

      const body = await response.json();
      expect(body.summary.sent).toBe(2);
      expect(body.summary.statusUpdated).toBe(2);
      expect(mockSendThankYouEmail).toHaveBeenCalledTimes(2);

      // Second reservation has no mypage_token, so mypageUrl should be undefined
      const calls = mockSendThankYouEmail.mock.calls as unknown as [Record<string, unknown>][];
      const secondCall = calls[1][0];
      expect(secondCall.mypageUrl).toBeUndefined();
    });

    it('skips status update when email send fails', async () => {
      const reservations = [createReservationData()];
      mockSendThankYouEmail.mockResolvedValueOnce({ success: false, error: 'SMTP error' });

      mockAdminClient.from.mockReturnValue(
        mockSelectChain({ data: reservations, error: null })
      );

      const request = createRequest('Bearer test-cron-secret');
      const response = await GET(request);

      const body = await response.json();
      expect(body.summary.sent).toBe(0);
      expect(body.summary.failed).toBe(1);
      expect(body.summary.statusUpdated).toBe(0);
      expect(body.details[0].emailSent).toBe(false);
      expect(body.details[0].statusUpdated).toBe(false);
      // The update chain should not have been called (from() only called once for select)
    });

    it('records statusUpdated=false when update query fails', async () => {
      const reservations = [createReservationData()];

      let fromCallIndex = 0;
      mockAdminClient.from.mockImplementation(() => {
        fromCallIndex++;
        if (fromCallIndex === 1) {
          return mockSelectChain({ data: reservations, error: null });
        }
        return mockUpdateChain({ error: { message: 'Update failed' } });
      });

      const request = createRequest('Bearer test-cron-secret');
      const response = await GET(request);

      const body = await response.json();
      expect(body.summary.sent).toBe(1);
      expect(body.summary.statusUpdated).toBe(0);
      expect(body.details[0].emailSent).toBe(true);
      expect(body.details[0].statusUpdated).toBe(false);
    });
  });

  // =====================
  // Error handling
  // =====================
  describe('Error handling', () => {
    it('returns 500 when DB fetch query fails', async () => {
      mockAdminClient.from.mockReturnValue(
        mockSelectChain({ data: null, error: { message: 'DB connection lost' } })
      );

      const request = createRequest('Bearer test-cron-secret');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe('DB connection lost');
    });

    it('returns 500 with error message on unexpected exception', async () => {
      mockAdminClient.from.mockImplementation(() => {
        throw new Error('Runtime crash');
      });

      const request = createRequest('Bearer test-cron-secret');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe('Runtime crash');
    });

    it('handles non-Error thrown values gracefully', async () => {
      mockAdminClient.from.mockImplementation(() => {
        throw 'string error'; // eslint-disable-line no-throw-literal
      });

      const request = createRequest('Bearer test-cron-secret');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe('Unknown error');
    });
  });
});
