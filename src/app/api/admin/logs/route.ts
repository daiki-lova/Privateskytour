import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireRole, AuthenticationError, AuthorizationError } from '@/lib/auth';
import {
  errorResponse,
  paginatedResponse,
  HttpStatus,
} from '@/lib/api/response';
import type { AuditLog, LogType, LogStatus } from '@/lib/data/types';

/**
 * Convert database row to AuditLog type
 */
function toAuditLog(row: Record<string, unknown>): AuditLog {
  return {
    id: row.id as string,
    logType: row.log_type as LogType,
    action: row.action as string,
    status: row.status as LogStatus,
    message: row.message as string | undefined,
    userId: row.user_id as string | undefined,
    userEmail: row.user_email as string | undefined,
    targetTable: row.target_table as string | undefined,
    targetId: row.target_id as string | undefined,
    oldValues: row.old_values as Record<string, unknown> | undefined,
    newValues: row.new_values as Record<string, unknown> | undefined,
    ipAddress: row.ip_address as string | undefined,
    userAgent: row.user_agent as string | undefined,
    metadata: row.metadata as Record<string, unknown> | undefined,
    createdAt: row.created_at as string,
  };
}

/**
 * GET /api/admin/logs
 * List audit logs with filtering
 *
 * Query params:
 * - page: Page number (default: 1)
 * - pageSize: Items per page (default: 50, max: 100)
 * - type: Filter by log type (stripe, crm, system, operation, auth)
 * - status: Filter by status (success, failure, warning, info)
 * - startDate: Filter logs from this date (ISO string)
 * - endDate: Filter logs until this date (ISO string)
 * - userId: Filter by user ID
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Require admin or staff role
    await requireRole(supabase, ['admin', 'staff']);

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '50', 10)));
    const logType = searchParams.get('type') as LogType | null;
    const status = searchParams.get('status') as LogStatus | null;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const userId = searchParams.get('userId');

    const offset = (page - 1) * pageSize;

    // Build query
    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (logType) {
      const validTypes: LogType[] = ['stripe', 'crm', 'system', 'operation', 'auth'];
      if (validTypes.includes(logType)) {
        query = query.eq('log_type', logType);
      }
    }

    if (status) {
      const validStatuses: LogStatus[] = ['success', 'failure', 'warning', 'info'];
      if (validStatuses.includes(status)) {
        query = query.eq('status', status);
      }
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    if (userId) {
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(userId)) {
        query = query.eq('user_id', userId);
      }
    }

    // Apply pagination
    query = query.range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching audit logs:', error);
      return errorResponse('Failed to fetch audit logs', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const logs = (data || []).map(toAuditLog);
    const total = count || 0;

    return paginatedResponse(logs, total, page, pageSize);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResponse(error.message, HttpStatus.UNAUTHORIZED);
    }
    if (error instanceof AuthorizationError) {
      return errorResponse(error.message, HttpStatus.FORBIDDEN);
    }
    console.error('Get audit logs error:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
