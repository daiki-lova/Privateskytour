import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Use vi.hoisted to define mocks before they're used
const mockStripe = vi.hoisted(() => ({
  checkout: {
    sessions: {
      create: vi.fn(),
    },
  },
  webhooks: {
    constructEvent: vi.fn(),
  },
}));

vi.mock('@/lib/stripe/client', () => ({
  stripe: mockStripe,
}));

// Import after mocking
import { POST as createSessionPOST } from '@/app/api/stripe/create-session/route';
import { POST as webhookPOST } from '@/app/api/stripe/webhook/route';

// Mock Supabase
const mockSupabaseClient = {
  from: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}));

// Mock email client
vi.mock('@/lib/email/client', () => ({
  sendReservationConfirmation: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  vi.clearAllMocks();
  process.env = { ...originalEnv };
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret';
  process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
});

describe('POST /api/stripe/create-session', () => {
  // Helper to create NextRequest
  function createRequest(body: Record<string, unknown>): NextRequest {
    return new NextRequest('http://localhost:3000/api/stripe/create-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'http://localhost:3000',
      },
      body: JSON.stringify(body),
    });
  }

  const validSessionData = {
    reservationId: '550e8400-e29b-41d4-a716-446655440001',
    amount: 110000,
    courseName: 'Tokyo Bay Helicopter Tour',
    customerEmail: 'test@example.com',
  };

  describe('Validation Errors', () => {
    it('reservationIdがない場合は400エラーを返す', async () => {
      const body = { ...validSessionData };
      delete (body as Record<string, unknown>).reservationId;

      const request = createRequest(body);
      const response = await createSessionPOST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Missing required field: reservationId');
    });

    it('amountがない場合は400エラーを返す', async () => {
      const body = { ...validSessionData };
      delete (body as Record<string, unknown>).amount;

      const request = createRequest(body);
      const response = await createSessionPOST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Invalid amount');
    });

    it('金額が0以下の場合は400エラーを返す', async () => {
      const body = { ...validSessionData, amount: 0 };

      const request = createRequest(body);
      const response = await createSessionPOST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Invalid amount');
    });

    it('金額がマイナスの場合は400エラーを返す', async () => {
      const body = { ...validSessionData, amount: -1000 };

      const request = createRequest(body);
      const response = await createSessionPOST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Invalid amount');
    });

    it('courseNameがない場合は400エラーを返す', async () => {
      const body = { ...validSessionData };
      delete (body as Record<string, unknown>).courseName;

      const request = createRequest(body);
      const response = await createSessionPOST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Missing required field: courseName');
    });

    it('customerEmailがない場合は400エラーを返す', async () => {
      const body = { ...validSessionData };
      delete (body as Record<string, unknown>).customerEmail;

      const request = createRequest(body);
      const response = await createSessionPOST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Missing required field: customerEmail');
    });

    it('無効なJSONボディの場合は400エラーを返す', async () => {
      const request = new NextRequest('http://localhost:3000/api/stripe/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json',
      });

      const response = await createSessionPOST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Invalid JSON in request body');
    });
  });

  describe('Successful Session Creation', () => {
    it('有効なデータでCheckoutセッションが作成される', async () => {
      const mockSessionId = 'cs_test_session_123';
      const mockSessionUrl = 'https://checkout.stripe.com/pay/cs_test_session_123';

      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: mockSessionId,
        url: mockSessionUrl,
      });

      const request = createRequest(validSessionData);
      const response = await createSessionPOST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.sessionId).toBe(mockSessionId);
      expect(json.data.url).toBe(mockSessionUrl);

      // Verify Stripe was called with correct parameters
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: validSessionData.customerEmail,
        line_items: [
          {
            price_data: {
              currency: 'jpy',
              product_data: {
                name: validSessionData.courseName,
                description: `Reservation ID: ${validSessionData.reservationId}`,
              },
              unit_amount: validSessionData.amount,
            },
            quantity: 1,
          },
        ],
        metadata: {
          reservationId: validSessionData.reservationId,
        },
        success_url: 'http://localhost:3000/booking/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'http://localhost:3000/booking/error',
      });
    });

    it('originヘッダーがあればそれをリダイレクトURLに使用する', async () => {
      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      });

      const request = new NextRequest('http://localhost:3000/api/stripe/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://example.com',
        },
        body: JSON.stringify(validSessionData),
      });

      await createSessionPOST(request);

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          success_url: 'https://example.com/booking/success?session_id={CHECKOUT_SESSION_ID}',
          cancel_url: 'https://example.com/booking/error',
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('Stripe APIエラーの場合は500エラーを返す', async () => {
      mockStripe.checkout.sessions.create.mockRejectedValue(new Error('Stripe API error'));

      const request = createRequest(validSessionData);
      const response = await createSessionPOST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Failed to create checkout session');
    });
  });
});

