import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// --- Mock setup (vi.hoisted) ---

const mockSupabaseClient = vi.hoisted(() => ({
  from: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}));

const mockSendContactConfirmation = vi.hoisted(() =>
  vi.fn(() => Promise.resolve({ success: true }))
);
const mockSendAdminContactInquiryNotification = vi.hoisted(() =>
  vi.fn(() => Promise.resolve({ success: true }))
);

vi.mock('@/lib/email/client', () => ({
  sendContactConfirmation: mockSendContactConfirmation,
  sendAdminContactInquiryNotification: mockSendAdminContactInquiryNotification,
}));

// --- Import AFTER mocks ---

import { POST } from '@/app/api/public/contact/route';

// --- Helpers ---

function createRequest(
  body: Record<string, unknown>,
  headers?: Record<string, string>
): NextRequest {
  return new NextRequest('http://localhost:3000/api/public/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

function createInvalidJsonRequest(): NextRequest {
  return new NextRequest('http://localhost:3000/api/public/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: 'not valid json {{{',
  });
}

const validContactData = {
  name: 'Test User',
  email: 'test@example.com',
  message: 'This is a test message',
};

const dbInquiryRow = {
  id: 'inquiry-id-123',
  name: 'Test User',
  email: 'test@example.com',
  phone: null,
  subject: null,
  message: 'This is a test message',
  lang: 'ja',
  status: 'new',
  assigned_to: null,
  resolved_at: null,
  response: null,
  ip_address: 'unknown',
  created_at: '2026-01-30T00:00:00Z',
  updated_at: '2026-01-30T00:00:00Z',
};

function mockDbSuccess(row: Record<string, unknown> = dbInquiryRow) {
  mockSupabaseClient.from.mockReturnValue({
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: row,
          error: null,
        }),
      }),
    }),
  });
}

function mockDbError(message = 'DB insert failed') {
  mockSupabaseClient.from.mockReturnValue({
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message },
        }),
      }),
    }),
  });
}

// --- Tests ---

