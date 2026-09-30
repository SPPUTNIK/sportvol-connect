import { supabase } from "@/lib/supabase";
import { getCurrentUserId } from "@/services/shared/backendService";
import type { AttendanceRecord } from "@/lib/types";

export const attendanceService = {
  async getAttendance(): Promise<AttendanceRecord[]> {
    const userId = await getCurrentUserId();

    if (!userId) {
      throw new Error("You must be signed in.");
    }

    /*
     * ============================================================
     * 1. Get ALL shifts assigned to this volunteer
     *
     * IMPORTANT:
     * We do NOT start from attendance_records because a volunteer
     * can have an assigned shift without having checked in yet.
     * ============================================================
     */

    const { data: assignments, error: assignmentsError } = await supabase
      .from("shift_assignments")
      .select(
        `
        id,
        shift_id,
        status,
        shift:event_shifts(
          id,
          event_id,
          role_id,
          title,
          location,
          date,
          start_time,
          end_time,
          event:events(
            title,
            start_date,
            end_date,
            venue,
            city
          ),
          role:event_roles(
            name
          )
        )
      `,
      )
      .eq("profile_id", userId)
      .eq("status", "assigned");

    if (assignmentsError) {
      console.error(
        "Failed to load volunteer shift assignments:",
        assignmentsError,
      );

      throw new Error(
        assignmentsError.message ||
          "Unable to load your assigned shifts.",
      );
    }

    if (!assignments || assignments.length === 0) {
      return [];
    }

    /*
     * ============================================================
     * 2. Get attendance records for those exact shifts
     *
     * Attendance is optional:
     *
     * assigned shift
     *       ├── no attendance record yet → pending
     *       ├── checked-in               → checked-in
     *       └── checked-out              → checked-out
     * ============================================================
     */

    const shiftIds = assignments
      .map((assignment) => assignment.shift_id)
      .filter(Boolean);

    const { data: attendanceRows, error: attendanceError } =
      await supabase
        .from("attendance_records")
        .select(
          `
          id,
          event_id,
          role_id,
          shift_id,
          date,
          status,
          check_in_time,
          check_out_time,
          notes
        `,
        )
        .eq("profile_id", userId)
        .in("shift_id", shiftIds);

    if (attendanceError) {
      console.error(
        "Failed to load attendance records:",
        attendanceError,
      );

      throw new Error(
        attendanceError.message ||
          "Unable to load attendance records.",
      );
    }

    /*
     * ============================================================
     * 3. Index attendance by shift_id
     *
     * This makes it easy to match:
     *
     * event_shifts.id
     *        ↓
     * attendance_records.shift_id
     * ============================================================
     */

    const attendanceByShiftId = new Map(
      (attendanceRows ?? []).map((record) => [
        record.shift_id,
        record,
      ]),
    );

    /*
     * ============================================================
     * 4. Build the final AttendanceRecord list
     *
     * Every assigned shift becomes one record.
     * Attendance information is added when available.
     * ============================================================
     */

    const records: AttendanceRecord[] = assignments
      .map((assignment) => {
        const shift = Array.isArray(assignment.shift)
          ? assignment.shift[0]
          : assignment.shift;

        if (!shift) {
          return null;
        }

        const attendance =
          attendanceByShiftId.get(shift.id) ?? null;

        const event = Array.isArray(shift.event)
          ? shift.event[0]
          : shift.event;

        const role = Array.isArray(shift.role)
          ? shift.role[0]
          : shift.role;

        return {
          /*
           * If attendance exists, use its real ID.
           * Otherwise use the shift assignment ID so the UI still
           * has a stable unique key.
           */
          id: attendance?.id ?? assignment.id,

          event_id: shift.event_id,

          event_title:
            event?.title ?? "Event",

          role_name:
            role?.name ?? "Volunteer",

          date: shift.date,

          /*
           * No attendance record yet means the shift is upcoming.
           */
          status:
            attendance?.status ?? "pending",

          check_in_time:
            attendance?.check_in_time ?? null,

          check_out_time:
            attendance?.check_out_time ?? null,

          notes:
            attendance?.notes ?? null,

          venue:
            event?.venue ?? null,

          city:
            event?.city ?? null,

          shift_title:
            shift.title ?? null,

          shift_start_time:
            shift.start_time ?? null,

          shift_end_time:
            shift.end_time ?? null,

          shift_location:
            shift.location ?? null,
        } as AttendanceRecord;
      })
      .filter(
        (record): record is AttendanceRecord =>
          record !== null,
      );

    /*
     * ============================================================
     * 5. Sort by date + start time
     *
     * Most recent / nearest shifts first.
     * ============================================================
     */

    records.sort((a, b) => {
      const dateA = `${a.date} ${a.shift_start_time ?? "00:00:00"}`;
      const dateB = `${b.date} ${b.shift_start_time ?? "00:00:00"}`;

      return dateA.localeCompare(dateB);
    });

    return records;
  },
};

