import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, HttpStatus } from '@/lib/api/response';
import { sendContactConfirmation, sendAdminContactInquiryNotification } from '@/lib/email/client';
import type { ContactInquiry, InquiryStatus, SupportedLang } from '@/lib/data/types';

/**
 * Convert database row to ContactInquiry type
 */
function toContactInquiry(row: Record<string, unknown>): ContactInquiry {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    phone: row.phone as string | undefined,
    subject: row.subject as string | undefined,
    message: row.message as string,
    lang: row.lang as SupportedLang,
    status: row.status as InquiryStatus,
    assignedTo: row.assigned_to as string | undefined,
    resolvedAt: row.resolved_at as string | undefined,
    response: row.response as string | undefined,
    ipAddress: row.ip_address as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/**
 * Validate the contact inquiry request body
 */
function validateContactInput(body: Record<string, unknown>): string | null {
  // Required fields
  if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
    return 'name is required';
  }
  if (!body.email || typeof body.email !== 'string') {
    return 'email is required';
  }
  if (!body.message || typeof body.message !== 'string' || body.message.trim() === '') {
    return 'message is required';
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email as string)) {
    return 'Invalid email format';
  }

  // Length validations
  if ((body.name as string).length > 100) {
    return 'name must be 100 characters or less';
  }
  if ((body.email as string).length > 255) {
    return 'email must be 255 characters or less';
  }
  if ((body.message as string).length > 5000) {
    return 'message must be 5000 characters or less';
  }
  if (body.subject && (body.subject as string).length > 200) {
    return 'subject must be 200 characters or less';
  }
  if (body.phone && (body.phone as string).length > 50) {
    return 'phone must be 50 characters or less';
  }

  // Language validation
  if (body.lang) {
    const validLangs: SupportedLang[] = ['ja', 'en', 'zh'];
    if (!validLangs.includes(body.lang as SupportedLang)) {
      return 'lang must be one of: ja, en, zh';
    }
  }

  return null;
}

/**
 * POST /api/public/contact
 * Submit a contact inquiry
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const body = await request.json();

    // Validate input
    const validationError = validateContactInput(body);
    if (validationError) {
      return errorResponse(validationError, HttpStatus.BAD_REQUEST);
    }

    // Get client IP for audit
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Create contact inquiry
    const { data, error } = await supabase
      .from('contact_inquiries')
      .insert([
        {
          name: (body.name as string).trim(),
          email: (body.email as string).trim().toLowerCase(),
          phone: body.phone ? (body.phone as string).trim() : null,
          subject: body.subject ? (body.subject as string).trim() : null,
          message: (body.message as string).trim(),
          lang: body.lang || 'ja',
          ip_address: ipAddress,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating contact inquiry:', error);
      return errorResponse('Failed to submit inquiry', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const inquiry = toContactInquiry(data);

    // Send email notifications (fire-and-forget)
    const customerEmail = (body.email as string).trim().toLowerCase();
    const customerName = (body.name as string).trim();
    const subject = body.subject ? (body.subject as string).trim() : 'お問い合わせ';
    const message = (body.message as string).trim();

    try {
      // 1. Send confirmation email to the customer
      sendContactConfirmation({
        to: customerEmail,
        customerName,
        subject,
        message,
      }).catch((emailError) => {
        console.error('[Email] Failed to send contact confirmation:', emailError);
      });

      // 2. Send notification to admin
      sendAdminContactInquiryNotification({
        to: 'info@privatesky.co.jp',
        customerName,
        customerEmail,
        customerPhone: body.phone ? (body.phone as string).trim() : undefined,
        subject,
        message,
      }).catch((emailError) => {
        console.error('[Email] Failed to send admin contact inquiry notification:', emailError);
      });
    } catch (emailError) {
      console.error('[Email] Failed to send contact emails:', emailError);
    }

    return successResponse(inquiry, HttpStatus.CREATED);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON body', HttpStatus.BAD_REQUEST);
    }
    console.error('Contact inquiry error:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
