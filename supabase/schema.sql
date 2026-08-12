-- Supabase schema for SportVol Morocco

create type user_role as enum ('volunteer', 'admin');

create type event_status as enum ('draft', 'published', 'closed', 'completed', 'cancelled');

create type application_status as enum ('pending', 'accepted', 'rejected', 'withdrawn');

create table if not exists profiles (
  id uuid primary key,
  email text,
  role user_role not null default 'volunteer',
  first_name text,
  last_name text,
  avatar_url text,
  phone text,
  city text,
  country text,
  bio text,
  interests text[] not null default array[]::text[],
  skills text[] not null default array[]::text[],
  languages text[] not null default array[]::text[],
  experience text,
  volunteer_hours integer not null default 0,
  attendance_rate numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_email_idx on profiles (email);
create index if not exists profiles_role_idx on profiles (role);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  sport text not null,
  city text not null,
  country text not null,
  venue text not null,
  cover_url text,
  description text,
  start_date date not null,
  end_date date not null,
  start_time time,
  end_time time,
  application_deadline date,
  status event_status not null default 'draft',
  total_volunteers_needed integer not null default 0,
  required_languages text[] not null default array[]::text[],
  requirements text,
  event_type text,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists event_roles (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  name text not null,
  description text,
  responsibilities text,
  requirements text,
  skills text[] not null default array[]::text[],
  positions integer not null default 1,
  filled_positions integer not null default 0,
  min_age integer,
  mandatory_training boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists event_roles_event_id_idx on event_roles (event_id);

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  role_id uuid references event_roles(id) on delete set null,
  status application_status not null default 'pending',
  notes text,
  applied_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, event_id, role_id)
);

create index if not exists applications_profile_id_idx on applications (profile_id);
create index if not exists applications_event_id_idx on applications (event_id);
