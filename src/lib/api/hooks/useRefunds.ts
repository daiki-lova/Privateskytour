// src/lib/api/hooks/useRefunds.ts
import useSWR from 'swr';
import { paginatedFetcher } from '@/lib/api/client';

export interface RefundCandidate {
  id: string;
  bookingNumber: string;
  status: string;
  reservationDate: string;
  reservationTime: string;
  pax: number;
  totalPrice: number;
  cancelledAt: string | null;
  cancellationReason: string | null;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  } | null;
  course: {
    id: string;
    title: string;
  } | null;
  payment: {
    id: string;
    amount: number;
    status: string;
    stripePaymentIntentId: string | null;
    paidAt: string | null;
  } | null;
}

export interface CompletedRefund {
  id: string;
  reservationId: string;
  paymentId: string;
  amount: number;
  reason: string;
  reasonDetail: string | null;
  stripeRefundId: string | null;
  status: string;
  processedAt: string | null;
  processedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
  reservation: {
    id: string;
    bookingNumber: string;
    reservationDate: string;
    reservationTime: string;
    totalPrice: number;
    customer: {
      id: string;
      name: string;
      email: string;
    } | null;
    course: {
      id: string;
      title: string;
    } | null;
  } | null;
}

export interface RefundsApiResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface UseRefundsParams {
  status?: 'pending' | 'completed' | 'all';
  page?: number;
  pageSize?: number;
}

export function useRefundCandidates(params: UseRefundsParams = {}) {
  const { status = 'pending', page = 1, pageSize = 20 } = params;
  const queryParams = new URLSearchParams({
    status,
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  const { data, error, isLoading, mutate } = useSWR<RefundsApiResponse<RefundCandidate>>(
    `/api/admin/refunds?${queryParams}`,
    paginatedFetcher<RefundCandidate>
  );

  return {
    data,
    refundCandidates: data?.data ?? [],
    pagination: data?.pagination ?? null,
    error,
    isLoading,
    mutate,
  };
}

export function useCompletedRefunds(params: UseRefundsParams = {}) {
  const { status = 'completed', page = 1, pageSize = 20 } = params;
  const queryParams = new URLSearchParams({
    status,
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  const { data, error, isLoading, mutate } = useSWR<RefundsApiResponse<CompletedRefund>>(
    `/api/admin/refunds?${queryParams}`,
    paginatedFetcher<CompletedRefund>
  );

  return {
    data,
    refunds: data?.data ?? [],
    pagination: data?.pagination ?? null,
    error,
    isLoading,
    mutate,
  };
}

export interface ProcessRefundRequest {
  amount?: number;
  reason?: 'customer_request' | 'weather' | 'mechanical' | 'operator_cancel' | 'other';
  reasonDetail?: string;
}

export interface ProcessRefundResponse {
  success: boolean;
  data: {
    refund: {
      id: string;
      reservationId: string;
      paymentId: string;
      amount: number;
      reason: string;
      reasonDetail: string | null;
      stripeRefundId: string;
      status: string;
      processedAt: string;
      processedBy: string;
    };
    stripeRefund: {
      id: string;
      status: string;
      amount: number;
    };
    paymentStatus: string;
    isFullRefund: boolean;
  };
}

export async function processRefund(
  reservationId: string,
  request: ProcessRefundRequest = {}
): Promise<ProcessRefundResponse> {
  const response = await fetch(`/api/admin/reservations/${reservationId}/refund`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to process refund');
  }

  return response.json();
}
