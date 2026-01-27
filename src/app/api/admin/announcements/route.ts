import { NextRequest } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import {
  requireRole,
  AuthenticationError,
  AuthorizationError,
} from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  HttpStatus,
} from '@/lib/api/response';
import type { Database } from '@/lib/supabase/database.types';

type AnnouncementInsert = Database['public']['Tables']['announcements']['Insert'];
type AnnouncementType = Database['public']['Enums']['announcement_type'];
type AnnouncementStatus = Database['public']['Enums']['announcement_status'];

/**
 * GET /api/admin/announcements
 * List all announcements with optional filtering
 * Accessible by: admin, staff
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Require admin or staff role
    await requireRole(supabase, ['admin', 'staff']);

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as AnnouncementType | null;
    const status = searchParams.get('status') as AnnouncementStatus | null;
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('page_size') || '50', 10);

    // Build query
    let query = supabase
      .from('announcements')
      .select('*', { count: 'exact' });

    // Apply filters
    if (type) {
      query = query.eq('type', type);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    // Apply ordering (newest first)
    query = query.order('created_at', { ascending: false });

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching announcements:', error);
      return errorResponse('Failed to fetch announcements', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Map database columns to camelCase for response
    const announcements = (data || []).map((announcement) => ({
      id: announcement.id,
      type: announcement.type,
      title: announcement.title,
      content: announcement.content,
      target: announcement.target,
      status: announcement.status,
      scheduledAt: announcement.scheduled_at,
      sentAt: announcement.sent_at,
      author: announcement.author,
      createdAt: announcement.created_at,
      updatedAt: announcement.updated_at,
    }));

    return paginatedResponse(announcements, count || 0, page, pageSize);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResponse(error.message, HttpStatus.UNAUTHORIZED);
    }
    if (error instanceof AuthorizationError) {
      return errorResponse(error.message, HttpStatus.FORBIDDEN);
    }
    console.error('Unexpected error in GET /api/admin/announcements:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * POST /api/admin/announcements
 * Create a new announcement
 * Accessible by: admin only
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Require admin role for creating announcements
    const adminUser = await requireRole(supabase, ['admin']);

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.title) {
      return errorResponse('Title is required', HttpStatus.BAD_REQUEST);
    }
    if (!body.content) {
      return errorResponse('Content is required', HttpStatus.BAD_REQUEST);
    }
    if (!body.type || !['reservation', 'public'].includes(body.type)) {
      return errorResponse('Valid type is required (reservation or public)', HttpStatus.BAD_REQUEST);
    }

    // Validate status if provided
    const validStatuses = ['draft', 'scheduled', 'sent', 'published'];
    if (body.status && !validStatuses.includes(body.status)) {
      return errorResponse('Invalid status', HttpStatus.BAD_REQUEST);
    }

    // Prepare insert data (map camelCase to snake_case)
    const insertData: AnnouncementInsert = {
      type: body.type,
      title: body.title,
      content: body.content,
      target: body.target || null,
      status: body.status || 'draft',
      scheduled_at: body.scheduledAt || null,
      author: body.author || adminUser.name || 'Admin',
    };

    // Set sent_at for immediate send/publish
    if (body.status === 'sent' || body.status === 'published') {
      insertData.sent_at = new Date().toISOString();
    }

    // Insert the announcement
    const { data, error } = await supabase
      .from('announcements')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating announcement:', error);
      return errorResponse('Failed to create announcement', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Map response to camelCase
    const announcement = {
      id: data.id,
      type: data.type,
      title: data.title,
      content: data.content,
      target: data.target,
      status: data.status,
      scheduledAt: data.scheduled_at,
      sentAt: data.sent_at,
      author: data.author,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return successResponse(announcement, HttpStatus.CREATED);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResponse(error.message, HttpStatus.UNAUTHORIZED);
    }
    if (error instanceof AuthorizationError) {
      return errorResponse(error.message, HttpStatus.FORBIDDEN);
    }
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', HttpStatus.BAD_REQUEST);
    }
    console.error('Unexpected error in POST /api/admin/announcements:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
