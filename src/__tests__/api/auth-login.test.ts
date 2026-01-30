import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// --- Mock setup (hoisted) ---

const mockAuthClient = vi.hoisted(() => ({
  auth: {
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
  },
}));

const mockAdminClient = vi.hoisted(() => ({
  from: vi.fn(),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => mockAuthClient),
}));

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: vi.fn(() => mockAdminClient),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      getAll: vi.fn(() => []),
      set: vi.fn(),
    })
  ),
}));

import { POST } from '@/app/api/auth/login/route';

// --- Helpers ---

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const MOCK_ADMIN_ROW = {
  id: 'admin-user-id',
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'admin',
  avatar_url: null,
  is_active: true,
  last_login_at: '2024-01-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

/**
 * Sets up mockAdminClient.from() to chain .select().eq().eq().single()
 * and then optionally .update().eq() for the last_login_at update.
 */
function setupAdminClientChain(options: {
  selectResult: { data: typeof MOCK_ADMIN_ROW | null; error: { message: string } | null };
  updateResult?: { error: { message: string } | null };
}) {
  const updateEq = vi.fn(() => options.updateResult ?? { error: null });
  const updateFn = vi.fn(() => ({ eq: updateEq }));

  const singleFn = vi.fn(() => options.selectResult);
  const eqActiveFn = vi.fn(() => ({ single: singleFn }));
  const eqIdFn = vi.fn(() => ({ eq: eqActiveFn }));
  const selectFn = vi.fn(() => ({ eq: eqIdFn }));

  mockAdminClient.from.mockImplementation((table: string) => {
    if (table === 'admin_users') {
      // Return different chain depending on the method called
      return {
        select: selectFn,
        update: updateFn,
      };
    }
    return {};
  });

  return { selectFn, eqIdFn, eqActiveFn, singleFn, updateFn, updateEq };
}

function setupSuccessfulAuth() {
  mockAuthClient.auth.signInWithPassword.mockResolvedValue({
    data: { user: { id: 'admin-user-id', email: 'admin@example.com' } },
    error: null,
  });
}

// --- Tests ---

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  });

  // ---------- Validation ----------

  describe('Validation', () => {
    it('returns 400 when email is missing', async () => {
      const req = createRequest({ password: 'secret123' });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain('required');
    });

    it('returns 400 when password is missing', async () => {
      const req = createRequest({ email: 'admin@example.com' });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain('required');
    });
  });

  // ---------- Auth ----------

  describe('Authentication', () => {
    it('returns 401 when signInWithPassword returns an error', async () => {
      mockAuthClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid login credentials' },
      });

      const req = createRequest({ email: 'wrong@example.com', password: 'wrong' });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Invalid login credentials');
    });

    it('returns 401 when no user is returned from auth', async () => {
      mockAuthClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const req = createRequest({ email: 'ghost@example.com', password: 'pass' });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Login failed');
    });

    it('returns 403 and signs out when user is not in admin_users', async () => {
      setupSuccessfulAuth();
      setupAdminClientChain({
        selectResult: { data: null, error: { message: 'No rows found' } },
      });
      mockAuthClient.auth.signOut.mockResolvedValue({ error: null });

      const req = createRequest({ email: 'admin@example.com', password: 'pass' });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.success).toBe(false);
      expect(json.error).toContain('Not an admin user');
      expect(mockAuthClient.auth.signOut).toHaveBeenCalledOnce();
    });

    it('returns 403 when admin user is inactive', async () => {
      setupSuccessfulAuth();
      // is_active = false means the .eq('is_active', true).single() won't match
      setupAdminClientChain({
        selectResult: { data: null, error: { message: 'No rows found' } },
      });
      mockAuthClient.auth.signOut.mockResolvedValue({ error: null });

      const req = createRequest({ email: 'admin@example.com', password: 'pass' });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.success).toBe(false);
      expect(mockAuthClient.auth.signOut).toHaveBeenCalledOnce();
    });
  });

  // ---------- Success ----------

  describe('Successful login', () => {
    it('returns admin user data on valid login', async () => {
      setupSuccessfulAuth();
      setupAdminClientChain({
        selectResult: { data: MOCK_ADMIN_ROW, error: null },
        updateResult: { error: null },
      });

      const req = createRequest({ email: 'admin@example.com', password: 'pass' });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toMatchObject({
        id: 'admin-user-id',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        isActive: true,
      });
      // avatarUrl is mapped from avatar_url (null)
      expect(json.data.avatarUrl).toBeNull();
    });

    it('calls update on admin_users to set last_login_at', async () => {
      setupSuccessfulAuth();
      const { updateFn, updateEq } = setupAdminClientChain({
        selectResult: { data: MOCK_ADMIN_ROW, error: null },
        updateResult: { error: null },
      });

      const req = createRequest({ email: 'admin@example.com', password: 'pass' });
      await POST(req);

      // from('admin_users') is called twice: once for select, once for update
      expect(mockAdminClient.from).toHaveBeenCalledWith('admin_users');
      expect(updateFn).toHaveBeenCalledWith(
        expect.objectContaining({ last_login_at: expect.stringMatching(/^\d{4}-/) })
      );
      expect(updateEq).toHaveBeenCalledWith('id', 'admin-user-id');
    });

    it('still succeeds when last_login_at update fails', async () => {
      setupSuccessfulAuth();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      setupAdminClientChain({
        selectResult: { data: MOCK_ADMIN_ROW, error: null },
        updateResult: { error: { message: 'Update failed' } },
      });

      const req = createRequest({ email: 'admin@example.com', password: 'pass' });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to update last_login_at:',
        expect.objectContaining({ message: 'Update failed' })
      );

      consoleSpy.mockRestore();
    });
  });

  // ---------- Error handling ----------

  describe('Error handling', () => {
    it('returns 500 when request body is not valid JSON', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const req = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not-json',
      });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error).toBe('An unexpected error occurred');

      consoleSpy.mockRestore();
    });

    it('returns 500 when NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;

      const req = createRequest({ email: 'admin@example.com', password: 'pass' });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error).toContain('configuration');
    });
  });

  // ---------- Config ----------

  describe('Configuration', () => {
    it('returns 500 when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const req = createRequest({ email: 'admin@example.com', password: 'pass' });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error).toContain('configuration');
    });
  });
});
