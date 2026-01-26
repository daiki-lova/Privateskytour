import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Use vi.hoisted to define mocks before they're used
const mockSupabaseClient = vi.hoisted(() => ({
  from: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}));

// Import after mocking
import { POST } from '@/app/api/public/reservations/route';

// Helper to create NextRequest
function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/public/reservations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

// Valid reservation data
const validReservationData = {
  courseId: '550e8400-e29b-41d4-a716-446655440001',
  slotId: '550e8400-e29b-41d4-a716-446655440002',
  reservationDate: '2024-06-15',
  reservationTime: '10:00',
  customer: {
    email: 'test@example.com',
    name: 'Test Customer',
    phone: '090-1234-5678',
  },
  passengers: [{ name: 'Passenger 1' }, { name: 'Passenger 2' }],
  healthConfirmed: true,
  termsAccepted: true,
  privacyAccepted: true,
};

describe('POST /api/public/reservations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Validation Errors', () => {
    it('courseIdがない場合は400エラーを返す', async () => {
      const body = { ...validReservationData };
      delete (body as Record<string, unknown>).courseId;

      const request = createRequest(body);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('courseId is required');
    });

    it('slotIdがない場合は400エラーを返す', async () => {
      const body = { ...validReservationData };
      delete (body as Record<string, unknown>).slotId;

      const request = createRequest(body);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('slotId is required');
    });

    it('reservationDateがない場合は400エラーを返す', async () => {
      const body = { ...validReservationData };
      delete (body as Record<string, unknown>).reservationDate;

      const request = createRequest(body);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('reservationDate is required');
    });

    it('reservationTimeがない場合は400エラーを返す', async () => {
      const body = { ...validReservationData };
      delete (body as Record<string, unknown>).reservationTime;

      const request = createRequest(body);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('reservationTime is required');
    });

    it('customerオブジェクトがない場合は400エラーを返す', async () => {
      const body = { ...validReservationData };
      delete (body as Record<string, unknown>).customer;

      const request = createRequest(body);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('customer information is required');
    });

    it('customer.emailがない場合は400エラーを返す', async () => {
      const body = {
        ...validReservationData,
        customer: { name: 'Test' },
      };

      const request = createRequest(body);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('customer.email is required');
    });

    it('customer.nameがない場合は400エラーを返す', async () => {
      const body = {
        ...validReservationData,
        customer: { email: 'test@example.com' },
      };

      const request = createRequest(body);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('customer.name is required');
    });

    it('無効なメールフォーマットの場合は400エラーを返す', async () => {
      const body = {
        ...validReservationData,
        customer: { email: 'invalid-email', name: 'Test' },
      };

      const request = createRequest(body);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Invalid email format');
    });

    it('passengersが空配列の場合は400エラーを返す', async () => {
      const body = {
        ...validReservationData,
        passengers: [],
      };

      const request = createRequest(body);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('At least one passenger is required');
    });

    it('passenger.nameがない場合は400エラーを返す', async () => {
      const body = {
        ...validReservationData,
        passengers: [{ weightKg: 70 }],
      };

      const request = createRequest(body);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('passengers[0].name is required');
    });

    it('healthConfirmedがfalseの場合は400エラーを返す', async () => {
      const body = {
        ...validReservationData,
        healthConfirmed: false,
      };

      const request = createRequest(body);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Health confirmation is required');
    });

    it('termsAcceptedがfalseの場合は400エラーを返す', async () => {
      const body = {
        ...validReservationData,
        termsAccepted: false,
      };

      const request = createRequest(body);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Terms acceptance is required');
    });

    it('privacyAcceptedがfalseの場合は400エラーを返す', async () => {
      const body = {
        ...validReservationData,
        privacyAccepted: false,
      };

      const request = createRequest(body);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Privacy acceptance is required');
    });

    it('無効なcourseId形式（UUID以外）の場合は400エラーを返す', async () => {
      const body = {
        ...validReservationData,
        courseId: 'invalid-uuid',
      };

      const request = createRequest(body);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Invalid courseId format');
    });

    it('無効なslotId形式（UUID以外）の場合は400エラーを返す', async () => {
      const body = {
        ...validReservationData,
        slotId: 'invalid-uuid',
      };

      const request = createRequest(body);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Invalid slotId format');
    });

    it('無効な日付形式の場合は400エラーを返す', async () => {
      const body = {
        ...validReservationData,
        reservationDate: '2024/06/15',
      };

      const request = createRequest(body);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Invalid reservationDate format. Use YYYY-MM-DD');
    });

    it('無効な時間形式の場合は400エラーを返す', async () => {
      const body = {
        ...validReservationData,
        reservationTime: '10:00:00',
      };

      const request = createRequest(body);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Invalid reservationTime format. Use HH:mm');
    });

    it('無効なJSONボディの場合は400エラーを返す', async () => {
      const request = new NextRequest('http://localhost:3000/api/public/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Invalid JSON body');
    });
  });

  describe('Slot Availability', () => {
    it('存在しないスロットの場合は404エラーを返す', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
          }),
        }),
      });

      const request = createRequest(validReservationData);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Slot not found');
    });

    it('スロットのステータスがopen以外の場合は409エラーを返す', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: validReservationData.slotId, max_pax: 4, current_pax: 0, status: 'closed' },
              error: null,
            }),
          }),
        }),
      });

      const request = createRequest(validReservationData);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(409);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Slot is not available');
    });

    it('空きがない場合は409エラーを返す', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: validReservationData.slotId, max_pax: 2, current_pax: 1, status: 'open' },
              error: null,
            }),
          }),
        }),
      });

      const request = createRequest(validReservationData);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(409);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Not enough availability. Only 1 spots available.');
    });
  });

  describe('Course Validation', () => {
    it('存在しないコースの場合は404エラーを返す', async () => {
      // Mock slot (success)
      const slotMock = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: validReservationData.slotId, max_pax: 4, current_pax: 0, status: 'open' },
              error: null,
            }),
          }),
        }),
      };

      // Mock course (not found)
      const courseMock = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
          }),
        }),
      };

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'slots') return slotMock;
        if (table === 'courses') return courseMock;
        return slotMock;
      });

      const request = createRequest(validReservationData);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Course not found');
    });

    it('非アクティブなコースの場合は409エラーを返す', async () => {
      // Mock slot (success)
      const slotMock = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: validReservationData.slotId, max_pax: 4, current_pax: 0, status: 'open' },
              error: null,
            }),
          }),
        }),
      };

      // Mock course (inactive)
      const courseMock = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: validReservationData.courseId, price: 50000, is_active: false },
              error: null,
            }),
          }),
        }),
      };

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'slots') return slotMock;
        if (table === 'courses') return courseMock;
        return slotMock;
      });

      const request = createRequest(validReservationData);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(409);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Course is not available');
    });
  });

  describe('Successful Reservation', () => {
    it('正常な予約データで予約が作成される', async () => {
      const mockReservationId = '550e8400-e29b-41d4-a716-446655440003';
      const mockCustomerId = '550e8400-e29b-41d4-a716-446655440004';
      const mockBookingNumber = 'BK-2024-001';

      // Mock slot
      const slotMock = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: validReservationData.slotId, max_pax: 4, current_pax: 0, status: 'open' },
              error: null,
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      };

      // Mock course
      const courseMock = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: validReservationData.courseId, price: 50000, is_active: true },
              error: null,
            }),
          }),
        }),
      };

      // Mock customers
      const customersMock = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: mockCustomerId,
                email: 'test@example.com',
                name: 'Test Customer',
                preferred_lang: 'ja',
                total_spent: 0,
                booking_count: 0,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
              },
              error: null,
            }),
          }),
        }),
      };

      // Mock reservations
      const reservationsMock = {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: mockReservationId,
                booking_number: mockBookingNumber,
                customer_id: mockCustomerId,
                course_id: validReservationData.courseId,
                slot_id: validReservationData.slotId,
                reservation_date: validReservationData.reservationDate,
                reservation_time: validReservationData.reservationTime,
                pax: 2,
                subtotal: 100000,
                tax: 10000,
                total_price: 110000,
                status: 'pending',
                payment_status: 'pending',
                health_confirmed: true,
                terms_accepted: true,
                privacy_accepted: true,
                booked_via: 'web',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
              },
              error: null,
            }),
          }),
        }),
      };

      // Mock passengers
      const passengersMock = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };

      mockSupabaseClient.from.mockImplementation((table: string) => {
        switch (table) {
          case 'slots':
            return slotMock;
          case 'courses':
            return courseMock;
          case 'customers':
            return customersMock;
          case 'reservations':
            return reservationsMock;
          case 'passengers':
            return passengersMock;
          default:
            return slotMock;
        }
      });

      const request = createRequest(validReservationData);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data).toBeDefined();
      expect(json.data.id).toBe(mockReservationId);
      expect(json.data.bookingNumber).toBe(mockBookingNumber);
      expect(json.data.pax).toBe(2);
      expect(json.data.totalPrice).toBe(110000);
    });

    it('既存の顧客で予約が作成される', async () => {
      const mockReservationId = '550e8400-e29b-41d4-a716-446655440003';
      const mockCustomerId = '550e8400-e29b-41d4-a716-446655440004';
      const mockBookingNumber = 'BK-2024-002';

      // Mock slot
      const slotMock = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: validReservationData.slotId, max_pax: 4, current_pax: 0, status: 'open' },
              error: null,
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      };

      // Mock course
      const courseMock = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: validReservationData.courseId, price: 50000, is_active: true },
              error: null,
            }),
          }),
        }),
      };

      // Mock customers (existing customer found)
      const customersMock = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: mockCustomerId,
                email: 'test@example.com',
                name: 'Existing Customer',
                preferred_lang: 'ja',
                total_spent: 200000,
                booking_count: 5,
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
              },
              error: null,
            }),
          }),
        }),
      };

      // Mock reservations
      const reservationsMock = {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: mockReservationId,
                booking_number: mockBookingNumber,
                customer_id: mockCustomerId,
                course_id: validReservationData.courseId,
                slot_id: validReservationData.slotId,
                reservation_date: validReservationData.reservationDate,
                reservation_time: validReservationData.reservationTime,
                pax: 2,
                subtotal: 100000,
                tax: 10000,
                total_price: 110000,
                status: 'pending',
                payment_status: 'pending',
                health_confirmed: true,
                terms_accepted: true,
                privacy_accepted: true,
                booked_via: 'web',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
              },
              error: null,
            }),
          }),
        }),
      };

      // Mock passengers
      const passengersMock = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };

      mockSupabaseClient.from.mockImplementation((table: string) => {
        switch (table) {
          case 'slots':
            return slotMock;
          case 'courses':
            return courseMock;
          case 'customers':
            return customersMock;
          case 'reservations':
            return reservationsMock;
          case 'passengers':
            return passengersMock;
          default:
            return slotMock;
        }
      });

      const request = createRequest(validReservationData);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.customer.name).toBe('Existing Customer');
      expect(json.data.customer.bookingCount).toBe(5);
    });
  });

  describe('Pricing Calculation', () => {
    it('価格が正しく計算される（乗客数 x コース価格 + 10%税）', async () => {
      const mockCustomerId = '550e8400-e29b-41d4-a716-446655440004';
      const coursePrice = 30000;
      const passengerCount = 3;
      const expectedSubtotal = coursePrice * passengerCount; // 90000
      const expectedTax = Math.floor(expectedSubtotal * 0.1); // 9000
      const expectedTotal = expectedSubtotal + expectedTax; // 99000

      // Mock slot
      const slotMock = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: validReservationData.slotId, max_pax: 4, current_pax: 0, status: 'open' },
              error: null,
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      };

      // Mock course with specific price
      const courseMock = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: validReservationData.courseId, price: coursePrice, is_active: true },
              error: null,
            }),
          }),
        }),
      };

      // Mock customers
      const customersMock = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: mockCustomerId,
                email: 'test@example.com',
                name: 'Test Customer',
                preferred_lang: 'ja',
                total_spent: 0,
                booking_count: 0,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
              },
              error: null,
            }),
          }),
        }),
      };

      // Mock reservations - capture the inserted data
      let insertedData: Record<string, unknown> | null = null;
      const reservationsMock = {
        insert: vi.fn().mockImplementation((data: Record<string, unknown>[]) => {
          insertedData = data[0];
          return {
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: '550e8400-e29b-41d4-a716-446655440003',
                  booking_number: 'BK-2024-001',
                  customer_id: mockCustomerId,
                  course_id: validReservationData.courseId,
                  slot_id: validReservationData.slotId,
                  reservation_date: validReservationData.reservationDate,
                  reservation_time: validReservationData.reservationTime,
                  pax: passengerCount,
                  subtotal: expectedSubtotal,
                  tax: expectedTax,
                  total_price: expectedTotal,
                  status: 'pending',
                  payment_status: 'pending',
                  health_confirmed: true,
                  terms_accepted: true,
                  privacy_accepted: true,
                  booked_via: 'web',
                  created_at: '2024-01-01T00:00:00Z',
                  updated_at: '2024-01-01T00:00:00Z',
                },
                error: null,
              }),
            }),
          };
        }),
      };

      // Mock passengers
      const passengersMock = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };

      mockSupabaseClient.from.mockImplementation((table: string) => {
        switch (table) {
          case 'slots':
            return slotMock;
          case 'courses':
            return courseMock;
          case 'customers':
            return customersMock;
          case 'reservations':
            return reservationsMock;
          case 'passengers':
            return passengersMock;
          default:
            return slotMock;
        }
      });

      const threePassengerData = {
        ...validReservationData,
        passengers: [{ name: 'P1' }, { name: 'P2' }, { name: 'P3' }],
      };

      const request = createRequest(threePassengerData);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.subtotal).toBe(expectedSubtotal);
      expect(json.data.tax).toBe(expectedTax);
      expect(json.data.totalPrice).toBe(expectedTotal);

      // Verify the data sent to database
      expect(insertedData).not.toBeNull();
      expect(insertedData!.subtotal).toBe(expectedSubtotal);
      expect(insertedData!.tax).toBe(expectedTax);
      expect(insertedData!.total_price).toBe(expectedTotal);
    });
  });
});