describe('POST /api/stripe/webhook', () => {
  // Helper to create webhook request
  function createWebhookRequest(body: string, signature: string | null): NextRequest {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (signature) {
      headers['stripe-signature'] = signature;
    }

    return new NextRequest('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      headers,
      body,
    });
  }

  describe('Signature Validation', () => {
    it('stripe-signatureヘッダーがない場合は400エラーを返す', async () => {
      const request = createWebhookRequest('{}', null);
      const response = await webhookPOST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Missing signature');
    });

    it('無効なシグネチャの場合は400エラーを返す', async () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const request = createWebhookRequest('{}', 'invalid_signature');
      const response = await webhookPOST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Webhook Error: Invalid signature');
    });

    it('STRIPE_WEBHOOK_SECRETが設定されていない場合は500エラーを返す', async () => {
      delete process.env.STRIPE_WEBHOOK_SECRET;

      const request = createWebhookRequest('{}', 'test_signature');
      const response = await webhookPOST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Webhook secret not configured');
    });
  });

  describe('checkout.session.completed Event', () => {
    const mockSession = {
      id: 'cs_test_session_123',
      payment_intent: 'pi_test_payment_123',
      metadata: {
        reservationId: '550e8400-e29b-41d4-a716-446655440001',
      },
    };

    it('予約ステータスがconfirmedに更新される', async () => {
      mockStripe.webhooks.constructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: mockSession,
        },
      });

      const updateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: mockSession.metadata.reservationId,
              booking_number: 'HF-20250127-0001',
              reservation_date: '2025-02-01',
              reservation_time: '10:00',
              pax: 2,
              total_price: 110000,
              customer: {
                id: 'customer-123',
                email: 'test@example.com',
                name: 'Test Customer',
                mypage_token: 'token-123',
              },
              course: {
                id: 'course-123',
                title: 'Tokyo Bay Tour',
                heliport: {
                  id: 'heliport-123',
                  name: 'Tokyo Heliport',
                  address: 'Tokyo, Japan',
                },
              },
            },
            error: null,
          }),
        }),
      });

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'reservations') {
          return {
            update: updateMock,
            select: selectMock,
          };
        }
        return {};
      });

      const request = createWebhookRequest(JSON.stringify(mockSession), 'valid_signature');
      const response = await webhookPOST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.received).toBe(true);

      // Verify Supabase update was called correctly
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('reservations');
      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'confirmed',
          payment_status: 'paid',
          stripe_checkout_session_id: mockSession.id,
          stripe_payment_intent_id: mockSession.payment_intent,
        })
      );
    });

    it('metadataにreservationIdがない場合はエラーをログに記録', async () => {
      const sessionWithoutReservationId = {
        id: 'cs_test_session_123',
        payment_intent: 'pi_test_payment_123',
        metadata: {},
      };

      mockStripe.webhooks.constructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: sessionWithoutReservationId,
        },
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const request = createWebhookRequest(JSON.stringify(sessionWithoutReservationId), 'valid_signature');
      const response = await webhookPOST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.received).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        'No reservationId in session metadata:',
        sessionWithoutReservationId.id
      );

      consoleSpy.mockRestore();
    });

    it('Supabase更新エラーの場合はエラーをスロー', async () => {
      mockStripe.webhooks.constructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: mockSession,
        },
      });

      const updateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'Database error' } }),
      });

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'reservations') {
          return {
            update: updateMock,
          };
        }
        return {};
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const request = createWebhookRequest(JSON.stringify(mockSession), 'valid_signature');

      // The function throws, which should propagate
      await expect(webhookPOST(request)).rejects.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('Unhandled Event Types', () => {
    it('未対応のイベントタイプは受け取りを確認するのみ', async () => {
      mockStripe.webhooks.constructEvent.mockReturnValue({
        type: 'payment_intent.succeeded',
        data: {
          object: {},
        },
      });

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const request = createWebhookRequest('{}', 'valid_signature');
      const response = await webhookPOST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.received).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('Unhandled event type: payment_intent.succeeded');

      consoleSpy.mockRestore();
    });
  });
});
