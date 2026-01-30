// ============================================================
// Supabase Mock Factory - Chainable mock builder for tests
// ============================================================

import { vi } from 'vitest';

// ============================================================
// Types
// ============================================================

interface SupabaseResponse<T> {
  data: T | null;
  error: { message: string } | null;
}

interface MockChainTerminal<T> {
  single: ReturnType<typeof vi.fn>;
  then?: ReturnType<typeof vi.fn>;
  _resolvedValue: SupabaseResponse<T>;
}

interface MockSelectChain<T> {
  eq: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  range: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  _terminal: MockChainTerminal<T>;
}

interface MockMutationChain<T> {
  eq: ReturnType<typeof vi.fn>;
  select: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  _resolvedValue: SupabaseResponse<T>;
}

interface MockTableReturn {
  select: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
}

export interface MockSupabaseClient {
  from: ReturnType<typeof vi.fn>;
}

// ============================================================
// Query result configuration
// ============================================================

interface SelectConfig<T = unknown> {
  /** Data returned by the query */
  data: T | null;
  /** Error message (null for success) */
  error?: string | null;
}

interface MutationConfig<T = unknown> {
  /** Data returned after insert/update */
  data?: T | null;
  /** Error message (null for success) */
  error?: string | null;
}

export interface TableConfig {
  select?: SelectConfig;
  insert?: MutationConfig;
  update?: MutationConfig;
  delete?: MutationConfig;
}

export type MultiTableConfig = Record<string, TableConfig>;

// ============================================================
// Mock Factory
// ============================================================

/**
 * Creates a fresh Supabase client mock with a chainable `from()` method.
 *
 * Usage with vi.hoisted:
 * ```ts
 * const mockSupabaseClient = vi.hoisted(() => createMockSupabaseClient());
 * vi.mock('@/lib/supabase/server', () => ({
 *   createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
 * }));
 * ```
 */
export function createMockSupabaseClient(): MockSupabaseClient {
  return {
    from: vi.fn(),
  };
}

// ============================================================
// Select chain builder
// ============================================================

function buildSelectChain<T>(config: SelectConfig<T>): MockSelectChain<T> {
  const response: SupabaseResponse<T> = {
    data: config.data,
    error: config.error ? { message: config.error } : null,
  };

  const terminal: MockChainTerminal<T> = {
    single: vi.fn().mockResolvedValue(response),
    _resolvedValue: response,
  };

  // Build a self-referencing chain so that any combination of
  // .eq().eq().single(), .order().limit().single(), etc. works
  const chain: MockSelectChain<T> = {
    eq: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    range: vi.fn(),
    single: terminal.single,
    _terminal: terminal,
  };

  // Each chainable method returns the chain itself
  chain.eq.mockReturnValue(chain);
  chain.order.mockReturnValue(chain);
  chain.limit.mockReturnValue(chain);
  chain.range.mockReturnValue(chain);

  return chain;
}

// ============================================================
// Mutation chain builder (insert / update / delete)
// ============================================================

function buildMutationChain<T>(config: MutationConfig<T>): MockMutationChain<T> {
  const response: SupabaseResponse<T | null> = {
    data: config.data ?? null,
    error: config.error ? { message: config.error } : null,
  };

  // If no data is provided, resolve directly (e.g. simple update/delete)
  if (config.data === undefined) {
    const directResolve = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue(response),
    });
    return {
      eq: vi.fn().mockResolvedValue(response),
      select: directResolve,
      single: vi.fn().mockResolvedValue(response),
      _resolvedValue: response as SupabaseResponse<T>,
    };
  }

  // With data: build insert().select().single() chain
  const singleFn = vi.fn().mockResolvedValue(response);
  const selectFn = vi.fn().mockReturnValue({ single: singleFn });
  const eqFn = vi.fn().mockResolvedValue(response);

  return {
    eq: eqFn,
    select: selectFn,
    single: singleFn,
    _resolvedValue: response as SupabaseResponse<T>,
  };
}

// ============================================================
// Table mock setup
// ============================================================

/**
 * Sets up `from(tableName)` to return configured select/insert/update/delete chains.
 *
 * Usage:
 * ```ts
 * mockTableQuery(mockClient, 'slots', {
 *   select: { data: { id: 'slot-1', max_pax: 4, current_pax: 0, status: 'open' } },
 * });
 * ```
 */
export function mockTableQuery(
  mockClient: MockSupabaseClient,
  _tableName: string,
  config: TableConfig,
): MockTableReturn {
  const tableMock: MockTableReturn = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  if (config.select) {
    const chain = buildSelectChain(config.select);
    tableMock.select.mockReturnValue(chain);
  }

  if (config.insert) {
    const chain = buildMutationChain(config.insert);
    tableMock.insert.mockReturnValue(chain);
  }

  if (config.update) {
    const chain = buildMutationChain(config.update);
    tableMock.update.mockReturnValue(chain);
  }

  if (config.delete) {
    const chain = buildMutationChain(config.delete);
    tableMock.delete.mockReturnValue(chain);
  }

  mockClient.from.mockReturnValue(tableMock);

  return tableMock;
}

/**
 * Sets up `from()` with mockImplementation to handle multiple tables.
 *
 * Usage:
 * ```ts
 * const mocks = mockMultiTableQuery(mockClient, {
 *   slots: {
 *     select: { data: { id: 'slot-1', max_pax: 4, current_pax: 0, status: 'open' } },
 *   },
 *   courses: {
 *     select: { data: { id: 'course-1', price: 50000, is_active: true } },
 *   },
 * });
 * ```
 */
export function mockMultiTableQuery(
  mockClient: MockSupabaseClient,
  tableConfigs: MultiTableConfig,
): Record<string, MockTableReturn> {
  const tableMocks: Record<string, MockTableReturn> = {};

  for (const [tableName, config] of Object.entries(tableConfigs)) {
    const tableMock: MockTableReturn = {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    if (config.select) {
      const chain = buildSelectChain(config.select);
      tableMock.select.mockReturnValue(chain);
    }

    if (config.insert) {
      const chain = buildMutationChain(config.insert);
      tableMock.insert.mockReturnValue(chain);
    }

    if (config.update) {
      const chain = buildMutationChain(config.update);
      tableMock.update.mockReturnValue(chain);
    }

    if (config.delete) {
      const chain = buildMutationChain(config.delete);
      tableMock.delete.mockReturnValue(chain);
    }

    tableMocks[tableName] = tableMock;
  }

  mockClient.from.mockImplementation((table: string) => {
    const mock = tableMocks[table];
    if (!mock) {
      throw new Error(`Unmocked table: "${table}". Add it to mockMultiTableQuery config.`);
    }
    return mock;
  });

  return tableMocks;
}
