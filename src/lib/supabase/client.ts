import { createBrowserClient } from '@supabase/ssr';

// モックSupabaseクライアント（開発用・クライアントサイド）
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
      onAuthStateChange: (callback: (event: string, session: unknown) => void) => {
        // モック認証状態変更リスナー - 非同期で呼び出す
        if (typeof callback === 'function') {
          setTimeout(() => {
            callback('SIGNED_IN', { user: { id: mockUser.id, email: mockUser.email } });
          }, 0);
        }
        return {
          data: {
            subscription: {
              unsubscribe: () => {},
            },
          },
        };
      },
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

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const devSkipAuth = process.env.NEXT_PUBLIC_DEV_SKIP_AUTH === 'true';

  // 開発モードでSupabase未設定の場合はモッククライアントを返す
  if (devSkipAuth && (!supabaseUrl || !supabaseKey)) {
    console.warn('⚠️ DEV_SKIP_AUTH mode: Using mock Supabase client (browser)');
    return createMockClient() as unknown as ReturnType<typeof createBrowserClient>;
  }

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
