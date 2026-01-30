import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  generateMypageToken,
  isValidTokenFormat,
  calculateTokenExpiration,
  buildMypageUrl,
  validateMypageToken,
  getMypageData,
  createOrRefreshMypageToken,
  revokeMypageToken,
} from '../mypage-token';

// ---------------------------------------------------------------------------
// Mock Supabase helper
// ---------------------------------------------------------------------------

interface MockChain {
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
}

function createMockSupabase() {
  return { from: vi.fn() };
}

/**
 * Build a fluent chain mock where each method returns the chain itself
 * and the terminal method resolves to `result`.
 */
function buildChain(result: { data: unknown; error: unknown }): MockChain {
  const chain: MockChain = {
    select: vi.fn(),
    eq: vi.fn(),
    single: vi.fn(),
    update: vi.fn(),
    order: vi.fn(),
  };
  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.single.mockResolvedValue(result);
  chain.update.mockReturnValue(chain);
  chain.order.mockReturnValue(chain);
  return chain;
}

// ---------------------------------------------------------------------------
// generateMypageToken
// ---------------------------------------------------------------------------

describe('generateMypageToken', () => {
  it('returns a 128-character string', () => {
    const token = generateMypageToken();
    expect(token).toHaveLength(128);
  });

  it('returns a hex string', () => {
    const token = generateMypageToken();
    expect(token).toMatch(/^[a-f0-9]+$/);
  });

  it('generates unique tokens on successive calls', () => {
    const a = generateMypageToken();
    const b = generateMypageToken();
    expect(a).not.toBe(b);
  });
});

// ---------------------------------------------------------------------------
// isValidTokenFormat
// ---------------------------------------------------------------------------

