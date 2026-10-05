--
-- PostgreSQL database dump
--

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: accreditation_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.accreditation_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


--
-- Name: application_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.application_status AS ENUM (
    'pending',
    'accepted',
    'rejected',
    'withdrawn',
    'waitlisted'
);


--
-- Name: attendance_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.attendance_status AS ENUM (
    'scheduled',
    'checked-in',
    'checked-out',
    'absent',
    'late'
);


--
-- Name: committee_member_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.committee_member_status AS ENUM (
    'assigned',
    'removed',
    'completed'
);


--
-- Name: committee_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.committee_status AS ENUM (
    'active',
    'inactive',
    'archived'
);


--
-- Name: event_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.event_status AS ENUM (
    'draft',
    'published',
    'closed',
    'completed',
    'cancelled'
);


--
-- Name: notification_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.notification_category AS ENUM (
    'application',
    'training',
    'accreditation',
    'certificate',
    'event',
    'other'
);


--
-- Name: report_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.report_status AS ENUM (
    'open',
    'reviewing',
    'resolved',
    'dismissed'
);


--
-- Name: shift_assignment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.shift_assignment_status AS ENUM (
    'assigned',
    'removed',
    'completed'
);


--
-- Name: training_resource_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.training_resource_type AS ENUM (
    'video',
    'pdf',
    'text',
    'link'
);


--
-- Name: training_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.training_status AS ENUM (
    'draft',
    'published'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'volunteer',
    'admin',
    'leader'
);


