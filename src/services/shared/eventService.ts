import { supabase } from "@/lib/supabase";
import type { Event } from "@/lib/types";

type EventRow = Event & {
  event_roles?: Array<{
    id: string;
    event_id: string;
    name: string;
    description: string | null;
    responsibilities: string | null;
    requirements: string | null;
    skills: string[];
    positions: number;
    filled_positions: number;
    min_age: number | null;
    mandatory_training: boolean;
  }>;
};

export interface MyEvent {
  id: string;
  eventId: string;
  event: string;
  location: string;
  date: string;
  role: string;
  roleId: string;
  status: string;
  shift: string;
  shiftId: string | null;
  training: string;
  accreditation: string;
  attendance: string;
}

const MOROCCO_TIMEZONE = "Africa/Casablanca";

function getMoroccoDateString(date = new Date()): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: MOROCCO_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function isEventFinished(endDate: string | null | undefined): boolean {
  if (!endDate) {
    return false;
  }

  return endDate < getMoroccoDateString();
}

export function isApplicationDeadlinePassed(deadline: string | null | undefined): boolean {
  if (!deadline) {
    return false;
  }

  const deadlineDate = new Date(`${deadline}T00:00:00`);
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return deadlineDate.getTime() < today.getTime();
}

export function isShiftFinished(shiftDate: string | null | undefined, endTime: string | null | undefined): boolean {
  if (!shiftDate || !endTime) {
    return false;
  }

  const normalizedEndTime = String(endTime).trim();

  if (!normalizedEndTime) {
    return false;
  }

  const paddedEndTime = normalizedEndTime.includes(":")
    ? normalizedEndTime
    : `${normalizedEndTime}:00`;

  const shiftEndDate = new Date(`${shiftDate}T${paddedEndTime}`);

  if (Number.isNaN(shiftEndDate.getTime())) {
    return false;
  }

  return shiftEndDate.getTime() < Date.now();
}

function hasValidAttendanceStatus(status: string | null | undefined): boolean {
  if (!status) {
    return false;
  }

  const normalized = status.toLowerCase();

  return [
    "late",
    "excused",
    "checked-in",
    "checked-out",
    "present",
    "complete",
    "completed",
  ].includes(normalized);
}

function isRlsViolation(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");

  return /row-level security|new row violates|permission denied/i.test(message);
}

async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user.id;
}

async function finalizeExpiredShiftAttendance(): Promise<number> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return 0;
  }

  const { data: assignments, error: assignmentsError } = await supabase
    .from("shift_assignments")
    .select(
      `
        id,
        profile_id,
        shift_id,
        status,
        event_shifts (
          id,
          event_id,
          role_id,
          date,
          start_time,
          end_time
        )
      `,
    )
    .eq("profile_id", userId)
    .eq("status", "assigned");

  if (assignmentsError) {
    throw new Error(assignmentsError.message);
  }

  const expiredAssignments = (assignments ?? []).filter((assignment) => {
    const shift = Array.isArray(assignment.event_shifts)
      ? assignment.event_shifts[0]
      : assignment.event_shifts;

    return shift ? isShiftFinished(shift.date, shift.end_time) : false;
  });

  if (!expiredAssignments.length) {
    return 0;
  }

  const shiftIds = expiredAssignments.map((assignment) => assignment.shift_id).filter(Boolean);

  if (!shiftIds.length) {
    return 0;
  }

  const { data: attendanceRows, error: attendanceError } = await supabase
    .from("attendance_records")
    .select("id, profile_id, shift_id, status")
    .eq("profile_id", userId)
    .in("shift_id", shiftIds);

  if (attendanceError) {
    throw new Error(attendanceError.message);
  }

  const attendanceByShiftId = new Map(
    (attendanceRows ?? []).map((record) => [record.shift_id, record]),
  );

  let updated = 0;

  for (const assignment of expiredAssignments) {
    const attendance = attendanceByShiftId.get(assignment.shift_id);

    if (attendance && hasValidAttendanceStatus(attendance.status)) {
      continue;
    }

    const shiftDate = assignment.event_shifts?.date ?? null;

    const payload = {
      profile_id: userId,
      shift_id: assignment.shift_id,
      event_id: assignment.event_shifts?.event_id ?? null,
      role_id: assignment.event_shifts?.role_id ?? null,
      date: shiftDate,
      status: "absent",
      check_in_time: attendance?.check_in_time ?? null,
      check_out_time: attendance?.check_out_time ?? null,
      notes: attendance?.notes ?? null,
    };

    if (!shiftDate) {
      console.warn("Skipping finalization insert because the assigned shift is missing its date.");
      continue;
    }

    if (attendance) {
      try {
        const { error } = await supabase
          .from("attendance_records")
          .update({
            status: "absent",
            updated_at: new Date().toISOString(),
          })
          .eq("id", attendance.id);

        if (error) {
          if (isRlsViolation(error)) {
            console.warn("Skipping attendance finalization update because the volunteer cannot modify this record yet.");
            continue;
          }

          throw new Error(error.message);
        }
      } catch (error) {
        if (isRlsViolation(error)) {
          console.warn("Skipping attendance finalization update because the volunteer cannot modify this record yet.");
          continue;
        }

        throw error;
      }

      updated += 1;
      continue;
    }

    try {
      const { error: insertError } = await supabase.from("attendance_records").insert(payload);

      if (insertError) {
        if (isRlsViolation(insertError)) {
          console.warn("Skipping attendance finalization insert because current RLS policy blocks volunteer self-insert for absent shifts.");
          continue;
        }

        throw new Error(insertError.message);
      }
    } catch (error) {
      if (isRlsViolation(error)) {
        console.warn("Skipping attendance finalization insert because current RLS policy blocks volunteer self-insert for absent shifts.");
        continue;
      }

      throw error;
    }

    updated += 1;
  }

  return updated;
}

