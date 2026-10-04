BEGIN;

CREATE OR REPLACE FUNCTION public.is_event_finished(p_event_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.events e
    WHERE e.id = p_event_id
      AND e.end_date < CURRENT_DATE
  );
$$;

CREATE OR REPLACE FUNCTION public.is_shift_finished(p_shift_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.event_shifts s
    WHERE s.id = p_shift_id
      AND (s.date + s.end_time)::timestamp < now()
  );
$$;

CREATE OR REPLACE FUNCTION public.finalize_expired_shift_attendance()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_rows integer := 0;
BEGIN
  WITH expired_assignments AS (
    SELECT
      sa.profile_id,
      sa.shift_id,
      es.event_id,
      es.role_id,
      es.date
    FROM public.shift_assignments sa
    JOIN public.event_shifts es ON es.id = sa.shift_id
    WHERE sa.status = 'assigned'
      AND (es.date + es.end_time)::timestamp < now()
  ),
  stale_records AS (
    SELECT
      ea.profile_id,
      ea.shift_id,
      ea.event_id,
      ea.role_id
    FROM expired_assignments ea
    LEFT JOIN public.attendance_records ar
      ON ar.profile_id = ea.profile_id
     AND ar.shift_id = ea.shift_id
    WHERE ar.id IS NULL
       OR ar.status IN ('scheduled', 'checked-in', 'checked-out')
       OR ar.status IS NULL
  )
  UPDATE public.attendance_records ar
  SET status = 'absent',
      updated_at = now()
  FROM stale_records sr
  WHERE ar.profile_id = sr.profile_id
    AND ar.shift_id = sr.shift_id
    AND ar.status IN ('scheduled', 'checked-in', 'checked-out', 'absent')
    OR (ar.status IS NULL AND ar.profile_id = sr.profile_id AND ar.shift_id = sr.shift_id);

  GET DIAGNOSTICS affected_rows = ROW_COUNT;

  WITH expired_assignments AS (
    SELECT
      sa.profile_id,
      sa.shift_id,
      es.event_id,
      es.role_id,
      es.date
    FROM public.shift_assignments sa
    JOIN public.event_shifts es ON es.id = sa.shift_id
    WHERE sa.status = 'assigned'
      AND (es.date + es.end_time)::timestamp < now()
  )
  INSERT INTO public.attendance_records (
    profile_id,
    event_id,
    role_id,
    shift_id,
    date,
    status
  )
  SELECT
    ea.profile_id,
    ea.event_id,
    ea.role_id,
    ea.shift_id,
    ea.date,
    'absent'
  FROM expired_assignments ea
  LEFT JOIN public.attendance_records ar
    ON ar.profile_id = ea.profile_id
   AND ar.shift_id = ea.shift_id
  WHERE ar.id IS NULL
  ON CONFLICT (profile_id, shift_id) DO UPDATE
    SET status = 'absent',
        updated_at = now();

  RETURN affected_rows;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_event_finished(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_shift_finished(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_expired_shift_attendance() TO authenticated;

COMMIT;
