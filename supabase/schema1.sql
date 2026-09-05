


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."application_status" AS ENUM (
    'pending',
    'accepted',
    'rejected',
    'withdrawn',
    'waitlisted'
);


ALTER TYPE "public"."application_status" OWNER TO "postgres";


CREATE TYPE "public"."attendance_status" AS ENUM (
    'scheduled',
    'checked-in',
    'checked-out',
    'absent',
    'late'
);


ALTER TYPE "public"."attendance_status" OWNER TO "postgres";


CREATE TYPE "public"."committee_member_status" AS ENUM (
    'assigned',
    'removed',
    'completed'
);


ALTER TYPE "public"."committee_member_status" OWNER TO "postgres";


CREATE TYPE "public"."committee_status" AS ENUM (
    'active',
    'inactive',
    'archived'
);


ALTER TYPE "public"."committee_status" OWNER TO "postgres";


CREATE TYPE "public"."event_status" AS ENUM (
    'draft',
    'published',
    'closed',
    'completed',
    'cancelled'
);


ALTER TYPE "public"."event_status" OWNER TO "postgres";


CREATE TYPE "public"."notification_category" AS ENUM (
    'application',
    'training',
    'accreditation',
    'certificate',
    'event',
    'other'
);


ALTER TYPE "public"."notification_category" OWNER TO "postgres";


CREATE TYPE "public"."report_status" AS ENUM (
    'open',
    'reviewing',
    'resolved',
    'dismissed'
);


ALTER TYPE "public"."report_status" OWNER TO "postgres";


CREATE TYPE "public"."shift_assignment_status" AS ENUM (
    'assigned',
    'removed',
    'completed'
);


ALTER TYPE "public"."shift_assignment_status" OWNER TO "postgres";


CREATE TYPE "public"."training_resource_type" AS ENUM (
    'video',
    'pdf',
    'text',
    'link'
);


ALTER TYPE "public"."training_resource_type" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'volunteer',
    'admin',
    'leader'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_committee_feedback_consistency"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."check_committee_feedback_consistency"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_committee_leader"("p_committee" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.committees c
    where c.id = p_committee
      and c.leader_profile_id = auth.uid()
  );
$$;


ALTER FUNCTION "public"."is_committee_leader"("p_committee" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_committee_member"("p_committee" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.committee_members cm
    where cm.committee_id = p_committee
      and cm.profile_id = auth.uid()
      and cm.status = 'assigned'
  );
$$;


ALTER FUNCTION "public"."is_committee_member"("p_committee" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."protect_application_fields"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$BEGIN

  /*
   * profile_id can NEVER be changed.
   * Not by volunteers.
   * Not by admins.
   */

  IF NEW.profile_id IS DISTINCT FROM OLD.profile_id THEN
    RAISE EXCEPTION 'You cannot change the application owner.';
  END IF;


  /*
   * Volunteers cannot change application status.
   *
   * Admins are allowed to change status.
   */

  IF NOT public.is_admin() THEN

    IF NEW.status IS DISTINCT FROM OLD.status THEN
      RAISE EXCEPTION 'You cannot change the application status.';
    END IF;

  END IF;


  RETURN NEW;

END;$$;


ALTER FUNCTION "public"."protect_application_fields"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."protect_profile_fields"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."protect_profile_fields"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
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


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."trigger_set_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."accreditations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "event_id" "uuid" NOT NULL,
    "role_id" "uuid" NOT NULL,
    "volunteer_identifier" "text" NOT NULL,
    "zone" "text",
    "qr_code_data" "text",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."accreditations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."achievement_definitions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "icon" "text",
    "category" "text" DEFAULT 'general'::"text" NOT NULL,
    "requirement_type" "text" NOT NULL,
    "requirement_value" integer DEFAULT 1 NOT NULL,
    "points" integer DEFAULT 0 NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."achievement_definitions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."applications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "event_id" "uuid" NOT NULL,
    "role_id" "uuid" NOT NULL,
    "status" "public"."application_status" DEFAULT 'pending'::"public"."application_status" NOT NULL,
    "experience" "text",
    "availability" "text",
    "motivation" "text",
    "admin_notes" "text",
    "applied_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."applications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."attendance_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "event_id" "uuid" NOT NULL,
    "shift_id" "uuid" NOT NULL,
    "role_id" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "status" "public"."attendance_status" DEFAULT 'scheduled'::"public"."attendance_status" NOT NULL,
    "check_in_time" time without time zone,
    "check_out_time" time without time zone,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."attendance_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."certificates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "event_id" "uuid" NOT NULL,
    "role_id" "uuid" NOT NULL,
    "hours" integer DEFAULT 0 NOT NULL,
    "date" "date" NOT NULL,
    "certificate_id" "text" NOT NULL,
    "file_path" "text",
    "issued_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."certificates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."committee_feedback" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "committee_id" "uuid" NOT NULL,
    "member_profile_id" "uuid" NOT NULL,
    "leader_profile_id" "uuid" NOT NULL,
    "event_id" "uuid" NOT NULL,
    "punctuality" integer DEFAULT 0 NOT NULL,
    "teamwork" integer DEFAULT 0 NOT NULL,
    "communication" integer DEFAULT 0 NOT NULL,
    "responsibility" integer DEFAULT 0 NOT NULL,
    "overall_rating" integer DEFAULT 0 NOT NULL,
    "comment" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "committee_feedback_communication_check" CHECK ((("communication" >= 1) AND ("communication" <= 5))),
    CONSTRAINT "committee_feedback_overall_rating_check" CHECK ((("overall_rating" >= 1) AND ("overall_rating" <= 5))),
    CONSTRAINT "committee_feedback_punctuality_check" CHECK ((("punctuality" >= 1) AND ("punctuality" <= 5))),
    CONSTRAINT "committee_feedback_responsibility_check" CHECK ((("responsibility" >= 1) AND ("responsibility" <= 5))),
    CONSTRAINT "committee_feedback_teamwork_check" CHECK ((("teamwork" >= 1) AND ("teamwork" <= 5)))
);


