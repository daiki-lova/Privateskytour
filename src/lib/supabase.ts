import { createClient } from '@supabase/supabase-js';

// Helper to safely access environment variables in various environments (Vite, Next.js, etc.)
const getEnvVar = (key: string) => {
  // Check for import.meta.env (Vite)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      return import.meta.env[`VITE_${key}`] || import.meta.env[`NEXT_PUBLIC_${key}`] || import.meta.env[key];
    }
  } catch (e) {
    // Ignore errors accessing import.meta
  }

  // Check for process.env (Next.js / Webpack / Node)
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[`NEXT_PUBLIC_${key}`] || process.env[key];
    }
  } catch (e) {
    // Ignore errors accessing process
  }

  return undefined;
};

const supabaseUrl = getEnvVar('SUPABASE_URL') || 'https://placeholder.supabase.co';
const supabaseAnonKey = getEnvVar('SUPABASE_ANON_KEY') || 'placeholder';

// Only create a real client if the URL is valid
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface DbPlan {
  id: string;
  title: string;
  duration: string;
  price: number;
  image_url: string;
  description: string;
  long_description: string;
  category: string;
  area: string;
  rating: number;
  popular: boolean;
  highlights: string[];
  itinerary: { time: string; activity: string }[];
}

export interface DbBooking {
  id?: string;
  plan_id: string;
  booking_date: string;
  time_slot: string;
  passengers: number;
  total_price: number;
  created_at?: string;
}

const isConfigured = supabaseUrl !== 'https://placeholder.supabase.co' && supabaseUrl !== 'YOUR_SUPABASE_URL';

/**
 * Fetch all plans from the CMS (Supabase)
 */
export async function getPlans() {
  if (!isConfigured) return null;

  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching plans:', error);
    return null;
  }
  return data as DbPlan[];
}

/**
 * Save a new booking
 */
export async function saveBooking(booking: DbBooking) {
  if (!isConfigured) {
    console.log('Mock saving booking:', booking);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { ...booking, id: 'mock-id' };
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert([booking])
    .select();

  if (error) {
    console.error('Error saving booking:', error);
    throw error;
  }
  return data[0];
}

/**
 * Check if a slot is already booked (Inventory management)
 */
export async function checkAvailability(date: string, timeSlot: string) {
  if (!isConfigured) return true;

  const { data, error } = await supabase
    .from('bookings')
    .select('id')
    .eq('booking_date', date)
    .eq('time_slot', timeSlot);

  if (error) {
    console.error('Error checking availability:', error);
    return false;
  }
  
  // Return true if NO booking exists for this slot
  return data.length === 0;
}

/**
 * Get all booked slots for a specific date
 */
export async function getBookedSlots(date: string) {
  if (!isConfigured) return [];

  const { data, error } = await supabase
    .from('bookings')
    .select('time_slot')
    .eq('booking_date', date);

  if (error) {
    console.error('Error fetching booked slots:', error);
    return [];
  }

  return data.map((booking: { time_slot: string }) => booking.time_slot);
}
