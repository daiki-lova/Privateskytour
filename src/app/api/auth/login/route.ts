import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, HttpStatus } from '@/lib/api/response';
import type { AdminUser } from '@/lib/data/types';

interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LoginRequest;
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse('Email and password are required', HttpStatus.BAD_REQUEST);
    }

    const supabase = await createClient();

    // Sign in with email and password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return errorResponse(authError.message, HttpStatus.UNAUTHORIZED);
    }

    if (!authData.user) {
      return errorResponse('Login failed', HttpStatus.UNAUTHORIZED);
    }

    // Verify user exists in admin_users table and is active
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', authData.user.id)
      .eq('is_active', true)
      .single();

    if (adminError || !adminUser) {
      // Sign out the user if they are not an admin
      await supabase.auth.signOut();
      return errorResponse('Access denied: Not an admin user', HttpStatus.FORBIDDEN);
    }

    // Update last_login_at timestamp
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', authData.user.id);

    if (updateError) {
      console.error('Failed to update last_login_at:', updateError);
      // Continue anyway - this is not a critical error
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

    return successResponse(responseUser);
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
