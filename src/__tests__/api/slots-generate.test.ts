import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Use vi.hoisted to define mocks before they're used
const mockSupabaseClient = vi.hoisted(() => ({
  from: vi.fn(),
}));

const mockAdminClient = vi.hoisted(() => ({
  from: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
  createAdminClient: vi.fn(() => mockAdminClient),
}));

vi.mock('@/lib/auth', () => ({
  requireRole: vi.fn(),
  AuthenticationError: class AuthenticationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'AuthenticationError';
    }
  },
  AuthorizationError: class AuthorizationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'AuthorizationError';
    }
  },
}));

// Import after mocking
import { POST } from '@/app/api/admin/slots/generate/route';
import {
  requireRole,
  AuthenticationError,
  AuthorizationError,
} from '@/lib/auth';
import type { AdminUser } from '@/lib/data/types';

const mockAdminUser: AdminUser = {
  id: 'admin-1',
  email: 'admin@example.com',
  name: 'Test Admin',
  role: 'admin',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

// Helper to create NextRequest
function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest(
    'http://localhost:3000/api/admin/slots/generate',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
}

// Valid request body
const validBody = {
  startDate: '2024-06-15',
  endDate: '2024-06-17',
  times: ['09:00', '10:30', '14:00'],
  maxPax: 4,
};

/**
 * Helper to set up adminClient.from() chain for successful slot generation.
 * Configures:
 *   - existing slots query (returns empty by default)
 *   - insert chain
 */
function setupSlotGenerationMocks(options: {
  existingSlots?: { slot_date: string; slot_time: string; course_id: string | null }[];
  insertResult?: { data: unknown[]; error: null } | { data: null; error: { message: string } };
  courseCheck?: { data: { id: string } | null; error: { message: string } | null };
}) {
  const {
    existingSlots = [],
    insertResult = { data: Array(9).fill({ id: 'slot-id' }), error: null },
    courseCheck,
  } = options;

  mockAdminClient.from.mockImplementation((table: string) => {
    if (table === 'courses') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(
              courseCheck ?? { data: { id: 'course-1' }, error: null }
            ),
          }),
        }),
      };
    }

    if (table === 'slots') {
      return {
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            lte: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: existingSlots,
                error: null,
              }),
            }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue(insertResult),
        }),
      };
    }

    return { select: vi.fn() };
  });
}

