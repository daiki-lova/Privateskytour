import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, HttpStatus } from '@/lib/api/response';
import {
  validateMypageToken,
  getMypageData,
  isValidTokenFormat,
  type MypageTokenValidationResult,
  type MypageData,
} from '@/lib/auth/mypage-token';
import { sendMypageAccessEmail } from '@/lib/email';
import type { Database } from '@/lib/supabase/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Rate limiting configuration
 * In production, consider using Redis or a dedicated rate limiting service
 */
const RATE_LIMIT_CONFIG = {
  /** Maximum requests per window */
  MAX_REQUESTS: 10,
  /** Window duration in milliseconds (1 minute) */
  WINDOW_MS: 60 * 1000,
} as const;

/**
 * Simple in-memory rate limiter
 * Note: This only works for single-instance deployments.
 * For production with multiple instances, use Redis or similar.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/**
 * Check rate limit for an IP address
 */
function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // Clean up expired entries periodically
  if (rateLimitMap.size > 10000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetAt < now) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!record || record.resetAt < now) {
    // Start new window
    rateLimitMap.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_CONFIG.WINDOW_MS,
    });
    return { allowed: true };
  }

  if (record.count >= RATE_LIMIT_CONFIG.MAX_REQUESTS) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Increment count
  record.count++;
  return { allowed: true };
}

/**
 * GET /api/auth/mypage-token
 *
 * Validates a mypage token and returns customer information.
 *
 * Query Parameters:
 * - token: The mypage token to validate (required)
 * - includeData: If 'true', returns full customer and reservation data (optional)
 *
 * Response (validation only):
 * - 200: { valid: true, customerId, customerEmail, customerName, expiresAt }
 * - 200: { valid: false, error: "..." }
 *
 * Response (with data):
 * - 200: { customer: {...}, reservations: [...] }
 * - 401: { error: "Invalid or expired token" }
 *
 * Error Responses:
 * - 400: Missing token parameter
 * - 429: Rate limit exceeded
 * - 500: Internal server error
 */
export async function GET(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown';

    // Check rate limit
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return errorResponse(
        `Rate limit exceeded. Try again in ${rateLimit.retryAfter} seconds.`,
        HttpStatus.FORBIDDEN
      );
    }

    // Get token from query params
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const includeData = searchParams.get('includeData') === 'true';

    // Validate token parameter exists
    if (!token) {
      return errorResponse('Token parameter is required', HttpStatus.BAD_REQUEST);
    }

    // Quick format validation before hitting the database
    if (!isValidTokenFormat(token)) {
      return successResponse<MypageTokenValidationResult>({
        valid: false,
        error: 'Invalid token format',
      });
    }

    // Create Supabase client
    const supabase = (await createClient()) as SupabaseClient<Database>;

    // If includeData is requested, get full mypage data
    if (includeData) {
      const mypageData = await getMypageData(supabase, token);

      if (!mypageData) {
        return errorResponse('Invalid or expired token', HttpStatus.UNAUTHORIZED);
      }

      return successResponse<MypageData>(mypageData);
    }

    // Otherwise, just validate the token
    const validationResult = await validateMypageToken(supabase, token);

    return successResponse<MypageTokenValidationResult>(validationResult);
  } catch (error) {
    console.error('Mypage token validation error:', error);
    return errorResponse(
      'An unexpected error occurred',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * POST /api/auth/mypage-token
 *
 * Request a new mypage token via email verification.
 * This endpoint initiates a magic link flow for customers who lost their token.
 *
 * Request Body:
 * - email: Customer email address (required)
 *
 * Note: This is a placeholder for future implementation.
 * Full implementation would:
 * 1. Verify the email exists in customers table
 * 2. Generate a temporary verification code
 * 3. Send an email with the verification code
 * 4. On verification, create a new mypage token
 *
 * Response:
 * - 200: { message: "Verification email sent" }
 * - 400: Missing email
 * - 404: Customer not found
 * - 429: Rate limit exceeded
 */
export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown';

    // Stricter rate limit for POST (token request)
    const rateLimit = checkRateLimit(`${ip}-post`);
    if (!rateLimit.allowed) {
      return errorResponse(
        `Rate limit exceeded. Try again in ${rateLimit.retryAfter} seconds.`,
        HttpStatus.FORBIDDEN
      );
    }

    const body = await request.json().catch(() => ({}));
    const email = body.email as string | undefined;

    if (!email || typeof email !== 'string') {
      return errorResponse('Email is required', HttpStatus.BAD_REQUEST);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse('Invalid email format', HttpStatus.BAD_REQUEST);
    }

    const supabase = (await createClient()) as SupabaseClient<Database>;

    // Check if customer exists (including mypage token info for reuse)
    const { data: customer, error } = await supabase
      .from('customers')
      .select('id, email, name, mypage_token, mypage_token_expires_at')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !customer) {
      // Return generic message to prevent email enumeration
      return successResponse({
        message:
          'If an account exists with this email, a verification link will be sent.',
      });
    }

    // 顧客の既存のマイページトークンを取得、または新規生成
    let mypageToken = customer.mypage_token;
    let tokenExpiresAt = customer.mypage_token_expires_at;

    // トークンが無い、または期限切れの場合は新規生成
    const now = new Date();
    const tokenExpired = tokenExpiresAt ? new Date(tokenExpiresAt) < now : true;

    if (!mypageToken || tokenExpired) {
      // 新しいトークンを生成（ランダムな64文字の文字列）
      const newToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');

      // トークンの有効期限を90日後に設定
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 90);

      const { error: updateError } = await supabase
        .from('customers')
        .update({
          mypage_token: newToken,
          mypage_token_expires_at: expiresAt.toISOString(),
        })
        .eq('id', customer.id);

      if (updateError) {
        console.error('Failed to update mypage token:', updateError);
        return errorResponse(
          'An unexpected error occurred',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      mypageToken = newToken;
      tokenExpiresAt = expiresAt.toISOString();
    }

    // マイページURLを構築
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const mypageUrl = `${baseUrl}/mypage?token=${mypageToken}`;

    // マイページアクセスメールを送信
    try {
      await sendMypageAccessEmail({
        to: customer.email,
        customerName: customer.name,
        mypageUrl,
        expiresAt: tokenExpiresAt ?? '',
      });
      console.log(`Mypage access email sent to customer: ${customer.id}`);
    } catch (emailError) {
      // メール送信エラーはログに記録するが、処理は続行
      console.error('Failed to send mypage access email:', emailError);
    }

    return successResponse({
      message:
        'If an account exists with this email, a verification link will be sent.',
    });
  } catch (error) {
    console.error('Mypage token request error:', error);
    return errorResponse(
      'An unexpected error occurred',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
