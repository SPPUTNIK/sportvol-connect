BEGIN;

DROP POLICY IF EXISTS "committee_leaders_can_view_committee_accreditations" ON public.accreditations;

CREATE OR REPLACE FUNCTION public.is_committee_leader_for_accreditation(p_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.shift_assignments sa
    JOIN public.event_shifts es
      ON es.id = sa.shift_id
    JOIN public.committee_shifts cs
      ON cs.shift_id = es.id
    JOIN public.committees c
      ON c.id = cs.committee_id
    WHERE sa.profile_id = p_profile_id
      AND sa.status = 'assigned'
      AND c.leader_profile_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_committee_leader_for_accreditation(uuid) TO authenticated;

CREATE POLICY "committee_leaders_can_view_committee_accreditations"
ON public.accreditations
FOR SELECT TO authenticated
USING (
  profile_id = auth.uid()
  OR public.is_admin()
  OR public.is_committee_leader_for_accreditation(profile_id)
);

COMMIT;
