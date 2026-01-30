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
  HttpStatus,
} from '@/lib/api/response';
import type { Database } from '@/lib/supabase/database.types';

type AnnouncementUpdate = Database['public']['Tables']['announcements']['Update'];
type AnnouncementStatus = Database['public']['Enums']['announcement_status'];

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/admin/announcements/[id]
 * Get a single announcement by ID
 * Accessible by: admin, staff
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const supabase = await createClient();
    const { id } = await context.params;

    // Require admin or staff role
    await requireRole(supabase, ['admin', 'staff']);

    // Fetch the announcement
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Announcement not found', HttpStatus.NOT_FOUND);
      }
      console.error('Error fetching announcement:', error);
      return errorResponse('Failed to fetch announcement', HttpStatus.INTERNAL_SERVER_ERROR);
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

    return successResponse(announcement);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResponse(error.message, HttpStatus.UNAUTHORIZED);
    }
    if (error instanceof AuthorizationError) {
      return errorResponse(error.message, HttpStatus.FORBIDDEN);
    }
    console.error('Unexpected error in GET /api/admin/announcements/[id]:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * PUT /api/admin/announcements/[id]
 * Update an announcement
 * Accessible by: admin only
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const supabase = await createClient();
    const { id } = await context.params;

    // Require admin role for updating announcements
    await requireRole(supabase, ['admin']);

    // Parse request body
    const body = await request.json();

    // Check if announcement exists
    const { data: existing, error: fetchError } = await supabase
      .from('announcements')
      .select('id, status')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return errorResponse('Announcement not found', HttpStatus.NOT_FOUND);
      }
      console.error('Error fetching announcement:', fetchError);
      return errorResponse('Failed to fetch announcement', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Validate status if provided
    const validStatuses: AnnouncementStatus[] = ['draft', 'scheduled', 'sent', 'published'];
    if (body.status && !validStatuses.includes(body.status)) {
      return errorResponse('Invalid status', HttpStatus.BAD_REQUEST);
    }

    // Validate type if provided
    if (body.type && !['reservation', 'public'].includes(body.type)) {
      return errorResponse('Invalid type', HttpStatus.BAD_REQUEST);
    }

    // Prepare update data
    const updateData: AnnouncementUpdate = {};

    if (body.type !== undefined) updateData.type = body.type;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.target !== undefined) updateData.target = body.target;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.scheduledAt !== undefined) updateData.scheduled_at = body.scheduledAt;
    if (body.author !== undefined) updateData.author = body.author;

    // Set sent_at when transitioning to sent/published status
    if (body.status && (body.status === 'sent' || body.status === 'published')) {
      if (existing.status !== 'sent' && existing.status !== 'published') {
        updateData.sent_at = new Date().toISOString();
      }
    }

    // Update the announcement
    const { data, error } = await supabase
      .from('announcements')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating announcement:', error);
      return errorResponse('Failed to update announcement', HttpStatus.INTERNAL_SERVER_ERROR);
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

    return successResponse(announcement);
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
    console.error('Unexpected error in PUT /api/admin/announcements/[id]:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * DELETE /api/admin/announcements/[id]
 * Delete an announcement
 * Accessible by: admin only
 */
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const supabase = await createClient();
    const { id } = await context.params;

    // Require admin role for deleting announcements
    await requireRole(supabase, ['admin']);

    // Check if announcement exists
    const { error: fetchError } = await supabase
      .from('announcements')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return errorResponse('Announcement not found', HttpStatus.NOT_FOUND);
      }
      console.error('Error fetching announcement:', fetchError);
      return errorResponse('Failed to fetch announcement', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Delete the announcement
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting announcement:', error);
      return errorResponse('Failed to delete announcement', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return successResponse({ deleted: true, id });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResponse(error.message, HttpStatus.UNAUTHORIZED);
    }
    if (error instanceof AuthorizationError) {
      return errorResponse(error.message, HttpStatus.FORBIDDEN);
    }
    console.error('Unexpected error in DELETE /api/admin/announcements/[id]:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