describe('POST /api/public/contact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================
  // Validation tests
  // ============================================================
  describe('Validation', () => {
    it('returns 400 when name is missing', async () => {
      const req = createRequest({ email: 'a@b.com', message: 'hi' });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('name is required');
    });

    it('returns 400 when name is empty string', async () => {
      const req = createRequest({ name: '   ', email: 'a@b.com', message: 'hi' });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe('name is required');
    });

    it('returns 400 when email is missing', async () => {
      const req = createRequest({ name: 'User', message: 'hi' });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe('email is required');
    });

    it('returns 400 when message is missing', async () => {
      const req = createRequest({ name: 'User', email: 'a@b.com' });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe('message is required');
    });

    it('returns 400 when email format is invalid', async () => {
      const req = createRequest({ name: 'User', email: 'not-an-email', message: 'hi' });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe('Invalid email format');
    });

    it('returns 400 when name exceeds 100 characters', async () => {
      const req = createRequest({
        name: 'a'.repeat(101),
        email: 'a@b.com',
        message: 'hi',
      });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe('name must be 100 characters or less');
    });

    it('returns 400 when email exceeds 255 characters', async () => {
      const longEmail = `${'a'.repeat(250)}@b.com`;
      const req = createRequest({
        name: 'User',
        email: longEmail,
        message: 'hi',
      });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe('email must be 255 characters or less');
    });

    it('returns 400 when message exceeds 5000 characters', async () => {
      const req = createRequest({
        name: 'User',
        email: 'a@b.com',
        message: 'x'.repeat(5001),
      });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe('message must be 5000 characters or less');
    });

    it('returns 400 when subject exceeds 200 characters', async () => {
      const req = createRequest({
        ...validContactData,
        subject: 's'.repeat(201),
      });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe('subject must be 200 characters or less');
    });

    it('returns 400 when phone exceeds 50 characters', async () => {
      const req = createRequest({
        ...validContactData,
        phone: '0'.repeat(51),
      });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe('phone must be 50 characters or less');
    });

    it('returns 400 when lang is an invalid value', async () => {
      const req = createRequest({
        ...validContactData,
        lang: 'fr',
      });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe('lang must be one of: ja, en, zh');
    });
  });

  // ============================================================
  // Success tests
  // ============================================================
  describe('Success', () => {
    it('returns 201 with inquiry data for valid input', async () => {
      mockDbSuccess();
      const req = createRequest(validContactData);
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.id).toBe('inquiry-id-123');
      expect(json.data.name).toBe('Test User');
      expect(json.data.email).toBe('test@example.com');
      expect(json.data.lang).toBe('ja');
    });

    it('extracts IP from x-forwarded-for header', async () => {
      mockDbSuccess({ ...dbInquiryRow, ip_address: '1.2.3.4' });

      const req = createRequest(validContactData, {
        'x-forwarded-for': '1.2.3.4, 10.0.0.1',
      });
      const res = await POST(req);

      expect(res.status).toBe(201);
      // Verify supabase was called with the correct IP
      const insertCall = mockSupabaseClient.from.mock.results[0].value.insert;
      const insertedData = insertCall.mock.calls[0][0][0];
      expect(insertedData.ip_address).toBe('1.2.3.4');
    });

    it('extracts IP from x-real-ip header when x-forwarded-for is absent', async () => {
      mockDbSuccess({ ...dbInquiryRow, ip_address: '5.6.7.8' });

      const req = createRequest(validContactData, {
        'x-real-ip': '5.6.7.8',
      });
      const res = await POST(req);

      expect(res.status).toBe(201);
      const insertCall = mockSupabaseClient.from.mock.results[0].value.insert;
      const insertedData = insertCall.mock.calls[0][0][0];
      expect(insertedData.ip_address).toBe('5.6.7.8');
    });

    it('defaults lang to "ja" when not provided', async () => {
      mockDbSuccess();
      const req = createRequest(validContactData);
      await POST(req);

      const insertCall = mockSupabaseClient.from.mock.results[0].value.insert;
      const insertedData = insertCall.mock.calls[0][0][0];
      expect(insertedData.lang).toBe('ja');
    });

    it('passes optional phone and subject to the database', async () => {
      const dataWithOptionals = {
        ...validContactData,
        phone: '090-1234-5678',
        subject: 'Booking inquiry',
        lang: 'en',
      };
      mockDbSuccess({
        ...dbInquiryRow,
        phone: '090-1234-5678',
        subject: 'Booking inquiry',
        lang: 'en',
      });

      const req = createRequest(dataWithOptionals);
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.data.phone).toBe('090-1234-5678');
      expect(json.data.subject).toBe('Booking inquiry');
      expect(json.data.lang).toBe('en');

      const insertCall = mockSupabaseClient.from.mock.results[0].value.insert;
      const insertedData = insertCall.mock.calls[0][0][0];
      expect(insertedData.phone).toBe('090-1234-5678');
      expect(insertedData.subject).toBe('Booking inquiry');
      expect(insertedData.lang).toBe('en');
    });

    it('calls sendContactConfirmation and sendAdminContactInquiryNotification', async () => {
      mockDbSuccess();
      const req = createRequest(validContactData);
      await POST(req);

      // Allow fire-and-forget promises to settle
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockSendContactConfirmation).toHaveBeenCalledOnce();
      expect(mockSendContactConfirmation).toHaveBeenCalledWith({
        to: 'test@example.com',
        customerName: 'Test User',
        subject: 'お問い合わせ',
        message: 'This is a test message',
      });

      expect(mockSendAdminContactInquiryNotification).toHaveBeenCalledOnce();
      expect(mockSendAdminContactInquiryNotification).toHaveBeenCalledWith({
        to: 'info@privatesky.co.jp',
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        customerPhone: undefined,
        subject: 'お問い合わせ',
        message: 'This is a test message',
      });
    });

    it('trims name/message and lowercases email before insert', async () => {
      mockDbSuccess({
        ...dbInquiryRow,
        name: 'Test User',
        email: 'test@example.com',
        message: 'Hello',
      });
      const req = createRequest({
        name: '  Test User  ',
        email: 'TeSt@Example.COM',
        message: '  Hello  ',
      });
      await POST(req);

      const insertCall = mockSupabaseClient.from.mock.results[0].value.insert;
      const insertedData = insertCall.mock.calls[0][0][0];
      expect(insertedData.name).toBe('Test User');
      expect(insertedData.email).toBe('test@example.com');
      expect(insertedData.message).toBe('Hello');
    });
  });

  // ============================================================
  // Error handling tests
  // ============================================================
  describe('Error handling', () => {
    it('returns 500 when DB insert fails', async () => {
      mockDbError('unique constraint violation');
      const req = createRequest(validContactData);
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Failed to submit inquiry');
    });

    it('returns 400 for invalid JSON body', async () => {
      const req = createInvalidJsonRequest();
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Invalid JSON body');
    });

    it('does not call email functions when DB insert fails', async () => {
      mockDbError();
      const req = createRequest(validContactData);
      await POST(req);

      expect(mockSendContactConfirmation).not.toHaveBeenCalled();
      expect(mockSendAdminContactInquiryNotification).not.toHaveBeenCalled();
    });

    it('returns 201 even if email sending fails', async () => {
      mockDbSuccess();
      mockSendContactConfirmation.mockRejectedValueOnce(new Error('SMTP down'));
      mockSendAdminContactInquiryNotification.mockRejectedValueOnce(new Error('SMTP down'));

      const req = createRequest(validContactData);
      const res = await POST(req);

      expect(res.status).toBe(201);
    });

    it('inserts into contact_inquiries table', async () => {
      mockDbSuccess();
      const req = createRequest(validContactData);
      await POST(req);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('contact_inquiries');
    });
  });
});
