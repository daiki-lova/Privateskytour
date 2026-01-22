-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Plans table (CMS content)
create table plans (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  duration text not null,
  price integer not null,
  image_url text,
  description text,
  long_description text,
  category text,
  area text,
  rating numeric,
  popular boolean default false,
  highlights text[], -- Array of strings
  itinerary jsonb, -- Array of objects {time: string, activity: string}
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Bookings table
create table bookings (
  id uuid primary key default uuid_generate_v4(),
  plan_id uuid references plans(id) not null,
  booking_date date not null,
  time_slot text not null,
  passengers integer not null,
  total_price integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS Policies (Optional but recommended)
alter table plans enable row level security;
alter table bookings enable row level security;

-- Allow public read access to plans
create policy "Public plans are viewable by everyone"
  on plans for select
  using ( true );

-- Allow public insert to bookings (for this demo app)
create policy "Anyone can create a booking"
  on bookings for insert
  with check ( true );

-- Allow reading bookings to check availability (public)
create policy "Anyone can view bookings to check availability"
  on bookings for select
  using ( true );
