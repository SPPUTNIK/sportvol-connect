import { supabase } from "@/lib/supabase";
const db = supabase as any;

import type {
  Application,
  AttendanceRecord,
  Certificate,
  Event,
  Shift,
  Training,
  VolunteerHours,
  Notification,
  TrainingResource,
  DashboardAchievement,
  DashboardUpcomingEvent,
  DashboardApplication,
  VolunteerDashboard,
} from "@/lib/types";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

export async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
    error,
  } = await db.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user.id;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  return value.slice(0, 10);
}

/* -------------------------------------------------------------------------- */
/* Events                                                                     */
/* -------------------------------------------------------------------------- */

export async function getAllEvents(): Promise<Event[]> {
  const { data, error } = await db
    .from("events")
    .select("*, event_roles(*)")
    .eq("status", "published")
    .order("start_date", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const { data, error } = await db
    .from("events")
    .select("*, event_roles(*)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
}

/* -------------------------------------------------------------------------- */
/* Applications                                                               */
/* -------------------------------------------------------------------------- */

export async function getApplications(): Promise<Application[]> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const { data, error } = await db
    .from("applications")
    .select(
      `
      id,
      status,
      applied_at,
      experience,
      availability,
      motivation,
      event_id,
      role_id,
      event:events(title),
      role:event_roles(name)
    `,
    )
    .eq("profile_id", userId)
    .order("applied_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    event_id: row.event_id,
    event_title: row.event?.title ?? "",
    role_name: row.role?.name ?? "",
    submitted_at: formatDate(row.applied_at),
    status: row.status,
    message:
      [row.motivation, row.experience, row.availability].filter(Boolean).join("\n\n") || null,
  }));
}

export async function getAcceptedEvents(): Promise<Event[]> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const { data, error } = await db
    .from("applications")
    .select(
      `
      event:events(
        *,
        event_roles(*)
      )
    `,
    )
    .eq("profile_id", userId)
    .eq("status", "accepted")
    .order("applied_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: any) => row.event as Event).filter(Boolean);
}

/* -------------------------------------------------------------------------- */
/* Shifts                                                                     */
/* -------------------------------------------------------------------------- */

export async function getShifts(): Promise<Shift[]> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const { data, error } = await db
    .from("shift_assignments")
    .select(
      `
      id,
      status,
      assigned_at,
      shift:event_shifts(
        id,
        event_id,
        role_id,
        title,
        date,
        start_time,
        end_time,
        location,
        instructions,
        event:events(
          id,
          title,
          cover_url,
          city,
          venue
        ),
        role:event_roles(name)
      )
    `,
    )
    .eq("profile_id", userId)
    .order("date", {
      ascending: true,
      referencedTable: "shift",
    });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    event_id: row.shift?.event_id ?? "",
    event_title: row.shift?.event?.title ?? "",
    role_name: row.shift?.role?.name ?? "",
    date: formatDate(row.shift?.date),
    start_time: row.shift?.start_time ?? "",
    end_time: row.shift?.end_time ?? "",
    location: row.shift?.location ?? "",
    instructions: row.shift?.instructions ?? "",
  }));
}

/* -------------------------------------------------------------------------- */
/* Training                                                                   */
/* -------------------------------------------------------------------------- */

export async function getTraining(): Promise<Training[]> {
  const userId = await getCurrentUserId();

  const [{ data: modules, error: moduleError }, { data: progress, error: progressError }] =
    await Promise.all([
      db
        .from("training_modules")
        .select(
          `
        id,
        title,
        description,
        resources,
        required,
        event_id,
        role_id
      `,
        )
        .order("title", { ascending: true }),

      userId
        ? db
            .from("training_progress")
            .select(
              `
            training_id,
            completed,
            completed_at
          `,
            )
            .eq("profile_id", userId)
        : Promise.resolve({
            data: [],
            error: null,
          }),
    ]);

  if (moduleError || progressError) {
    throw moduleError ?? progressError;
  }

  const progressMap = new Map(
    (progress ?? []).map((item: any) => [item.training_id, Boolean(item.completed)]),
  );

  return (modules ?? []).map((module: any) => ({
    id: module.id,
    title: module.title,
    description: module.description ?? "",
    resources: (module.resources ?? []) as TrainingResource[],
    completed: Boolean(progressMap.get(module.id)),
  }));
}

