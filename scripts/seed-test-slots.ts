/**
 * Test slot seeding script
 *
 * Usage: npx tsx scripts/seed-test-slots.ts
 *
 * This script generates test slots for the next 30 days
 * with all time slots from 09:00 to 19:00 (30-minute intervals)
 */

import { createClient } from '@supabase/supabase-js';
import { format, addDays } from 'date-fns';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00'
];

async function seedTestSlots() {
  console.log('🚁 Starting test slot seeding...\n');

  const startDate = new Date();
  const endDate = addDays(startDate, 30);
  const maxPax = 3;

  // Generate slots
  const slotsToInsert: {
    course_id: string | null;
    slot_date: string;
    slot_time: string;
    max_pax: number;
    current_pax: number;
    status: 'open';
  }[] = [];

  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');

    for (const time of TIME_SLOTS) {
      slotsToInsert.push({
        course_id: null, // null means available for all courses
        slot_date: dateStr,
        slot_time: time,
        max_pax: maxPax,
        current_pax: 0,
        status: 'open',
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  console.log(`📅 Date range: ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);
  console.log(`⏰ Time slots: ${TIME_SLOTS.length} per day`);
  console.log(`👥 Max passengers: ${maxPax}`);
  console.log(`📊 Total slots to create: ${slotsToInsert.length}\n`);

  // Check for existing slots
  const { data: existingSlots } = await supabase
    .from('slots')
    .select('slot_date, slot_time')
    .gte('slot_date', format(startDate, 'yyyy-MM-dd'))
    .lte('slot_date', format(endDate, 'yyyy-MM-dd'));

  const existingKeys = new Set(
    (existingSlots || []).map(s => `${s.slot_date}|${s.slot_time}`)
  );

  // Filter out duplicates
  const newSlots = slotsToInsert.filter(
    slot => !existingKeys.has(`${slot.slot_date}|${slot.slot_time}`)
  );

  if (newSlots.length === 0) {
    console.log('✅ All slots already exist. No new slots to create.\n');
    return;
  }

  console.log(`🆕 New slots to create: ${newSlots.length}`);
  console.log(`⏭️  Skipping existing: ${slotsToInsert.length - newSlots.length}\n`);

  // Insert in batches
  const batchSize = 100;
  let totalCreated = 0;

  for (let i = 0; i < newSlots.length; i += batchSize) {
    const batch = newSlots.slice(i, i + batchSize);
    const { data, error } = await supabase.from('slots').insert(batch).select();

    if (error) {
      console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error.message);
    } else {
      totalCreated += data?.length || 0;
      process.stdout.write(`\r⏳ Progress: ${totalCreated}/${newSlots.length} slots created`);
    }
  }

  console.log(`\n\n✅ Successfully created ${totalCreated} test slots!`);
  console.log('\n📝 Next steps:');
  console.log('   1. Start the dev server: npm run dev');
  console.log('   2. Go to the booking page and select a date');
  console.log('   3. You should see the available time slots from the database');
}

seedTestSlots().catch(console.error);
