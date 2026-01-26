-- Seed test slots for E2E testing
-- This creates slots for the next 30 days with times from 09:00 to 19:00

-- Only run this in development/staging environments!
-- Comment out or delete this migration in production

DO $$
DECLARE
  current_date_val DATE := CURRENT_DATE;
  end_date_val DATE := CURRENT_DATE + INTERVAL '30 days';
  time_slot TIME;
  time_slots TIME[] := ARRAY[
    '09:00:00'::TIME, '09:30:00'::TIME, '10:00:00'::TIME, '10:30:00'::TIME,
    '11:00:00'::TIME, '11:30:00'::TIME, '12:00:00'::TIME, '12:30:00'::TIME,
    '13:00:00'::TIME, '13:30:00'::TIME, '14:00:00'::TIME, '14:30:00'::TIME,
    '15:00:00'::TIME, '15:30:00'::TIME, '16:00:00'::TIME, '16:30:00'::TIME,
    '17:00:00'::TIME, '17:30:00'::TIME, '18:00:00'::TIME, '18:30:00'::TIME,
    '19:00:00'::TIME
  ];
BEGIN
  -- Loop through each day
  WHILE current_date_val <= end_date_val LOOP
    -- Loop through each time slot
    FOREACH time_slot IN ARRAY time_slots LOOP
      -- Insert if slot doesn't already exist (course_id = NULL means available for all)
      INSERT INTO slots (
        course_id,
        slot_date,
        slot_time,
        max_pax,
        current_pax,
        status
      ) VALUES (
        NULL,
        current_date_val,
        time_slot,
        3,
        0,
        'open'
      ) ON CONFLICT (course_id, slot_date, slot_time) DO NOTHING;
    END LOOP;

    current_date_val := current_date_val + INTERVAL '1 day';
  END LOOP;

  RAISE NOTICE 'Test slots seeded successfully!';
END $$;
