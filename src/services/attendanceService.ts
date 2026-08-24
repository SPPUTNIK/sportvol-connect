import { supabase } from "@/lib/supabase";
import { getCurrentUserId } from "@/services/backendService";
import type { AttendanceRecord } from "@/lib/types";

export const attendanceService = {
  async getAttendance(): Promise<AttendanceRecord[]> {
    const userId = await getCurrentUserId();

    if (!userId) {
      throw new Error("You must be signed in.");
    }

    const { data, error } = await supabase
      .from("attendance_records")
      .select(`
        id,
        event_id,
        role_id,
        shift_id,
        date,
        status,
        check_in_time,
        check_out_time,
        notes,
        event:events(
          title,
          start_date,
          end_date,
          venue,
          city
        ),
        role:event_roles(
          name
        ),
        shift:event_shifts(
          title,
          start_time,
          end_time,
          location
        )
      `)
      .eq("profile_id", userId)
      .order("date", { ascending: false });

    if (error) {
      console.error("Failed to load attendance:", error);
      throw new Error(
        error.message || "Unable to load attendance.",
      );
    }

    return (data ?? []).map((record: any) => ({
      id: record.id,
      event_id: record.event_id,

      event_title:
        record.event?.title ??
        "Event",

      role_name:
        record.role?.title ??
        "Volunteer",

      date: record.date,

      status:
        record.status ?? "pending",

      check_in_time:
        record.check_in_time ?? null,

      check_out_time:
        record.check_out_time ?? null,

      notes:
        record.notes ?? null,

      venue:
        record.event?.venue ?? null,

      city:
        record.event?.city ?? null,

      shift_title:
        record.shift?.title ?? null,

      shift_start_time:
        record.shift?.start_time ?? null,

      shift_end_time:
        record.shift?.end_time ?? null,

      shift_location:
        record.shift?.location ?? null,
    }));
  },
};