async function getEventsWithRegistrationCounts(): Promise<Event[]> {
  /*
   * ============================================================
   * EVENTS
   * ============================================================
   */

  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select(
      `
      *,
      event_roles (
        id,
        event_id,
        name,
        description,
        responsibilities,
        requirements,
        skills,
        positions,
        filled_positions,
        min_age,
        mandatory_training
      )
    `,
    )
    .eq("status", "published")
    .order("start_date", {
      ascending: true,
    });

  if (eventsError) {
    throw new Error(eventsError.message);
  }

  const visibleEvents = (events ?? []).filter((event) => {
    if (isEventFinished(event.end_date)) {
      return false;
    }

    return !isApplicationDeadlinePassed(event.application_deadline);
  });

  if (!visibleEvents.length) {
    return [];
  }

  /*
   * ============================================================
   * APPLICATIONS
   * ============================================================
   *
   * We count real applications from Supabase.
   *
   * Rejected and withdrawn applications are not counted.
   */

  const { data: applications, error: applicationsError } = await supabase
    .from("applications")
    .select(
      `
        id,
        event_id,
        status
      `,
    )
    .in("status", ["pending", "accepted", "waitlisted"]);

  if (applicationsError) {
    throw new Error(applicationsError.message);
  }

  /*
   * ============================================================
   * COUNT APPLICATIONS PER EVENT
   * ============================================================
   */

  const registrationCounts = new Map<string, number>();

  for (const application of applications ?? []) {
    const current = registrationCounts.get(application.event_id) ?? 0;

    registrationCounts.set(application.event_id, current + 1);
  }

  /*
   * ============================================================
   * MAP EVENTS
   * ============================================================
   */

  return visibleEvents.map((event) => {
    const registered = registrationCounts.get(event.id) ?? 0;

    return {
      ...(event as EventRow),

      event_roles: event.event_roles ?? [],

      registered_volunteers: registered,
    } as Event;
  });
}

