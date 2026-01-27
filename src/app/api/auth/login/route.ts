import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/server';
import type { AdminUser } from '@/lib/data/types';
import { cookies } from 'next/headers';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

type CookieToSet = {
  name: string;
  value: string;
  options?: Partial<ResponseCookie>;
};

interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LoginRequest;
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();

    // Create Supabase client with cookie handling
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    });

    // Sign in with email and password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: 401 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: 'Login failed' },
        { status: 401 }
      );
    }

    // Use admin client to verify user exists in admin_users table (bypasses RLS)
    const adminClient = createAdminClient();
    const { data: adminUser, error: adminError } = await adminClient
      .from('admin_users')
      .select('*')
      .eq('id', authData.user.id)
      .eq('is_active', true)
      .single();

    if (adminError || !adminUser) {
      // Sign out the user if they are not an admin
      await supabase.auth.signOut();
      return NextResponse.json(
        { success: false, error: 'Access denied: Not an admin user' },
        { status: 403 }
      );
    }

    // Update last_login_at timestamp using admin client
    const { error: updateError } = await adminClient
      .from('admin_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', authData.user.id);

    if (updateError) {
      console.error('Failed to update last_login_at:', updateError);
    }

    const responseUser: AdminUser = {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      avatarUrl: adminUser.avatar_url,
      isActive: adminUser.is_active,
      lastLoginAt: new Date().toISOString(),
      createdAt: adminUser.created_at,
      updatedAt: adminUser.updated_at,
    };

    return NextResponse.json({ success: true, data: responseUser });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
