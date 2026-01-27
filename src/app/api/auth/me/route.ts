import { createClient, createAdminClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, HttpStatus } from '@/lib/api/response';
import type { AdminUser, UserRole } from '@/lib/data/types';

export async function GET() {
  try {
    // DEV_SKIP_AUTH mode: return mock admin user for development
    if (process.env.DEV_SKIP_AUTH === 'true') {
      const mockAdminUser: AdminUser = {
        id: 'dev-admin',
        email: 'dev@admin.local',
        name: 'Dev Admin',
        role: 'admin' as UserRole,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return successResponse(mockAdminUser);
    }

    const supabase = await createClient();
    const user = await getCurrentUser(supabase);

    if (!user) {
      return errorResponse('Not authenticated', HttpStatus.UNAUTHORIZED);
    }

    // Use admin client to bypass RLS for admin_users table
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('admin_users')
      .select('id, email, name, role, avatar_url, is_active, last_login_at, created_at, updated_at')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      return errorResponse('Not an admin user', HttpStatus.UNAUTHORIZED);
    }

    const adminUser: AdminUser = {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role as UserRole,
      avatarUrl: data.avatar_url ?? undefined,
      isActive: data.is_active,
      lastLoginAt: data.last_login_at ?? undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return successResponse(adminUser);
  } catch (error) {
    console.error('Get current user error:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
