CREATE OR REPLACE FUNCTION public.sync_accreditation_from_shift_assignment()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  shift_row record;
  profile_row record;
  canonical_qr text;
  next_status public.accreditation_status;
  volunteer_name text;
  qr_seed text;
  qr_code text;
  qr_hash text;
BEGIN
  SELECT s.event_id, s.role_id, s.date
    INTO shift_row
  FROM public.event_shifts s
  WHERE s.id = NEW.shift_id;

  IF shift_row IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT p.first_name, p.last_name, p.email
    INTO profile_row
  FROM public.profiles p
  WHERE p.id = NEW.profile_id;

  IF profile_row IS NULL THEN
    RETURN NEW;
  END IF;

  volunteer_name := trim(concat_ws(' ', profile_row.first_name, profile_row.last_name));

  IF shift_row.date = CURRENT_DATE THEN
    next_status := 'approved';
  ELSE
    next_status := 'pending';
  END IF;

  qr_seed := NEW.profile_id::text || '|' || shift_row.event_id::text || '|' || shift_row.role_id::text || '|' || COALESCE(NEW.id::text, gen_random_uuid()::text);
  qr_hash := upper(substr(md5(qr_seed), 1, 12));
  qr_code := 'VOL-' || qr_hash;

  INSERT INTO public.accreditations (
    profile_id,
    event_id,
    role_id,
    volunteer_identifier,
    zone,
    qr_code_data,
    status
  )
  VALUES (
    NEW.profile_id,
    shift_row.event_id,
    shift_row.role_id,
    COALESCE(NULLIF(volunteer_name, ''), profile_row.email, NEW.profile_id::text),
    NULL,
    qr_code,
    next_status
  )
  ON CONFLICT (profile_id, event_id, role_id)
  DO UPDATE SET
    volunteer_identifier = EXCLUDED.volunteer_identifier,
    qr_code_data = EXCLUDED.qr_code_data,
    status = EXCLUDED.status,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS shift_assignments_sync_accreditation ON public.shift_assignments;

CREATE TRIGGER shift_assignments_sync_accreditation
AFTER INSERT OR UPDATE OF shift_id, profile_id
ON public.shift_assignments
FOR EACH ROW
EXECUTE FUNCTION public.sync_accreditation_from_shift_assignment();