export const eventService = {
  /**
   * ============================================================
   * GET EVENTS
   * ============================================================
   */
  async getEvents(): Promise<Event[]> {
    return getEventsWithRegistrationCounts();
  },

  /**
   * ============================================================
   * GET EVENT BY ID
   * ============================================================
   */
  async getEventById(id: string): Promise<Event | null> {
    const { data: event, error } = await supabase
      .from("events")
      .select(
        `
        *,
        event_roles (
          id,
          event_id,
          name,
          description,
          responsibilities,
          requirements,
          skills,
          positions,
          filled_positions,
          min_age,
          mandatory_training
        )
      `,
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!event) {
      return null;
    }

    if (isEventFinished(event.end_date) || isApplicationDeadlinePassed(event.application_deadline)) {
      return null;
    }

    /*
     * Get applications for this event.
     */
    const { count, error: applicationsError } = await supabase
      .from("applications")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("event_id", id)
      .in("status", ["pending", "accepted", "waitlisted"]);

    if (applicationsError) {
      throw new Error(applicationsError.message);
    }

    return {
      ...(event as EventRow),

      event_roles: event.event_roles ?? [],

      registered_volunteers: count ?? 0,
    } as Event;
  },

  /**
   * ============================================================
   * GET EVENT BY SLUG
   * ============================================================
   */
  async getEventBySlug(slug: string): Promise<Event | null> {
    const { data: event, error } = await supabase
      .from("events")
      .select(
        `
        *,
        event_roles (
          id,
          event_id,
          name,
          description,
          responsibilities,
          requirements,
          skills,
          positions,
          filled_positions,
          min_age,
          mandatory_training
        )
      `,
      )
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!event) {
      return null;
    }

    if (isEventFinished(event.end_date) || isApplicationDeadlinePassed(event.application_deadline)) {
      return null;
    }

    const { count, error: applicationsError } = await supabase
      .from("applications")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("event_id", event.id)
      .in("status", ["pending", "accepted", "waitlisted"]);

    if (applicationsError) {
      throw new Error(applicationsError.message);
    }

    return {
      ...(event as EventRow),

      event_roles: event.event_roles ?? [],

      registered_volunteers: count ?? 0,
    } as Event;
  },

  /**
   * ============================================================
   * GET MY EVENTS
   * ============================================================
   *
   * Returns events where the authenticated volunteer
   * has an accepted application.
   */
  async getMyEvents(): Promise<MyEvent[]> {
    const userId = await getCurrentUserId();

    if (!userId) {
      throw new Error("You must be signed in.");
    }

    await finalizeExpiredShiftAttendance();

    const { data: applications, error: applicationsError } = await supabase
      .from("applications")
      .select(
        `
          id,
          event_id,
          role_id,
          status,
          applied_at,
          events (
            id,
            title,
            city,
            venue,
            start_date,
            end_date,
            start_time,
            end_time
          ),
          event_roles (
            id,
            name
          )
        `,
      )
      .eq("profile_id", userId)
      .order("applied_at", { ascending: false });

    if (applicationsError) {
      throw new Error(applicationsError.message);
    }

    const eventIds = new Set<string>();

    for (const application of applications ?? []) {
      const event = Array.isArray(application.events) ? application.events[0] : application.events;

      if (event) {
        eventIds.add(event.id);
      }
    }

    const [shiftResult, trainingResult, accreditationResult, attendanceResult] = await Promise.all([
      eventIds.size
        ? supabase
            .from("shift_assignments")
            .select(
              `
                id,
                status,
                profile_id,
                shift_id,
                event_shifts (
                  id,
                  title,
                  location,
                  date,
                  start_time,
                  end_time,
                  event_id,
                  role_id,
                  instructions
                )
              `,
            )
            .eq("profile_id", userId)
        : Promise.resolve({ data: [], error: null }),
      eventIds.size
        ? supabase
            .from("training_modules")
            .select(
              `
                id,
                title,
                required,
                event_id,
                training_progress (
                  completed,
                  profile_id
                )
              `,
            )
            .in("event_id", [...eventIds])
        : Promise.resolve({ data: [], error: null }),
      eventIds.size
        ? supabase
            .from("accreditations")
            .select(
              `
                id,
                profile_id,
                event_id,
                role_id,
                status,
                volunteer_identifier,
                zone,
                qr_code_data
              `,
            )
            .eq("profile_id", userId)
            .in("event_id", [...eventIds])
        : Promise.resolve({ data: [], error: null }),
      eventIds.size
        ? supabase
            .from("attendance_records")
            .select(
              `
                id,
                profile_id,
                event_id,
                shift_id,
                status,
                check_in_time,
                check_out_time
              `,
            )
            .eq("profile_id", userId)
            .in("event_id", [...eventIds])
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (shiftResult.error) throw new Error(shiftResult.error.message);
    if (trainingResult.error) throw new Error(trainingResult.error.message);
    if (accreditationResult.error) throw new Error(accreditationResult.error.message);
    if (attendanceResult.error) throw new Error(attendanceResult.error.message);

    const shiftsByEventId = new Map<string, any[]>();
    for (const assignment of shiftResult.data ?? []) {
      const shift = Array.isArray(assignment.event_shifts)
        ? assignment.event_shifts[0]
        : assignment.event_shifts;

      if (!shift || !shift.event_id) {
        continue;
      }

      const list = shiftsByEventId.get(shift.event_id) ?? [];
      list.push(assignment);
      shiftsByEventId.set(shift.event_id, list);
    }

    const trainingsByEventId = new Map<string, any[]>();
    for (const module of trainingResult.data ?? []) {
      if (!module.event_id) {
        continue;
      }

      const list = trainingsByEventId.get(module.event_id) ?? [];
      list.push(module);
      trainingsByEventId.set(module.event_id, list);
    }

    const accreditationsByEventIdAndRole = new Map<string, any>();
    for (const accreditation of accreditationResult.data ?? []) {
      const key = `${accreditation.event_id}:${accreditation.role_id ?? ""}`;
      accreditationsByEventIdAndRole.set(key, accreditation);
    }

    const attendanceByEventId = new Map<string, any>();
    for (const attendance of attendanceResult.data ?? []) {
      if (!attendance.event_id) {
        continue;
      }
      attendanceByEventId.set(attendance.event_id, attendance);
    }

    const result: MyEvent[] = [];

    for (const application of applications ?? []) {
      const event = Array.isArray(application.events) ? application.events[0] : application.events;
      const role = Array.isArray(application.event_roles)
        ? application.event_roles[0]
        : application.event_roles;

      if (!event || !role || isEventFinished(event.end_date)) {
        continue;
      }

      const assignedShift = (shiftsByEventId.get(event.id) ?? []).find((assignment) => {
        const shift = Array.isArray(assignment.event_shifts)
          ? assignment.event_shifts[0]
          : assignment.event_shifts;

        return shift && assignment.profile_id === userId && shift.event_id === event.id;
      });

      const shift = assignedShift
        ? Array.isArray(assignedShift.event_shifts)
          ? assignedShift.event_shifts[0]
          : assignedShift.event_shifts
        : null;

      const eventTraining = trainingsByEventId.get(event.id) ?? [];
      let trainingLabel = "Not required";
      if (eventTraining.length > 0) {
        const completed = eventTraining.filter((training) => {
          const progress = Array.isArray(training.training_progress)
            ? training.training_progress.find((item) => item.profile_id === userId)
            : training.training_progress;

          return progress?.completed === true;
        }).length;

        trainingLabel = `${completed}/${eventTraining.length} completed`;
      }

      const accreditationKey = `${event.id}:${role.id}`;
      const accreditation = accreditationsByEventIdAndRole.get(accreditationKey) ?? null;
      const accreditationLabel = accreditation
        ? accreditation.status === "approved"
          ? "Approved"
          : accreditation.status
        : "Pending";

      const attendance = attendanceByEventId.get(event.id) ?? null;
      let attendanceLabel = "Scheduled";

      if (attendance) {
        switch (attendance.status) {
          case "checked-in":
          case "checked_in":
            attendanceLabel = "Present";
            break;

          case "checked-out":
          case "checked_out":
            attendanceLabel = "Present";
            break;

          case "absent":
            attendanceLabel = "Absent";
            break;

          case "late":
            attendanceLabel = "Late";
            break;

          case "excused":
            attendanceLabel = "Excused";
            break;

          default:
            attendanceLabel = attendance.status;
        }
      }

      let shiftLabel = "Not assigned";
      if (shift) {
        const location = shift.location ? ` · ${shift.location}` : "";
        shiftLabel = `${shift.date} · ${shift.start_time} – ${shift.end_time}${location}`;
      }

      result.push({
        id: application.id,
        eventId: event.id,
        event: event.title,
        location: `${event.venue}, ${event.city}`,
        date:
          event.start_date === event.end_date
            ? event.start_date
            : `${event.start_date} – ${event.end_date}`,
        role: role.name,
        roleId: role.id,
        status: application.status,
        shift: shiftLabel,
        shiftId: shift?.id ?? null,
        training: trainingLabel,
        accreditation: accreditationLabel,
        attendance: attendanceLabel,
      });
    }

    return result;
  },
};