--
-- Name: check_committee_feedback_consistency(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_committee_feedback_consistency() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN

  -- committee must belong to the supplied event
  IF NOT EXISTS (
    SELECT 1
    FROM public.committees c
    WHERE c.id = NEW.committee_id
      AND c.event_id = NEW.event_id
  ) THEN
    RAISE EXCEPTION
      'committee % does not belong to event %',
      NEW.committee_id,
      NEW.event_id;
  END IF;

  -- leader must match committee leader
  IF NOT EXISTS (
    SELECT 1
    FROM public.committees c
    WHERE c.id = NEW.committee_id
      AND c.leader_profile_id = NEW.leader_profile_id
  ) THEN
    RAISE EXCEPTION
      'leader_profile_id % is not the leader of committee %',
      NEW.leader_profile_id,
      NEW.committee_id;
  END IF;

  -- member must be assigned to committee
  IF NOT EXISTS (
    SELECT 1
    FROM public.committee_members cm
    WHERE cm.committee_id = NEW.committee_id
      AND cm.profile_id = NEW.member_profile_id
      AND cm.status = 'assigned'
  ) THEN
    RAISE EXCEPTION
      'member_profile_id % is not an assigned member of committee %',
      NEW.member_profile_id,
      NEW.committee_id;
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$begin



  insert into public.profiles (

    id,

    email,

    role,

    status,

    first_name,

    last_name,

    date_of_birth,

    phone,

    city,

    country

  )

  values (

    new.id,

    new.email,

    'volunteer',

    'active',



    nullif(new.raw_user_meta_data ->> 'first_name', ''),

    nullif(new.raw_user_meta_data ->> 'last_name', ''),



    nullif(

      new.raw_user_meta_data ->> 'date_of_birth',

      ''

    )::date,



    nullif(new.raw_user_meta_data ->> 'phone', ''),

    nullif(new.raw_user_meta_data ->> 'city', ''),



    coalesce(

      nullif(new.raw_user_meta_data ->> 'country', ''),

      'Morocco'

    )

  );



  return new;



exception

  when others then



    raise warning

      'Unable to create profile for user %: %',

      new.id,

      sqlerrm;



    return new;



end;$$;


--
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;


--
-- Name: is_committee_leader(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_committee_leader(p_committee uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists (
    select 1
    from public.committees c
    where c.id = p_committee
      and c.leader_profile_id = auth.uid()
  );
$$;


--
-- Name: is_committee_leader_for_shift(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_committee_leader_for_shift(p_shift_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$

  SELECT EXISTS (

    SELECT 1

    FROM public.committee_shifts cs

    INNER JOIN public.committees c

      ON c.id = cs.committee_id

    WHERE cs.shift_id = p_shift_id

      AND c.leader_profile_id = auth.uid()

      AND c.status = 'active'::public.committee_status

  );

$$;


--
-- Name: is_committee_member(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_committee_member(p_committee uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists (
    select 1
    from public.committee_members cm
    where cm.committee_id = p_committee
      and cm.profile_id = auth.uid()
      and cm.status = 'assigned'
  );
$$;


--
-- Name: is_committee_member_for_shift(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_committee_member_for_shift(p_shift_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$

  SELECT EXISTS (

    SELECT 1

    FROM public.committee_shifts cs

    INNER JOIN public.committee_members cm

      ON cm.committee_id = cs.committee_id

    WHERE cs.shift_id = p_shift_id

      AND cm.profile_id = auth.uid()

      AND cm.status = 'assigned'::public.committee_member_status

  );

$$;


--
-- Name: protect_application_fields(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.protect_application_fields() RETURNS trigger
    LANGUAGE plpgsql
    AS $$BEGIN



  IF TG_OP = 'UPDATE' THEN



    IF NEW.profile_id IS DISTINCT FROM OLD.profile_id THEN

      RAISE EXCEPTION 'You cannot change the application owner.';

    END IF;



    IF NOT public.is_admin() THEN

      IF NEW.status IS DISTINCT FROM OLD.status THEN

        RAISE EXCEPTION 'You cannot change the application status.';

      END IF;

    END IF;



  END IF;



  RETURN NEW;



END;$$;


--
-- Name: protect_profile_fields(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.protect_profile_fields() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$

BEGIN



  -- Never allow changing profile ID

  NEW.id := OLD.id;



  -- Only protect role from non-admin users

  IF NOT public.is_admin() THEN

    NEW.role := OLD.role;

  END IF;



  -- Never allow public users to change account status

  IF NOT public.is_admin() THEN

    NEW.status := OLD.status;

  END IF;



  -- Email should follow auth.users

  NEW.email := OLD.email;



  -- System-managed fields

  NEW.volunteer_hours := OLD.volunteer_hours;

  NEW.attendance_rate := OLD.attendance_rate;



  -- Keep original creation date

  NEW.created_at := OLD.created_at;



  -- Always refresh updated_at

  NEW.updated_at := now();



  RETURN NEW;



END;

$$;


--
-- Name: calculate_attendance_hours(time without time zone, time without time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_attendance_hours(p_check_in_time time without time zone, p_check_out_time time without time zone) RETURNS integer
    LANGUAGE sql
    AS $$
  SELECT CASE
    WHEN p_check_in_time IS NULL OR p_check_out_time IS NULL THEN 0
    WHEN p_check_out_time < p_check_in_time THEN 0
    ELSE CAST(ROUND(EXTRACT(EPOCH FROM (p_check_out_time - p_check_in_time)) / 3600.0)::numeric AS integer)
  END;
$$;


--
-- Name: sync_volunteer_hours(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_volunteer_hours() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  previous_hours integer := 0;
  next_hours integer := 0;
  delta_hours integer := 0;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.check_in_time IS NULL OR NEW.check_out_time IS NULL THEN
      RETURN NEW;
    END IF;

    next_hours := public.calculate_attendance_hours(NEW.check_in_time, NEW.check_out_time);
    IF next_hours > 0 THEN
      UPDATE public.profiles
      SET volunteer_hours = volunteer_hours + next_hours
      WHERE id = NEW.profile_id;

      INSERT INTO public.volunteer_hours (
        profile_id,
        event_id,
        shift_id,
        attendance_id,
        hours,
        approval_notes,
        year
      )
      VALUES (
        NEW.profile_id,
        NEW.event_id,
        NEW.shift_id,
        NEW.id,
        next_hours,
        'Auto-calculated from attendance check-in/check-out',
        EXTRACT(YEAR FROM NEW.date)::integer
      )
      ON CONFLICT (attendance_id) WHERE attendance_id IS NOT NULL
      DO UPDATE SET
        profile_id = EXCLUDED.profile_id,
        event_id = EXCLUDED.event_id,
        shift_id = EXCLUDED.shift_id,
        hours = EXCLUDED.hours,
        year = EXCLUDED.year,
        approval_notes = EXCLUDED.approval_notes,
        updated_at = now();
    END IF;

    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    previous_hours := public.calculate_attendance_hours(OLD.check_in_time, OLD.check_out_time);
    next_hours := public.calculate_attendance_hours(NEW.check_in_time, NEW.check_out_time);
    delta_hours := next_hours - previous_hours;

    IF delta_hours <> 0 THEN
      UPDATE public.profiles
      SET volunteer_hours = volunteer_hours + delta_hours
      WHERE id = NEW.profile_id;
    END IF;

    INSERT INTO public.volunteer_hours (
      profile_id,
      event_id,
      shift_id,
      attendance_id,
      hours,
      approval_notes,
      year
    )
    VALUES (
      NEW.profile_id,
      NEW.event_id,
      NEW.shift_id,
      NEW.id,
      next_hours,
      'Auto-calculated from attendance check-in/check-out',
      EXTRACT(YEAR FROM NEW.date)::integer
    )
    ON CONFLICT (attendance_id) WHERE attendance_id IS NOT NULL
    DO UPDATE SET
      profile_id = EXCLUDED.profile_id,
      event_id = EXCLUDED.event_id,
      shift_id = EXCLUDED.shift_id,
      hours = EXCLUDED.hours,
      year = EXCLUDED.year,
      approval_notes = EXCLUDED.approval_notes,
      updated_at = now();

    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: recalculate_attendance_rate(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.recalculate_attendance_rate(p_profile_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  total_records integer := 0;
  attended_records integer := 0;
BEGIN
  SELECT COUNT(*) INTO total_records
  FROM public.attendance_records
  WHERE profile_id = p_profile_id;

  IF total_records = 0 THEN
    UPDATE public.profiles
    SET attendance_rate = 0
    WHERE id = p_profile_id;
    RETURN;
  END IF;

  SELECT COUNT(*) INTO attended_records
  FROM public.attendance_records
  WHERE profile_id = p_profile_id
    AND status IN ('checked-in'::public.attendance_status, 'checked-out'::public.attendance_status, 'late'::public.attendance_status);

  UPDATE public.profiles
  SET attendance_rate = ROUND((attended_records::numeric / total_records::numeric) * 100, 2)
  WHERE id = p_profile_id;
END;
$$;


--
-- Name: sync_attendance_rate(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_attendance_rate() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.recalculate_attendance_rate(OLD.profile_id);
    RETURN OLD;
  END IF;

  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM public.recalculate_attendance_rate(NEW.profile_id);
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: rls_auto_enable(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.rls_auto_enable() RETURNS event_trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


--
-- Name: trigger_set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trigger_set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

begin

  new.updated_at = now();

  return new;

end;

$$;


--
-- Name: validate_committee_shift_event(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_committee_shift_event() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$

DECLARE

  committee_event_id uuid;

  shift_event_id uuid;

BEGIN

  SELECT c.event_id

  INTO committee_event_id

  FROM public.committees c

  WHERE c.id = NEW.committee_id;



  SELECT s.event_id

  INTO shift_event_id

  FROM public.event_shifts s

  WHERE s.id = NEW.shift_id;



  IF committee_event_id IS NULL THEN

    RAISE EXCEPTION 'Committee % does not exist', NEW.committee_id;

  END IF;



  IF shift_event_id IS NULL THEN

    RAISE EXCEPTION 'Shift % does not exist', NEW.shift_id;

  END IF;



  IF committee_event_id <> shift_event_id THEN

    RAISE EXCEPTION

      'Committee and shift must belong to the same event';

  END IF;



  RETURN NEW;

END;

$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accreditations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accreditations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    event_id uuid NOT NULL,
    role_id uuid NOT NULL,
    volunteer_identifier text NOT NULL,
    zone text,
    qr_code_data text,
    status public.accreditation_status DEFAULT 'pending'::public.accreditation_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: achievement_definitions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.achievement_definitions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    title text NOT NULL,
    description text,
    icon text,
    category text DEFAULT 'general'::text NOT NULL,
    requirement_type text NOT NULL,
    requirement_value integer DEFAULT 1 NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.applications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    event_id uuid NOT NULL,
    role_id uuid NOT NULL,
    status public.application_status DEFAULT 'pending'::public.application_status NOT NULL,
    experience text,
    availability text,
    motivation text,
    admin_notes text,
    applied_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: attendance_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendance_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    event_id uuid NOT NULL,
    shift_id uuid NOT NULL,
    role_id uuid NOT NULL,
    date date NOT NULL,
    status public.attendance_status DEFAULT 'scheduled'::public.attendance_status NOT NULL,
    check_in_time time without time zone,
    check_out_time time without time zone,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: certificates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.certificates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    event_id uuid NOT NULL,
    role_id uuid NOT NULL,
    hours integer DEFAULT 0 NOT NULL,
    date date NOT NULL,
    certificate_id text NOT NULL,
    file_path text,
    issued_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: committee_feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.committee_feedback (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    committee_id uuid NOT NULL,
    member_profile_id uuid NOT NULL,
    leader_profile_id uuid NOT NULL,
    event_id uuid NOT NULL,
    punctuality integer DEFAULT 0 NOT NULL,
    teamwork integer DEFAULT 0 NOT NULL,
    communication integer DEFAULT 0 NOT NULL,
    responsibility integer DEFAULT 0 NOT NULL,
    overall_rating integer DEFAULT 0 NOT NULL,
    comment text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT committee_feedback_communication_check CHECK (((communication >= 1) AND (communication <= 5))),
    CONSTRAINT committee_feedback_overall_rating_check CHECK (((overall_rating >= 1) AND (overall_rating <= 5))),
    CONSTRAINT committee_feedback_punctuality_check CHECK (((punctuality >= 1) AND (punctuality <= 5))),
    CONSTRAINT committee_feedback_responsibility_check CHECK (((responsibility >= 1) AND (responsibility <= 5))),
    CONSTRAINT committee_feedback_teamwork_check CHECK (((teamwork >= 1) AND (teamwork <= 5)))
);


--
-- Name: committee_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.committee_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    committee_id uuid NOT NULL,
    profile_id uuid NOT NULL,
    event_role_id uuid,
    status public.committee_member_status DEFAULT 'assigned'::public.committee_member_status NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: committee_shifts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.committee_shifts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    committee_id uuid NOT NULL,
    shift_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: committees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.committees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    leader_profile_id uuid,
    status public.committee_status DEFAULT 'active'::public.committee_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: event_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    responsibilities text,
    requirements text,
    skills text[] DEFAULT ARRAY[]::text[] NOT NULL,
    positions integer DEFAULT 1 NOT NULL,
    filled_positions integer DEFAULT 0 NOT NULL,
    min_age integer,
    mandatory_training boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT event_roles_nonnegative_filled CHECK ((filled_positions >= 0)),
    CONSTRAINT event_roles_positive_positions CHECK ((positions > 0))
);


--
-- Name: event_shifts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_shifts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    role_id uuid NOT NULL,
    title text NOT NULL,
    location text,
    date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    capacity integer DEFAULT 1 NOT NULL,
    instructions text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT event_shifts_positive_capacity CHECK ((capacity > 0))
);


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    sport_id uuid NOT NULL,
    sport text NOT NULL,
    city text NOT NULL,
    country text NOT NULL,
    venue text NOT NULL,
    cover_url text,
    description text,
    start_date date NOT NULL,
    end_date date NOT NULL,
    start_time time without time zone,
    end_time time without time zone,
    application_deadline date,
    status public.event_status DEFAULT 'draft'::public.event_status NOT NULL,
    total_volunteers_needed integer DEFAULT 0 NOT NULL,
    required_languages text[] DEFAULT ARRAY[]::text[] NOT NULL,
    requirements text,
    event_type text,
    featured boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT events_deadline_before_start CHECK (((application_deadline IS NULL) OR (application_deadline <= start_date))),
    CONSTRAINT events_positive_volunteers CHECK ((total_volunteers_needed >= 0)),
    CONSTRAINT events_valid_dates CHECK ((start_date <= end_date))
);


--
-- Name: languages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.languages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    event_id uuid,
    application_id uuid,
    title text NOT NULL,
    body text NOT NULL,
    category public.notification_category DEFAULT 'other'::public.notification_category NOT NULL,
    read boolean DEFAULT false NOT NULL,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profile_achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profile_achievements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    achievement_id uuid NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    unlocked boolean DEFAULT false NOT NULL,
    unlocked_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profile_languages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profile_languages (
    profile_id uuid NOT NULL,
    language_id uuid NOT NULL
);


--
-- Name: profile_skills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profile_skills (
    profile_id uuid NOT NULL,
    skill_id uuid NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text,
    role public.user_role DEFAULT 'volunteer'::public.user_role NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    first_name text,
    last_name text,
    date_of_birth date,
    avatar_url text,
    phone text,
    city text,
    country text,
    bio text,
    interests text[] DEFAULT ARRAY[]::text[] NOT NULL,
    skills text[] DEFAULT ARRAY[]::text[] NOT NULL,
    languages text[] DEFAULT ARRAY[]::text[] NOT NULL,
    experience text,
    volunteer_hours integer DEFAULT 0 NOT NULL,
    attendance_rate numeric DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    nationality text,
    cin_or_passport text
);


--
-- Name: reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reporter_id uuid NOT NULL,
    target_type text NOT NULL,
    target_id uuid,
    report_type text NOT NULL,
    reason text,
    description text,
    status public.report_status DEFAULT 'open'::public.report_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    resolved_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: shift_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shift_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    shift_id uuid NOT NULL,
    profile_id uuid NOT NULL,
    status public.shift_assignment_status DEFAULT 'assigned'::public.shift_assignment_status NOT NULL,
    assigned_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: skills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.skills (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: sports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: training_modules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.training_modules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    event_id uuid,
    role_id uuid,
    required boolean DEFAULT false NOT NULL,
    resources jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    training_mode text DEFAULT 'in_person'::text NOT NULL,
    zoom_url text,
    status text DEFAULT 'draft'::text NOT NULL,
    published_at timestamp with time zone,
    CONSTRAINT training_modules_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text]))),
    CONSTRAINT training_modules_training_mode_check CHECK ((training_mode = ANY (ARRAY['online'::text, 'in_person'::text, 'hybrid'::text])))
);


--
-- Name: training_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.training_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    training_id uuid NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    score integer DEFAULT 0 NOT NULL,
    total_questions integer DEFAULT 0 NOT NULL,
    passed boolean DEFAULT false NOT NULL,
    answers jsonb DEFAULT '{}'::jsonb NOT NULL,
    submitted_at timestamp with time zone,
    CONSTRAINT training_progress_score_check CHECK ((score >= 0)),
    CONSTRAINT training_progress_score_limit_check CHECK ((score <= total_questions)),
    CONSTRAINT training_progress_total_questions_check CHECK ((total_questions >= 0))
);


--
-- Name: training_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.training_questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    training_id uuid NOT NULL,
    question_number integer NOT NULL,
    question text NOT NULL,
    options jsonb DEFAULT '[]'::jsonb NOT NULL,
    correct_options jsonb DEFAULT '[]'::jsonb NOT NULL,
    points integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT training_questions_number_check CHECK (((question_number >= 1) AND (question_number <= 20))),
    CONSTRAINT training_questions_points_check CHECK ((points > 0))
);


--
-- Name: volunteer_hours; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteer_hours (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    event_id uuid,
    shift_id uuid,
    attendance_id uuid,
    hours integer DEFAULT 0 NOT NULL,
    approved_by uuid,
    approval_notes text,
    year integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT volunteer_hours_positive CHECK ((hours >= 0))
);


--
-- Name: volunteer_profile_completion; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.volunteer_profile_completion WITH (security_invoker='true') AS
 SELECT id AS profile_id,
    (((((((((
        CASE
            WHEN (NULLIF(TRIM(BOTH FROM first_name), ''::text) IS NOT NULL) THEN 1
            ELSE 0
        END +
        CASE
            WHEN (NULLIF(TRIM(BOTH FROM last_name), ''::text) IS NOT NULL) THEN 1
            ELSE 0
        END) +
        CASE
            WHEN (date_of_birth IS NOT NULL) THEN 1
            ELSE 0
        END) +
        CASE
            WHEN (NULLIF(TRIM(BOTH FROM phone), ''::text) IS NOT NULL) THEN 1
            ELSE 0
        END) +
        CASE
            WHEN (NULLIF(TRIM(BOTH FROM city), ''::text) IS NOT NULL) THEN 1
            ELSE 0
        END) +
        CASE
            WHEN (NULLIF(TRIM(BOTH FROM bio), ''::text) IS NOT NULL) THEN 1
            ELSE 0
        END) +
        CASE
            WHEN (NULLIF(TRIM(BOTH FROM avatar_url), ''::text) IS NOT NULL) THEN 1
            ELSE 0
        END) +
        CASE
            WHEN (COALESCE(array_length(skills, 1), 0) > 0) THEN 1
            ELSE 0
        END) +
        CASE
            WHEN (COALESCE(array_length(languages, 1), 0) > 0) THEN 1
            ELSE 0
        END) +
        CASE
            WHEN (NULLIF(TRIM(BOTH FROM experience), ''::text) IS NOT NULL) THEN 1
            ELSE 0
        END) AS completed_fields,
    10 AS total_fields,
    (round(((((((((((((
        CASE
            WHEN (NULLIF(TRIM(BOTH FROM first_name), ''::text) IS NOT NULL) THEN 1
            ELSE 0
        END +
        CASE
            WHEN (NULLIF(TRIM(BOTH FROM last_name), ''::text) IS NOT NULL) THEN 1
            ELSE 0
        END) +
        CASE
            WHEN (date_of_birth IS NOT NULL) THEN 1
            ELSE 0
        END) +
        CASE
            WHEN (NULLIF(TRIM(BOTH FROM phone), ''::text) IS NOT NULL) THEN 1
            ELSE 0
        END) +
        CASE
            WHEN (NULLIF(TRIM(BOTH FROM city), ''::text) IS NOT NULL) THEN 1
            ELSE 0
        END) +
        CASE
            WHEN (NULLIF(TRIM(BOTH FROM bio), ''::text) IS NOT NULL) THEN 1
            ELSE 0
        END) +
        CASE
            WHEN (NULLIF(TRIM(BOTH FROM avatar_url), ''::text) IS NOT NULL) THEN 1
            ELSE 0
        END) +
        CASE
            WHEN (COALESCE(array_length(skills, 1), 0) > 0) THEN 1
            ELSE 0
        END) +
        CASE
            WHEN (COALESCE(array_length(languages, 1), 0) > 0) THEN 1
            ELSE 0
        END) +
        CASE
            WHEN (NULLIF(TRIM(BOTH FROM experience), ''::text) IS NOT NULL) THEN 1
            ELSE 0
        END))::numeric / (10)::numeric) * (100)::numeric)))::integer AS completion_percentage
   FROM public.profiles p;


--
-- Name: accreditations accreditations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accreditations
    ADD CONSTRAINT accreditations_pkey PRIMARY KEY (id);


--
-- Name: accreditations accreditations_profile_id_event_id_role_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accreditations
    ADD CONSTRAINT accreditations_profile_id_event_id_role_id_key UNIQUE (profile_id, event_id, role_id);


--
-- Name: achievement_definitions achievement_definitions_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievement_definitions
    ADD CONSTRAINT achievement_definitions_code_key UNIQUE (code);


--
-- Name: achievement_definitions achievement_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievement_definitions
    ADD CONSTRAINT achievement_definitions_pkey PRIMARY KEY (id);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: applications applications_profile_id_event_id_role_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_profile_id_event_id_role_id_key UNIQUE (profile_id, event_id, role_id);


--
-- Name: attendance_records attendance_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_pkey PRIMARY KEY (id);


--
-- Name: attendance_records attendance_records_profile_id_shift_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_profile_id_shift_id_key UNIQUE (profile_id, shift_id);


--
-- Name: certificates certificates_certificate_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_certificate_id_key UNIQUE (certificate_id);


--
-- Name: certificates certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_pkey PRIMARY KEY (id);


--
-- Name: committee_feedback committee_feedback_committee_id_member_profile_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committee_feedback
    ADD CONSTRAINT committee_feedback_committee_id_member_profile_id_key UNIQUE (committee_id, member_profile_id);


--
-- Name: committee_feedback committee_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committee_feedback
    ADD CONSTRAINT committee_feedback_pkey PRIMARY KEY (id);


--
-- Name: committee_members committee_members_committee_id_profile_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committee_members
    ADD CONSTRAINT committee_members_committee_id_profile_id_key UNIQUE (committee_id, profile_id);


--
-- Name: committee_members committee_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committee_members
    ADD CONSTRAINT committee_members_pkey PRIMARY KEY (id);


--
-- Name: committee_shifts committee_shifts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committee_shifts
    ADD CONSTRAINT committee_shifts_pkey PRIMARY KEY (id);


--
-- Name: committee_shifts committee_shifts_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committee_shifts
    ADD CONSTRAINT committee_shifts_unique UNIQUE (committee_id, shift_id);


--
-- Name: committees committees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committees
    ADD CONSTRAINT committees_pkey PRIMARY KEY (id);


--
-- Name: event_roles event_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_roles
    ADD CONSTRAINT event_roles_pkey PRIMARY KEY (id);


--
-- Name: event_shifts event_shifts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_shifts
    ADD CONSTRAINT event_shifts_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: events events_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_slug_key UNIQUE (slug);


--
-- Name: languages languages_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.languages
    ADD CONSTRAINT languages_name_key UNIQUE (name);


--
-- Name: languages languages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.languages
    ADD CONSTRAINT languages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: profile_achievements profile_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_achievements
    ADD CONSTRAINT profile_achievements_pkey PRIMARY KEY (id);


--
-- Name: profile_achievements profile_achievements_profile_id_achievement_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_achievements
    ADD CONSTRAINT profile_achievements_profile_id_achievement_id_key UNIQUE (profile_id, achievement_id);


--
-- Name: profile_languages profile_languages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_languages
    ADD CONSTRAINT profile_languages_pkey PRIMARY KEY (profile_id, language_id);


--
-- Name: profile_skills profile_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_skills
    ADD CONSTRAINT profile_skills_pkey PRIMARY KEY (profile_id, skill_id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: shift_assignments shift_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_assignments
    ADD CONSTRAINT shift_assignments_pkey PRIMARY KEY (id);


--
-- Name: shift_assignments shift_assignments_shift_id_profile_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_assignments
    ADD CONSTRAINT shift_assignments_shift_id_profile_id_key UNIQUE (shift_id, profile_id);


--
-- Name: skills skills_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_name_key UNIQUE (name);


--
-- Name: skills skills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_pkey PRIMARY KEY (id);


--
-- Name: sports sports_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sports
    ADD CONSTRAINT sports_name_key UNIQUE (name);


--
-- Name: sports sports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sports
    ADD CONSTRAINT sports_pkey PRIMARY KEY (id);


--
-- Name: training_modules training_modules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_modules
    ADD CONSTRAINT training_modules_pkey PRIMARY KEY (id);


--
-- Name: training_progress training_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_progress
    ADD CONSTRAINT training_progress_pkey PRIMARY KEY (id);


--
-- Name: training_progress training_progress_profile_id_training_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_progress
    ADD CONSTRAINT training_progress_profile_id_training_id_key UNIQUE (profile_id, training_id);


--
-- Name: training_questions training_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_questions
    ADD CONSTRAINT training_questions_pkey PRIMARY KEY (id);


--
-- Name: training_questions training_questions_unique_number; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_questions
    ADD CONSTRAINT training_questions_unique_number UNIQUE (training_id, question_number);


--
-- Name: volunteer_hours volunteer_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_hours
    ADD CONSTRAINT volunteer_hours_pkey PRIMARY KEY (id);


--
-- Name: accreditations_event_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX accreditations_event_id_idx ON public.accreditations USING btree (event_id);


--
-- Name: accreditations_profile_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX accreditations_profile_id_idx ON public.accreditations USING btree (profile_id);


--
-- Name: applications_event_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX applications_event_id_idx ON public.applications USING btree (event_id);


--
-- Name: applications_one_per_event; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX applications_one_per_event ON public.applications USING btree (profile_id, event_id);


--
-- Name: applications_profile_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX applications_profile_id_idx ON public.applications USING btree (profile_id);


--
-- Name: applications_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX applications_status_idx ON public.applications USING btree (status);


--
-- Name: attendance_records_event_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attendance_records_event_id_idx ON public.attendance_records USING btree (event_id);


--
-- Name: attendance_records_profile_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attendance_records_profile_id_idx ON public.attendance_records USING btree (profile_id);


--
-- Name: attendance_records_shift_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attendance_records_shift_id_idx ON public.attendance_records USING btree (shift_id);


--
-- Name: certificates_event_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX certificates_event_id_idx ON public.certificates USING btree (event_id);


--
-- Name: certificates_profile_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX certificates_profile_id_idx ON public.certificates USING btree (profile_id);


--
-- Name: committee_feedback_committee_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX committee_feedback_committee_id_idx ON public.committee_feedback USING btree (committee_id);


--
-- Name: committee_feedback_leader_profile_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX committee_feedback_leader_profile_id_idx ON public.committee_feedback USING btree (leader_profile_id);


--
-- Name: committee_feedback_member_profile_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX committee_feedback_member_profile_id_idx ON public.committee_feedback USING btree (member_profile_id);


--
-- Name: committee_members_committee_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX committee_members_committee_id_idx ON public.committee_members USING btree (committee_id);


--
-- Name: committee_members_profile_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX committee_members_profile_id_idx ON public.committee_members USING btree (profile_id);


--
-- Name: committee_members_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX committee_members_status_idx ON public.committee_members USING btree (status);


--
-- Name: committee_shifts_committee_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX committee_shifts_committee_id_idx ON public.committee_shifts USING btree (committee_id);


--
-- Name: committee_shifts_shift_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX committee_shifts_shift_id_idx ON public.committee_shifts USING btree (shift_id);


--
-- Name: committees_event_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX committees_event_id_idx ON public.committees USING btree (event_id);


--
-- Name: committees_leader_profile_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX committees_leader_profile_id_idx ON public.committees USING btree (leader_profile_id);


--
-- Name: committees_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX committees_status_idx ON public.committees USING btree (status);


--
-- Name: event_roles_event_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX event_roles_event_id_idx ON public.event_roles USING btree (event_id);


--
-- Name: event_shifts_event_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX event_shifts_event_id_idx ON public.event_shifts USING btree (event_id);


--
-- Name: event_shifts_role_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX event_shifts_role_id_idx ON public.event_shifts USING btree (role_id);


--
-- Name: events_city_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_city_idx ON public.events USING btree (city);


--
-- Name: events_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_slug_idx ON public.events USING btree (slug);


--
-- Name: events_sport_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_sport_idx ON public.events USING btree (sport_id);


--
-- Name: events_start_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_start_date_idx ON public.events USING btree (start_date);


--
-- Name: events_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_status_idx ON public.events USING btree (status);


--
-- Name: notifications_event_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_event_id_idx ON public.notifications USING btree (event_id);


--
-- Name: notifications_profile_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_profile_id_idx ON public.notifications USING btree (profile_id);


--
-- Name: notifications_read_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_read_at_idx ON public.notifications USING btree (read_at);


--
-- Name: profiles_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX profiles_email_idx ON public.profiles USING btree (email);


--
-- Name: profiles_role_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX profiles_role_idx ON public.profiles USING btree (role);


--
-- Name: profiles_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX profiles_status_idx ON public.profiles USING btree (status);


--
-- Name: reports_reporter_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reports_reporter_id_idx ON public.reports USING btree (reporter_id);


--
-- Name: reports_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reports_status_idx ON public.reports USING btree (status);


--
-- Name: shift_assignments_profile_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX shift_assignments_profile_id_idx ON public.shift_assignments USING btree (profile_id);


--
-- Name: shift_assignments_shift_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX shift_assignments_shift_id_idx ON public.shift_assignments USING btree (shift_id);


--
-- Name: training_modules_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX training_modules_status_idx ON public.training_modules USING btree (status);


--
-- Name: training_progress_profile_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX training_progress_profile_id_idx ON public.training_progress USING btree (profile_id);


--
-- Name: training_progress_training_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX training_progress_training_id_idx ON public.training_progress USING btree (training_id);


--
-- Name: volunteer_hours_event_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX volunteer_hours_event_id_idx ON public.volunteer_hours USING btree (event_id);


--
-- Name: volunteer_hours_profile_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX volunteer_hours_profile_id_idx ON public.volunteer_hours USING btree (profile_id);


--
-- Name: volunteer_hours_year_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX volunteer_hours_year_idx ON public.volunteer_hours USING btree (year);
CREATE UNIQUE INDEX volunteer_hours_attendance_id_unique_idx ON public.volunteer_hours USING btree (attendance_id) WHERE (attendance_id IS NOT NULL);


--
-- Name: accreditations accreditations_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER accreditations_set_updated_at BEFORE UPDATE ON public.accreditations FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


--
-- Name: applications applications_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER applications_set_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


--
-- Name: attendance_records attendance_records_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER attendance_records_set_updated_at BEFORE UPDATE ON public.attendance_records FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


--
-- Name: attendance_records attendance_records_sync_attendance_rate; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER attendance_records_sync_attendance_rate AFTER INSERT OR UPDATE OF status OR DELETE ON public.attendance_records FOR EACH ROW EXECUTE FUNCTION public.sync_attendance_rate();


--
-- Name: attendance_records attendance_records_sync_volunteer_hours; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER attendance_records_sync_volunteer_hours AFTER INSERT OR UPDATE OF check_in_time, check_out_time ON public.attendance_records FOR EACH ROW EXECUTE FUNCTION public.sync_volunteer_hours();


--
-- Name: certificates certificates_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER certificates_set_updated_at BEFORE UPDATE ON public.certificates FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


--
-- Name: committee_feedback committee_feedback_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER committee_feedback_set_updated_at BEFORE UPDATE ON public.committee_feedback FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


--
-- Name: committee_members committee_members_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER committee_members_set_updated_at BEFORE UPDATE ON public.committee_members FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


--
-- Name: committee_shifts committee_shifts_validate_event; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER committee_shifts_validate_event BEFORE INSERT OR UPDATE ON public.committee_shifts FOR EACH ROW EXECUTE FUNCTION public.validate_committee_shift_event();


--
-- Name: committees committees_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER committees_set_updated_at BEFORE UPDATE ON public.committees FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


--
-- Name: event_roles event_roles_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER event_roles_set_updated_at BEFORE UPDATE ON public.event_roles FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


--
-- Name: event_shifts event_shifts_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER event_shifts_set_updated_at BEFORE UPDATE ON public.event_shifts FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


--
-- Name: events events_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER events_set_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


--
-- Name: notifications notifications_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER notifications_set_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


--
-- Name: profiles profiles_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


--
-- Name: applications protect_application_fields_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER protect_application_fields_trigger BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.protect_application_fields();


--
-- Name: profiles protect_profile_fields_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER protect_profile_fields_trigger BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();


--
-- Name: reports reports_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER reports_set_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


--
-- Name: shift_assignments shift_assignments_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER shift_assignments_set_updated_at BEFORE UPDATE ON public.shift_assignments FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


--
-- Name: training_modules training_modules_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER training_modules_set_updated_at BEFORE UPDATE ON public.training_modules FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


--
-- Name: training_progress training_progress_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER training_progress_set_updated_at BEFORE UPDATE ON public.training_progress FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


--
-- Name: volunteer_hours volunteer_hours_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER volunteer_hours_set_updated_at BEFORE UPDATE ON public.volunteer_hours FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


--
-- Name: accreditations accreditations_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accreditations
    ADD CONSTRAINT accreditations_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: accreditations accreditations_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accreditations
    ADD CONSTRAINT accreditations_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: accreditations accreditations_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accreditations
    ADD CONSTRAINT accreditations_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.event_roles(id) ON DELETE CASCADE;


--
-- Name: applications applications_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: applications applications_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: applications applications_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.event_roles(id) ON DELETE RESTRICT;


--
-- Name: attendance_records attendance_records_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: attendance_records attendance_records_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: attendance_records attendance_records_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.event_roles(id) ON DELETE CASCADE;


--
-- Name: attendance_records attendance_records_shift_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_shift_id_fkey FOREIGN KEY (shift_id) REFERENCES public.event_shifts(id) ON DELETE CASCADE;


--
-- Name: certificates certificates_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: certificates certificates_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: certificates certificates_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.event_roles(id) ON DELETE CASCADE;


--
-- Name: committee_feedback committee_feedback_committee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committee_feedback
    ADD CONSTRAINT committee_feedback_committee_id_fkey FOREIGN KEY (committee_id) REFERENCES public.committees(id) ON DELETE CASCADE;


--
-- Name: committee_feedback committee_feedback_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committee_feedback
    ADD CONSTRAINT committee_feedback_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: committee_feedback committee_feedback_leader_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committee_feedback
    ADD CONSTRAINT committee_feedback_leader_profile_id_fkey FOREIGN KEY (leader_profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: committee_feedback committee_feedback_member_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committee_feedback
    ADD CONSTRAINT committee_feedback_member_profile_id_fkey FOREIGN KEY (member_profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: committee_members committee_members_committee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committee_members
    ADD CONSTRAINT committee_members_committee_id_fkey FOREIGN KEY (committee_id) REFERENCES public.committees(id) ON DELETE CASCADE;


--
-- Name: committee_members committee_members_event_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committee_members
    ADD CONSTRAINT committee_members_event_role_id_fkey FOREIGN KEY (event_role_id) REFERENCES public.event_roles(id) ON DELETE SET NULL;


--
-- Name: committee_members committee_members_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committee_members
    ADD CONSTRAINT committee_members_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: committee_shifts committee_shifts_committee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committee_shifts
    ADD CONSTRAINT committee_shifts_committee_id_fkey FOREIGN KEY (committee_id) REFERENCES public.committees(id) ON DELETE CASCADE;


--
-- Name: committee_shifts committee_shifts_shift_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committee_shifts
    ADD CONSTRAINT committee_shifts_shift_id_fkey FOREIGN KEY (shift_id) REFERENCES public.event_shifts(id) ON DELETE CASCADE;


--
-- Name: committees committees_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committees
    ADD CONSTRAINT committees_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: committees committees_leader_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committees
    ADD CONSTRAINT committees_leader_profile_id_fkey FOREIGN KEY (leader_profile_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: event_roles event_roles_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_roles
    ADD CONSTRAINT event_roles_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: event_shifts event_shifts_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_shifts
    ADD CONSTRAINT event_shifts_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: event_shifts event_shifts_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_shifts
    ADD CONSTRAINT event_shifts_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.event_roles(id) ON DELETE CASCADE;


--
-- Name: events events_sport_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_sport_id_fkey FOREIGN KEY (sport_id) REFERENCES public.sports(id) ON DELETE RESTRICT;


--
-- Name: notifications notifications_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: profile_achievements profile_achievements_achievement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_achievements
    ADD CONSTRAINT profile_achievements_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES public.achievement_definitions(id) ON DELETE CASCADE;


--
-- Name: profile_achievements profile_achievements_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_achievements
    ADD CONSTRAINT profile_achievements_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: profile_languages profile_languages_language_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_languages
    ADD CONSTRAINT profile_languages_language_id_fkey FOREIGN KEY (language_id) REFERENCES public.languages(id) ON DELETE CASCADE;


--
-- Name: profile_languages profile_languages_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_languages
    ADD CONSTRAINT profile_languages_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: profile_skills profile_skills_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_skills
    ADD CONSTRAINT profile_skills_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: profile_skills profile_skills_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_skills
    ADD CONSTRAINT profile_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: reports reports_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: shift_assignments shift_assignments_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_assignments
    ADD CONSTRAINT shift_assignments_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: shift_assignments shift_assignments_shift_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_assignments
    ADD CONSTRAINT shift_assignments_shift_id_fkey FOREIGN KEY (shift_id) REFERENCES public.event_shifts(id) ON DELETE CASCADE;


--
-- Name: training_modules training_modules_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_modules
    ADD CONSTRAINT training_modules_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE SET NULL;


--
-- Name: training_modules training_modules_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_modules
    ADD CONSTRAINT training_modules_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.event_roles(id) ON DELETE SET NULL;


--
-- Name: training_progress training_progress_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_progress
    ADD CONSTRAINT training_progress_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: training_progress training_progress_training_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_progress
    ADD CONSTRAINT training_progress_training_id_fkey FOREIGN KEY (training_id) REFERENCES public.training_modules(id) ON DELETE CASCADE;


--
-- Name: training_questions training_questions_training_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_questions
    ADD CONSTRAINT training_questions_training_id_fkey FOREIGN KEY (training_id) REFERENCES public.training_modules(id) ON DELETE CASCADE;


--
-- Name: volunteer_hours volunteer_hours_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_hours
    ADD CONSTRAINT volunteer_hours_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: volunteer_hours volunteer_hours_attendance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_hours
    ADD CONSTRAINT volunteer_hours_attendance_id_fkey FOREIGN KEY (attendance_id) REFERENCES public.attendance_records(id) ON DELETE SET NULL;


--
-- Name: volunteer_hours volunteer_hours_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_hours
    ADD CONSTRAINT volunteer_hours_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE SET NULL;


--
-- Name: volunteer_hours volunteer_hours_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_hours
    ADD CONSTRAINT volunteer_hours_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: volunteer_hours volunteer_hours_shift_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_hours
    ADD CONSTRAINT volunteer_hours_shift_id_fkey FOREIGN KEY (shift_id) REFERENCES public.event_shifts(id) ON DELETE SET NULL;


--
-- Name: training_questions Admins can manage training questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage training questions" ON public.training_questions TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: achievement_definitions Authenticated users can view active achievements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view active achievements" ON public.achievement_definitions FOR SELECT TO authenticated USING ((active = true));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));


--
-- Name: profile_achievements Users can view own achievements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own achievements" ON public.profile_achievements FOR SELECT TO authenticated USING ((profile_id = auth.uid()));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING ((auth.uid() = id));


--
-- Name: training_questions Volunteers can view published training questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Volunteers can view published training questions" ON public.training_questions FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.training_modules tm
  WHERE ((tm.id = training_questions.training_id) AND (tm.status = 'published'::text)))));


--
-- Name: training_modules Volunteers can view published trainings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Volunteers can view published trainings" ON public.training_modules FOR SELECT TO authenticated USING (((status = 'published'::text) OR public.is_admin()));


--
-- Name: accreditations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.accreditations ENABLE ROW LEVEL SECURITY;

--
-- Name: accreditations accreditations_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY accreditations_delete ON public.accreditations FOR DELETE USING (public.is_admin());


--
-- Name: accreditations accreditations_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY accreditations_insert ON public.accreditations FOR INSERT WITH CHECK (public.is_admin());


--
-- Name: accreditations accreditations_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY accreditations_select ON public.accreditations FOR SELECT USING (((profile_id = auth.uid()) OR public.is_admin()));


--
-- Name: accreditations accreditations_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY accreditations_update ON public.accreditations FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: achievement_definitions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.achievement_definitions ENABLE ROW LEVEL SECURITY;

--
-- Name: applications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

--
-- Name: applications applications_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY applications_delete ON public.applications FOR DELETE TO authenticated USING (public.is_admin());


--
-- Name: applications applications_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY applications_insert ON public.applications FOR INSERT TO authenticated WITH CHECK ((profile_id = auth.uid()));


--
-- Name: applications applications_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY applications_select ON public.applications FOR SELECT TO authenticated USING (((profile_id = auth.uid()) OR public.is_admin()));


--
-- Name: applications applications_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY applications_update ON public.applications FOR UPDATE TO authenticated USING (((profile_id = auth.uid()) OR public.is_admin())) WITH CHECK (((profile_id = auth.uid()) OR public.is_admin()));


--
-- Name: attendance_records; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

--
-- Name: attendance_records attendance_records_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY attendance_records_delete ON public.attendance_records FOR DELETE TO authenticated USING ((public.is_admin() OR public.is_committee_leader_for_shift(shift_id)));


--
-- Name: attendance_records attendance_records_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY attendance_records_insert ON public.attendance_records FOR INSERT TO authenticated WITH CHECK ((public.is_admin() OR (public.is_committee_leader_for_shift(shift_id) AND (EXISTS ( SELECT 1
   FROM (public.committee_shifts cs
     JOIN public.committee_members cm ON ((cm.committee_id = cs.committee_id)))
  WHERE ((cs.shift_id = attendance_records.shift_id) AND (cm.profile_id = attendance_records.profile_id) AND (cm.status = 'assigned'::public.committee_member_status)))) AND (EXISTS ( SELECT 1
   FROM public.event_shifts s
  WHERE ((s.id = attendance_records.shift_id) AND (s.event_id = attendance_records.event_id) AND (s.role_id = attendance_records.role_id)))))));


--
-- Name: attendance_records attendance_records_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY attendance_records_select ON public.attendance_records FOR SELECT USING ((public.is_admin() OR (profile_id = auth.uid()) OR (public.is_committee_leader_for_shift(shift_id) AND (EXISTS ( SELECT 1
   FROM (public.committee_shifts cs
     JOIN public.committee_members cm ON ((cm.committee_id = cs.committee_id)))
  WHERE ((cs.shift_id = attendance_records.shift_id) AND (cm.profile_id = attendance_records.profile_id) AND (cm.status = 'assigned'::public.committee_member_status)))))));


--
-- Name: attendance_records attendance_records_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY attendance_records_update ON public.attendance_records FOR UPDATE TO authenticated USING ((public.is_admin() OR (public.is_committee_leader_for_shift(shift_id) AND (EXISTS ( SELECT 1
   FROM (public.committee_shifts cs
     JOIN public.committee_members cm ON ((cm.committee_id = cs.committee_id)))
  WHERE ((cs.shift_id = attendance_records.shift_id) AND (cm.profile_id = attendance_records.profile_id) AND (cm.status = 'assigned'::public.committee_member_status))))))) WITH CHECK ((public.is_admin() OR (public.is_committee_leader_for_shift(shift_id) AND (EXISTS ( SELECT 1
   FROM (public.committee_shifts cs
     JOIN public.committee_members cm ON ((cm.committee_id = cs.committee_id)))
  WHERE ((cs.shift_id = attendance_records.shift_id) AND (cm.profile_id = attendance_records.profile_id) AND (cm.status = 'assigned'::public.committee_member_status)))))));


--
-- Name: certificates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

--
-- Name: certificates certificates_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY certificates_delete ON public.certificates FOR DELETE USING (public.is_admin());


--
-- Name: certificates certificates_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY certificates_insert ON public.certificates FOR INSERT WITH CHECK (public.is_admin());


--
-- Name: certificates certificates_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY certificates_select ON public.certificates FOR SELECT USING (((profile_id = auth.uid()) OR public.is_admin()));


--
-- Name: certificates certificates_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY certificates_update ON public.certificates FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: committee_feedback; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.committee_feedback ENABLE ROW LEVEL SECURITY;

--
-- Name: committee_feedback committee_feedback_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY committee_feedback_delete ON public.committee_feedback FOR DELETE USING (public.is_admin());


--
-- Name: committee_feedback committee_feedback_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY committee_feedback_insert ON public.committee_feedback FOR INSERT WITH CHECK ((public.is_admin() OR (public.is_committee_leader(committee_id) AND (member_profile_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.committee_members cm
  WHERE ((cm.committee_id = cm.committee_id) AND (cm.profile_id = committee_feedback.member_profile_id) AND (cm.status = 'assigned'::public.committee_member_status)))))));


--
-- Name: committee_feedback committee_feedback_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY committee_feedback_select ON public.committee_feedback FOR SELECT USING ((public.is_admin() OR public.is_committee_leader(committee_id) OR (member_profile_id = auth.uid())));


--
-- Name: committee_feedback committee_feedback_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY committee_feedback_update ON public.committee_feedback FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: committee_feedback committee_leaders_can_insert_feedback; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY committee_leaders_can_insert_feedback ON public.committee_feedback FOR INSERT TO authenticated WITH CHECK (((leader_profile_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM (public.committees c
     JOIN public.committee_members cm ON ((cm.committee_id = c.id)))
  WHERE ((c.id = committee_feedback.committee_id) AND (c.event_id = committee_feedback.event_id) AND (c.leader_profile_id = auth.uid()) AND (c.status = 'active'::public.committee_status) AND (cm.profile_id = committee_feedback.member_profile_id) AND (cm.status = 'assigned'::public.committee_member_status))))));


--
-- Name: committee_feedback committee_leaders_can_update_feedback; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY committee_leaders_can_update_feedback ON public.committee_feedback FOR UPDATE TO authenticated USING (((leader_profile_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.committees c
  WHERE ((c.id = committee_feedback.committee_id) AND (c.leader_profile_id = auth.uid()) AND (c.status = 'active'::public.committee_status)))))) WITH CHECK (((leader_profile_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.committees c
  WHERE ((c.id = committee_feedback.committee_id) AND (c.leader_profile_id = auth.uid()) AND (c.status = 'active'::public.committee_status))))));


--
-- Name: accreditations committee_leaders_can_view_committee_accreditations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY committee_leaders_can_view_committee_accreditations ON public.accreditations FOR SELECT TO authenticated USING (((profile_id = auth.uid()) OR public.is_admin() OR (EXISTS ( SELECT 1
   FROM (public.committee_members cm
     JOIN public.committees c ON ((c.id = cm.committee_id)))
  WHERE ((cm.profile_id = accreditations.profile_id) AND (c.leader_profile_id = auth.uid()) AND (cm.status = 'assigned'::public.committee_member_status) AND (c.status = 'active'::public.committee_status))))));


--
-- Name: profiles committee_leaders_can_view_committee_volunteers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY committee_leaders_can_view_committee_volunteers ON public.profiles FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.committee_members cm
     JOIN public.committees c ON ((c.id = cm.committee_id)))
  WHERE ((cm.profile_id = profiles.id) AND (c.leader_profile_id = auth.uid()) AND (cm.status = ANY (ARRAY['assigned'::public.committee_member_status, 'completed'::public.committee_member_status])) AND (c.status = 'active'::public.committee_status)))));


