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
import { GET } from '@/app/api/public/slots/available/route';

// Helper to create GET requests with search params
function createRequest(params: Record<string, string>): NextRequest {
  const url = new URL('http://localhost:3000/api/public/slots/available');
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.set(key, value)
  );
  return new NextRequest(url);
}

// Helper to create a chainable Supabase query mock.
// The Supabase query builder is both chainable and thenable.
// `order()` returns the same chain, and `await` resolves via `.then()`.
function createChainMock(resolvedData: {
  data: unknown[] | null;
  error: unknown | null;
}) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    then: vi.fn((resolve: (value: unknown) => void) => {
      resolve(resolvedData);
    }),
  };
  // Every chainable method returns the chain itself
  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.order.mockReturnValue(chain);
  return chain;
}

// Test constants
const TEST_COURSE_ID = '550e8400-e29b-41d4-a716-446655440001';
const TEST_DATE = '2024-06-15';

// Factory for slot data (snake_case DB format)
function createSlotRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'slot-id-1',
    course_id: TEST_COURSE_ID,
    slot_date: TEST_DATE,
    slot_time: '10:00',
    max_pax: 4,
    current_pax: 0,
    status: 'open',
    suspended_reason: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    courses: {
      id: TEST_COURSE_ID,
      heliport_id: 'heliport-1',
      title: 'Test Course',
      title_en: 'Test Course EN',
      title_zh: null,
      subtitle: null,
      subtitle_en: null,
      subtitle_zh: null,
      description: 'A test course',
      description_en: null,
      description_zh: null,
      course_type: 'regular',
      duration_minutes: 15,
      price: 30000,
      max_pax: 4,
      min_pax: 1,
      tags: null,
      images: null,
      flight_schedule: null,
      highlights: null,
      is_active: true,
      display_order: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    ...overrides,
  };
}

describe('GET /api/public/slots/available', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ──────────────────────────────────────────
  // Validation
  // ──────────────────────────────────────────
  describe('Validation', () => {
    it('dateパラメータがない場合は400エラーを返す', async () => {
      const request = createRequest({});
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Date parameter is required');
    });

    it('不正な日付フォーマット(スラッシュ区切り)は400エラーを返す', async () => {
      const request = createRequest({ date: '2024/06/15' });
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Invalid date format. Use YYYY-MM-DD');
    });

    it('不正な日付フォーマット(日本語)は400エラーを返す', async () => {
      const request = createRequest({ date: '2024年06月15日' });
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Invalid date format. Use YYYY-MM-DD');
    });

    it('不正なcourseIdフォーマットは400エラーを返す', async () => {
      // Query chain is built before courseId validation, so mock is needed
      const chainMock = createChainMock({ data: [], error: null });
      mockSupabaseClient.from.mockReturnValue(chainMock);

      const request = createRequest({
        date: TEST_DATE,
        courseId: 'not-a-valid-uuid',
      });
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Invalid courseId format');
    });
  });

  // ──────────────────────────────────────────
  // Success cases
  // ──────────────────────────────────────────
  describe('Success', () => {
    it('指定日付のオープンスロットを返す', async () => {
      const slotRow = createSlotRow();
      const chainMock = createChainMock({ data: [slotRow], error: null });
      mockSupabaseClient.from.mockReturnValue(chainMock);

      const request = createRequest({ date: TEST_DATE });
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toHaveLength(1);
      expect(json.data[0].slotDate).toBe(TEST_DATE);
      expect(json.data[0].slotTime).toBe('10:00');
      expect(json.data[0].availablePax).toBe(4);

      // Supabase query chain の検証
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('slots');
      expect(chainMock.select).toHaveBeenCalledWith('*, courses(*)');
      expect(chainMock.eq).toHaveBeenCalledWith('slot_date', TEST_DATE);
      expect(chainMock.eq).toHaveBeenCalledWith('status', 'open');
      expect(chainMock.order).toHaveBeenCalledWith('slot_time');
    });

    it('courseIdで絞り込んだスロットを返す', async () => {
      const slotRow = createSlotRow();
      const chainMock = createChainMock({ data: [slotRow], error: null });
      mockSupabaseClient.from.mockReturnValue(chainMock);

      const request = createRequest({
        date: TEST_DATE,
        courseId: TEST_COURSE_ID,
      });
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toHaveLength(1);

      // courseId による追加の eq 呼び出しを検証
      expect(chainMock.eq).toHaveBeenCalledWith('course_id', TEST_COURSE_ID);
    });

    it('満席のスロット(currentPax >= maxPax)を除外する', async () => {
      const fullSlot = createSlotRow({
        id: 'slot-full',
        max_pax: 4,
        current_pax: 4,
      });
      const availableSlot = createSlotRow({
        id: 'slot-available',
        max_pax: 4,
        current_pax: 2,
      });
      const chainMock = createChainMock({
        data: [fullSlot, availableSlot],
        error: null,
      });
      mockSupabaseClient.from.mockReturnValue(chainMock);

      const request = createRequest({ date: TEST_DATE });
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toHaveLength(1);
      expect(json.data[0].id).toBe('slot-available');
      expect(json.data[0].availablePax).toBe(2);
    });

    it('該当スロットがない場合は空配列を返す', async () => {
      const chainMock = createChainMock({ data: [], error: null });
      mockSupabaseClient.from.mockReturnValue(chainMock);

      const request = createRequest({ date: '2024-12-25' });
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toEqual([]);
    });

    it('レスポンスにネストされたコースデータを含む', async () => {
      const slotRow = createSlotRow();
      const chainMock = createChainMock({ data: [slotRow], error: null });
      mockSupabaseClient.from.mockReturnValue(chainMock);

      const request = createRequest({ date: TEST_DATE });
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data[0].course).toBeDefined();
      expect(json.data[0].course.title).toBe('Test Course');
      expect(json.data[0].course.price).toBe(30000);
      expect(json.data[0].course.durationMinutes).toBe(15);
      expect(json.data[0].course.id).toBe(TEST_COURSE_ID);
    });
  });

  // ──────────────────────────────────────────
  // Error handling
  // ──────────────────────────────────────────
  describe('Error handling', () => {
    it('データベースエラー時に500を返す', async () => {
      const chainMock = createChainMock({
        data: null,
        error: { message: 'Database connection failed', code: '500' },
      });
      mockSupabaseClient.from.mockReturnValue(chainMock);

      const request = createRequest({ date: TEST_DATE });
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Failed to fetch available slots');
    });

    it('createClientが例外をスローした場合に500を返す', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      vi.mocked(createClient).mockRejectedValueOnce(
        new Error('Supabase init failed')
      );

      const request = createRequest({ date: TEST_DATE });
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error).toBe('An unexpected error occurred');
    });

    it('データがnullの場合は空配列を返す(エラーではない)', async () => {
      const chainMock = createChainMock({ data: null, error: null });
      mockSupabaseClient.from.mockReturnValue(chainMock);

      const request = createRequest({ date: TEST_DATE });
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toEqual([]);
    });
  });
});
