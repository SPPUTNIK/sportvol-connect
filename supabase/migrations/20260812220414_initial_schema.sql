-- Supabase schema for SportVol Morocco

create extension if not exists "pgcrypto";

create type user_role as enum ('volunteer', 'admin');
create type event_status as enum ('draft', 'published', 'closed', 'completed', 'cancelled');
create type application_status as enum ('pending', 'accepted', 'rejected', 'withdrawn', 'waitlisted');
create type attendance_status as enum ('scheduled', 'checked-in', 'checked-out', 'absent', 'late');
create type notification_category as enum ('application', 'training', 'accreditation', 'certificate', 'event', 'other');
create type training_resource_type as enum ('video', 'pdf', 'text', 'link');
create type shift_assignment_status as enum ('assigned', 'removed', 'completed');
create type report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role user_role not null default 'volunteer',
  status text not null default 'active',
  first_name text,
  last_name text,
  date_of_birth date,
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
create index if not exists profiles_status_idx on profiles (status);

create table if not exists sports (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists skills (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists languages (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists profile_skills (
  profile_id uuid not null references profiles(id) on delete cascade,
  skill_id uuid not null references skills(id) on delete cascade,
  primary key (profile_id, skill_id)
);

create table if not exists profile_languages (
  profile_id uuid not null references profiles(id) on delete cascade,
  language_id uuid not null references languages(id) on delete cascade,
  primary key (profile_id, language_id)
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  sport_id uuid not null references sports(id) on delete restrict,
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
  updated_at timestamptz not null default now(),
  constraint events_valid_dates check (start_date <= end_date),
  constraint events_deadline_before_start check (application_deadline IS NULL OR application_deadline <= start_date),
  constraint events_positive_volunteers check (total_volunteers_needed >= 0)
);

create index if not exists events_status_idx on events (status);
create index if not exists events_start_date_idx on events (start_date);
create index if not exists events_sport_idx on events (sport_id);
create index if not exists events_city_idx on events (city);
create index if not exists events_slug_idx on events (slug);

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
  updated_at timestamptz not null default now(),
  constraint event_roles_positive_positions check (positions > 0),
  constraint event_roles_nonnegative_filled check (filled_positions >= 0)
);

create index if not exists event_roles_event_id_idx on event_roles (event_id);

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  role_id uuid not null references event_roles(id) on delete restrict,
  status application_status not null default 'pending',
  experience text,
  availability text,
  motivation text,
  admin_notes text,
  applied_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, event_id, role_id)
);

create index if not exists applications_profile_id_idx on applications (profile_id);
create index if not exists applications_event_id_idx on applications (event_id);
create index if not exists applications_status_idx on applications (status);

create table if not exists training_modules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_id uuid references events(id) on delete set null,
  role_id uuid references event_roles(id) on delete set null,
  required boolean not null default false,
  resources jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists training_progress (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  training_id uuid not null references training_modules(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, training_id)
);

create index if not exists training_progress_profile_id_idx on training_progress (profile_id);
create index if not exists training_progress_training_id_idx on training_progress (training_id);

create table if not exists accreditations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  role_id uuid not null references event_roles(id) on delete cascade,
  volunteer_identifier text not null,
  zone text,
  qr_code_data text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, event_id, role_id)
);

create index if not exists accreditations_profile_id_idx on accreditations (profile_id);
create index if not exists accreditations_event_id_idx on accreditations (event_id);

create table if not exists event_shifts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  role_id uuid not null references event_roles(id) on delete cascade,
  title text not null,
  location text,
  date date not null,
  start_time time not null,
  end_time time not null,
  capacity integer not null default 1,
  instructions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_shifts_positive_capacity check (capacity > 0)
);

create index if not exists event_shifts_event_id_idx on event_shifts (event_id);
create index if not exists event_shifts_role_id_idx on event_shifts (role_id);

create table if not exists shift_assignments (
  id uuid primary key default gen_random_uuid(),
  shift_id uuid not null references event_shifts(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  status shift_assignment_status not null default 'assigned',
  assigned_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (shift_id, profile_id)
);

create index if not exists shift_assignments_profile_id_idx on shift_assignments (profile_id);
create index if not exists shift_assignments_shift_id_idx on shift_assignments (shift_id);

create table if not exists attendance_records (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  shift_id uuid not null references event_shifts(id) on delete cascade,
  role_id uuid not null references event_roles(id) on delete cascade,
  date date not null,
  status attendance_status not null default 'scheduled',
  check_in_time time,
  check_out_time time,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, shift_id)
);

