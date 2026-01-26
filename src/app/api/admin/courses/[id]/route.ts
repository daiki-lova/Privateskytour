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

type CourseUpdate = Database['public']['Tables']['courses']['Update'];

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/admin/courses/[id]
 * Get a single course by ID with full details
 * Accessible by: admin, staff
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Require admin or staff role
    await requireRole(supabase, ['admin', 'staff']);

    // Fetch course with heliport data
    const { data, error } = await supabase
      .from('courses')
      .select('*, heliports(id, name, name_en, name_zh, address, image_url)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Course not found', HttpStatus.NOT_FOUND);
      }
      console.error('Error fetching course:', error);
      return errorResponse('Failed to fetch course', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Map to camelCase
    const course = {
      id: data.id,
      heliportId: data.heliport_id,
      title: data.title,
      titleEn: data.title_en,
      titleZh: data.title_zh,
      subtitle: data.subtitle,
      subtitleEn: data.subtitle_en,
      subtitleZh: data.subtitle_zh,
      description: data.description,
      descriptionEn: data.description_en,
      descriptionZh: data.description_zh,
      courseType: data.course_type,
      durationMinutes: data.duration_minutes,
      price: data.price,
      maxPax: data.max_pax,
      minPax: data.min_pax,
      tags: data.tags,
      images: data.images,
      flightSchedule: data.flight_schedule,
      highlights: data.highlights,
      isActive: data.is_active,
      displayOrder: data.display_order,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      heliport: data.heliports
        ? {
            id: data.heliports.id,
            name: data.heliports.name,
            nameEn: data.heliports.name_en,
            nameZh: data.heliports.name_zh,
            address: data.heliports.address,
            imageUrl: data.heliports.image_url,
          }
        : null,
    };

    return successResponse(course);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResponse(error.message, HttpStatus.UNAUTHORIZED);
    }
    if (error instanceof AuthorizationError) {
      return errorResponse(error.message, HttpStatus.FORBIDDEN);
    }
    console.error('Unexpected error in GET /api/admin/courses/[id]:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * PATCH /api/admin/courses/[id]
 * Update a course's details
 * Accessible by: admin only
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Require admin role for updating courses
    await requireRole(supabase, ['admin']);

    // Check if course exists
    const { data: existingCourse, error: fetchError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingCourse) {
      return errorResponse('Course not found', HttpStatus.NOT_FOUND);
    }

    // Parse request body
    const body = await request.json();

    // Validate price if provided
    if (body.price !== undefined && body.price < 0) {
      return errorResponse('Price must be non-negative', HttpStatus.BAD_REQUEST);
    }

    // Validate duration if provided
    if (body.durationMinutes !== undefined && body.durationMinutes <= 0) {
      return errorResponse('Duration must be positive', HttpStatus.BAD_REQUEST);
    }

    // Validate heliport exists if provided
    if (body.heliportId !== undefined && body.heliportId !== null) {
      const { data: heliport, error: heliportError } = await supabase
        .from('heliports')
        .select('id')
        .eq('id', body.heliportId)
        .single();

      if (heliportError || !heliport) {
        return errorResponse('Invalid heliport ID', HttpStatus.BAD_REQUEST);
      }
    }

    // Prepare update data (only include fields that are provided)
    const updateData: CourseUpdate = {};

    if (body.heliportId !== undefined) updateData.heliport_id = body.heliportId;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.titleEn !== undefined) updateData.title_en = body.titleEn;
    if (body.titleZh !== undefined) updateData.title_zh = body.titleZh;
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle;
    if (body.subtitleEn !== undefined) updateData.subtitle_en = body.subtitleEn;
    if (body.subtitleZh !== undefined) updateData.subtitle_zh = body.subtitleZh;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.descriptionEn !== undefined) updateData.description_en = body.descriptionEn;
    if (body.descriptionZh !== undefined) updateData.description_zh = body.descriptionZh;
    if (body.courseType !== undefined) updateData.course_type = body.courseType;
    if (body.durationMinutes !== undefined) updateData.duration_minutes = body.durationMinutes;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.maxPax !== undefined) updateData.max_pax = body.maxPax;
    if (body.minPax !== undefined) updateData.min_pax = body.minPax;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.images !== undefined) updateData.images = body.images;
    if (body.flightSchedule !== undefined) updateData.flight_schedule = body.flightSchedule;
    if (body.highlights !== undefined) updateData.highlights = body.highlights;
    if (body.isActive !== undefined) updateData.is_active = body.isActive;
    if (body.displayOrder !== undefined) updateData.display_order = body.displayOrder;

    // Check if there are any fields to update
    if (Object.keys(updateData).length === 0) {
      return errorResponse('No fields to update', HttpStatus.BAD_REQUEST);
    }

    // Update the course
    const { data, error } = await supabase
      .from('courses')
      .update(updateData)
      .eq('id', id)
      .select('*, heliports(id, name, name_en, name_zh, address, image_url)')
      .single();

    if (error) {
      console.error('Error updating course:', error);
      return errorResponse('Failed to update course', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Map response to camelCase
    const course = {
      id: data.id,
      heliportId: data.heliport_id,
      title: data.title,
      titleEn: data.title_en,
      titleZh: data.title_zh,
      subtitle: data.subtitle,
      subtitleEn: data.subtitle_en,
      subtitleZh: data.subtitle_zh,
      description: data.description,
      descriptionEn: data.description_en,
      descriptionZh: data.description_zh,
      courseType: data.course_type,
      durationMinutes: data.duration_minutes,
      price: data.price,
      maxPax: data.max_pax,
      minPax: data.min_pax,
      tags: data.tags,
      images: data.images,
      flightSchedule: data.flight_schedule,
      highlights: data.highlights,
      isActive: data.is_active,
      displayOrder: data.display_order,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      heliport: data.heliports
        ? {
            id: data.heliports.id,
            name: data.heliports.name,
            nameEn: data.heliports.name_en,
            nameZh: data.heliports.name_zh,
            address: data.heliports.address,
            imageUrl: data.heliports.image_url,
          }
        : null,
    };

    return successResponse(course);
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
    console.error('Unexpected error in PATCH /api/admin/courses/[id]:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * DELETE /api/admin/courses/[id]
 * Delete a course (soft delete by default, hard delete with ?hard=true)
 * Accessible by: admin only
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Require admin role for deleting courses
    await requireRole(supabase, ['admin']);

    // Check if course exists
    const { data: existingCourse, error: fetchError } = await supabase
      .from('courses')
      .select('id, title')
      .eq('id', id)
      .single();

    if (fetchError || !existingCourse) {
      return errorResponse('Course not found', HttpStatus.NOT_FOUND);
    }

    // Check for hard delete flag
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get('hard') === 'true';

    if (hardDelete) {
      // Check for active reservations before hard delete
      const { count: reservationCount } = await supabase
        .from('reservations')
        .select('id', { count: 'exact', head: true })
        .eq('course_id', id)
        .in('status', ['pending', 'confirmed']);

      if (reservationCount && reservationCount > 0) {
        return errorResponse(
          'Cannot delete course with active reservations. Cancel or complete reservations first.',
          HttpStatus.CONFLICT
        );
      }

      // Check for slots
      const { count: slotCount } = await supabase
        .from('slots')
        .select('id', { count: 'exact', head: true })
        .eq('course_id', id);

      if (slotCount && slotCount > 0) {
        return errorResponse(
          'Cannot delete course with associated slots. Delete slots first or use soft delete.',
          HttpStatus.CONFLICT
        );
      }

      // Hard delete
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error hard deleting course:', error);
        return errorResponse('Failed to delete course', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return successResponse({
        message: 'Course permanently deleted',
        id,
        title: existingCourse.title,
      });
    } else {
      // Soft delete (set is_active = false)
      const { data, error } = await supabase
        .from('courses')
        .update({ is_active: false })
        .eq('id', id)
        .select('id, title, is_active')
        .single();

      if (error) {
        console.error('Error soft deleting course:', error);
        return errorResponse('Failed to deactivate course', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return successResponse({
        message: 'Course deactivated',
        id: data.id,
        title: data.title,
        isActive: data.is_active,
      });
    }
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResponse(error.message, HttpStatus.UNAUTHORIZED);
    }
    if (error instanceof AuthorizationError) {
      return errorResponse(error.message, HttpStatus.FORBIDDEN);
    }
    console.error('Unexpected error in DELETE /api/admin/courses/[id]:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
