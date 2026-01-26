import { apiPost, apiPut } from '../client';
import type { Slot, SlotStatus } from '@/lib/data/types';

export interface CreateSlotInput {
  courseId: string;
  heliportId: string;
  startTime: string;
  endTime: string;
  capacity: number;
}

export interface UpdateSlotInput {
  status?: SlotStatus;
  capacity?: number;
}

export interface GenerateSlotsInput {
  courseId: string;
  heliportId: string;
  startDate: string;
  endDate: string;
  times: string[];  // e.g., ['09:00', '10:30', '14:00']
  capacity: number;
}

export async function createSlot(data: CreateSlotInput): Promise<Slot> {
  return apiPost<CreateSlotInput, Slot>('/api/admin/slots', data);
}

export async function updateSlot(id: string, data: UpdateSlotInput): Promise<Slot> {
  return apiPut<UpdateSlotInput, Slot>(`/api/admin/slots/${id}`, data);
}

export async function generateSlots(data: GenerateSlotsInput): Promise<Slot[]> {
  return apiPost<GenerateSlotsInput, Slot[]>('/api/admin/slots/generate', data);
}

export async function suspendSlot(id: string): Promise<Slot> {
  return apiPut<UpdateSlotInput, Slot>(`/api/admin/slots/${id}`, { status: 'suspended' });
}
