-- Core Hyperlocal Events schema.
-- Apply with Supabase CLI to a fresh local Supabase database.

create type public.user_role as enum ('attendee', 'organizer', 'admin');
create type public.event_status as enum (
  'draft',
  'published',
  'cancelled',
  'completed'
);
create type public.registration_status as enum ('registered', 'cancelled');
create type public.attendance_status as enum (
  'unknown',
  'attended',
  'no_show'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role public.user_role not null default 'attendee',
  interests text[] not null default '{}',
  preferred_categories text[] not null default '{}',
  preferred_budget numeric(10, 2),
  preferred_location_label text,
  preferred_latitude double precision,
  preferred_longitude double precision,
  preferred_radius_km numeric not null default 10,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length check (
    display_name is null or char_length(display_name) <= 80
  ),
  constraint profiles_location_label_length check (
    preferred_location_label is null
    or char_length(preferred_location_label) <= 120
  ),
  constraint profiles_budget_nonnegative check (
    preferred_budget is null or preferred_budget >= 0
  ),
  constraint profiles_radius_positive check (preferred_radius_km > 0),
  constraint profiles_location_pair check (
    (preferred_latitude is null) = (preferred_longitude is null)
  ),
  constraint profiles_latitude_range check (
    preferred_latitude is null
    or preferred_latitude between -90 and 90
  ),
  constraint profiles_longitude_range check (
    preferred_longitude is null
    or preferred_longitude between -180 and 180
  )
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.profiles (id) on delete restrict,
  title text not null,
  slug text,
  description text not null,
  category text not null,
  venue_name text,
  address text,
  latitude double precision,
  longitude double precision,
  start_at timestamptz not null,
  end_at timestamptz not null,
  price numeric(10, 2) not null default 0,
  currency text not null default 'INR',
  capacity integer not null,
  registered_count integer not null default 0,
  registration_deadline timestamptz,
  image_url text,
  status public.event_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_title_length check (
    char_length(title) between 1 and 140
  ),
  constraint events_description_length check (
    char_length(description) between 1 and 5000
  ),
  constraint events_category_valid check (
    category in (
      'Technology',
      'Music',
      'Food & Drink',
      'Sports & Fitness',
      'Arts & Culture',
      'Business & Networking',
      'Education & Workshops',
      'Community',
      'Health & Wellness',
      'Other'
    )
  ),
  constraint events_time_order check (end_at > start_at),
  constraint events_price_nonnegative check (price >= 0),
  constraint events_capacity_positive check (capacity > 0),
  constraint events_registered_count_in_capacity check (
    registered_count between 0 and capacity
  ),
  constraint events_currency_format check (currency ~ '^[A-Z]{3}$'),
  constraint events_coordinates_pair check (
    (latitude is null) = (longitude is null)
  ),
  constraint events_latitude_range check (
    latitude is null or latitude between -90 and 90
  ),
  constraint events_longitude_range check (
    longitude is null or longitude between -180 and 180
  ),
  constraint events_slug_length check (
    slug is null or char_length(slug) <= 180
  ),
  constraint events_venue_name_length check (
    venue_name is null or char_length(venue_name) <= 160
  ),
  constraint events_address_length check (
    address is null or char_length(address) <= 500
  ),
  constraint events_image_url_length check (
    image_url is null or char_length(image_url) <= 2048
  )
);

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  attendee_id uuid not null references public.profiles (id) on delete cascade,
  status public.registration_status not null default 'registered',
  attendance_status public.attendance_status not null default 'unknown',
  registered_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.saved_events (
  id uuid primary key default gen_random_uuid(),
  attendee_id uuid not null references public.profiles (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint saved_events_attendee_event_unique unique (attendee_id, event_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  event_id uuid references public.events (id) on delete set null,
  type text not null,
  title text not null,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notifications_type_valid check (
    type in (
      'registration_confirmed',
      'event_updated',
      'event_cancelled',
      'reminder',
      'general'
    )
  ),
  constraint notifications_title_length check (
    char_length(title) between 1 and 160
  ),
  constraint notifications_message_length check (
    char_length(message) between 1 and 2000
  )
);

create table public.event_feedback (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  attendee_id uuid not null references public.profiles (id) on delete cascade,
  rating integer not null,
  comment text,
  created_at timestamptz not null default now(),
  constraint event_feedback_rating_range check (rating between 1 and 5),
  constraint event_feedback_comment_length check (
    comment is null or char_length(comment) <= 1000
  ),
  constraint event_feedback_attendee_event_unique unique (
    attendee_id,
    event_id
  )
);

create index events_status_start_at_idx
  on public.events (status, start_at);
create index events_category_idx
  on public.events (category);
create index events_organizer_id_idx
  on public.events (organizer_id);
create index events_coordinates_idx
  on public.events (latitude, longitude);
create unique index events_slug_unique_idx
  on public.events (slug)
  where slug is not null;
create index registrations_event_id_idx
  on public.registrations (event_id);
create index registrations_attendee_id_idx
  on public.registrations (attendee_id);
create unique index registrations_one_active_per_attendee_event_idx
  on public.registrations (attendee_id, event_id)
  where status = 'registered';
create index saved_events_attendee_id_idx
  on public.saved_events (attendee_id);
create index notifications_recipient_read_at_idx
  on public.notifications (recipient_id, read_at);
create index event_feedback_event_id_idx
  on public.event_feedback (event_id);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

create trigger registrations_set_updated_at
before update on public.registrations
for each row execute function public.set_updated_at();

create function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, pg_temp
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(
      pg_catalog.left(
        pg_catalog.btrim(new.raw_user_meta_data ->> 'display_name'),
        80
      ),
      ''
    )
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();
