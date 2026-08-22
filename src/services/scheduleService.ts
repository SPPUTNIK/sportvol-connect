import { supabase } from "@/lib/supabase";
import type { Shift } from "@/lib/types";

export const scheduleService = {
  async getShifts(): Promise<Shift[]> {
    // ============================================================
    // 1. GET AUTHENTICATED USER
    // ============================================================

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      throw new Error(authError.message);
    }

    if (!user) {
      throw new Error("You must be signed in.");
    }

    // ============================================================
    // 2. GET ASSIGNED SHIFTS
    // ============================================================
    //
    // A volunteer only sees shifts explicitly assigned to them.
    //

    const { data, error } = await supabase
      .from("shift_assignments")
      .select(`
        id,
        status,
        assigned_at,

        event_shifts (
          id,
          event_id,
          role_id,
          title,
          location,
          date,
          start_time,
          end_time,
          instructions,

          events (
            title
          ),

          event_roles (
            name
          )
        )
      `)
      .eq("profile_id", user.id)
      .eq("status", "assigned");

    if (error) {
      throw new Error(error.message);
    }

    // ============================================================
    // 3. MAP DATA TO FRONTEND Shift TYPE
    // ============================================================

    return (data ?? [])
      .map((assignment) => {
        const shift = Array.isArray(assignment.event_shifts)
          ? assignment.event_shifts[0]
          : assignment.event_shifts;

        if (!shift) {
          return null;
        }

        const event = Array.isArray(shift.events)
          ? shift.events[0]
          : shift.events;

        const role = Array.isArray(shift.event_roles)
          ? shift.event_roles[0]
          : shift.event_roles;

        return {
          id: shift.id,

          event_id: shift.event_id,

          event_title:
            event?.title ?? "Unknown event",

          role_name:
            role?.name ?? "Volunteer",

          date: shift.date,

          start_time:
            shift.start_time ?? "",

          end_time:
            shift.end_time ?? "",

          location:
            shift.location ?? "",

          instructions:
            shift.instructions ?? "",
        } as Shift;
      })
      .filter((shift): shift is Shift => shift !== null)
      .sort((a, b) => {
        const dateA = `${a.date} ${a.start_time}`;
        const dateB = `${b.date} ${b.start_time}`;

        return dateA.localeCompare(dateB);
      });
  },
};