import { NextResponse } from 'next/server';

/**
 * API Response Types
 */

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  error: string;
};

export type PaginationMeta = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type PaginatedApiResponse<T> = {
  success: true;
  data: T[];
  pagination: PaginationMeta;
};

/**
 * Union type for all API responses
 */
export type ApiResponse<T> =
  | ApiSuccessResponse<T>
  | ApiErrorResponse
  | PaginatedApiResponse<T>;

/**
 * Creates a success response with data
 *
 * @param data - The data to return in the response
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with ApiSuccessResponse
 */
export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    } as ApiSuccessResponse<T>,
    { status }
  );
}

/**
 * Creates an error response with message
 *
 * @param message - The error message to return
 * @param status - HTTP status code (default: 400)
 * @returns NextResponse with ApiErrorResponse
 */
export function errorResponse(
  message: string,
  status: number = 400
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
    } as ApiErrorResponse,
    { status }
  );
}

/**
 * Creates a paginated response for list endpoints
 *
 * @param data - Array of items for the current page
 * @param total - Total number of items across all pages
 * @param page - Current page number (1-indexed)
 * @param pageSize - Number of items per page
 * @returns NextResponse with PaginatedApiResponse
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
): NextResponse<PaginatedApiResponse<T>> {
  const totalPages = Math.ceil(total / pageSize);

  return NextResponse.json(
    {
      success: true,
      data,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
    } as PaginatedApiResponse<T>,
    { status: 200 }
  );
}

/**
 * Common HTTP status codes for convenience
 */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export type HttpStatusCode = (typeof HttpStatus)[keyof typeof HttpStatus];