--
-- Name: committee_feedback committee_leaders_can_view_feedback; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY committee_leaders_can_view_feedback ON public.committee_feedback FOR SELECT TO authenticated USING (((leader_profile_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.committees c
  WHERE ((c.id = committee_feedback.committee_id) AND (c.leader_profile_id = auth.uid()))))));


--
-- Name: committee_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.committee_members ENABLE ROW LEVEL SECURITY;

--
-- Name: committee_members committee_members_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY committee_members_delete ON public.committee_members FOR DELETE USING (public.is_admin());


--
-- Name: committee_members committee_members_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY committee_members_insert ON public.committee_members FOR INSERT WITH CHECK (public.is_admin());


--
-- Name: committee_members committee_members_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY committee_members_select ON public.committee_members FOR SELECT USING ((public.is_admin() OR (profile_id = auth.uid()) OR public.is_committee_leader(committee_id)));


--
-- Name: committee_members committee_members_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY committee_members_update ON public.committee_members FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: committee_shifts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.committee_shifts ENABLE ROW LEVEL SECURITY;

--
-- Name: committee_shifts committee_shifts_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY committee_shifts_delete ON public.committee_shifts FOR DELETE TO authenticated USING (public.is_admin());


--
-- Name: committee_shifts committee_shifts_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY committee_shifts_insert ON public.committee_shifts FOR INSERT TO authenticated WITH CHECK (public.is_admin());


