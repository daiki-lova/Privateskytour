import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { AdminUser, UserRole } from '@/lib/data/types';

/**
 * Authentication error thrown when user is not authenticated
 */
export class AuthenticationError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error thrown when user doesn't have required role
 */
export class AuthorizationError extends Error {
  constructor(message = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Get the current Supabase auth user
 * @returns The authenticated user or null if not authenticated
 */
export async function getCurrentUser(
  supabase: SupabaseClient
): Promise<User | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting current user:', error.message);
    return null;
  }

  return user;
}

/**
 * Get the admin user from admin_users table (includes role information)
 * @returns The admin user with role or null if not found
 */
export async function getAdminUser(
  supabase: SupabaseClient
): Promise<AdminUser | null> {
  const user = await getCurrentUser(supabase);

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('admin_users')
    .select('id, email, name, role, avatar_url, is_active, last_login_at, created_at, updated_at')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error getting admin user:', error.message);
    return null;
  }

  if (!data) {
    return null;
  }

  // Map snake_case database columns to camelCase TypeScript interface
  return {
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
}

/**
 * Require authentication - throws if not authenticated
 * @throws AuthenticationError if user is not authenticated
 * @returns The authenticated Supabase user
 */
export async function requireAuth(supabase: SupabaseClient): Promise<User> {
  const user = await getCurrentUser(supabase);

  if (!user) {
    throw new AuthenticationError();
  }

  return user;
}

/**
 * Require specific role(s) - throws if not authorized
 * @param roles Array of allowed roles
 * @throws AuthenticationError if user is not authenticated
 * @throws AuthorizationError if user doesn't have required role or is inactive
 * @returns The admin user with verified role
 */
export async function requireRole(
  supabase: SupabaseClient,
  roles: UserRole[]
): Promise<AdminUser> {
  // First ensure user is authenticated
  await requireAuth(supabase);

  // Get admin user with role
  const adminUser = await getAdminUser(supabase);

  if (!adminUser) {
    throw new AuthorizationError('User not found in admin users');
  }

  // Check if user is active
  if (!adminUser.isActive) {
    throw new AuthorizationError('User account is inactive');
  }

  // Check if user has one of the required roles
  if (!roles.includes(adminUser.role)) {
    throw new AuthorizationError(
      `Required role: ${roles.join(' or ')}. Current role: ${adminUser.role}`
    );
  }

  return adminUser;
}