create index if not exists attendance_records_profile_id_idx on attendance_records (profile_id);
create index if not exists attendance_records_event_id_idx on attendance_records (event_id);
create index if not exists attendance_records_shift_id_idx on attendance_records (shift_id);

create table if not exists volunteer_hours (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  event_id uuid references events(id) on delete set null,
  shift_id uuid references event_shifts(id) on delete set null,
  attendance_id uuid references attendance_records(id) on delete set null,
  hours integer not null default 0,
  approved_by uuid references profiles(id) on delete set null,
  approval_notes text,
  year integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint volunteer_hours_positive check (hours >= 0)
);

create index if not exists volunteer_hours_profile_id_idx on volunteer_hours (profile_id);
create index if not exists volunteer_hours_event_id_idx on volunteer_hours (event_id);
create index if not exists volunteer_hours_year_idx on volunteer_hours (year);

create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  role_id uuid not null references event_roles(id) on delete cascade,
  hours integer not null default 0,
  date date not null,
  certificate_id text not null unique,
  file_path text,
  issued_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists certificates_profile_id_idx on certificates (profile_id);
create index if not exists certificates_event_id_idx on certificates (event_id);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  event_id uuid references events(id) on delete set null,
  application_id uuid references applications(id) on delete set null,
  title text not null,
  body text not null,
  category notification_category not null default 'other',
  read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notifications_profile_id_idx on notifications (profile_id);
create index if not exists notifications_event_id_idx on notifications (event_id);
create index if not exists notifications_read_at_idx on notifications (read_at);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles(id) on delete cascade,
  target_type text not null,
  target_id uuid,
  report_type text not null,
  reason text,
  description text,
  status report_status not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists reports_reporter_id_idx on reports (reporter_id);
create index if not exists reports_status_idx on reports (status);

create or replace function trigger_set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function is_admin() returns boolean as $$
  select exists(select 1 from profiles where id = auth.uid() and role = 'admin');
$$ language sql stable;

alter table profiles enable row level security;
create policy profiles_select on profiles for select using (auth.uid() = id or is_admin());
create policy profiles_insert on profiles for insert with check (auth.uid() = id or is_admin());
create policy profiles_update on profiles for update using (auth.uid() = id or is_admin()) with check (auth.uid() = id or is_admin());
create policy profiles_delete on profiles for delete using (is_admin());

alter table sports enable row level security;
create policy sports_select on sports for select using (true);
create policy sports_manage on sports for all using (is_admin()) with check (is_admin());

alter table skills enable row level security;
create policy skills_select on skills for select using (true);
create policy skills_manage on skills for all using (is_admin()) with check (is_admin());

alter table languages enable row level security;
create policy languages_select on languages for select using (true);
create policy languages_manage on languages for all using (is_admin()) with check (is_admin());

alter table profile_skills enable row level security;
create policy profile_skills_select on profile_skills for select using (profile_id = auth.uid() or is_admin());
create policy profile_skills_insert on profile_skills for insert with check (profile_id = auth.uid() or is_admin());
create policy profile_skills_update on profile_skills for update using (profile_id = auth.uid() or is_admin()) with check (profile_id = auth.uid() or is_admin());
create policy profile_skills_delete on profile_skills for delete using (profile_id = auth.uid() or is_admin());

alter table profile_languages enable row level security;
create policy profile_languages_select on profile_languages for select using (profile_id = auth.uid() or is_admin());
create policy profile_languages_insert on profile_languages for insert with check (profile_id = auth.uid() or is_admin());
create policy profile_languages_update on profile_languages for update using (profile_id = auth.uid() or is_admin()) with check (profile_id = auth.uid() or is_admin());
create policy profile_languages_delete on profile_languages for delete using (profile_id = auth.uid() or is_admin());

alter table events enable row level security;
create policy events_select on events for select using (status = 'published' or is_admin());
create policy events_insert on events for insert with check (is_admin());
create policy events_update on events for update using (is_admin()) with check (is_admin());
create policy events_delete on events for delete using (is_admin());

alter table event_roles enable row level security;
create policy event_roles_select on event_roles for select using (exists(select 1 from events where id = event_id and (status = 'published' or is_admin())));
create policy event_roles_manage on event_roles for all using (is_admin()) with check (is_admin());

alter table event_shifts enable row level security;
create policy event_shifts_select on event_shifts for select using (exists(select 1 from events where id = event_id and (status = 'published' or is_admin())));
create policy event_shifts_manage on event_shifts for all using (is_admin()) with check (is_admin());

alter table applications enable row level security;
create policy applications_select on applications for select using (profile_id = auth.uid() or is_admin());
create policy applications_insert on applications for insert with check (profile_id = auth.uid());
create policy applications_update on applications for update using (profile_id = auth.uid() or is_admin()) with check (profile_id = auth.uid() or is_admin());
create policy applications_delete on applications for delete using (is_admin());

