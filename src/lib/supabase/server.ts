import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

type CookieToSet = {
  name: string;
  value: string;
  options?: Partial<ResponseCookie>;
};

// モックSupabaseクライアント（開発用）
function createMockClient() {
  const mockUser = {
    id: 'dev-admin-id',
    email: 'admin@privatesky.jp',
    name: '開発管理者',
    role: 'admin',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return {
    auth: {
      signInWithPassword: async () => ({
        data: { user: { id: mockUser.id, email: mockUser.email } },
        error: null,
      }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({
        data: { user: { id: mockUser.id, email: mockUser.email } },
        error: null,
      }),
    },
    from: (table: string) => ({
      select: (_columns?: string) => ({
        eq: (_column: string, _value: unknown) => ({
          eq: (_col2: string, _val2: unknown) => ({
            single: async () => {
              if (table === 'admin_users') {
                return { data: mockUser, error: null };
              }
              return { data: null, error: null };
            },
          }),
          single: async () => {
            if (table === 'admin_users') {
              return { data: mockUser, error: null };
            }
            return { data: null, error: null };
          },
          order: () => ({
            range: () => ({
              then: (resolve: (result: { data: unknown[]; error: null; count: number }) => void) =>
                resolve({ data: [], error: null, count: 0 }),
            }),
          }),
        }),
        order: () => ({
          range: () => ({
            then: (resolve: (result: { data: unknown[]; error: null; count: number }) => void) =>
              resolve({ data: [], error: null, count: 0 }),
          }),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: async () => ({ data: null, error: null }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: async () => ({ data: null, error: null }),
          }),
        }),
      }),
      delete: () => ({
        eq: () => ({ then: (resolve: (result: { error: null }) => void) => resolve({ error: null }) }),
      }),
    }),
  };
}

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const devSkipAuth = process.env.DEV_SKIP_AUTH === 'true';

  // 開発モードでSupabase未設定の場合はモッククライアントを返す
  if (devSkipAuth && (!supabaseUrl || !supabaseKey)) {
    console.warn('⚠️ DEV_SKIP_AUTH mode: Using mock Supabase client');
    return createMockClient() as unknown as ReturnType<typeof createServerClient>;
  }

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component - ignore
        }
      },
    },
  });
}
