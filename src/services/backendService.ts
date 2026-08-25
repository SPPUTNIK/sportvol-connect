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

async function getCurrentUserId(): Promise<string | null> {
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

export async function getEventBySlug(
  slug: string,
): Promise<Event | null> {
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
    .select(`
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
    `)
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
      [
        row.motivation,
        row.experience,
        row.availability,
      ]
        .filter(Boolean)
        .join("\n\n") || null,
  }));
}

export async function getAcceptedEvents(): Promise<Event[]> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const { data, error } = await db
    .from("applications")
    .select(`
      event:events(
        *,
        event_roles(*)
      )
    `)
    .eq("profile_id", userId)
    .eq("status", "accepted")
    .order("applied_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? [])
    .map((row: any) => row.event as Event)
    .filter(Boolean);
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
    .select(`
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
    `)
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

  const [
    { data: modules, error: moduleError },
    { data: progress, error: progressError },
  ] = await Promise.all([
    db
      .from("training_modules")
      .select(`
        id,
        title,
        description,
        resources,
        required,
        event_id,
        role_id
      `)
      .order("title", { ascending: true }),

    userId
      ? db
          .from("training_progress")
          .select(`
            training_id,
            completed,
            completed_at
          `)
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
    (progress ?? []).map((item: any) => [
      item.training_id,
      Boolean(item.completed),
    ]),
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
    .select(`
      id,
      date,
      status,
      check_in_time,
      check_out_time,
      event:events(title),
      role:event_roles(name)
    `)
    .eq("profile_id", userId)
    .order("date", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    event_title: row.event?.title ?? "",
    role_name: row.role?.name ?? "",
    date: formatDate(row.date),
    status: row.status,
    check_in_time: row.check_in_time ?? null,
    check_out_time: row.check_out_time ?? null,
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
    .select(`
      id,
      hours,
      date,
      certificate_id,
      issued_at,
      event:events(title),
      role:event_roles(name)
    `)
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
    .select(`
      id,
      title,
      body,
      read,
      category,
      created_at,
      event_id,
      application_id
    `)
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
      by_sport: [],
      by_event: [],
    };
  }

  /*
   * IMPORTANT:
   *
   * volunteer_hours is the source of truth for volunteer hours.
   * certificates are certificates, not the complete hours ledger.
   */

  const { data, error } = await db
    .from("volunteer_hours")
    .select(`
      hours,
      year,
      event:events(
        title,
        sport,
        start_date
      )
    `)
    .eq("profile_id", userId);

  if (error) {
    throw error;
  }

  const rows = data ?? [];
  const currentYear = new Date().getFullYear();

  let total = 0;
  let currentYearTotal = 0;

  const bySport = new Map<string, number>();
  const byEvent = new Map<string, number>();

  rows.forEach((row: any) => {
    const hours = Number(row.hours ?? 0);

    total += hours;

    const eventTitle =
      row.event?.title ?? "Unknown event";

    const sport =
      row.event?.sport ?? "Unknown sport";

    byEvent.set(
      eventTitle,
      (byEvent.get(eventTitle) ?? 0) + hours,
    );

    bySport.set(
      sport,
      (bySport.get(sport) ?? 0) + hours,
    );

    /*
     * Prefer the explicit year column from volunteer_hours.
     */
    if (Number(row.year) === currentYear) {
      currentYearTotal += hours;
    }
  });

  return {
    total,
    current_year: currentYearTotal,

    by_sport: Array.from(bySport.entries()).map(
      ([label, value]) => ({
        label,
        value,
      }),
    ),

    by_event: Array.from(byEvent.entries()).map(
      ([label, value]) => ({
        label,
        value,
      }),
    ),
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
    .select(`
      id,
      status,
      application_deadline
    `)
    .eq("id", eventId)
    .maybeSingle();

  if (eventError || !event) {
    throw new Error("Event not found.");
  }

  if (event.status !== "published") {
    throw new Error("Applications are closed for this event.");
  }

  if (
    event.application_deadline &&
    new Date(event.application_deadline) < new Date()
  ) {
    throw new Error("The application deadline has passed.");
  }

  /* -------------------------------- Role --------------------------------- */

  const { data: role, error: roleError } = await db
    .from("event_roles")
    .select(`
      id,
      positions,
      filled_positions
    `)
    .eq("id", roleId)
    .maybeSingle();

  if (roleError || !role) {
    throw new Error("Selected role not found.");
  }

  if (
    Number(role.filled_positions ?? 0) >=
    Number(role.positions ?? 0)
  ) {
    throw new Error("This role is already full.");
  }

  /* -------------------------- Existing application ---------------------- */

  const {
    data: existing,
    error: existingError,
  } = await db
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
    throw new Error(
      "You have already applied for this role.",
    );
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

  const { error: insertError } = await db
    .from("applications")
    .insert(payload);

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
      .select(`
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
      `)
      .eq("id", userId)
      .single(),

    // --------------------------------
    // Applications
    // --------------------------------
    db
      .from("applications")
      .select(`
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
      `)
      .eq("profile_id", userId)
      .order("applied_at", { ascending: false }),

    // --------------------------------
    // Assigned shifts
    // --------------------------------
    db
      .from("shift_assignments")
      .select(`
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
      `)
      .eq("profile_id", userId)
      .eq("status", "assigned")
      .order("assigned_at", { ascending: true }),

    // --------------------------------
    // Certificates
    // --------------------------------
    db
      .from("certificates")
      .select("id, hours")
      .eq("profile_id", userId),

    // --------------------------------
    // Attendance
    // --------------------------------
    db
      .from("attendance_records")
      .select("id, status")
      .eq("profile_id", userId),

    // --------------------------------
    // Training progress
    // --------------------------------
    db
      .from("training_progress")
      .select("training_id, completed")
      .eq("profile_id", userId),

    // --------------------------------
    // Accreditations
    // --------------------------------
    db
      .from("accreditations")
      .select(`
        id,
        status,
        event_id,
        role_id
      `)
      .eq("profile_id", userId),

    // --------------------------------
    // LATEST 3 EVENTS ON PLATFORM
    // --------------------------------
    db
      .from("events")
      .select(`
        id,
        title,
        cover_url,
        city,
        venue,
        start_date,
        end_date,
        status
      `)
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
  const shifts = shiftsResult.data ?? [];
  const certificates = certificatesResult.data ?? [];
  const attendance = attendanceResult.data ?? [];
  const training = trainingResult.data ?? [];
  const accreditations = accreditationResult.data ?? [];
  const latestEvents = latestEventsResult.data ?? [];

  // ========================================
  // APPLICATIONS
  // ========================================

  const formattedApplications: Application[] = applications.map(
    (row: any) => ({
      id: row.id,
      event_id: row.event_id,
      event_title: row.event?.title ?? "",
      role_name: row.role?.name ?? "",
      submitted_at: formatDate(row.applied_at),
      status: row.status,
      message:
        [row.motivation, row.experience, row.availability]
          .filter(Boolean)
          .join("\n\n") || null,
    }),
  );

  // ========================================
  // LATEST 3 PLATFORM EVENTS
  // ========================================

  const upcomingEventsList: DashboardUpcomingEvent[] =
    latestEvents.map((event: any) => ({
      id: event.id,
      event_id: event.id,
      title: event.title ?? "",
      status: "available",
      date: formatDate(event.start_date),
      role: "Volunteer",
      shift: event.end_date
        ? `${formatDate(event.start_date)} - ${formatDate(event.end_date)}`
        : formatDate(event.start_date),
      location:
        [event.city, event.venue]
          .filter(Boolean)
          .join(" • ") || "",
      training: "Required",
      accreditation: "Pending",
      cover_url: event.cover_url ?? null,
    }));

  // ========================================
  // UPCOMING EVENT
  // First/latest published platform event
  // ========================================

  let upcomingEvent = null;

  const firstEvent = latestEvents[0];

  if (firstEvent) {
    // Check if current volunteer already has accreditation
    const accreditation = accreditations.find(
      (item: any) => item.event_id === firstEvent.id,
    );

    // Get required training for this event
    const trainingRequiredResult = await db
      .from("training_modules")
      .select("id, required")
      .eq("event_id", firstEvent.id);

    if (trainingRequiredResult.error) {
      throw trainingRequiredResult.error;
    }

    const requiredTraining =
      trainingRequiredResult.data ?? [];

    const completedTrainingIds = new Set(
      training
        .filter((item: any) => item.completed)
        .map((item: any) => item.training_id),
    );

    const trainingComplete =
      requiredTraining.length === 0 ||
      requiredTraining.every((item: any) =>
        completedTrainingIds.has(item.id),
      );

    upcomingEvent = {
      title: firstEvent.title ?? "",
      status: "available",
      date: formatDate(firstEvent.start_date),
      role: "Volunteer",
      shift: firstEvent.end_date
        ? `${formatDate(firstEvent.start_date)} - ${formatDate(
            firstEvent.end_date,
          )}`
        : formatDate(firstEvent.start_date),
      location:
        [firstEvent.city, firstEvent.venue]
          .filter(Boolean)
          .join(" • ") || "",
      training: trainingComplete ? "Complete" : "Required",
      accreditation: accreditation?.status ?? "Pending",
    };
  }

  // ========================================
  // STATISTICS
  // ========================================

  const volunteerHours = Number(
    profile?.volunteer_hours ?? 0,
  );

  const attendanceRate = Number(
    profile?.attendance_rate ?? 0,
  );

  const certificatesCount = certificates.length;

  // Number of upcoming assigned shifts
  const now = new Date();

  const upcomingAssignedShifts = shifts.filter(
    (row: any) => {
      const date = row.shift?.date;

      if (!date) return false;

      return new Date(`${date}T23:59:59`) >= now;
    },
  );

  const upcomingEvents =
    upcomingAssignedShifts.length;

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
    (value) =>
      value !== null &&
      value !== undefined &&
      String(value).trim() !== "",
  ).length;

  const interestsCount = Array.isArray(
    profile?.interests,
  )
    ? profile.interests.length
    : 0;

  const skillsCount = Array.isArray(profile?.skills)
    ? profile.skills.length
    : 0;

  const languagesCount = Array.isArray(
    profile?.languages,
  )
    ? profile.languages.length
    : 0;

  let profileCompletion = Math.round(
    (filledFields / profileFields.length) * 70 +
      (Math.min(interestsCount, 3) / 3) * 10 +
      (Math.min(skillsCount, 3) / 3) * 10 +
      (Math.min(languagesCount, 2) / 2) * 10,
  );

  profileCompletion = Math.min(
    100,
    Math.max(0, profileCompletion),
  );

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
      progress: Math.min(
        100,
        Math.round((volunteerHours / 10) * 100),
      ),
      unlocked: volunteerHours >= 10,
    },

    {
      title: "Perfect Attendance",
      progress: Math.min(
        100,
        Math.round(attendanceRate),
      ),
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