--
-- Name: committee_shifts committee_shifts_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY committee_shifts_select ON public.committee_shifts FOR SELECT TO authenticated USING ((public.is_admin() OR public.is_committee_leader(committee_id) OR public.is_committee_member(committee_id)));


--
-- Name: committee_shifts committee_shifts_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY committee_shifts_update ON public.committee_shifts FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: committees; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;

--
-- Name: committees committees_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY committees_delete ON public.committees FOR DELETE USING (public.is_admin());


--
-- Name: committees committees_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY committees_insert ON public.committees FOR INSERT WITH CHECK (public.is_admin());


--
-- Name: committees committees_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY committees_select ON public.committees FOR SELECT USING ((public.is_admin() OR (leader_profile_id = auth.uid()) OR public.is_committee_member(id)));


--
-- Name: committees committees_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY committees_update ON public.committees FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: event_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.event_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: event_roles event_roles_manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY event_roles_manage ON public.event_roles USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: event_roles event_roles_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY event_roles_select ON public.event_roles FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.events
  WHERE ((events.id = event_roles.event_id) AND ((events.status = 'published'::public.event_status) OR public.is_admin())))));


--
-- Name: event_shifts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.event_shifts ENABLE ROW LEVEL SECURITY;

--
-- Name: event_shifts event_shifts_manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY event_shifts_manage ON public.event_shifts USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: event_shifts event_shifts_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY event_shifts_select ON public.event_shifts FOR SELECT USING ((public.is_admin() OR (EXISTS ( SELECT 1
   FROM public.events e
  WHERE ((e.id = event_shifts.event_id) AND (e.status = 'published'::public.event_status)))) OR public.is_committee_leader_for_shift(id) OR public.is_committee_member_for_shift(id)));