ALTER TABLE "public"."committee_feedback" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."committee_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "committee_id" "uuid" NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "event_role_id" "uuid",
    "status" "public"."committee_member_status" DEFAULT 'assigned'::"public"."committee_member_status" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."committee_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."committees" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "leader_profile_id" "uuid",
    "status" "public"."committee_status" DEFAULT 'active'::"public"."committee_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."committees" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."event_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "responsibilities" "text",
    "requirements" "text",
    "skills" "text"[] DEFAULT ARRAY[]::"text"[] NOT NULL,
    "positions" integer DEFAULT 1 NOT NULL,
    "filled_positions" integer DEFAULT 0 NOT NULL,
    "min_age" integer,
    "mandatory_training" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "event_roles_nonnegative_filled" CHECK (("filled_positions" >= 0)),
    CONSTRAINT "event_roles_positive_positions" CHECK (("positions" > 0))
);


ALTER TABLE "public"."event_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."event_shifts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "role_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "location" "text",
    "date" "date" NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "capacity" integer DEFAULT 1 NOT NULL,
    "instructions" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "event_shifts_positive_capacity" CHECK (("capacity" > 0))
);


ALTER TABLE "public"."event_shifts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "sport_id" "uuid" NOT NULL,
    "sport" "text" NOT NULL,
    "city" "text" NOT NULL,
    "country" "text" NOT NULL,
    "venue" "text" NOT NULL,
    "cover_url" "text",
    "description" "text",
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "start_time" time without time zone,
    "end_time" time without time zone,
    "application_deadline" "date",
    "status" "public"."event_status" DEFAULT 'draft'::"public"."event_status" NOT NULL,
    "total_volunteers_needed" integer DEFAULT 0 NOT NULL,
    "required_languages" "text"[] DEFAULT ARRAY[]::"text"[] NOT NULL,
    "requirements" "text",
    "event_type" "text",
    "featured" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "events_deadline_before_start" CHECK ((("application_deadline" IS NULL) OR ("application_deadline" <= "start_date"))),
    CONSTRAINT "events_positive_volunteers" CHECK (("total_volunteers_needed" >= 0)),
    CONSTRAINT "events_valid_dates" CHECK (("start_date" <= "end_date"))
);


ALTER TABLE "public"."events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."languages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."languages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "event_id" "uuid",
    "application_id" "uuid",
    "title" "text" NOT NULL,
    "body" "text" NOT NULL,
    "category" "public"."notification_category" DEFAULT 'other'::"public"."notification_category" NOT NULL,
    "read" boolean DEFAULT false NOT NULL,
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profile_achievements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "achievement_id" "uuid" NOT NULL,
    "progress" integer DEFAULT 0 NOT NULL,
    "unlocked" boolean DEFAULT false NOT NULL,
    "unlocked_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profile_achievements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profile_languages" (
    "profile_id" "uuid" NOT NULL,
    "language_id" "uuid" NOT NULL
);


ALTER TABLE "public"."profile_languages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profile_skills" (
    "profile_id" "uuid" NOT NULL,
    "skill_id" "uuid" NOT NULL
);


ALTER TABLE "public"."profile_skills" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text",
    "role" "public"."user_role" DEFAULT 'volunteer'::"public"."user_role" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "date_of_birth" "date",
    "avatar_url" "text",
    "phone" "text",
    "city" "text",
    "country" "text",
    "bio" "text",
    "interests" "text"[] DEFAULT ARRAY[]::"text"[] NOT NULL,
    "skills" "text"[] DEFAULT ARRAY[]::"text"[] NOT NULL,
    "languages" "text"[] DEFAULT ARRAY[]::"text"[] NOT NULL,
    "experience" "text",
    "volunteer_hours" integer DEFAULT 0 NOT NULL,
    "attendance_rate" numeric DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "nationality" "text",
    "cin_or_passport" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reporter_id" "uuid" NOT NULL,
    "target_type" "text" NOT NULL,
    "target_id" "uuid",
    "report_type" "text" NOT NULL,
    "reason" "text",
    "description" "text",
    "status" "public"."report_status" DEFAULT 'open'::"public"."report_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "resolved_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."shift_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "shift_id" "uuid" NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "status" "public"."shift_assignment_status" DEFAULT 'assigned'::"public"."shift_assignment_status" NOT NULL,
    "assigned_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."shift_assignments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."skills" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."skills" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."sports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."training_modules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "event_id" "uuid",
    "role_id" "uuid",
    "required" boolean DEFAULT false NOT NULL,
    "resources" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."training_modules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."training_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "training_id" "uuid" NOT NULL,
    "completed" boolean DEFAULT false NOT NULL,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."training_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."volunteer_hours" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "event_id" "uuid",
    "shift_id" "uuid",
    "attendance_id" "uuid",
    "hours" integer DEFAULT 0 NOT NULL,
    "approved_by" "uuid",
    "approval_notes" "text",
    "year" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "volunteer_hours_positive" CHECK (("hours" >= 0))
);