describe('isValidTokenFormat', () => {
  it('returns true for a valid 128-char hex token', () => {
    const token = 'a'.repeat(128);
    expect(isValidTokenFormat(token)).toBe(true);
  });

  it('returns true for a 64-char hex token (minimum length)', () => {
    const token = 'abcdef0123456789'.repeat(4); // 64 chars
    expect(isValidTokenFormat(token)).toBe(true);
  });

  it('returns true for upper-case hex characters', () => {
    const token = 'ABCDEF0123456789'.repeat(4);
    expect(isValidTokenFormat(token)).toBe(true);
  });

  it('returns false for an empty string', () => {
    expect(isValidTokenFormat('')).toBe(false);
  });

  it('returns false for non-hex characters', () => {
    const token = 'g'.repeat(128);
    expect(isValidTokenFormat(token)).toBe(false);
  });

  it('returns false for a string shorter than 64 characters', () => {
    const token = 'a'.repeat(63);
    expect(isValidTokenFormat(token)).toBe(false);
  });

  it('returns false for a non-string value (null)', () => {
     
    expect(isValidTokenFormat(null as unknown as string)).toBe(false);
  });

  it('returns false for a non-string value (undefined)', () => {
     
    expect(isValidTokenFormat(undefined as unknown as string)).toBe(false);
  });

  it('returns false for a non-string value (number)', () => {
     
    expect(isValidTokenFormat(12345 as unknown as string)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// calculateTokenExpiration
// ---------------------------------------------------------------------------

describe('calculateTokenExpiration', () => {
  it('defaults to 90 days from now', () => {
    const before = new Date();
    const result = calculateTokenExpiration();
    const after = new Date();

    const resultDate = new Date(result);
    const expectedMin = new Date(before);
    expectedMin.setDate(expectedMin.getDate() + 90);
    const expectedMax = new Date(after);
    expectedMax.setDate(expectedMax.getDate() + 90);

    expect(resultDate.getTime()).toBeGreaterThanOrEqual(expectedMin.getTime() - 1000);
    expect(resultDate.getTime()).toBeLessThanOrEqual(expectedMax.getTime() + 1000);
  });

  it('accepts a custom number of days', () => {
    const before = new Date();
    const result = calculateTokenExpiration(30);
    const resultDate = new Date(result);

    const expected = new Date(before);
    expected.setDate(expected.getDate() + 30);

    // Within a 2-second tolerance
    expect(Math.abs(resultDate.getTime() - expected.getTime())).toBeLessThan(2000);
  });

  it('returns a valid ISO 8601 string', () => {
    const result = calculateTokenExpiration();
    // new Date(isoString).toISOString() should round-trip
    expect(new Date(result).toISOString()).toBe(result);
  });

  it('handles 0 days (expiration = now)', () => {
    const before = Date.now();
    const result = calculateTokenExpiration(0);
    const resultMs = new Date(result).getTime();
    expect(resultMs).toBeGreaterThanOrEqual(before - 1000);
    expect(resultMs).toBeLessThanOrEqual(before + 1000);
  });
});

// ---------------------------------------------------------------------------
// buildMypageUrl
// ---------------------------------------------------------------------------

describe('buildMypageUrl', () => {
  it('builds a correct mypage URL', () => {
    const url = buildMypageUrl('https://example.com', 'abc123');
    expect(url).toBe('https://example.com/mypage?token=abc123');
  });

  it('handles a base URL with a trailing slash', () => {
    const url = buildMypageUrl('https://example.com/', 'token456');
    expect(url).toBe('https://example.com/mypage?token=token456');
  });

  it('encodes special characters in the token', () => {
    const url = buildMypageUrl('https://example.com', 'a+b=c');
    expect(url).toContain('token=a%2Bb%3Dc');
  });
});

// ---------------------------------------------------------------------------
// validateMypageToken
// ---------------------------------------------------------------------------

describe('validateMypageToken', () => {
  let mockSupabase: ReturnType<typeof createMockSupabase>;

  beforeEach(() => {
    mockSupabase = createMockSupabase();
  });

  it('returns invalid for a token with bad format', async () => {
    const result = await validateMypageToken(
      mockSupabase as never,
      'short'
    );

    expect(result).toEqual({
      valid: false,
      error: 'Invalid token format',
    });
    // Should not call the database
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });

  it('returns invalid when token is not found in database', async () => {
    const chain = buildChain({
      data: null,
      error: { message: 'not found' },
    });
    mockSupabase.from.mockReturnValue(chain);

    const token = 'a'.repeat(128);
    const result = await validateMypageToken(mockSupabase as never, token);

    expect(result).toEqual({ valid: false, error: 'Token not found' });
    expect(mockSupabase.from).toHaveBeenCalledWith('customers');
    expect(chain.eq).toHaveBeenCalledWith('mypage_token', token);
  });

  it('returns invalid when token has expired', async () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString(); // 1 day ago
    const chain = buildChain({
      data: {
        id: 'cust-1',
        email: 'test@example.com',
        name: 'Test User',
        mypage_token_expires_at: pastDate,
      },
      error: null,
    });
    mockSupabase.from.mockReturnValue(chain);

    const token = 'a'.repeat(128);
    const result = await validateMypageToken(mockSupabase as never, token);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Token has expired');
    expect(result.expiresAt).toBe(pastDate);
  });

  it('returns valid with customer info for a non-expired token', async () => {
    const futureDate = new Date(Date.now() + 86400000 * 30).toISOString();
    const chain = buildChain({
      data: {
        id: 'cust-1',
        email: 'test@example.com',
        name: 'Test User',
        mypage_token_expires_at: futureDate,
      },
      error: null,
    });
    mockSupabase.from.mockReturnValue(chain);

    const token = 'a'.repeat(128);
    const result = await validateMypageToken(mockSupabase as never, token);

    expect(result).toEqual({
      valid: true,
      customerId: 'cust-1',
      customerEmail: 'test@example.com',
      customerName: 'Test User',
      expiresAt: futureDate,
    });
  });

  it('returns valid when mypage_token_expires_at is null (no expiry set)', async () => {
    const chain = buildChain({
      data: {
        id: 'cust-2',
        email: 'noexpiry@example.com',
        name: 'No Expiry',
        mypage_token_expires_at: null,
      },
      error: null,
    });
    mockSupabase.from.mockReturnValue(chain);

    const token = 'b'.repeat(128);
    const result = await validateMypageToken(mockSupabase as never, token);

    expect(result.valid).toBe(true);
    expect(result.customerId).toBe('cust-2');
    expect(result.expiresAt).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getMypageData
// ---------------------------------------------------------------------------

describe('getMypageData', () => {
  let mockSupabase: ReturnType<typeof createMockSupabase>;

  beforeEach(() => {
    mockSupabase = createMockSupabase();
  });

  it('returns null when the token is invalid format', async () => {
    const result = await getMypageData(mockSupabase as never, 'bad');
    expect(result).toBeNull();
  });

  it('returns null when the token is not found', async () => {
    const chain = buildChain({ data: null, error: { message: 'nope' } });
    mockSupabase.from.mockReturnValue(chain);

    const result = await getMypageData(mockSupabase as never, 'a'.repeat(128));
    expect(result).toBeNull();
  });

  it('returns customer and reservations for a valid token', async () => {
    const futureDate = new Date(Date.now() + 86400000 * 30).toISOString();
    let callCount = 0;

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'customers') {
        callCount++;
        if (callCount === 1) {
          // First call: validateMypageToken select
          return buildChain({
            data: {
              id: 'cust-1',
              email: 'test@example.com',
              name: 'Test User',
              mypage_token_expires_at: futureDate,
            },
            error: null,
          });
        }
        // Second call: full customer data
        return buildChain({
          data: {
            id: 'cust-1',
            email: 'test@example.com',
            name: 'Test User',
            name_kana: 'テストユーザー',
            phone: '090-1234-5678',
            preferred_lang: 'ja',
            booking_count: 2,
            total_spent: 50000,
            first_booking_date: '2025-01-01',
            last_booking_date: '2025-06-01',
          },
          error: null,
        });
      }

      // reservations table
      const reservationChain = buildChain({ data: null, error: null });
      // Override single - reservations don't call single, they resolve via order
      // We need the chain to resolve without single. Let's override order to return a promise-like.
      const reservationData = [
        {
          id: 'res-1',
          booking_number: 'BK-001',
          reservation_date: '2025-06-01',
          reservation_time: '10:00',
          pax: 2,
          status: 'confirmed',
          payment_status: 'paid',
          total_price: 25000,
          created_at: '2025-05-01T00:00:00Z',
          courses: {
            id: 'course-1',
            title: 'Tokyo Tour',
            title_en: 'Tokyo Tour',
            duration_minutes: 30,
            heliports: {
              id: 'heli-1',
              name: 'Tokyo Heliport',
              name_en: 'Tokyo Heliport',
              address: 'Tokyo, Japan',
            },
          },
        },
      ];

      // The reservations query calls .order() twice then resolves (no .single())
      // We need the last .order() to be thenable
      let orderCallCount = 0;
      reservationChain.order.mockImplementation(() => {
        orderCallCount++;
        if (orderCallCount >= 2) {
          // Return a thenable that resolves to the data
          return Promise.resolve({ data: reservationData, error: null });
        }
        return reservationChain;
      });

      return reservationChain;
    });

    const result = await getMypageData(mockSupabase as never, 'a'.repeat(128));

    expect(result).not.toBeNull();
    expect(result!.customer.id).toBe('cust-1');
    expect(result!.customer.email).toBe('test@example.com');
    expect(result!.customer.nameKana).toBe('テストユーザー');
    expect(result!.reservations).toHaveLength(1);
    expect(result!.reservations[0].bookingNumber).toBe('BK-001');
    expect(result!.reservations[0].course).toEqual({
      id: 'course-1',
      title: 'Tokyo Tour',
      titleEn: 'Tokyo Tour',
      durationMinutes: 30,
    });
    expect(result!.reservations[0].heliport).toEqual({
      id: 'heli-1',
      name: 'Tokyo Heliport',
      nameEn: 'Tokyo Heliport',
      address: 'Tokyo, Japan',
    });
  });

  it('returns customer with empty reservations when reservation fetch fails', async () => {
    const futureDate = new Date(Date.now() + 86400000 * 30).toISOString();
    let customerCallCount = 0;

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'customers') {
        customerCallCount++;
        if (customerCallCount === 1) {
          return buildChain({
            data: {
              id: 'cust-1',
              email: 'test@example.com',
              name: 'Test User',
              mypage_token_expires_at: futureDate,
            },
            error: null,
          });
        }
        return buildChain({
          data: {
            id: 'cust-1',
            email: 'test@example.com',
            name: 'Test User',
            name_kana: null,
            phone: null,
            preferred_lang: null,
            booking_count: 0,
            total_spent: 0,
            first_booking_date: null,
            last_booking_date: null,
          },
          error: null,
        });
      }

      // reservations - simulate error
      const reservationChain = buildChain({ data: null, error: null });
      let orderCallCount = 0;
      reservationChain.order.mockImplementation(() => {
        orderCallCount++;
        if (orderCallCount >= 2) {
          return Promise.resolve({
            data: null,
            error: { message: 'DB error' },
          });
        }
        return reservationChain;
      });
      return reservationChain;
    });

    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await getMypageData(mockSupabase as never, 'a'.repeat(128));

    expect(result).not.toBeNull();
    expect(result!.customer.id).toBe('cust-1');
    expect(result!.reservations).toEqual([]);

    consoleSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// createOrRefreshMypageToken
// ---------------------------------------------------------------------------

describe('createOrRefreshMypageToken', () => {
  let mockSupabase: ReturnType<typeof createMockSupabase>;

  beforeEach(() => {
    mockSupabase = createMockSupabase();
  });

  it('returns a new token on success', async () => {
    const chain = buildChain({ data: null, error: null });
    // update -> eq resolves with no error
    chain.eq.mockResolvedValue({ error: null });
    mockSupabase.from.mockReturnValue(chain);

    const result = await createOrRefreshMypageToken(
      mockSupabase as never,
      'cust-1'
    );

    expect(result).not.toBeNull();
    expect(result).toHaveLength(128);
    expect(result).toMatch(/^[a-f0-9]+$/);
    expect(mockSupabase.from).toHaveBeenCalledWith('customers');
    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        mypage_token: expect.stringMatching(/^[a-f0-9]{128}$/),
        mypage_token_expires_at: expect.any(String),
      })
    );
  });

  it('uses custom expiration days', async () => {
    const chain = buildChain({ data: null, error: null });
    chain.eq.mockResolvedValue({ error: null });
    mockSupabase.from.mockReturnValue(chain);

    const before = new Date();
    const result = await createOrRefreshMypageToken(
      mockSupabase as never,
      'cust-1',
      7
    );

    expect(result).not.toBeNull();

    // Verify the expiration passed to update is ~7 days from now
    const updateCall = chain.update.mock.calls[0][0];
    const expiresAt = new Date(updateCall.mypage_token_expires_at);
    const expectedMin = new Date(before);
    expectedMin.setDate(expectedMin.getDate() + 7);

    expect(Math.abs(expiresAt.getTime() - expectedMin.getTime())).toBeLessThan(
      2000
    );
  });

  it('returns null on database error', async () => {
    const chain = buildChain({ data: null, error: null });
    chain.eq.mockResolvedValue({ error: { message: 'update failed' } });
    mockSupabase.from.mockReturnValue(chain);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await createOrRefreshMypageToken(
      mockSupabase as never,
      'cust-1'
    );

    expect(result).toBeNull();

    consoleSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// revokeMypageToken
// ---------------------------------------------------------------------------

describe('revokeMypageToken', () => {
  let mockSupabase: ReturnType<typeof createMockSupabase>;

  beforeEach(() => {
    mockSupabase = createMockSupabase();
  });

  it('returns true on success', async () => {
    const chain = buildChain({ data: null, error: null });
    chain.eq.mockResolvedValue({ error: null });
    mockSupabase.from.mockReturnValue(chain);

    const result = await revokeMypageToken(mockSupabase as never, 'cust-1');

    expect(result).toBe(true);
    expect(mockSupabase.from).toHaveBeenCalledWith('customers');
    expect(chain.update).toHaveBeenCalledWith({
      mypage_token: null,
      mypage_token_expires_at: null,
    });
    expect(chain.eq).toHaveBeenCalledWith('id', 'cust-1');
  });

  it('returns false on database error', async () => {
    const chain = buildChain({ data: null, error: null });
    chain.eq.mockResolvedValue({ error: { message: 'delete failed' } });
    mockSupabase.from.mockReturnValue(chain);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await revokeMypageToken(mockSupabase as never, 'cust-1');

    expect(result).toBe(false);

    consoleSpy.mockRestore();
  });
});
