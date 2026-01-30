import { describe, it, expect } from 'vitest';

import {
  successResponse,
  errorResponse,
  paginatedResponse,
  HttpStatus,
} from '../response';

describe('successResponse', () => {
  it('returns status 200 by default', async () => {
    const response = successResponse({ id: 1 });
    expect(response.status).toBe(200);
  });

  it('returns a custom status code when provided', async () => {
    const response = successResponse({ id: 1 }, 201);
    expect(response.status).toBe(201);
  });

  it('returns the correct JSON format with success: true and data', async () => {
    const data = { name: 'test', value: 42 };
    const response = successResponse(data);
    const body = await response.json();

    expect(body).toEqual({
      success: true,
      data: { name: 'test', value: 42 },
    });
  });

  it('handles null data', async () => {
    const response = successResponse(null);
    const body = await response.json();

    expect(body).toEqual({ success: true, data: null });
    expect(response.status).toBe(200);
  });

  it('handles array data', async () => {
    const response = successResponse([1, 2, 3]);
    const body = await response.json();

    expect(body).toEqual({ success: true, data: [1, 2, 3] });
  });
});

describe('errorResponse', () => {
  it('returns status 400 by default', async () => {
    const response = errorResponse('Something went wrong');
    expect(response.status).toBe(400);
  });

  it('returns a custom status code when provided', async () => {
    const response = errorResponse('Not found', 404);
    expect(response.status).toBe(404);
  });

  it('returns the correct JSON format with success: false and error message', async () => {
    const response = errorResponse('Validation failed');
    const body = await response.json();

    expect(body).toEqual({
      success: false,
      error: 'Validation failed',
    });
  });

  it('handles an empty error message', async () => {
    const response = errorResponse('');
    const body = await response.json();

    expect(body).toEqual({ success: false, error: '' });
  });
});

describe('paginatedResponse', () => {
  it('returns status 200', async () => {
    const response = paginatedResponse(['a', 'b'], 10, 1, 5);
    expect(response.status).toBe(200);
  });

  it('returns the correct JSON format with data and pagination', async () => {
    const items = [{ id: 1 }, { id: 2 }];
    const response = paginatedResponse(items, 20, 2, 10);
    const body = await response.json();

    expect(body).toEqual({
      success: true,
      data: [{ id: 1 }, { id: 2 }],
      pagination: {
        total: 20,
        page: 2,
        pageSize: 10,
        totalPages: 2,
      },
    });
  });

  it('calculates totalPages correctly for exact division', async () => {
    const response = paginatedResponse([], 100, 1, 10);
    const body = await response.json();

    expect(body.pagination.totalPages).toBe(10);
  });

  it('calculates totalPages correctly when there is a remainder', async () => {
    const response = paginatedResponse([], 101, 1, 10);
    const body = await response.json();

    expect(body.pagination.totalPages).toBe(11);
  });

  it('calculates totalPages as 1 when total fits in a single page', async () => {
    const response = paginatedResponse(['x'], 3, 1, 5);
    const body = await response.json();

    expect(body.pagination.totalPages).toBe(1);
  });

  it('calculates totalPages as 0 when total is 0 (empty dataset)', async () => {
    const response = paginatedResponse([], 0, 1, 10);
    const body = await response.json();

    expect(body.pagination.totalPages).toBe(0);
  });

  it('calculates totalPages correctly for a large dataset', async () => {
    const response = paginatedResponse([], 9999, 1, 25);
    const body = await response.json();

    // Math.ceil(9999 / 25) = 400
    expect(body.pagination.totalPages).toBe(400);
  });

  it('preserves the page and pageSize values in the response', async () => {
    const response = paginatedResponse([], 50, 3, 15);
    const body = await response.json();

    expect(body.pagination.page).toBe(3);
    expect(body.pagination.pageSize).toBe(15);
  });
});

describe('HttpStatus', () => {
  it('has the correct value for OK', () => {
    expect(HttpStatus.OK).toBe(200);
  });

  it('has the correct value for CREATED', () => {
    expect(HttpStatus.CREATED).toBe(201);
  });

  it('has the correct value for NO_CONTENT', () => {
    expect(HttpStatus.NO_CONTENT).toBe(204);
  });

  it('has the correct value for BAD_REQUEST', () => {
    expect(HttpStatus.BAD_REQUEST).toBe(400);
  });

  it('has the correct value for UNAUTHORIZED', () => {
    expect(HttpStatus.UNAUTHORIZED).toBe(401);
  });

  it('has the correct value for FORBIDDEN', () => {
    expect(HttpStatus.FORBIDDEN).toBe(403);
  });

  it('has the correct value for NOT_FOUND', () => {
    expect(HttpStatus.NOT_FOUND).toBe(404);
  });

  it('has the correct value for CONFLICT', () => {
    expect(HttpStatus.CONFLICT).toBe(409);
  });

  it('has the correct value for UNPROCESSABLE_ENTITY', () => {
    expect(HttpStatus.UNPROCESSABLE_ENTITY).toBe(422);
  });

  it('has the correct value for INTERNAL_SERVER_ERROR', () => {
    expect(HttpStatus.INTERNAL_SERVER_ERROR).toBe(500);
  });
});