--
-- Name: events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

--
-- Name: events events_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY events_delete ON public.events FOR DELETE USING (public.is_admin());


--
-- Name: events events_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY events_insert ON public.events FOR INSERT WITH CHECK (public.is_admin());


--
-- Name: events events_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY events_select ON public.events FOR SELECT USING (((status = 'published'::public.event_status) OR public.is_admin()));


--
-- Name: events events_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY events_update ON public.events FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: languages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;

--
-- Name: languages languages_manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY languages_manage ON public.languages USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: languages languages_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY languages_select ON public.languages FOR SELECT USING (true);


--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications notifications_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY notifications_delete ON public.notifications FOR DELETE USING (public.is_admin());


--
-- Name: notifications notifications_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY notifications_insert ON public.notifications FOR INSERT WITH CHECK (((profile_id = auth.uid()) OR public.is_admin()));


--
-- Name: notifications notifications_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY notifications_select ON public.notifications FOR SELECT USING (((profile_id = auth.uid()) OR public.is_admin()));


--
-- Name: notifications notifications_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY notifications_update ON public.notifications FOR UPDATE USING (((profile_id = auth.uid()) OR public.is_admin())) WITH CHECK (((profile_id = auth.uid()) OR public.is_admin()));


--
-- Name: profile_achievements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profile_achievements ENABLE ROW LEVEL SECURITY;

