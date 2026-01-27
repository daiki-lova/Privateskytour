import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireRole, AuthenticationError, AuthorizationError } from '@/lib/auth';
import { successResponse, errorResponse, HttpStatus } from '@/lib/api/response';

/**
 * GET /api/admin/settings
 * Get all system settings or specific settings by keys
 *
 * Query params:
 * - keys: Comma-separated list of setting keys (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Require admin or staff role
    await requireRole(supabase, ['admin', 'staff']);

    const { searchParams } = new URL(request.url);
    const keysParam = searchParams.get('keys');

    let query = supabase.from('system_settings').select('*');

    if (keysParam) {
      const keys = keysParam.split(',').map((k) => k.trim());
      query = query.in('key', keys);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch settings:', error);
      return errorResponse('Failed to fetch settings', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Convert array to key-value object for easier consumption
    const settings: Record<string, unknown> = {};
    data?.forEach((item) => {
      settings[item.key] = item.value;
    });

    return successResponse(settings);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResponse(error.message, HttpStatus.UNAUTHORIZED);
    }
    if (error instanceof AuthorizationError) {
      return errorResponse(error.message, HttpStatus.FORBIDDEN);
    }
    console.error('Get settings error:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * PUT /api/admin/settings
 * Update system settings
 *
 * Body:
 * - settings: Object with key-value pairs to update
 *   Example: { "active_hours": ["09:00", "10:00"], "holiday_mode": true }
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Require admin role for updating settings
    await requireRole(supabase, ['admin']);

    const body = await request.json();
    const { settings } = body as { settings: Record<string, unknown> };

    if (!settings || typeof settings !== 'object') {
      return errorResponse('Settings object is required', HttpStatus.BAD_REQUEST);
    }

    // Update each setting
    const updates = Object.entries(settings).map(async ([key, value]) => {
      const { error } = await supabase
        .from('system_settings')
        .upsert(
          {
            key,
            value,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        );

      if (error) {
        console.error(`Failed to update setting ${key}:`, error);
        throw error;
      }

      return { key, success: true };
    });

    await Promise.all(updates);

    return successResponse({ message: 'Settings updated successfully' });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResponse(error.message, HttpStatus.UNAUTHORIZED);
    }
    if (error instanceof AuthorizationError) {
      return errorResponse(error.message, HttpStatus.FORBIDDEN);
    }
    console.error('Update settings error:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
