BEGIN;

DROP POLICY IF EXISTS attendance_records_insert ON public.attendance_records;
DROP POLICY IF EXISTS attendance_records_update ON public.attendance_records;
DROP POLICY IF EXISTS attendance_records_delete ON public.attendance_records;
DROP POLICY IF EXISTS attendance_records_select ON public.attendance_records;

CREATE POLICY "attendance_records_select"
ON public.attendance_records
FOR SELECT TO authenticated
USING (
  public.is_admin()
  OR profile_id = auth.uid()
  OR public.is_committee_leader_for_shift(shift_id)
);

CREATE POLICY "attendance_records_insert"
ON public.attendance_records
FOR INSERT TO authenticated
WITH CHECK (
  public.is_admin()
  OR public.is_committee_leader_for_shift(shift_id)
  OR (
    profile_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.shift_assignments sa
      WHERE sa.profile_id = auth.uid()
        AND sa.shift_id = attendance_records.shift_id
        AND sa.status = 'assigned'
    )
  )
);

CREATE POLICY "attendance_records_update"
ON public.attendance_records
FOR UPDATE TO authenticated
USING (
  public.is_admin()
  OR public.is_committee_leader_for_shift(shift_id)
  OR profile_id = auth.uid()
)
WITH CHECK (
  public.is_admin()
  OR public.is_committee_leader_for_shift(shift_id)
  OR profile_id = auth.uid()
);

CREATE POLICY "attendance_records_delete"
ON public.attendance_records
FOR DELETE TO authenticated
USING (
  public.is_admin()
  OR public.is_committee_leader_for_shift(shift_id)
);

COMMIT;