--
-- Name: profile_languages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profile_languages ENABLE ROW LEVEL SECURITY;

--
-- Name: profile_languages profile_languages_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profile_languages_delete ON public.profile_languages FOR DELETE USING (((profile_id = auth.uid()) OR public.is_admin()));


--
-- Name: profile_languages profile_languages_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profile_languages_insert ON public.profile_languages FOR INSERT WITH CHECK (((profile_id = auth.uid()) OR public.is_admin()));


--
-- Name: profile_languages profile_languages_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profile_languages_select ON public.profile_languages FOR SELECT USING (((profile_id = auth.uid()) OR public.is_admin()));


--
-- Name: profile_languages profile_languages_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profile_languages_update ON public.profile_languages FOR UPDATE USING (((profile_id = auth.uid()) OR public.is_admin())) WITH CHECK (((profile_id = auth.uid()) OR public.is_admin()));


--
-- Name: profile_skills; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profile_skills ENABLE ROW LEVEL SECURITY;

--
-- Name: profile_skills profile_skills_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profile_skills_delete ON public.profile_skills FOR DELETE USING (((profile_id = auth.uid()) OR public.is_admin()));


--
-- Name: profile_skills profile_skills_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profile_skills_insert ON public.profile_skills FOR INSERT WITH CHECK (((profile_id = auth.uid()) OR public.is_admin()));


