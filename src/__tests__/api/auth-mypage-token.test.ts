import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// --- Mock setup (hoisted) ---

const mockSupabaseClient = vi.hoisted(() => ({
  from: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}));

vi.mock('@/lib/auth/mypage-token', () => ({
  validateMypageToken: vi.fn(),
  getMypageData: vi.fn(),
  isValidTokenFormat: vi.fn(),
}));

vi.mock('@/lib/email', () => ({
  sendMypageAccessEmail: vi.fn(() => Promise.resolve({ success: true })),
}));

// --- Imports (after mocks) ---

import { GET, POST } from '@/app/api/auth/mypage-token/route';
import {
  validateMypageToken,
  getMypageData,
  isValidTokenFormat,
} from '@/lib/auth/mypage-token';
import { sendMypageAccessEmail } from '@/lib/email';

// --- Helpers ---

function createGetRequest(
  params: Record<string, string>,
  headers?: Record<string, string>
): NextRequest {
  const url = new URL('http://localhost:3000/api/auth/mypage-token');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url, { headers });
}

function createPostRequest(
  body: Record<string, unknown>,
  headers?: Record<string, string>
): NextRequest {
  return new NextRequest('http://localhost:3000/api/auth/mypage-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

/** Generate a unique IP to avoid rate limit collisions between tests */
let ipCounter = 0;
function uniqueIp(): string {
  ipCounter++;
  return `10.0.0.${ipCounter}`;
}

// --- Setup ---

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
});

// =============================================
// GET /api/auth/mypage-token
// =============================================

describe('GET /api/auth/mypage-token', () => {
  describe('Validation', () => {
    it('returns 400 when token parameter is missing', async () => {
      const ip = uniqueIp();
      const req = createGetRequest({}, { 'x-forwarded-for': ip });
      const res = await GET(req);

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain('Token parameter is required');
    });

    it('returns success with valid:false for invalid token format', async () => {
      const ip = uniqueIp();
      vi.mocked(isValidTokenFormat).mockReturnValue(false);

      const req = createGetRequest(
        { token: 'bad-format' },
        { 'x-forwarded-for': ip }
      );
      const res = await GET(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.valid).toBe(false);
      expect(json.data.error).toBe('Invalid token format');
    });

    it('calls validateMypageToken for valid format token', async () => {
      const ip = uniqueIp();
      vi.mocked(isValidTokenFormat).mockReturnValue(true);
      vi.mocked(validateMypageToken).mockResolvedValue({
        valid: true,
        customerId: 'cust-1',
        customerEmail: 'test@example.com',
        customerName: 'Test',
        expiresAt: '2026-12-31T00:00:00Z',
      });

      const req = createGetRequest(
        { token: 'valid-token-abc' },
        { 'x-forwarded-for': ip }
      );
      const res = await GET(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.valid).toBe(true);
      expect(json.data.customerId).toBe('cust-1');
      expect(validateMypageToken).toHaveBeenCalledOnce();
    });
  });

  describe('Token validation with includeData', () => {
    it('returns validation result without includeData', async () => {
      const ip = uniqueIp();
      vi.mocked(isValidTokenFormat).mockReturnValue(true);
      vi.mocked(validateMypageToken).mockResolvedValue({
        valid: true,
        customerId: 'cust-2',
        customerEmail: 'user@example.com',
        customerName: 'User',
        expiresAt: '2026-06-01T00:00:00Z',
      });

      const req = createGetRequest(
        { token: 'some-token' },
        { 'x-forwarded-for': ip }
      );
      const res = await GET(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.valid).toBe(true);
      expect(getMypageData).not.toHaveBeenCalled();
    });

    it('returns full mypage data when includeData=true and token is valid', async () => {
      const ip = uniqueIp();
      const mockData = {
        customer: { id: 'cust-3', email: 'full@example.com', name: 'Full Data' },
        reservations: [{ id: 'res-1', bookingNumber: 'BK-001' }],
      };
      vi.mocked(isValidTokenFormat).mockReturnValue(true);
      vi.mocked(getMypageData).mockResolvedValue(mockData);

      const req = createGetRequest(
        { token: 'data-token', includeData: 'true' },
        { 'x-forwarded-for': ip }
      );
      const res = await GET(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.customer.id).toBe('cust-3');
      expect(json.data.reservations).toHaveLength(1);
      expect(getMypageData).toHaveBeenCalledOnce();
    });

    it('returns 401 when includeData=true and token is invalid/expired', async () => {
      const ip = uniqueIp();
      vi.mocked(isValidTokenFormat).mockReturnValue(true);
      vi.mocked(getMypageData).mockResolvedValue(null);

      const req = createGetRequest(
        { token: 'expired-token', includeData: 'true' },
        { 'x-forwarded-for': ip }
      );
      const res = await GET(req);

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain('Invalid or expired token');
    });
  });

  describe('Rate limiting', () => {
    it('allows requests within the rate limit', async () => {
      const ip = uniqueIp();
      vi.mocked(isValidTokenFormat).mockReturnValue(true);
      vi.mocked(validateMypageToken).mockResolvedValue({ valid: true });

      // Send 10 requests (the limit) -- all should pass
      for (let i = 0; i < 10; i++) {
        const req = createGetRequest(
          { token: 'rate-token' },
          { 'x-forwarded-for': ip }
        );
        const res = await GET(req);
        expect(res.status).toBe(200);
      }
    });

    it('returns 403 when rate limit is exceeded', async () => {
      const ip = uniqueIp();
      vi.mocked(isValidTokenFormat).mockReturnValue(true);
      vi.mocked(validateMypageToken).mockResolvedValue({ valid: true });

      // Send 10 requests to fill the window
      for (let i = 0; i < 10; i++) {
        const req = createGetRequest(
          { token: 'rate-token' },
          { 'x-forwarded-for': ip }
        );
        await GET(req);
      }

      // 11th request should be blocked
      const req = createGetRequest(
        { token: 'rate-token' },
        { 'x-forwarded-for': ip }
      );
      const res = await GET(req);

      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain('Rate limit exceeded');
    });
  });
});