/* -------------------------------------------------------------------------- */
/* Attendance                                                                 */
/* -------------------------------------------------------------------------- */

export async function getAttendance(): Promise<AttendanceRecord[]> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const { data, error } = await db
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
    `,
    )
    .eq("profile_id", userId)
    .order("date", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,

    event_id: row.event_id,

    event_title: row.event?.title ?? "Unknown event",

    role_name: row.role?.name ?? "Unknown role",

    date: formatDate(row.date),

    status: row.status,

    check_in_time: row.check_in_time ?? null,

    check_out_time: row.check_out_time ?? null,

    notes: row.notes ?? null,

    venue: row.event?.venue ?? null,

    city: row.event?.city ?? null,

    shift_title: row.shift?.title ?? null,

    shift_start_time: row.shift?.start_time ?? null,

    shift_end_time: row.shift?.end_time ?? null,

    shift_location: row.shift?.location ?? null,
  }));
}

/* -------------------------------------------------------------------------- */
/* Certificates                                                               */
/* -------------------------------------------------------------------------- */

export async function getCertificates(): Promise<Certificate[]> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const { data, error } = await db
    .from("certificates")
    .select(
      `
      id,
      hours,
      date,
      certificate_id,
      issued_at,
      event:events(title),
      role:event_roles(name)
    `,
    )
    .eq("profile_id", userId)
    .order("date", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    event_title: row.event?.title ?? "",
    role_name: row.role?.name ?? "",
    hours: Number(row.hours ?? 0),
    date: formatDate(row.date),
    certificate_id: row.certificate_id ?? "",
  }));
}

/* -------------------------------------------------------------------------- */
/* Notifications                                                              */
/* -------------------------------------------------------------------------- */

export async function getNotifications(): Promise<Notification[]> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const { data, error } = await db
    .from("notifications")
    .select(
      `
      id,
      title,
      body,
      read,
      category,
      created_at,
      event_id,
      application_id
    `,
    )
    .eq("profile_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    date: formatDate(row.created_at),
    event_id: row.event_id,
    read: Boolean(row.read),
    category: row.category,
  }));
}

/* -------------------------------------------------------------------------- */
/* Volunteer Hours                                                            */
/* -------------------------------------------------------------------------- */

export async function getVolunteerHours(): Promise<VolunteerHours> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return {
      total: 0,
      current_year: 0,
      events_completed: 0,
      by_sport: [],
      by_event: [],
    };
  }

  /*
   * ============================================================
   * 1. VOLUNTEER HOURS
   *
   * volunteer_hours remains the source of truth for:
   * - total hours
   * - current year hours
   * - hours by sport
   * - hours by event
   * ============================================================
   */

  const { data: hoursData, error: hoursError } = await db
    .from("volunteer_hours")
    .select(
      `
      hours,
      year,
      event_id,
      event:events(
        title,
        sport,
        start_date,
        end_date,
        end_time
      )
    `,
    )
    .eq("profile_id", userId);

  if (hoursError) {
    throw hoursError;
  }

  const hoursRows = hoursData ?? [];
  const currentYear = new Date().getFullYear();

  let total = 0;
  let currentYearTotal = 0;

  const bySport = new Map<string, number>();
  const byEvent = new Map<string, number>();

  /*
   * Keep the event IDs that belong to this volunteer's
   * recorded volunteer hours.
   */
  const volunteerEventIds = new Set<string>();

  hoursRows.forEach((row: any) => {
    const hours = Number(row.hours ?? 0);

    total += hours;

    if (Number(row.year) === currentYear) {
      currentYearTotal += hours;
    }

    if (row.event_id) {
      volunteerEventIds.add(row.event_id);
    }

    const eventTitle = row.event?.title ?? "Unknown event";

    const sport = row.event?.sport ?? "Unknown sport";

    byEvent.set(eventTitle, (byEvent.get(eventTitle) ?? 0) + hours);

    bySport.set(sport, (bySport.get(sport) ?? 0) + hours);
  });

  /*
   * ============================================================
   * 2. LOAD ATTENDANCE
   *
   * An event is NOT considered completed just because
   * volunteer_hours.hours > 0.
   *
   * Completion requires:
   *
   * - Event has already ended.
   * - Volunteer has check-in AND check-out.
   * - For a multi-day event, every event day must have
   *   a valid check-in AND check-out.
   * ============================================================
   */

  let eventsCompleted = 0;

  if (volunteerEventIds.size > 0) {
    const eventIds = Array.from(volunteerEventIds);

    const { data: attendanceData, error: attendanceError } = await db
      .from("attendance_records")
      .select(
        `
          event_id,
          date,
          check_in_time,
          check_out_time,
          status,
          event:events(
            id,
            title,
            start_date,
            end_date,
            end_time
          )
        `,
      )
      .eq("profile_id", userId)
      .in("event_id", eventIds);

    if (attendanceError) {
      throw attendanceError;
    }

    const attendanceRows = attendanceData ?? [];

    /*
     * Group attendance records by event.
     */
    const attendanceByEvent = new Map<string, any[]>();

    attendanceRows.forEach((attendance: any) => {
      if (!attendance.event_id) {
        return;
      }

      const existing = attendanceByEvent.get(attendance.event_id) ?? [];

      existing.push(attendance);

      attendanceByEvent.set(attendance.event_id, existing);
    });

    /*
     * ==========================================================
     * HELPER: Convert YYYY-MM-DD into a local Date
     * ==========================================================
     */

    const parseDateOnly = (value: string): Date => {
      const [year, month, day] = value.split("-").map(Number);

      return new Date(year, month - 1, day);
    };

    /*
     * ==========================================================
     * HELPER: Format Date as YYYY-MM-DD
     * ==========================================================
     */

    const formatDateOnly = (date: Date): string => {
      const year = date.getFullYear();

      const month = String(date.getMonth() + 1).padStart(2, "0");

      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    };

    /*
     * ==========================================================
     * HELPER: Get every date between start and end
     *
     * Example:
     *
     * 2026-08-20 -> 2026-08-22
     *
     * returns:
     *
     * 2026-08-20
     * 2026-08-21
     * 2026-08-22
     * ==========================================================
     */

    const getEventDates = (startDate: string, endDate: string): string[] => {
      const dates: string[] = [];

      const current = parseDateOnly(startDate);

      const end = parseDateOnly(endDate);

      while (current <= end) {
        dates.push(formatDateOnly(current));

        current.setDate(current.getDate() + 1);
      }

      return dates;
    };

    /*
     * ==========================================================
     * CHECK EVERY EVENT
     * ==========================================================
     */

    for (const eventId of eventIds) {
      const attendance = attendanceByEvent.get(eventId) ?? [];

      /*
       * We need the event information.
       *
       * It is available through the attendance relation.
       */
      const event = attendance.find((record) => record.event)?.event;

      /*
       * If there is no attendance record at all,
       * the event cannot be completed.
       */
      if (!event) {
        continue;
      }

      const startDate = event.start_date;

      const endDate = event.end_date;

      if (!startDate || !endDate) {
        continue;
      }

      /*
       * ========================================================
       * 3. CHECK EVENT END DATE + END TIME
       *
       * Example:
       *
       * Event ends:
       * 2026-08-22 at 18:00
       *
       * It should NOT be completed at:
       * 17:30
       *
       * It CAN be completed at:
       * 18:01
       * ========================================================
       */

      const now = new Date();

      let eventEndDateTime: Date;

      if (event.end_time) {
        const [hours, minutes, seconds = 0] = String(event.end_time).split(":").map(Number);

        const endDateObject = parseDateOnly(endDate);

        endDateObject.setHours(hours, minutes, seconds, 0);

        eventEndDateTime = endDateObject;
      } else {
        /*
         * If end_time is NULL, consider the event
         * finished at the end of the end date.
         */
        const endDateObject = parseDateOnly(endDate);

        endDateObject.setHours(23, 59, 59, 999);

        eventEndDateTime = endDateObject;
      }

      /*
       * Event hasn't finished yet.
       */
      if (now < eventEndDateTime) {
        continue;
      }

      /*
       * ========================================================
       * 4. GET ALL DAYS OF THE EVENT
       * ========================================================
       */

      const eventDates = getEventDates(startDate, endDate);

      /*
       * ========================================================
       * 5. CHECK EVERY DAY
       *
       * Every day must have:
       *
       * check_in_time != null
       * check_out_time != null
       *
       * Example:
       *
       * Event: 20 -> 22 August
       *
       * 20 Aug  check-in + check-out ✅
       * 21 Aug  check-in + check-out ✅
       * 22 Aug  check-in + check-out ✅
       *
       * => COMPLETED
       *
       * If one day is missing:
       *
       * 20 Aug  ✅
       * 21 Aug  ❌
       * 22 Aug  ✅
       *
       * => NOT COMPLETED
       * ========================================================
       */

      const allDaysCompleted = eventDates.every((eventDate) => {
        const dayAttendance = attendance.filter((record) => record.date === eventDate);

        /*
         * There must be at least one attendance
         * record for this day.
         */
        if (dayAttendance.length === 0) {
          return false;
        }

        /*
         * At least one attendance record
         * for this day must have BOTH
         * check-in and check-out.
         */
        return dayAttendance.some(
          (record) => Boolean(record.check_in_time) && Boolean(record.check_out_time),
        );
      });

      if (allDaysCompleted) {
        eventsCompleted += 1;
      }
    }
  }

  /*
   * ============================================================
   * 6. RETURN FINAL RESULT
   * ============================================================
   */

  return {
    total,

    current_year: currentYearTotal,

    events_completed: eventsCompleted,

    by_sport: Array.from(bySport.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({
        label,
        value,
      })),

    by_event: Array.from(byEvent.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({
        label,
        value,
      })),
  };
}

/* -------------------------------------------------------------------------- */
/* Apply for Role                                                             */
/* -------------------------------------------------------------------------- */

export async function applyForRole(
  eventId: string,
  roleId: string,
  availability: string,
  experience: string,
  motivation: string,
): Promise<void> {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("You must be signed in to apply.");
  }

  /* ------------------------------- Event -------------------------------- */

  const { data: event, error: eventError } = await db
    .from("events")
    .select(
      `
      id,
      status,
      application_deadline
    `,
    )
    .eq("id", eventId)
    .maybeSingle();

  if (eventError || !event) {
    throw new Error("Event not found.");
  }

  if (event.status !== "published") {
    throw new Error("Applications are closed for this event.");
  }

  if (event.application_deadline && new Date(event.application_deadline) < new Date()) {
    throw new Error("The application deadline has passed.");
  }

  /* -------------------------------- Role --------------------------------- */

  const { data: role, error: roleError } = await db
    .from("event_roles")
    .select(
      `
      id,
      positions,
      filled_positions
    `,
    )
    .eq("id", roleId)
    .maybeSingle();

  if (roleError || !role) {
    throw new Error("Selected role not found.");
  }

  if (Number(role.filled_positions ?? 0) >= Number(role.positions ?? 0)) {
    throw new Error("This role is already full.");
  }

  /* -------------------------- Existing application ---------------------- */

  const { data: existing, error: existingError } = await db
    .from("applications")
    .select("id")
    .eq("profile_id", userId)
    .eq("event_id", eventId)
    .eq("role_id", roleId)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existing) {
    throw new Error("You have already applied for this role.");
  }

  /* -------------------------------- Insert ------------------------------- */

  const payload = {
    profile_id: userId,
    event_id: eventId,
    role_id: roleId,
    status: "pending" as const,
    availability,
    experience,
    motivation,
  };

  const { error: insertError } = await db.from("applications").insert(payload);

  if (insertError) {
    throw insertError;
  }
}

/* -------------------------------------------------------------------------- */
/* Dashboard Stats                                                            */
/* -------------------------------------------------------------------------- */

export async function getVolunteerStats() {
  const hours = await getVolunteerHours();

  return {
    totalHours: hours.total,
    currentYearHours: hours.current_year,
  };
}

export async function getVolunteerDashboard(): Promise<VolunteerDashboard> {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("You must be signed in.");
  }

  const [
    profileResult,
    applicationsResult,
    volunteerHoursResult,
    shiftsResult,
    certificatesResult,
    attendanceResult,
    trainingResult,
    accreditationResult,
    latestEventsResult,
  ] = await Promise.all([
    // --------------------------------
    // Profile
    // --------------------------------
    db
      .from("profiles")
      .select(
        `
        id,
        first_name,
        last_name,
        volunteer_hours,
        attendance_rate,
        phone,
        city,
        country,
        bio,
        interests,
        skills,
        languages,
        experience,
        avatar_url
      `,
      )
      .eq("id", userId)
      .single(),

    // --------------------------------
    // Applications
    // --------------------------------
    db
      .from("applications")
      .select(
        `
        id,
        status,
        applied_at,
        experience,
        availability,
        motivation,
        event_id,
        role_id,
        event:events(
          title,
          start_date,
          end_date,
          city,
          venue
        ),
        role:event_roles(name)
      `,
      )
      .eq("profile_id", userId)
      .order("applied_at", { ascending: false }),

    // --------------------------------
    // Volunteer Hours
    // --------------------------------
    db
      .from("volunteer_hours")
      .select(
        `
        id,
        hours,
        year,
        approved_by,
        event_id,
        shift_id,
        attendance_id
      `,
      )
      .eq("profile_id", userId),

    // --------------------------------
    // Assigned shifts
    // --------------------------------
    db
      .from("shift_assignments")
      .select(
        `
        id,
        status,
        assigned_at,
        shift:event_shifts(
          id,
          event_id,
          role_id,
          title,
          date,
          start_time,
          end_time,
          location,
          event:events(
            id,
            title,
            cover_url,
            city,
            venue
          ),
          role:event_roles(name)
        )
      `,
      )
      .eq("profile_id", userId)
      .eq("status", "assigned")
      .order("assigned_at", { ascending: true }),

    // --------------------------------
    // Certificates
    // --------------------------------
    db.from("certificates").select("id, hours").eq("profile_id", userId),

    // --------------------------------
    // Attendance
    // --------------------------------
    db.from("attendance_records").select("id, status").eq("profile_id", userId),

    // --------------------------------
    // Training progress
    // --------------------------------
    db.from("training_progress").select("training_id, completed").eq("profile_id", userId),

    // --------------------------------
    // Accreditations
    // --------------------------------
    db
      .from("accreditations")
      .select(
        `
        id,
        status,
        event_id,
        role_id
      `,
      )
      .eq("profile_id", userId),

    // --------------------------------
    // LATEST 3 EVENTS
    // --------------------------------
    db
      .from("events")
      .select(
        `
        id,
        title,
        cover_url,
        city,
        venue,
        start_date,
        end_date,
        status
      `,
      )
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  // --------------------------------
  // Errors
  // --------------------------------

  const error =
    profileResult.error ||
    applicationsResult.error ||
    volunteerHoursResult.error ||
    shiftsResult.error ||
    certificatesResult.error ||
    attendanceResult.error ||
    trainingResult.error ||
    accreditationResult.error ||
    latestEventsResult.error;

  if (error) {
    throw error;
  }

  // --------------------------------
  // Data
  // --------------------------------

  const profile = profileResult.data;

  const applications = applicationsResult.data ?? [];
  const volunteerHoursRows = volunteerHoursResult.data ?? [];
  const shifts = shiftsResult.data ?? [];
  const certificates = certificatesResult.data ?? [];
  const attendance = attendanceResult.data ?? [];
  const training = trainingResult.data ?? [];
  const accreditations = accreditationResult.data ?? [];
  const latestEvents = latestEventsResult.data ?? [];

  // ========================================
  // APPLICATIONS
  // ========================================

  const formattedApplications: Application[] = applications.map((row: any) => ({
    id: row.id,
    event_id: row.event_id,
    role_id: row.role_id,
    event_title: row.event?.title ?? "",
    role_name: row.role?.name ?? "",
    submitted_at: formatDate(row.applied_at),
    status: row.status,
    message:
      [row.motivation, row.experience, row.availability].filter(Boolean).join("\n\n") || null,
    availability: row.availability ?? null,
    experience: row.experience ?? null,
  }));

  // ========================================
  // LATEST 3 PLATFORM EVENTS
  // ========================================

  const upcomingEventsList: DashboardUpcomingEvent[] = latestEvents.map((event: any) => ({
    id: event.id,
    event_id: event.id,
    title: event.title ?? "",
    status: "available",
    date: formatDate(event.start_date),
    role: "Volunteer",
    shift: event.end_date
      ? `${formatDate(event.start_date)} - ${formatDate(event.end_date)}`
      : formatDate(event.start_date),
    location: [event.city, event.venue].filter(Boolean).join(" • ") || "",
    training: "Required",
    accreditation: "Pending",
    cover_url: event.cover_url ?? null,
  }));

  // ========================================
  // UPCOMING EVENT
  // ========================================

  let upcomingEvent = null;

  const firstEvent = latestEvents[0];

  if (firstEvent) {
    const accreditation = accreditations.find((item: any) => item.event_id === firstEvent.id);

    const trainingRequiredResult = await db
      .from("training_modules")
      .select("id, required")
      .eq("event_id", firstEvent.id);

    if (trainingRequiredResult.error) {
      throw trainingRequiredResult.error;
    }

    const requiredTraining = trainingRequiredResult.data ?? [];

    const completedTrainingIds = new Set(
      training.filter((item: any) => item.completed).map((item: any) => item.training_id),
    );

    const trainingComplete =
      requiredTraining.length === 0 ||
      requiredTraining.every((item: any) => completedTrainingIds.has(item.id));

    upcomingEvent = {
      title: firstEvent.title ?? "",
      status: "available",
      date: formatDate(firstEvent.start_date),
      role: "Volunteer",
      shift: firstEvent.end_date
        ? `${formatDate(firstEvent.start_date)} - ${formatDate(firstEvent.end_date)}`
        : formatDate(firstEvent.start_date),
      location: [firstEvent.city, firstEvent.venue].filter(Boolean).join(" • ") || "",
      training: trainingComplete ? "Complete" : "Required",
      accreditation: accreditation?.status ?? "Pending",
    };
  }

  // ========================================
  // STATISTICS
  // ========================================

  const volunteerHours = volunteerHoursRows.reduce(
    (total: number, row: any) => total + Number(row.hours ?? 0),
    0,
  );

  const attendanceRate = Number(profile?.attendance_rate ?? 0);

  const certificatesCount = certificates.length;

  const now = new Date();

  const upcomingAssignedShifts = shifts.filter((row: any) => {
    const date = row.shift?.date;

    if (!date) return false;

    return new Date(`${date}T23:59:59`) >= now;
  });

  const upcomingEvents = upcomingAssignedShifts.length;

  // ========================================
  // PROFILE COMPLETION
  // ========================================

  const profileFields = [
    profile?.first_name,
    profile?.last_name,
    profile?.phone,
    profile?.city,
    profile?.country,
    profile?.bio,
    profile?.experience,
    profile?.avatar_url,
  ];

  const filledFields = profileFields.filter(
    (value) => value !== null && value !== undefined && String(value).trim() !== "",
  ).length;

  const interestsCount = Array.isArray(profile?.interests) ? profile.interests.length : 0;

  const skillsCount = Array.isArray(profile?.skills) ? profile.skills.length : 0;

  const languagesCount = Array.isArray(profile?.languages) ? profile.languages.length : 0;

  let profileCompletion = Math.round(
    (filledFields / profileFields.length) * 70 +
      (Math.min(interestsCount, 3) / 3) * 10 +
      (Math.min(skillsCount, 3) / 3) * 10 +
      (Math.min(languagesCount, 2) / 2) * 10,
  );

  profileCompletion = Math.min(100, Math.max(0, profileCompletion));

  // ========================================
  // ACHIEVEMENTS
  // ========================================

  const achievements = [
    {
      title: "First Event",
      progress: volunteerHours > 0 ? 100 : 0,
      unlocked: volunteerHours > 0,
    },
    {
      title: "10 Volunteer Hours",
      progress: Math.min(100, Math.round((volunteerHours / 10) * 100)),
      unlocked: volunteerHours >= 10,
    },
    {
      title: "Perfect Attendance",
      progress: Math.min(100, Math.round(attendanceRate)),
      unlocked: attendanceRate >= 100,
    },
  ];

  // ========================================
  // RETURN
  // ========================================

  return {
    upcomingEvents,
    upcomingEventsList,
    volunteerHours,
    attendanceRate,
    certificates: certificatesCount,
    upcomingEvent,
    applications: formattedApplications,
    profileCompletion,
    achievements,
  };
}
