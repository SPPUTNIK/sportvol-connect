CREATE OR REPLACE FUNCTION public.calculate_attendance_hours(
  p_check_in_time time,
  p_check_out_time time
)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT CASE
    WHEN p_check_in_time IS NULL OR p_check_out_time IS NULL THEN 0
    WHEN p_check_out_time < p_check_in_time THEN 0
    ELSE CAST(ROUND(EXTRACT(EPOCH FROM (p_check_out_time - p_check_in_time)) / 3600.0)::numeric AS integer)
  END;
$$;

CREATE OR REPLACE FUNCTION public.sync_volunteer_hours()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.recalculate_attendance_rate(p_profile_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    AND status IN ('checked-in', 'checked-out', 'late');

  UPDATE public.profiles
  SET attendance_rate = ROUND((attended_records::numeric / total_records::numeric) * 100, 2)
  WHERE id = p_profile_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_attendance_rate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE UNIQUE INDEX IF NOT EXISTS volunteer_hours_attendance_id_unique_idx
ON public.volunteer_hours (attendance_id)
WHERE attendance_id IS NOT NULL;

DROP TRIGGER IF EXISTS attendance_records_sync_volunteer_hours ON public.attendance_records;

CREATE TRIGGER attendance_records_sync_volunteer_hours
AFTER INSERT OR UPDATE OF check_in_time, check_out_time
ON public.attendance_records
FOR EACH ROW
EXECUTE FUNCTION public.sync_volunteer_hours();

DROP TRIGGER IF EXISTS attendance_records_sync_attendance_rate ON public.attendance_records;

CREATE TRIGGER attendance_records_sync_attendance_rate
AFTER INSERT OR UPDATE OF status OR DELETE
ON public.attendance_records
FOR EACH ROW
EXECUTE FUNCTION public.sync_attendance_rate();