// =============================================
// POST /api/auth/mypage-token
// =============================================

describe('POST /api/auth/mypage-token', () => {
  /** Helper to set up the mock chain for a customer query */
  function mockCustomerQuery(
    result: { data: unknown; error: unknown },
    updateResult?: { error: unknown }
  ) {
    const eqFn = vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue(result),
    });
    const selectFn = vi.fn().mockReturnValue({ eq: eqFn });

    const updateEqFn = vi.fn().mockResolvedValue(
      updateResult ?? { error: null }
    );
    const updateFn = vi.fn().mockReturnValue({ eq: updateEqFn });

    mockSupabaseClient.from.mockImplementation((table: string) => {
      if (table === 'customers') {
        return { select: selectFn, update: updateFn };
      }
      return {};
    });

    return { selectFn, eqFn, updateFn, updateEqFn };
  }

  describe('Validation', () => {
    it('returns 400 when email is missing', async () => {
      const ip = uniqueIp();
      const req = createPostRequest({}, { 'x-forwarded-for': ip });
      const res = await POST(req);

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain('Email is required');
    });

    it('returns 400 when email format is invalid', async () => {
      const ip = uniqueIp();
      const req = createPostRequest(
        { email: 'not-an-email' },
        { 'x-forwarded-for': ip }
      );
      const res = await POST(req);

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain('Invalid email format');
    });

    it('returns success with valid email', async () => {
      const ip = uniqueIp();
      mockCustomerQuery({
        data: {
          id: 'customer-id',
          email: 'test@example.com',
          name: 'Test Customer',
          mypage_token: 'existing-token',
          mypage_token_expires_at: new Date(
            Date.now() + 86400000
          ).toISOString(),
        },
        error: null,
      });

      const req = createPostRequest(
        { email: 'test@example.com' },
        { 'x-forwarded-for': ip }
      );
      const res = await POST(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    });
  });

  describe('Token generation', () => {
    it('returns generic success message when customer is not found (anti-enumeration)', async () => {
      const ip = uniqueIp();
      mockCustomerQuery({
        data: null,
        error: { code: 'PGRST116', message: 'not found' },
      });

      const req = createPostRequest(
        { email: 'unknown@example.com' },
        { 'x-forwarded-for': ip }
      );
      const res = await POST(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.message).toContain('If an account exists');
    });

    it('sends email with existing valid token without generating new one', async () => {
      const ip = uniqueIp();
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const mocks = mockCustomerQuery({
        data: {
          id: 'customer-id',
          email: 'existing@example.com',
          name: 'Existing Customer',
          mypage_token: 'existing-valid-token',
          mypage_token_expires_at: futureDate,
        },
        error: null,
      });

      const req = createPostRequest(
        { email: 'existing@example.com' },
        { 'x-forwarded-for': ip }
      );
      const res = await POST(req);

      expect(res.status).toBe(200);
      // Should NOT have called update since token is still valid
      expect(mocks.updateFn).not.toHaveBeenCalled();
      expect(sendMypageAccessEmail).toHaveBeenCalledOnce();
    });

    it('generates new token when existing token is expired', async () => {
      const ip = uniqueIp();
      const pastDate = new Date(Date.now() - 86400000).toISOString();
      const mocks = mockCustomerQuery({
        data: {
          id: 'customer-expired',
          email: 'expired@example.com',
          name: 'Expired Token Customer',
          mypage_token: 'old-expired-token',
          mypage_token_expires_at: pastDate,
        },
        error: null,
      });

      const req = createPostRequest(
        { email: 'expired@example.com' },
        { 'x-forwarded-for': ip }
      );
      const res = await POST(req);

      expect(res.status).toBe(200);
      // Should have called update to set new token
      expect(mocks.updateFn).toHaveBeenCalledOnce();
      expect(sendMypageAccessEmail).toHaveBeenCalledOnce();
    });

    it('returns 500 when token update fails', async () => {
      const ip = uniqueIp();
      const pastDate = new Date(Date.now() - 86400000).toISOString();
      mockCustomerQuery(
        {
          data: {
            id: 'customer-fail',
            email: 'fail@example.com',
            name: 'Fail Customer',
            mypage_token: 'old-token',
            mypage_token_expires_at: pastDate,
          },
          error: null,
        },
        { error: { message: 'Database error' } }
      );

      const req = createPostRequest(
        { email: 'fail@example.com' },
        { 'x-forwarded-for': ip }
      );
      const res = await POST(req);

      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain('unexpected error');
    });
  });

  describe('Email sending', () => {
    it('sends mypage access email with correct parameters', async () => {
      const ip = uniqueIp();
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      mockCustomerQuery({
        data: {
          id: 'customer-email',
          email: 'emailtest@example.com',
          name: 'Email Test',
          mypage_token: 'email-token-123',
          mypage_token_expires_at: futureDate,
        },
        error: null,
      });

      const req = createPostRequest(
        { email: 'emailtest@example.com' },
        { 'x-forwarded-for': ip }
      );
      await POST(req);

      expect(sendMypageAccessEmail).toHaveBeenCalledWith({
        to: 'emailtest@example.com',
        customerName: 'Email Test',
        mypageUrl: 'http://localhost:3000/mypage?token=email-token-123',
        expiresAt: futureDate,
      });
    });

    it('does not break response when email sending fails', async () => {
      const ip = uniqueIp();
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      mockCustomerQuery({
        data: {
          id: 'customer-email-fail',
          email: 'failmail@example.com',
          name: 'Fail Mail',
          mypage_token: 'fail-email-token',
          mypage_token_expires_at: futureDate,
        },
        error: null,
      });

      vi.mocked(sendMypageAccessEmail).mockRejectedValueOnce(
        new Error('SMTP error')
      );

      const req = createPostRequest(
        { email: 'failmail@example.com' },
        { 'x-forwarded-for': ip }
      );
      const res = await POST(req);

      // Response should still be success despite email failure
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.message).toContain('If an account exists');
    });
  });

  describe('Rate limiting', () => {
    it('returns 403 when POST rate limit is exceeded', async () => {
      const ip = uniqueIp();
      mockCustomerQuery({
        data: null,
        error: { code: 'PGRST116', message: 'not found' },
      });

      // Fill rate limit window with 10 requests
      for (let i = 0; i < 10; i++) {
        const req = createPostRequest(
          { email: 'ratelimit@example.com' },
          { 'x-forwarded-for': ip }
        );
        await POST(req);
      }

      // 11th request should be blocked
      const req = createPostRequest(
        { email: 'ratelimit@example.com' },
        { 'x-forwarded-for': ip }
      );
      const res = await POST(req);

      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain('Rate limit exceeded');
    });
  });
});
