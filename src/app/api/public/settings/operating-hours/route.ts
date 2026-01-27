import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, HttpStatus } from '@/lib/api/response';

/**
 * GET /api/public/settings/operating-hours
 * Get active operating hours from system settings
 *
 * Returns:
 * - activeHours: Array of time slots that are currently active (e.g., ["09:00", "09:30", ...])
 * - holidayMode: Whether the system is in holiday mode (no bookings allowed)
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch active_hours and holiday_mode settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', ['active_hours', 'holiday_mode']);

    if (settingsError) {
      console.error('Failed to fetch operating hours:', settingsError);
      // Fall back to default hours
      return successResponse({
        activeHours: [
          '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
          '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
          '16:00', '16:30', '17:00'
        ],
        holidayMode: false,
        isDefault: true,
      });
    }

    // Parse settings
    const settings: Record<string, unknown> = {};
    settingsData?.forEach((item) => {
      settings[item.key] = item.value;
    });

    const activeHours = Array.isArray(settings.active_hours)
      ? settings.active_hours as string[]
      : [
          '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
          '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
          '16:00', '16:30', '17:00'
        ];

    const holidayMode = typeof settings.holiday_mode === 'boolean'
      ? settings.holiday_mode
      : false;

    return successResponse({
      activeHours,
      holidayMode,
      isDefault: !settings.active_hours,
    });
  } catch (error) {
    console.error('Get operating hours error:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
