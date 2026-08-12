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
} from "@/lib/types";

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
    .single();

  if (error) {
    if (error.details?.includes("No rows")) {
      return null;
    }
    throw error;
  }

  return data;
}

export async function getApplications(): Promise<Application[]> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return [];
  }

  const { data, error } = await db
    .from("applications")
    .select(
      "id, status, applied_at, experience, availability, motivation, event_id, role_id, event:events(title), role:event_roles(name)",
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
    message: [row.motivation, row.experience, row.availability].filter(Boolean).join("\n\n") || null,
  }));
}

export async function getAcceptedEvents(): Promise<Event[]> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return [];
  }

  const { data, error } = await db
    .from("applications")
    .select("event:events(*, event_roles(*))")
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

export async function getShifts(): Promise<Shift[]> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return [];
  }

  const { data, error } = await db
    .from("shift_assignments")
    .select(
      "id, shift:event_shifts(id, event_id, role_id, date, start_time, end_time, location, instructions, event:events(title), role:event_roles(name))",
    )
    .eq("profile_id", userId)
    .order("shift.date", { ascending: true });

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

export async function getTraining(): Promise<Training[]> {
  const userId = await getCurrentUserId();
  const [{ data: modules, error: moduleError }, { data: progress, error: progressError }] =
    await Promise.all([
      db.from("training_modules").select("id, title, description, resources").order("title", { ascending: true }),
      userId
        ? db
            .from("training_progress")
            .select("training_id, completed")
            .eq("profile_id", userId)
        : Promise.resolve({ data: [], error: null }),
    ] as const);

  if (moduleError || progressError) {
    throw moduleError ?? progressError;
  }

  const progressMap = new Map(
    (progress ?? []).map((item: any) => [item.training_id, item.completed]),
  );

  return (modules ?? []).map((module: any) => ({
    id: module.id,
    title: module.title,
    description: module.description,
    resources: module.resources as TrainingResource[],
    completed: Boolean(progressMap.get(module.id)),
  }));
}

export async function getAttendance(): Promise<AttendanceRecord[]> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return [];
  }

  const { data, error } = await db
    .from("attendance_records")
    .select(
      "id, date, status, check_in_time, check_out_time, event:events(title), role:event_roles(name)",
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
    date: formatDate(row.date),
    status: row.status,
    check_in_time: row.check_in_time ?? null,
    check_out_time: row.check_out_time ?? null,
  }));
}

export async function getCertificates(): Promise<Certificate[]> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return [];
  }

  const { data, error } = await db
    .from("certificates")
    .select("id, hours, date, certificate_id, event:events(title), role:event_roles(name)")
    .eq("profile_id", userId)
    .order("date", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    event_title: row.event?.title ?? "",
    role_name: row.role?.name ?? "",
    hours: row.hours ?? 0,
    date: formatDate(row.date),
    certificate_id: row.certificate_id ?? "",
  }));
}

export async function getNotifications(): Promise<Notification[]> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return [];
  }

  const { data, error } = await db
    .from("notifications")
    .select("id, title, body, read, category, created_at, event_id")
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

  const { data, error } = await db
    .from("certificates")
    .select("hours, event:events(title, sport, start_date)")
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
    const eventTitle = row.event?.title ?? "Unknown event";
    const sport = row.event?.sport ?? "Unknown sport";
    const startDate = row.event?.start_date ?? "";

    byEvent.set(eventTitle, (byEvent.get(eventTitle) ?? 0) + hours);
    bySport.set(sport, (bySport.get(sport) ?? 0) + hours);

    if (startDate.startsWith(String(currentYear))) {
      currentYearTotal += hours;
    }
  });

  return {
    total,
    current_year: currentYearTotal,
    by_sport: Array.from(bySport.entries()).map(([label, value]) => ({ label, value })),
    by_event: Array.from(byEvent.entries()).map(([label, value]) => ({ label, value })),
  };
}

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

  const { data: event, error: eventError } = await db
    .from("events")
    .select("id, status, application_deadline")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    throw new Error("Event not found.");
  }

  if (event.status !== "published") {
    throw new Error("Applications are closed for this event.");
  }

  if (event.application_deadline && new Date(event.application_deadline) < new Date()) {
    throw new Error("The application deadline has passed.");
  }

  const { data: role, error: roleError } = await db
    .from("event_roles")
    .select("id, positions, filled_positions")
    .eq("id", roleId)
    .single();

  if (roleError || !role) {
    throw new Error("Selected role not found.");
  }

  if (role.filled_positions >= role.positions) {
    throw new Error("This role is already full.");
  }

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

  const payload = { profile_id: userId, event_id: eventId, role_id: roleId, status: "pending" as const, availability, experience, motivation };
  const { error: insertError } = await db.from("applications").insert(payload);
  if (insertError) {
    throw insertError;
  }
}

export async function getVolunteerStats() {
  const hours = await getVolunteerHours();
  return { totalHours: hours.total, currentYearHours: hours.current_year };
}