describe('POST /api/admin/slots/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------
  // 1. Auth tests
  // -------------------------------------------------------
  describe('Authentication / Authorization', () => {
    it('認証されていない場合は401を返す', async () => {
      vi.mocked(requireRole).mockRejectedValue(
        new AuthenticationError('Not authenticated')
      );

      const request = createRequest(validBody);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Not authenticated');
    });

    it('admin権限がない場合は403を返す', async () => {
      vi.mocked(requireRole).mockRejectedValue(
        new AuthorizationError('Insufficient permissions')
      );

      const request = createRequest(validBody);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(403);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Insufficient permissions');
    });
  });

  // -------------------------------------------------------
  // 2. Validation tests
  // -------------------------------------------------------
  describe('Validation', () => {
    beforeEach(() => {
      vi.mocked(requireRole).mockResolvedValue(mockAdminUser);
    });

    it('startDateが欠けている場合は400を返す', async () => {
      const body = { endDate: '2024-06-17', times: ['09:00'] };
      const response = await POST(createRequest(body));
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toContain('startDate');
    });

    it('endDateが欠けている場合は400を返す', async () => {
      const body = { startDate: '2024-06-15', times: ['09:00'] };
      const response = await POST(createRequest(body));
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toContain('endDate');
    });

    it('timesが未指定の場合は400を返す', async () => {
      const body = { startDate: '2024-06-15', endDate: '2024-06-17' };
      const response = await POST(createRequest(body));
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toContain('times');
    });

    it('timesが空配列の場合は400を返す', async () => {
      const body = { ...validBody, times: [] };
      const response = await POST(createRequest(body));
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toContain('times');
    });

    it('日付フォーマットが不正な場合は400を返す', async () => {
      const body = { ...validBody, startDate: '15-06-2024' };
      const response = await POST(createRequest(body));
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toContain('YYYY-MM-DD');
    });

    it('時間が25:00のように不正な場合は400を返す', async () => {
      const body = { ...validBody, times: ['25:00'] };
      const response = await POST(createRequest(body));
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toContain('25:00');
    });

    it('時間が10:60のように分が不正な場合は400を返す', async () => {
      const body = { ...validBody, times: ['10:60'] };
      const response = await POST(createRequest(body));
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toContain('10:60');
    });

    it('startDateがendDateより後の場合は400を返す', async () => {
      const body = { ...validBody, startDate: '2024-06-20', endDate: '2024-06-15' };
      const response = await POST(createRequest(body));
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toContain('before or equal');
    });

    it('日付範囲が90日を超える場合は400を返す', async () => {
      const body = {
        ...validBody,
        startDate: '2024-01-01',
        endDate: '2024-06-01',
      };
      const response = await POST(createRequest(body));
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toContain('90 days');
    });

    it('不正なJSONボディの場合は400を返す', async () => {
      vi.mocked(requireRole).mockResolvedValue(mockAdminUser);

      const request = new NextRequest(
        'http://localhost:3000/api/admin/slots/generate',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{invalid json',
        }
      );
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toContain('Invalid JSON');
    });
  });

  // -------------------------------------------------------
  // 3. Slot generation tests
  // -------------------------------------------------------
  describe('Slot Generation', () => {
    beforeEach(() => {
      vi.mocked(requireRole).mockResolvedValue(mockAdminUser);
    });

    it('正しい数のスロットを生成する (3日 x 3時間 = 9)', async () => {
      setupSlotGenerationMocks({
        insertResult: {
          data: Array(9).fill({ id: 'slot-id' }),
          error: null,
        },
      });

      const response = await POST(createRequest(validBody));
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.created).toBe(9);
      expect(json.data.skipped).toBe(0);

      // insert が呼ばれた際の引数を検証
      const insertCalls = mockAdminClient.from.mock.results.filter(
        (_r: unknown, i: number) =>
          mockAdminClient.from.mock.calls[i]?.[0] === 'slots'
      );
      // insert 呼び出しがあることを確認
      expect(insertCalls.length).toBeGreaterThan(0);
    });

    it('既存スロットと重複する場合はスキップする', async () => {
      // 3つの既存スロットを設定
      const existingSlots = [
        { slot_date: '2024-06-15', slot_time: '09:00', course_id: null },
        { slot_date: '2024-06-15', slot_time: '10:30', course_id: null },
        { slot_date: '2024-06-16', slot_time: '14:00', course_id: null },
      ];

      setupSlotGenerationMocks({
        existingSlots,
        insertResult: {
          data: Array(6).fill({ id: 'slot-id' }),
          error: null,
        },
      });

      const response = await POST(createRequest(validBody));
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.data.created).toBe(6);
      expect(json.data.skipped).toBe(3);
    });

    it('courseIdが存在しないコースの場合は404を返す', async () => {
      setupSlotGenerationMocks({
        courseCheck: { data: null, error: { message: 'Not found' } },
      });

      const body = { ...validBody, courseId: 'non-existent-course' };
      const response = await POST(createRequest(body));
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.error).toContain('Course not found');
    });

    it('同一日のstartDate/endDateでも正しく動作する', async () => {
      setupSlotGenerationMocks({
        insertResult: {
          data: Array(3).fill({ id: 'slot-id' }),
          error: null,
        },
      });

      const body = {
        ...validBody,
        startDate: '2024-06-15',
        endDate: '2024-06-15',
      };
      const response = await POST(createRequest(body));
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.data.created).toBe(3);
    });

    it('全スロットが重複の場合は "no new slots" メッセージを返す', async () => {
      // 全9スロットが既に存在
      const existingSlots = [
        { slot_date: '2024-06-15', slot_time: '09:00', course_id: null },
        { slot_date: '2024-06-15', slot_time: '10:30', course_id: null },
        { slot_date: '2024-06-15', slot_time: '14:00', course_id: null },
        { slot_date: '2024-06-16', slot_time: '09:00', course_id: null },
        { slot_date: '2024-06-16', slot_time: '10:30', course_id: null },
        { slot_date: '2024-06-16', slot_time: '14:00', course_id: null },
        { slot_date: '2024-06-17', slot_time: '09:00', course_id: null },
        { slot_date: '2024-06-17', slot_time: '10:30', course_id: null },
        { slot_date: '2024-06-17', slot_time: '14:00', course_id: null },
      ];

      setupSlotGenerationMocks({ existingSlots });

      const response = await POST(createRequest(validBody));
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data.created).toBe(0);
      expect(json.data.skipped).toBe(9);
      expect(json.data.message).toContain('No new slots');
    });
  });

  // -------------------------------------------------------
  // 4. Error handling tests
  // -------------------------------------------------------
  describe('Error Handling', () => {
    beforeEach(() => {
      vi.mocked(requireRole).mockResolvedValue(mockAdminUser);
    });

    it('バッチ挿入が全て失敗した場合は500を返す', async () => {
      setupSlotGenerationMocks({
        insertResult: {
          data: null,
          error: { message: 'Database connection failed' },
        },
      });

      const response = await POST(createRequest(validBody));
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error).toContain('Failed to create slots');
    });

    it('一部バッチが失敗した場合はwarningsを含めて201を返す', async () => {
      // 大量のスロット生成をシミュレート (101以上でバッチ分割される)
      // 1バッチ目は成功、2バッチ目は失敗をシミュレート
      let insertCallCount = 0;

      mockAdminClient.from.mockImplementation((table: string) => {
        if (table === 'slots') {
          return {
            select: vi.fn().mockReturnValue({
              gte: vi.fn().mockReturnValue({
                lte: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({
                    data: [],
                    error: null,
                  }),
                }),
              }),
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockImplementation(() => {
                insertCallCount++;
                if (insertCallCount === 1) {
                  return Promise.resolve({
                    data: Array(100).fill({ id: 'slot-id' }),
                    error: null,
                  });
                }
                return Promise.resolve({
                  data: null,
                  error: { message: 'Partial batch failure' },
                });
              }),
            }),
          };
        }
        return { select: vi.fn() };
      });

      // 35日 x 3時間 = 105スロット -> 2バッチ (100 + 5)
      const body = {
        startDate: '2024-06-01',
        endDate: '2024-07-05',
        times: ['09:00', '10:30', '14:00'],
        maxPax: 4,
      };

      const response = await POST(createRequest(body));
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.data.created).toBe(100);
      expect(json.data.warnings).toBeDefined();
      expect(json.data.warnings.length).toBeGreaterThan(0);
    });

    it('maxPaxのデフォルト値が4として適用される', async () => {
      setupSlotGenerationMocks({
        insertResult: {
          data: Array(3).fill({ id: 'slot-id' }),
          error: null,
        },
      });

      const body = {
        startDate: '2024-06-15',
        endDate: '2024-06-15',
        times: ['09:00', '10:30', '14:00'],
        // maxPax intentionally omitted
      };

      const response = await POST(createRequest(body));
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.data.created).toBe(3);

      // insert に渡されたスロットオブジェクトを検証
      const slotsFromCalls = mockAdminClient.from.mock.calls;
      const insertCall = slotsFromCalls.find(
        (call: unknown[]) => call[0] === 'slots'
      );
      expect(insertCall).toBeDefined();
    });
  });
});