--
-- Name: profile_skills profile_skills_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profile_skills_select ON public.profile_skills FOR SELECT USING (((profile_id = auth.uid()) OR public.is_admin()));


--
-- Name: profile_skills profile_skills_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profile_skills_update ON public.profile_skills FOR UPDATE USING (((profile_id = auth.uid()) OR public.is_admin())) WITH CHECK (((profile_id = auth.uid()) OR public.is_admin()));


--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles profiles_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_delete ON public.profiles FOR DELETE USING (public.is_admin());


--
-- Name: profiles profiles_delete_own_or_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_delete_own_or_admin ON public.profiles FOR DELETE TO authenticated USING (((id = auth.uid()) OR (role = 'admin'::public.user_role)));


--
-- Name: profiles profiles_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_insert ON public.profiles FOR INSERT WITH CHECK (((auth.uid() = id) AND (role = 'volunteer'::public.user_role)));


--
-- Name: profiles profiles_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_select ON public.profiles FOR SELECT USING (((auth.uid() = id) OR public.is_admin()));


--
-- Name: profiles profiles_select_own_or_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_select_own_or_admin ON public.profiles FOR SELECT TO authenticated USING (((id = auth.uid()) OR (role = 'admin'::public.user_role)));


--
-- Name: profiles profiles_self_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_self_insert ON public.profiles FOR INSERT WITH CHECK (((auth.uid() = id) AND (role = 'volunteer'::public.user_role)));


