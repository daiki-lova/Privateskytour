import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mock setup (vi.hoisted) ---

const mockAdminClient = vi.hoisted(() => ({
  from: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: vi.fn(() => mockAdminClient),
}));

const mockSendReminder3Days = vi.hoisted(() =>
  vi.fn(() => Promise.resolve({ success: true } as { success: boolean; error?: string }))
);
const mockSendReminder1Day = vi.hoisted(() =>
  vi.fn(() => Promise.resolve({ success: true } as { success: boolean; error?: string }))
);

vi.mock('@/lib/email/client', () => ({
  sendReservationReminder3Days: mockSendReminder3Days,
  sendReservationReminder1Day: mockSendReminder1Day,
}));

// --- Import AFTER mocks ---

import { GET } from '@/app/api/cron/send-reminders/route';

// --- Environment ---

process.env.CRON_SECRET = 'test-cron-secret';

// --- Helpers ---

function createRequest(authHeader?: string): Request {
  return new Request('http://localhost:3000/api/cron/send-reminders', {
    headers: authHeader ? { authorization: authHeader } : {},
  });
}

function createReservationData(overrides: Record<string, unknown> = {}) {
  return {
    id: 'res-1',
    booking_number: 'HF-20240618-0001',
    pax: 2,
    customer_id: 'cust-1',
    slot_id: 'slot-1',
    customers: { id: 'cust-1', name: 'Test Customer', email: 'test@example.com' },
    slots: {
      id: 'slot-1',
      slot_date: '2024-06-18',
      slot_time: '10:00:00',
      course_id: 'course-1',
      courses: {
        id: 'course-1',
        title: 'Test Course',
        heliport_id: 'hp-1',
        heliports: {
          id: 'hp-1',
          name: 'Test Heliport',
          address: 'Test Address',
          google_map_url: 'https://maps.google.com',
        },
      },
    },
    ...overrides,
  };
}

/**
 * Supabase chain: .from().select().eq().eq()
 * The second .eq() resolves the promise.
 */
function mockFromChain(resolvedValue: { data: unknown; error: unknown }) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue(resolvedValue),
      }),
    }),
  };
}

// --- Tests ---

