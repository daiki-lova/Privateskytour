import { createClient } from '@/lib/supabase/server';
import { getCurrentUser, getAdminUser } from '@/lib/auth';
import { successResponse, errorResponse, HttpStatus } from '@/lib/api/response';

export async function GET() {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser(supabase);

    if (!user) {
      return errorResponse('Not authenticated', HttpStatus.UNAUTHORIZED);
    }

    const adminUser = await getAdminUser(supabase);

    if (!adminUser) {
      return errorResponse('Not an admin user', HttpStatus.UNAUTHORIZED);
    }

    return successResponse(adminUser);
  } catch (error) {
    console.error('Get current user error:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