--
-- Name: profiles profiles_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_update ON public.profiles FOR UPDATE USING (((auth.uid() = id) OR public.is_admin())) WITH CHECK ((((auth.uid() = id) AND (role = 'volunteer'::public.user_role)) OR public.is_admin()));


--
-- Name: profiles profiles_update_own_or_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_update_own_or_admin ON public.profiles FOR UPDATE TO authenticated USING (((id = auth.uid()) OR (role = 'admin'::public.user_role))) WITH CHECK (((id = auth.uid()) OR (role = 'admin'::public.user_role)));


--
-- Name: reports; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

--
-- Name: reports reports_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY reports_delete ON public.reports FOR DELETE USING (public.is_admin());


--
-- Name: reports reports_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY reports_insert ON public.reports FOR INSERT WITH CHECK ((reporter_id = auth.uid()));


--
-- Name: reports reports_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY reports_select ON public.reports FOR SELECT USING (((reporter_id = auth.uid()) OR public.is_admin()));


--
-- Name: reports reports_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY reports_update ON public.reports FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: shift_assignments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.shift_assignments ENABLE ROW LEVEL SECURITY;

--
-- Name: shift_assignments shift_assignments_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY shift_assignments_delete ON public.shift_assignments FOR DELETE TO authenticated USING ((public.is_admin() OR public.is_committee_leader_for_shift(shift_id)));


--
-- Name: shift_assignments shift_assignments_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY shift_assignments_insert ON public.shift_assignments FOR INSERT TO authenticated WITH CHECK ((public.is_admin() OR (public.is_committee_leader_for_shift(shift_id) AND (EXISTS ( SELECT 1
   FROM (public.committee_shifts cs
     JOIN public.committee_members cm ON ((cm.committee_id = cs.committee_id)))
  WHERE ((cs.shift_id = shift_assignments.shift_id) AND (cm.profile_id = shift_assignments.profile_id) AND (cm.status = 'assigned'::public.committee_member_status)))))));


--
-- Name: shift_assignments shift_assignments_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY shift_assignments_select ON public.shift_assignments FOR SELECT USING ((public.is_admin() OR (profile_id = auth.uid()) OR public.is_committee_leader_for_shift(shift_id)));


--
-- Name: shift_assignments shift_assignments_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY shift_assignments_update ON public.shift_assignments FOR UPDATE TO authenticated USING ((public.is_admin() OR public.is_committee_leader_for_shift(shift_id))) WITH CHECK ((public.is_admin() OR (public.is_committee_leader_for_shift(shift_id) AND (EXISTS ( SELECT 1
   FROM (public.committee_shifts cs
     JOIN public.committee_members cm ON ((cm.committee_id = cs.committee_id)))
  WHERE ((cs.shift_id = shift_assignments.shift_id) AND (cm.profile_id = shift_assignments.profile_id) AND (cm.status = 'assigned'::public.committee_member_status)))))));


--
-- Name: skills; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

--
-- Name: skills skills_manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY skills_manage ON public.skills USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: skills skills_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY skills_select ON public.skills FOR SELECT USING (true);


--
-- Name: sports; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;

--
-- Name: sports sports_manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY sports_manage ON public.sports USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: sports sports_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY sports_select ON public.sports FOR SELECT USING (true);


--
-- Name: training_modules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;

--
-- Name: training_modules training_modules_manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY training_modules_manage ON public.training_modules USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: training_modules training_modules_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY training_modules_select ON public.training_modules FOR SELECT USING (true);


--
-- Name: training_progress; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.training_progress ENABLE ROW LEVEL SECURITY;

--
-- Name: training_progress training_progress_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY training_progress_delete ON public.training_progress FOR DELETE USING (public.is_admin());


--
-- Name: training_progress training_progress_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY training_progress_insert ON public.training_progress FOR INSERT WITH CHECK ((profile_id = auth.uid()));


--
-- Name: training_progress training_progress_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY training_progress_select ON public.training_progress FOR SELECT USING (((profile_id = auth.uid()) OR public.is_admin()));


--
-- Name: training_progress training_progress_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY training_progress_update ON public.training_progress FOR UPDATE USING (((profile_id = auth.uid()) OR public.is_admin())) WITH CHECK (((profile_id = auth.uid()) OR public.is_admin()));


--
-- Name: training_questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.training_questions ENABLE ROW LEVEL SECURITY;

--
-- Name: volunteer_hours; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.volunteer_hours ENABLE ROW LEVEL SECURITY;

--
-- Name: volunteer_hours volunteer_hours_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_hours_delete ON public.volunteer_hours FOR DELETE USING (public.is_admin());


--
-- Name: volunteer_hours volunteer_hours_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_hours_insert ON public.volunteer_hours FOR INSERT WITH CHECK (public.is_admin());


--
-- Name: volunteer_hours volunteer_hours_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_hours_select ON public.volunteer_hours FOR SELECT USING (((profile_id = auth.uid()) OR public.is_admin()));


--
-- Name: volunteer_hours volunteer_hours_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_hours_update ON public.volunteer_hours FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- PostgreSQL database dump complete
--