ALTER TABLE "public"."volunteer_hours" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."volunteer_profile_completion" WITH ("security_invoker"='true') AS
 SELECT "id" AS "profile_id",
    (((((((((
        CASE
            WHEN (NULLIF(TRIM(BOTH FROM "first_name"), ''::"text") IS NOT NULL) THEN 1
            ELSE 0
        END +
        CASE
            WHEN (NULLIF(TRIM(BOTH FROM "last_name"), ''::"text") IS NOT NULL) THEN 1
            ELSE 0
        END) +
        CASE
            WHEN ("date_of_birth" IS NOT NULL) THEN 1
            ELSE 0
        END) +
        CASE
            WHEN (NULLIF(TRIM(BOTH FROM "phone"), ''::"text") IS NOT NULL) THEN 1
            ELSE 0
        END) +
        CASE
            WHEN (NULLIF(TRIM(BOTH FROM "city"), ''::"text") IS NOT NULL) THEN 1
            ELSE 0
        END) +
        CASE
            WHEN (NULLIF(TRIM(BOTH FROM "bio"), ''::"text") IS NOT NULL) THEN 1
            ELSE 0
        END) +
        CASE
            WHEN (NULLIF(TRIM(BOTH FROM "avatar_url"), ''::"text") IS NOT NULL) THEN 1
            ELSE 0
        END) +
        CASE
            WHEN (COALESCE("array_length"("skills", 1), 0) > 0) THEN 1
            ELSE 0
        END) +
        CASE
            WHEN (COALESCE("array_length"("languages", 1), 0) > 0) THEN 1
            ELSE 0
        END) +
        CASE
            WHEN (NULLIF(TRIM(BOTH FROM "experience"), ''::"text") IS NOT NULL) THEN 1
            ELSE 0
        END) AS "completed_fields",
    10 AS "total_fields",
    ("round"(((((((((((((
        CASE
            WHEN (NULLIF(TRIM(BOTH FROM "first_name"), ''::"text") IS NOT NULL) THEN 1
            ELSE 0
        END +
        CASE
            WHEN (NULLIF(TRIM(BOTH FROM "last_name"), ''::"text") IS NOT NULL) THEN 1
            ELSE 0
        END) +
        CASE
            WHEN ("date_of_birth" IS NOT NULL) THEN 1
            ELSE 0
        END) +
        CASE
            WHEN (NULLIF(TRIM(BOTH FROM "phone"), ''::"text") IS NOT NULL) THEN 1
            ELSE 0
        END) +
        CASE
            WHEN (NULLIF(TRIM(BOTH FROM "city"), ''::"text") IS NOT NULL) THEN 1
            ELSE 0
        END) +
        CASE
            WHEN (NULLIF(TRIM(BOTH FROM "bio"), ''::"text") IS NOT NULL) THEN 1
            ELSE 0
        END) +
        CASE
            WHEN (NULLIF(TRIM(BOTH FROM "avatar_url"), ''::"text") IS NOT NULL) THEN 1
            ELSE 0
        END) +
        CASE
            WHEN (COALESCE("array_length"("skills", 1), 0) > 0) THEN 1
            ELSE 0
        END) +
        CASE
            WHEN (COALESCE("array_length"("languages", 1), 0) > 0) THEN 1
            ELSE 0
        END) +
        CASE
            WHEN (NULLIF(TRIM(BOTH FROM "experience"), ''::"text") IS NOT NULL) THEN 1
            ELSE 0
        END))::numeric / (10)::numeric) * (100)::numeric)))::integer AS "completion_percentage"
   FROM "public"."profiles" "p";


ALTER VIEW "public"."volunteer_profile_completion" OWNER TO "postgres";


ALTER TABLE ONLY "public"."accreditations"
    ADD CONSTRAINT "accreditations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."accreditations"
    ADD CONSTRAINT "accreditations_profile_id_event_id_role_id_key" UNIQUE ("profile_id", "event_id", "role_id");



ALTER TABLE ONLY "public"."achievement_definitions"
    ADD CONSTRAINT "achievement_definitions_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."achievement_definitions"
    ADD CONSTRAINT "achievement_definitions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_profile_id_event_id_role_id_key" UNIQUE ("profile_id", "event_id", "role_id");



ALTER TABLE ONLY "public"."attendance_records"
    ADD CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."attendance_records"
    ADD CONSTRAINT "attendance_records_profile_id_shift_id_key" UNIQUE ("profile_id", "shift_id");



ALTER TABLE ONLY "public"."certificates"
    ADD CONSTRAINT "certificates_certificate_id_key" UNIQUE ("certificate_id");



ALTER TABLE ONLY "public"."certificates"
    ADD CONSTRAINT "certificates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."committee_feedback"
    ADD CONSTRAINT "committee_feedback_committee_id_member_profile_id_key" UNIQUE ("committee_id", "member_profile_id");



ALTER TABLE ONLY "public"."committee_feedback"
    ADD CONSTRAINT "committee_feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."committee_members"
    ADD CONSTRAINT "committee_members_committee_id_profile_id_key" UNIQUE ("committee_id", "profile_id");



ALTER TABLE ONLY "public"."committee_members"
    ADD CONSTRAINT "committee_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."committees"
    ADD CONSTRAINT "committees_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."event_roles"
    ADD CONSTRAINT "event_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."event_shifts"
    ADD CONSTRAINT "event_shifts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."languages"
    ADD CONSTRAINT "languages_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."languages"
    ADD CONSTRAINT "languages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profile_achievements"
    ADD CONSTRAINT "profile_achievements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profile_achievements"
    ADD CONSTRAINT "profile_achievements_profile_id_achievement_id_key" UNIQUE ("profile_id", "achievement_id");