describe('GET /api/cron/send-reminders', () => {
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
  // 3-day reminders
  // =====================
  describe('3-day reminders', () => {
    it('handles no reservations found for 3-day reminder', async () => {
      // Both queries return empty arrays
      const emptyChain = mockFromChain({ data: [], error: null });
      mockAdminClient.from.mockReturnValue(emptyChain);

      const request = createRequest('Bearer test-cron-secret');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.summary.sent).toBe(0);
      expect(body.summary.total).toBe(0);
    });

    it('sends 3-day reminder emails for found reservations', async () => {
      const reservations = [
        createReservationData(),
        createReservationData({
          id: 'res-2',
          booking_number: 'HF-20240618-0002',
          customers: { id: 'cust-2', name: 'Customer 2', email: 'cust2@example.com' },
        }),
      ];

      // First from() call: 3-day query returns reservations
      // Second from() call: 1-day query returns empty
      let callIndex = 0;
      mockAdminClient.from.mockImplementation(() => {
        callIndex++;
        if (callIndex === 1) {
          return mockFromChain({ data: reservations, error: null });
        }
        return mockFromChain({ data: [], error: null });
      });

      const request = createRequest('Bearer test-cron-secret');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.summary.sent).toBe(2);
      expect(body.summary.total).toBe(2);
      expect(mockSendReminder3Days).toHaveBeenCalledTimes(2);
      expect(mockSendReminder3Days).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          customerName: 'Test Customer',
          courseName: 'Test Course',
          heliportName: 'Test Heliport',
        })
      );
    });

    it('records failure when 3-day email send fails', async () => {
      const reservations = [createReservationData()];
      mockSendReminder3Days.mockResolvedValueOnce({ success: false, error: 'SMTP error' });

      let callIndex = 0;
      mockAdminClient.from.mockImplementation(() => {
        callIndex++;
        if (callIndex === 1) {
          return mockFromChain({ data: reservations, error: null });
        }
        return mockFromChain({ data: [], error: null });
      });

      const request = createRequest('Bearer test-cron-secret');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.summary.sent).toBe(0);
      expect(body.summary.failed).toBe(1);
      expect(body.details[0].success).toBe(false);
      expect(body.details[0].error).toBe('SMTP error');
    });

    it('continues processing when 3-day DB query returns error', async () => {
      // First from() call: 3-day query errors
      // Second from() call: 1-day query returns empty
      let callIndex = 0;
      mockAdminClient.from.mockImplementation(() => {
        callIndex++;
        if (callIndex === 1) {
          return mockFromChain({ data: null, error: { message: 'DB connection failed' } });
        }
        return mockFromChain({ data: [], error: null });
      });

      const request = createRequest('Bearer test-cron-secret');
      const response = await GET(request);

      // Route does not abort on 3-day error; it logs and continues to 1-day
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.summary.total).toBe(0);
    });
  });

  // =====================
  // 1-day reminders
  // =====================
  describe('1-day reminders', () => {
    it('sends 1-day reminder emails for found reservations', async () => {
      const reservations = [createReservationData()];

      let callIndex = 0;
      mockAdminClient.from.mockImplementation(() => {
        callIndex++;
        if (callIndex === 1) {
          return mockFromChain({ data: [], error: null });
        }
        return mockFromChain({ data: reservations, error: null });
      });

      const request = createRequest('Bearer test-cron-secret');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.summary.sent).toBe(1);
      expect(mockSendReminder1Day).toHaveBeenCalledTimes(1);
      expect(mockSendReminder1Day).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          bookingNumber: 'HF-20240618-0001',
          flightTime: '10:00',
        })
      );
    });

    it('records failure when 1-day email send fails', async () => {
      const reservations = [createReservationData()];
      mockSendReminder1Day.mockResolvedValueOnce({ success: false, error: 'Delivery failed' });

      let callIndex = 0;
      mockAdminClient.from.mockImplementation(() => {
        callIndex++;
        if (callIndex === 1) {
          return mockFromChain({ data: [], error: null });
        }
        return mockFromChain({ data: reservations, error: null });
      });

      const request = createRequest('Bearer test-cron-secret');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.summary.failed).toBe(1);
      expect(body.details[0].type).toBe('1day');
      expect(body.details[0].success).toBe(false);
    });

    it('continues processing when 1-day DB query returns error', async () => {
      let callIndex = 0;
      mockAdminClient.from.mockImplementation(() => {
        callIndex++;
        if (callIndex === 1) {
          return mockFromChain({ data: [], error: null });
        }
        return mockFromChain({ data: null, error: { message: '1-day query failed' } });
      });

      const request = createRequest('Bearer test-cron-secret');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.summary.total).toBe(0);
    });
  });

  // =====================
  // Summary / combined
  // =====================
  describe('Summary', () => {
    it('returns correct counts when both reminder types have results', async () => {
      const threeDayRes = [createReservationData()];
      const oneDayRes = [
        createReservationData({
          id: 'res-2',
          booking_number: 'HF-20240619-0001',
          customers: { id: 'cust-2', name: 'Customer 2', email: 'cust2@example.com' },
        }),
      ];

      let callIndex = 0;
      mockAdminClient.from.mockImplementation(() => {
        callIndex++;
        if (callIndex === 1) {
          return mockFromChain({ data: threeDayRes, error: null });
        }
        return mockFromChain({ data: oneDayRes, error: null });
      });

      const request = createRequest('Bearer test-cron-secret');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.summary.sent).toBe(2);
      expect(body.summary.failed).toBe(0);
      expect(body.summary.total).toBe(2);
      expect(body.details).toHaveLength(2);
      expect(body.details[0].type).toBe('3day');
      expect(body.details[1].type).toBe('1day');
    });

    it('returns mixed success/failure counts', async () => {
      const threeDayRes = [createReservationData()];
      const oneDayRes = [
        createReservationData({
          id: 'res-2',
          booking_number: 'HF-20240619-0001',
          customers: { id: 'cust-2', name: 'Customer 2', email: 'cust2@example.com' },
        }),
      ];

      // 3-day succeeds, 1-day fails
      mockSendReminder3Days.mockResolvedValueOnce({ success: true });
      mockSendReminder1Day.mockResolvedValueOnce({ success: false, error: 'Failed' });

      let callIndex = 0;
      mockAdminClient.from.mockImplementation(() => {
        callIndex++;
        if (callIndex === 1) {
          return mockFromChain({ data: threeDayRes, error: null });
        }
        return mockFromChain({ data: oneDayRes, error: null });
      });

      const request = createRequest('Bearer test-cron-secret');
      const response = await GET(request);

      const body = await response.json();
      expect(body.summary.sent).toBe(1);
      expect(body.summary.failed).toBe(1);
      expect(body.summary.total).toBe(2);
    });

    it('returns 500 with error message on unexpected exception', async () => {
      mockAdminClient.from.mockImplementation(() => {
        throw new Error('Unexpected crash');
      });

      const request = createRequest('Bearer test-cron-secret');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe('Unexpected crash');
      expect(body.details).toEqual([]);
    });
  });
});