alter table training_modules enable row level security;
create policy training_modules_select on training_modules for select using (true);
create policy training_modules_manage on training_modules for all using (is_admin()) with check (is_admin());

alter table training_progress enable row level security;
create policy training_progress_select on training_progress for select using (profile_id = auth.uid() or is_admin());
create policy training_progress_insert on training_progress for insert with check (profile_id = auth.uid());
create policy training_progress_update on training_progress for update using (profile_id = auth.uid() or is_admin()) with check (profile_id = auth.uid() or is_admin());
create policy training_progress_delete on training_progress for delete using (is_admin());

alter table accreditations enable row level security;
create policy accreditations_select on accreditations for select using (profile_id = auth.uid() or is_admin());
create policy accreditations_insert on accreditations for insert with check (is_admin());
create policy accreditations_update on accreditations for update using (is_admin()) with check (is_admin());
create policy accreditations_delete on accreditations for delete using (is_admin());

alter table shift_assignments enable row level security;
create policy shift_assignments_select on shift_assignments for select using (profile_id = auth.uid() or is_admin());
create policy shift_assignments_insert on shift_assignments for insert with check (is_admin());
create policy shift_assignments_update on shift_assignments for update using (is_admin()) with check (is_admin());
create policy shift_assignments_delete on shift_assignments for delete using (is_admin());

alter table attendance_records enable row level security;
create policy attendance_records_select on attendance_records for select using (profile_id = auth.uid() or is_admin());
create policy attendance_records_insert on attendance_records for insert with check (is_admin());
create policy attendance_records_update on attendance_records for update using (is_admin()) with check (is_admin());
create policy attendance_records_delete on attendance_records for delete using (is_admin());

alter table volunteer_hours enable row level security;
create policy volunteer_hours_select on volunteer_hours for select using (profile_id = auth.uid() or is_admin());
create policy volunteer_hours_insert on volunteer_hours for insert with check (is_admin());
create policy volunteer_hours_update on volunteer_hours for update using (is_admin()) with check (is_admin());
create policy volunteer_hours_delete on volunteer_hours for delete using (is_admin());

alter table certificates enable row level security;
create policy certificates_select on certificates for select using (profile_id = auth.uid() or is_admin());
create policy certificates_insert on certificates for insert with check (is_admin());
create policy certificates_update on certificates for update using (is_admin()) with check (is_admin());
create policy certificates_delete on certificates for delete using (is_admin());

alter table notifications enable row level security;
create policy notifications_select on notifications for select using (profile_id = auth.uid() or is_admin());
create policy notifications_insert on notifications for insert with check (profile_id = auth.uid() or is_admin());
create policy notifications_update on notifications for update using (profile_id = auth.uid() or is_admin()) with check (profile_id = auth.uid() or is_admin());
create policy notifications_delete on notifications for delete using (is_admin());

alter table reports enable row level security;
create policy reports_select on reports for select using (reporter_id = auth.uid() or is_admin());
create policy reports_insert on reports for insert with check (reporter_id = auth.uid());
create policy reports_update on reports for update using (is_admin()) with check (is_admin());
create policy reports_delete on reports for delete using (is_admin());

create trigger profiles_set_updated_at before update on profiles for each row execute function trigger_set_updated_at();
create trigger events_set_updated_at before update on events for each row execute function trigger_set_updated_at();
create trigger event_roles_set_updated_at before update on event_roles for each row execute function trigger_set_updated_at();
create trigger applications_set_updated_at before update on applications for each row execute function trigger_set_updated_at();
create trigger training_modules_set_updated_at before update on training_modules for each row execute function trigger_set_updated_at();
create trigger training_progress_set_updated_at before update on training_progress for each row execute function trigger_set_updated_at();
create trigger accreditations_set_updated_at before update on accreditations for each row execute function trigger_set_updated_at();
create trigger event_shifts_set_updated_at before update on event_shifts for each row execute function trigger_set_updated_at();
create trigger shift_assignments_set_updated_at before update on shift_assignments for each row execute function trigger_set_updated_at();
create trigger attendance_records_set_updated_at before update on attendance_records for each row execute function trigger_set_updated_at();
create trigger volunteer_hours_set_updated_at before update on volunteer_hours for each row execute function trigger_set_updated_at();
create trigger certificates_set_updated_at before update on certificates for each row execute function trigger_set_updated_at();
create trigger notifications_set_updated_at before update on notifications for each row execute function trigger_set_updated_at();
create trigger reports_set_updated_at before update on reports for each row execute function trigger_set_updated_at();

