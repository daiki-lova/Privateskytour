import { apiPost, apiPut, apiDelete } from '../client';
import type { Reservation, ReservationStatus } from '@/lib/data/types';

export interface CreateReservationInput {
  customerId: string;
  courseId: string;
  slotId: string;
  heliportId: string;
  numberOfGuests: number;
  specialRequests?: string;
}

export interface UpdateReservationInput {
  status?: ReservationStatus;
  specialRequests?: string;
  numberOfGuests?: number;
}

export async function createReservation(data: CreateReservationInput): Promise<Reservation> {
  return apiPost<CreateReservationInput, Reservation>('/api/admin/reservations', data);
}

export async function updateReservation(id: string, data: UpdateReservationInput): Promise<Reservation> {
  return apiPut<UpdateReservationInput, Reservation>(`/api/admin/reservations/${id}`, data);
}

export async function cancelReservation(id: string, reason?: string): Promise<Reservation> {
  return apiPost<{ reason?: string }, Reservation>(`/api/admin/reservations/${id}/cancel`, { reason });
}

export async function deleteReservation(id: string): Promise<void> {
  return apiDelete(`/api/admin/reservations/${id}`);
}
