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

type CourseInsert = Database['public']['Tables']['courses']['Insert'];

/**
 * GET /api/admin/courses
 * List all courses with optional filtering
 * Accessible by: admin, staff
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Require admin or staff role
    await requireRole(supabase, ['admin', 'staff']);

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('is_active');
    const heliportId = searchParams.get('heliport_id');
    const courseType = searchParams.get('course_type');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('page_size') || '20', 10);

    // Build query
    let query = supabase
      .from('courses')
      .select('*, heliports(id, name, name_en)', { count: 'exact' });

    // Apply filters
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    if (heliportId) {
      query = query.eq('heliport_id', heliportId);
    }

    if (courseType) {
      query = query.eq('course_type', courseType);
    }

    // Apply ordering
    query = query.order('display_order', { ascending: true, nullsFirst: false });
    query = query.order('created_at', { ascending: false });

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching courses:', error);
      return errorResponse('Failed to fetch courses', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Map database columns to camelCase for response
    const courses = (data || []).map((course) => ({
      id: course.id,
      heliportId: course.heliport_id,
      title: course.title,
      titleEn: course.title_en,
      titleZh: course.title_zh,
      subtitle: course.subtitle,
      subtitleEn: course.subtitle_en,
      subtitleZh: course.subtitle_zh,
      description: course.description,
      descriptionEn: course.description_en,
      descriptionZh: course.description_zh,
      courseType: course.course_type,
      durationMinutes: course.duration_minutes,
      price: course.price,
      maxPax: course.max_pax,
      minPax: course.min_pax,
      tags: course.tags,
      images: course.images,
      flightSchedule: course.flight_schedule,
      highlights: course.highlights,
      isActive: course.is_active,
      displayOrder: course.display_order,
      createdAt: course.created_at,
      updatedAt: course.updated_at,
      heliport: course.heliports
        ? {
            id: course.heliports.id,
            name: course.heliports.name,
            nameEn: course.heliports.name_en,
          }
        : null,
    }));

    return paginatedResponse(courses, count || 0, page, pageSize);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResponse(error.message, HttpStatus.UNAUTHORIZED);
    }
    if (error instanceof AuthorizationError) {
      return errorResponse(error.message, HttpStatus.FORBIDDEN);
    }
    console.error('Unexpected error in GET /api/admin/courses:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * POST /api/admin/courses
 * Create a new course
 * Accessible by: admin only
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Require admin role for creating courses
    await requireRole(supabase, ['admin']);

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.title) {
      return errorResponse('Title is required', HttpStatus.BAD_REQUEST);
    }
    if (body.durationMinutes === undefined || body.durationMinutes === null) {
      return errorResponse('Duration (minutes) is required', HttpStatus.BAD_REQUEST);
    }
    if (body.price === undefined || body.price === null) {
      return errorResponse('Price is required', HttpStatus.BAD_REQUEST);
    }

    // Validate price is non-negative
    if (body.price < 0) {
      return errorResponse('Price must be non-negative', HttpStatus.BAD_REQUEST);
    }

    // Validate duration is positive
    if (body.durationMinutes <= 0) {
      return errorResponse('Duration must be positive', HttpStatus.BAD_REQUEST);
    }

    // Validate heliport exists if provided
    if (body.heliportId) {
      const { data: heliport, error: heliportError } = await supabase
        .from('heliports')
        .select('id')
        .eq('id', body.heliportId)
        .single();

      if (heliportError || !heliport) {
        return errorResponse('Invalid heliport ID', HttpStatus.BAD_REQUEST);
      }
    }

    // Prepare insert data (map camelCase to snake_case)
    const insertData: CourseInsert = {
      heliport_id: body.heliportId || null,
      title: body.title,
      title_en: body.titleEn || null,
      title_zh: body.titleZh || null,
      subtitle: body.subtitle || null,
      subtitle_en: body.subtitleEn || null,
      subtitle_zh: body.subtitleZh || null,
      description: body.description || null,
      description_en: body.descriptionEn || null,
      description_zh: body.descriptionZh || null,
      course_type: body.courseType || 'standard',
      duration_minutes: body.durationMinutes,
      price: body.price,
      max_pax: body.maxPax || null,
      min_pax: body.minPax || null,
      tags: body.tags || null,
      images: body.images || null,
      flight_schedule: body.flightSchedule || null,
      highlights: body.highlights || null,
      is_active: body.isActive ?? true,
      display_order: body.displayOrder || null,
    };

    // Insert the course
    const { data, error } = await supabase
      .from('courses')
      .insert(insertData)
      .select('*, heliports(id, name, name_en)')
      .single();

    if (error) {
      console.error('Error creating course:', error);
      return errorResponse('Failed to create course', HttpStatus.INTERNAL_SERVER_ERROR);
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
          }
        : null,
    };

    return successResponse(course, HttpStatus.CREATED);
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
    console.error('Unexpected error in POST /api/admin/courses:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