ALTER TABLE ONLY "public"."profile_languages"
    ADD CONSTRAINT "profile_languages_pkey" PRIMARY KEY ("profile_id", "language_id");



ALTER TABLE ONLY "public"."profile_skills"
    ADD CONSTRAINT "profile_skills_pkey" PRIMARY KEY ("profile_id", "skill_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shift_assignments"
    ADD CONSTRAINT "shift_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shift_assignments"
    ADD CONSTRAINT "shift_assignments_shift_id_profile_id_key" UNIQUE ("shift_id", "profile_id");



ALTER TABLE ONLY "public"."skills"
    ADD CONSTRAINT "skills_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."skills"
    ADD CONSTRAINT "skills_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sports"
    ADD CONSTRAINT "sports_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."sports"
    ADD CONSTRAINT "sports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."training_modules"
    ADD CONSTRAINT "training_modules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."training_progress"
    ADD CONSTRAINT "training_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."training_progress"
    ADD CONSTRAINT "training_progress_profile_id_training_id_key" UNIQUE ("profile_id", "training_id");



ALTER TABLE ONLY "public"."volunteer_hours"
    ADD CONSTRAINT "volunteer_hours_pkey" PRIMARY KEY ("id");



CREATE INDEX "accreditations_event_id_idx" ON "public"."accreditations" USING "btree" ("event_id");



CREATE INDEX "accreditations_profile_id_idx" ON "public"."accreditations" USING "btree" ("profile_id");



CREATE INDEX "applications_event_id_idx" ON "public"."applications" USING "btree" ("event_id");



CREATE UNIQUE INDEX "applications_one_per_event" ON "public"."applications" USING "btree" ("profile_id", "event_id");



CREATE INDEX "applications_profile_id_idx" ON "public"."applications" USING "btree" ("profile_id");



CREATE INDEX "applications_status_idx" ON "public"."applications" USING "btree" ("status");



CREATE INDEX "attendance_records_event_id_idx" ON "public"."attendance_records" USING "btree" ("event_id");



CREATE INDEX "attendance_records_profile_id_idx" ON "public"."attendance_records" USING "btree" ("profile_id");



CREATE INDEX "attendance_records_shift_id_idx" ON "public"."attendance_records" USING "btree" ("shift_id");



CREATE INDEX "certificates_event_id_idx" ON "public"."certificates" USING "btree" ("event_id");



CREATE INDEX "certificates_profile_id_idx" ON "public"."certificates" USING "btree" ("profile_id");



CREATE INDEX "committee_feedback_committee_id_idx" ON "public"."committee_feedback" USING "btree" ("committee_id");



CREATE INDEX "committee_feedback_leader_profile_id_idx" ON "public"."committee_feedback" USING "btree" ("leader_profile_id");



CREATE INDEX "committee_feedback_member_profile_id_idx" ON "public"."committee_feedback" USING "btree" ("member_profile_id");



CREATE INDEX "committee_members_committee_id_idx" ON "public"."committee_members" USING "btree" ("committee_id");



CREATE INDEX "committee_members_profile_id_idx" ON "public"."committee_members" USING "btree" ("profile_id");



CREATE INDEX "committee_members_status_idx" ON "public"."committee_members" USING "btree" ("status");



CREATE INDEX "committees_event_id_idx" ON "public"."committees" USING "btree" ("event_id");



CREATE INDEX "committees_leader_profile_id_idx" ON "public"."committees" USING "btree" ("leader_profile_id");



CREATE INDEX "committees_status_idx" ON "public"."committees" USING "btree" ("status");



CREATE INDEX "event_roles_event_id_idx" ON "public"."event_roles" USING "btree" ("event_id");



CREATE INDEX "event_shifts_event_id_idx" ON "public"."event_shifts" USING "btree" ("event_id");



CREATE INDEX "event_shifts_role_id_idx" ON "public"."event_shifts" USING "btree" ("role_id");



CREATE INDEX "events_city_idx" ON "public"."events" USING "btree" ("city");



CREATE INDEX "events_slug_idx" ON "public"."events" USING "btree" ("slug");



CREATE INDEX "events_sport_idx" ON "public"."events" USING "btree" ("sport_id");



CREATE INDEX "events_start_date_idx" ON "public"."events" USING "btree" ("start_date");



CREATE INDEX "events_status_idx" ON "public"."events" USING "btree" ("status");



CREATE INDEX "notifications_event_id_idx" ON "public"."notifications" USING "btree" ("event_id");



CREATE INDEX "notifications_profile_id_idx" ON "public"."notifications" USING "btree" ("profile_id");



CREATE INDEX "notifications_read_at_idx" ON "public"."notifications" USING "btree" ("read_at");



CREATE UNIQUE INDEX "profiles_email_idx" ON "public"."profiles" USING "btree" ("email");



CREATE INDEX "profiles_role_idx" ON "public"."profiles" USING "btree" ("role");



CREATE INDEX "profiles_status_idx" ON "public"."profiles" USING "btree" ("status");



CREATE INDEX "reports_reporter_id_idx" ON "public"."reports" USING "btree" ("reporter_id");



CREATE INDEX "reports_status_idx" ON "public"."reports" USING "btree" ("status");



CREATE INDEX "shift_assignments_profile_id_idx" ON "public"."shift_assignments" USING "btree" ("profile_id");



CREATE INDEX "shift_assignments_shift_id_idx" ON "public"."shift_assignments" USING "btree" ("shift_id");



CREATE INDEX "training_progress_profile_id_idx" ON "public"."training_progress" USING "btree" ("profile_id");



CREATE INDEX "training_progress_training_id_idx" ON "public"."training_progress" USING "btree" ("training_id");



CREATE INDEX "volunteer_hours_event_id_idx" ON "public"."volunteer_hours" USING "btree" ("event_id");



CREATE INDEX "volunteer_hours_profile_id_idx" ON "public"."volunteer_hours" USING "btree" ("profile_id");



CREATE INDEX "volunteer_hours_year_idx" ON "public"."volunteer_hours" USING "btree" ("year");



CREATE OR REPLACE TRIGGER "accreditations_set_updated_at" BEFORE UPDATE ON "public"."accreditations" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_updated_at"();



CREATE OR REPLACE TRIGGER "applications_set_updated_at" BEFORE UPDATE ON "public"."applications" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_updated_at"();



CREATE OR REPLACE TRIGGER "attendance_records_set_updated_at" BEFORE UPDATE ON "public"."attendance_records" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_updated_at"();



CREATE OR REPLACE TRIGGER "certificates_set_updated_at" BEFORE UPDATE ON "public"."certificates" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_updated_at"();



CREATE OR REPLACE TRIGGER "committee_feedback_set_updated_at" BEFORE UPDATE ON "public"."committee_feedback" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_updated_at"();



CREATE OR REPLACE TRIGGER "committee_members_set_updated_at" BEFORE UPDATE ON "public"."committee_members" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_updated_at"();



CREATE OR REPLACE TRIGGER "committees_set_updated_at" BEFORE UPDATE ON "public"."committees" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_updated_at"();



CREATE OR REPLACE TRIGGER "event_roles_set_updated_at" BEFORE UPDATE ON "public"."event_roles" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_updated_at"();



CREATE OR REPLACE TRIGGER "event_shifts_set_updated_at" BEFORE UPDATE ON "public"."event_shifts" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_updated_at"();



CREATE OR REPLACE TRIGGER "events_set_updated_at" BEFORE UPDATE ON "public"."events" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_updated_at"();



CREATE OR REPLACE TRIGGER "notifications_set_updated_at" BEFORE UPDATE ON "public"."notifications" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_updated_at"();



CREATE OR REPLACE TRIGGER "profiles_set_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_updated_at"();



CREATE OR REPLACE TRIGGER "protect_application_fields_trigger" BEFORE UPDATE ON "public"."applications" FOR EACH ROW EXECUTE FUNCTION "public"."protect_application_fields"();



CREATE OR REPLACE TRIGGER "protect_profile_fields_trigger" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."protect_profile_fields"();



CREATE OR REPLACE TRIGGER "reports_set_updated_at" BEFORE UPDATE ON "public"."reports" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_updated_at"();



CREATE OR REPLACE TRIGGER "shift_assignments_set_updated_at" BEFORE UPDATE ON "public"."shift_assignments" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_updated_at"();



CREATE OR REPLACE TRIGGER "training_modules_set_updated_at" BEFORE UPDATE ON "public"."training_modules" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_updated_at"();



CREATE OR REPLACE TRIGGER "training_progress_set_updated_at" BEFORE UPDATE ON "public"."training_progress" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_updated_at"();



CREATE OR REPLACE TRIGGER "volunteer_hours_set_updated_at" BEFORE UPDATE ON "public"."volunteer_hours" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_updated_at"();



ALTER TABLE ONLY "public"."accreditations"
    ADD CONSTRAINT "accreditations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."accreditations"
    ADD CONSTRAINT "accreditations_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."accreditations"
    ADD CONSTRAINT "accreditations_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."event_roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."event_roles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."attendance_records"
    ADD CONSTRAINT "attendance_records_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."attendance_records"
    ADD CONSTRAINT "attendance_records_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."attendance_records"
    ADD CONSTRAINT "attendance_records_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."event_roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."attendance_records"
    ADD CONSTRAINT "attendance_records_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "public"."event_shifts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."certificates"
    ADD CONSTRAINT "certificates_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."certificates"
    ADD CONSTRAINT "certificates_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."certificates"
    ADD CONSTRAINT "certificates_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."event_roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."committee_feedback"
    ADD CONSTRAINT "committee_feedback_committee_id_fkey" FOREIGN KEY ("committee_id") REFERENCES "public"."committees"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."committee_feedback"
    ADD CONSTRAINT "committee_feedback_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."committee_feedback"
    ADD CONSTRAINT "committee_feedback_leader_profile_id_fkey" FOREIGN KEY ("leader_profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."committee_feedback"
    ADD CONSTRAINT "committee_feedback_member_profile_id_fkey" FOREIGN KEY ("member_profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."committee_members"
    ADD CONSTRAINT "committee_members_committee_id_fkey" FOREIGN KEY ("committee_id") REFERENCES "public"."committees"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."committee_members"
    ADD CONSTRAINT "committee_members_event_role_id_fkey" FOREIGN KEY ("event_role_id") REFERENCES "public"."event_roles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."committee_members"
    ADD CONSTRAINT "committee_members_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."committees"
    ADD CONSTRAINT "committees_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."committees"
    ADD CONSTRAINT "committees_leader_profile_id_fkey" FOREIGN KEY ("leader_profile_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."event_roles"
    ADD CONSTRAINT "event_roles_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."event_shifts"
    ADD CONSTRAINT "event_shifts_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."event_shifts"
    ADD CONSTRAINT "event_shifts_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."event_roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_sport_id_fkey" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile_achievements"
    ADD CONSTRAINT "profile_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievement_definitions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile_achievements"
    ADD CONSTRAINT "profile_achievements_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile_languages"
    ADD CONSTRAINT "profile_languages_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile_languages"
    ADD CONSTRAINT "profile_languages_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile_skills"
    ADD CONSTRAINT "profile_skills_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile_skills"
    ADD CONSTRAINT "profile_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shift_assignments"
    ADD CONSTRAINT "shift_assignments_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shift_assignments"
    ADD CONSTRAINT "shift_assignments_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "public"."event_shifts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."training_modules"
    ADD CONSTRAINT "training_modules_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."training_modules"
    ADD CONSTRAINT "training_modules_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."event_roles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."training_progress"
    ADD CONSTRAINT "training_progress_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."training_progress"
    ADD CONSTRAINT "training_progress_training_id_fkey" FOREIGN KEY ("training_id") REFERENCES "public"."training_modules"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."volunteer_hours"
    ADD CONSTRAINT "volunteer_hours_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."volunteer_hours"
    ADD CONSTRAINT "volunteer_hours_attendance_id_fkey" FOREIGN KEY ("attendance_id") REFERENCES "public"."attendance_records"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."volunteer_hours"
    ADD CONSTRAINT "volunteer_hours_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."volunteer_hours"
    ADD CONSTRAINT "volunteer_hours_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."volunteer_hours"
    ADD CONSTRAINT "volunteer_hours_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "public"."event_shifts"("id") ON DELETE SET NULL;



CREATE POLICY "Authenticated users can view active achievements" ON "public"."achievement_definitions" FOR SELECT TO "authenticated" USING (("active" = true));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can view own achievements" ON "public"."profile_achievements" FOR SELECT TO "authenticated" USING (("profile_id" = "auth"."uid"()));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."accreditations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "accreditations_delete" ON "public"."accreditations" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "accreditations_insert" ON "public"."accreditations" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "accreditations_select" ON "public"."accreditations" FOR SELECT USING ((("profile_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "accreditations_update" ON "public"."accreditations" FOR UPDATE USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



ALTER TABLE "public"."achievement_definitions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."applications" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "applications_delete" ON "public"."applications" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "applications_insert" ON "public"."applications" FOR INSERT TO "authenticated" WITH CHECK (("profile_id" = "auth"."uid"()));



CREATE POLICY "applications_select" ON "public"."applications" FOR SELECT TO "authenticated" USING ((("profile_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "applications_update" ON "public"."applications" FOR UPDATE TO "authenticated" USING ((("profile_id" = "auth"."uid"()) OR "public"."is_admin"())) WITH CHECK ((("profile_id" = "auth"."uid"()) OR "public"."is_admin"()));



ALTER TABLE "public"."attendance_records" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "attendance_records_delete" ON "public"."attendance_records" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "attendance_records_insert" ON "public"."attendance_records" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "attendance_records_select" ON "public"."attendance_records" FOR SELECT USING ((("profile_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "attendance_records_update" ON "public"."attendance_records" FOR UPDATE USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



ALTER TABLE "public"."certificates" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "certificates_delete" ON "public"."certificates" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "certificates_insert" ON "public"."certificates" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "certificates_select" ON "public"."certificates" FOR SELECT USING ((("profile_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "certificates_update" ON "public"."certificates" FOR UPDATE USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



ALTER TABLE "public"."committee_feedback" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "committee_feedback_delete" ON "public"."committee_feedback" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "committee_feedback_insert" ON "public"."committee_feedback" FOR INSERT WITH CHECK (("public"."is_admin"() OR ("public"."is_committee_leader"("committee_id") AND ("member_profile_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."committee_members" "cm"
  WHERE (("cm"."committee_id" = "cm"."committee_id") AND ("cm"."profile_id" = "committee_feedback"."member_profile_id") AND ("cm"."status" = 'assigned'::"public"."committee_member_status")))))));



CREATE POLICY "committee_feedback_select" ON "public"."committee_feedback" FOR SELECT USING (("public"."is_admin"() OR "public"."is_committee_leader"("committee_id") OR ("member_profile_id" = "auth"."uid"())));



CREATE POLICY "committee_feedback_update" ON "public"."committee_feedback" FOR UPDATE USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



ALTER TABLE "public"."committee_members" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "committee_members_delete" ON "public"."committee_members" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "committee_members_insert" ON "public"."committee_members" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "committee_members_select" ON "public"."committee_members" FOR SELECT USING (("public"."is_admin"() OR ("profile_id" = "auth"."uid"()) OR "public"."is_committee_leader"("committee_id")));



CREATE POLICY "committee_members_update" ON "public"."committee_members" FOR UPDATE USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



ALTER TABLE "public"."committees" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "committees_delete" ON "public"."committees" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "committees_insert" ON "public"."committees" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "committees_select" ON "public"."committees" FOR SELECT USING (("public"."is_admin"() OR ("leader_profile_id" = "auth"."uid"()) OR "public"."is_committee_member"("id")));



CREATE POLICY "committees_update" ON "public"."committees" FOR UPDATE USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



ALTER TABLE "public"."event_roles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "event_roles_manage" ON "public"."event_roles" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "event_roles_select" ON "public"."event_roles" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."events"
  WHERE (("events"."id" = "event_roles"."event_id") AND (("events"."status" = 'published'::"public"."event_status") OR "public"."is_admin"())))));



ALTER TABLE "public"."event_shifts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "event_shifts_manage" ON "public"."event_shifts" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "event_shifts_select" ON "public"."event_shifts" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."events"
  WHERE (("events"."id" = "event_shifts"."event_id") AND (("events"."status" = 'published'::"public"."event_status") OR "public"."is_admin"())))));



ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "events_delete" ON "public"."events" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "events_insert" ON "public"."events" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "events_select" ON "public"."events" FOR SELECT USING ((("status" = 'published'::"public"."event_status") OR "public"."is_admin"()));



CREATE POLICY "events_update" ON "public"."events" FOR UPDATE USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



ALTER TABLE "public"."languages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "languages_manage" ON "public"."languages" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "languages_select" ON "public"."languages" FOR SELECT USING (true);



ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "notifications_delete" ON "public"."notifications" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "notifications_insert" ON "public"."notifications" FOR INSERT WITH CHECK ((("profile_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "notifications_select" ON "public"."notifications" FOR SELECT USING ((("profile_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "notifications_update" ON "public"."notifications" FOR UPDATE USING ((("profile_id" = "auth"."uid"()) OR "public"."is_admin"())) WITH CHECK ((("profile_id" = "auth"."uid"()) OR "public"."is_admin"()));



ALTER TABLE "public"."profile_achievements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profile_languages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profile_languages_delete" ON "public"."profile_languages" FOR DELETE USING ((("profile_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "profile_languages_insert" ON "public"."profile_languages" FOR INSERT WITH CHECK ((("profile_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "profile_languages_select" ON "public"."profile_languages" FOR SELECT USING ((("profile_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "profile_languages_update" ON "public"."profile_languages" FOR UPDATE USING ((("profile_id" = "auth"."uid"()) OR "public"."is_admin"())) WITH CHECK ((("profile_id" = "auth"."uid"()) OR "public"."is_admin"()));



ALTER TABLE "public"."profile_skills" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profile_skills_delete" ON "public"."profile_skills" FOR DELETE USING ((("profile_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "profile_skills_insert" ON "public"."profile_skills" FOR INSERT WITH CHECK ((("profile_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "profile_skills_select" ON "public"."profile_skills" FOR SELECT USING ((("profile_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "profile_skills_update" ON "public"."profile_skills" FOR UPDATE USING ((("profile_id" = "auth"."uid"()) OR "public"."is_admin"())) WITH CHECK ((("profile_id" = "auth"."uid"()) OR "public"."is_admin"()));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_delete" ON "public"."profiles" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "profiles_delete_own_or_admin" ON "public"."profiles" FOR DELETE TO "authenticated" USING ((("id" = "auth"."uid"()) OR ("role" = 'admin'::"public"."user_role")));



CREATE POLICY "profiles_insert" ON "public"."profiles" FOR INSERT WITH CHECK ((("auth"."uid"() = "id") AND ("role" = 'volunteer'::"public"."user_role")));



CREATE POLICY "profiles_select" ON "public"."profiles" FOR SELECT USING ((("auth"."uid"() = "id") OR "public"."is_admin"()));



CREATE POLICY "profiles_select_own_or_admin" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((("id" = "auth"."uid"()) OR ("role" = 'admin'::"public"."user_role")));



CREATE POLICY "profiles_self_insert" ON "public"."profiles" FOR INSERT WITH CHECK ((("auth"."uid"() = "id") AND ("role" = 'volunteer'::"public"."user_role")));



CREATE POLICY "profiles_update" ON "public"."profiles" FOR UPDATE USING ((("auth"."uid"() = "id") OR "public"."is_admin"())) WITH CHECK (((("auth"."uid"() = "id") AND ("role" = 'volunteer'::"public"."user_role")) OR "public"."is_admin"()));



CREATE POLICY "profiles_update_own_or_admin" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ((("id" = "auth"."uid"()) OR ("role" = 'admin'::"public"."user_role"))) WITH CHECK ((("id" = "auth"."uid"()) OR ("role" = 'admin'::"public"."user_role")));



ALTER TABLE "public"."reports" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "reports_delete" ON "public"."reports" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "reports_insert" ON "public"."reports" FOR INSERT WITH CHECK (("reporter_id" = "auth"."uid"()));



CREATE POLICY "reports_select" ON "public"."reports" FOR SELECT USING ((("reporter_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "reports_update" ON "public"."reports" FOR UPDATE USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



ALTER TABLE "public"."shift_assignments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "shift_assignments_delete" ON "public"."shift_assignments" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "shift_assignments_insert" ON "public"."shift_assignments" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "shift_assignments_select" ON "public"."shift_assignments" FOR SELECT USING ((("profile_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "shift_assignments_update" ON "public"."shift_assignments" FOR UPDATE USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



ALTER TABLE "public"."skills" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "skills_manage" ON "public"."skills" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "skills_select" ON "public"."skills" FOR SELECT USING (true);



ALTER TABLE "public"."sports" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "sports_manage" ON "public"."sports" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "sports_select" ON "public"."sports" FOR SELECT USING (true);



ALTER TABLE "public"."training_modules" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "training_modules_manage" ON "public"."training_modules" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "training_modules_select" ON "public"."training_modules" FOR SELECT USING (true);



ALTER TABLE "public"."training_progress" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "training_progress_delete" ON "public"."training_progress" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "training_progress_insert" ON "public"."training_progress" FOR INSERT WITH CHECK (("profile_id" = "auth"."uid"()));



CREATE POLICY "training_progress_select" ON "public"."training_progress" FOR SELECT USING ((("profile_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "training_progress_update" ON "public"."training_progress" FOR UPDATE USING ((("profile_id" = "auth"."uid"()) OR "public"."is_admin"())) WITH CHECK ((("profile_id" = "auth"."uid"()) OR "public"."is_admin"()));



ALTER TABLE "public"."volunteer_hours" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "volunteer_hours_delete" ON "public"."volunteer_hours" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "volunteer_hours_insert" ON "public"."volunteer_hours" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "volunteer_hours_select" ON "public"."volunteer_hours" FOR SELECT USING ((("profile_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "volunteer_hours_update" ON "public"."volunteer_hours" FOR UPDATE USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."check_committee_feedback_consistency"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_committee_feedback_consistency"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_committee_feedback_consistency"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_committee_leader"("p_committee" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_committee_leader"("p_committee" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_committee_leader"("p_committee" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_committee_member"("p_committee" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_committee_member"("p_committee" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_committee_member"("p_committee" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."protect_application_fields"() TO "anon";
GRANT ALL ON FUNCTION "public"."protect_application_fields"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."protect_application_fields"() TO "service_role";



GRANT ALL ON FUNCTION "public"."protect_profile_fields"() TO "anon";
GRANT ALL ON FUNCTION "public"."protect_profile_fields"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."protect_profile_fields"() TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_set_updated_at"() TO "service_role";



GRANT ALL ON TABLE "public"."accreditations" TO "anon";
GRANT ALL ON TABLE "public"."accreditations" TO "authenticated";
GRANT ALL ON TABLE "public"."accreditations" TO "service_role";



GRANT ALL ON TABLE "public"."achievement_definitions" TO "anon";
GRANT ALL ON TABLE "public"."achievement_definitions" TO "authenticated";
GRANT ALL ON TABLE "public"."achievement_definitions" TO "service_role";



GRANT ALL ON TABLE "public"."applications" TO "anon";
GRANT ALL ON TABLE "public"."applications" TO "authenticated";
GRANT ALL ON TABLE "public"."applications" TO "service_role";



GRANT ALL ON TABLE "public"."attendance_records" TO "anon";
GRANT ALL ON TABLE "public"."attendance_records" TO "authenticated";
GRANT ALL ON TABLE "public"."attendance_records" TO "service_role";



GRANT ALL ON TABLE "public"."certificates" TO "anon";
GRANT ALL ON TABLE "public"."certificates" TO "authenticated";
GRANT ALL ON TABLE "public"."certificates" TO "service_role";



GRANT ALL ON TABLE "public"."committee_feedback" TO "anon";
GRANT ALL ON TABLE "public"."committee_feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."committee_feedback" TO "service_role";



GRANT ALL ON TABLE "public"."committee_members" TO "anon";
GRANT ALL ON TABLE "public"."committee_members" TO "authenticated";
GRANT ALL ON TABLE "public"."committee_members" TO "service_role";



GRANT ALL ON TABLE "public"."committees" TO "anon";
GRANT ALL ON TABLE "public"."committees" TO "authenticated";
GRANT ALL ON TABLE "public"."committees" TO "service_role";



GRANT ALL ON TABLE "public"."event_roles" TO "anon";
GRANT ALL ON TABLE "public"."event_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."event_roles" TO "service_role";



GRANT ALL ON TABLE "public"."event_shifts" TO "anon";
GRANT ALL ON TABLE "public"."event_shifts" TO "authenticated";
GRANT ALL ON TABLE "public"."event_shifts" TO "service_role";



GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";



GRANT ALL ON TABLE "public"."languages" TO "anon";
GRANT ALL ON TABLE "public"."languages" TO "authenticated";
GRANT ALL ON TABLE "public"."languages" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."profile_achievements" TO "anon";
GRANT ALL ON TABLE "public"."profile_achievements" TO "authenticated";
GRANT ALL ON TABLE "public"."profile_achievements" TO "service_role";



GRANT ALL ON TABLE "public"."profile_languages" TO "anon";
GRANT ALL ON TABLE "public"."profile_languages" TO "authenticated";
GRANT ALL ON TABLE "public"."profile_languages" TO "service_role";



GRANT ALL ON TABLE "public"."profile_skills" TO "anon";
GRANT ALL ON TABLE "public"."profile_skills" TO "authenticated";
GRANT ALL ON TABLE "public"."profile_skills" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."reports" TO "anon";
GRANT ALL ON TABLE "public"."reports" TO "authenticated";
GRANT ALL ON TABLE "public"."reports" TO "service_role";



GRANT ALL ON TABLE "public"."shift_assignments" TO "anon";
GRANT ALL ON TABLE "public"."shift_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."shift_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."skills" TO "anon";
GRANT ALL ON TABLE "public"."skills" TO "authenticated";
GRANT ALL ON TABLE "public"."skills" TO "service_role";



GRANT ALL ON TABLE "public"."sports" TO "anon";
GRANT ALL ON TABLE "public"."sports" TO "authenticated";
GRANT ALL ON TABLE "public"."sports" TO "service_role";



GRANT ALL ON TABLE "public"."training_modules" TO "anon";
GRANT ALL ON TABLE "public"."training_modules" TO "authenticated";
GRANT ALL ON TABLE "public"."training_modules" TO "service_role";



GRANT ALL ON TABLE "public"."training_progress" TO "anon";
GRANT ALL ON TABLE "public"."training_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."training_progress" TO "service_role";



GRANT ALL ON TABLE "public"."volunteer_hours" TO "anon";
GRANT ALL ON TABLE "public"."volunteer_hours" TO "authenticated";
GRANT ALL ON TABLE "public"."volunteer_hours" TO "service_role";



GRANT ALL ON TABLE "public"."volunteer_profile_completion" TO "anon";
GRANT ALL ON TABLE "public"."volunteer_profile_completion" TO "authenticated";
GRANT ALL ON TABLE "public"."volunteer_profile_completion" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







