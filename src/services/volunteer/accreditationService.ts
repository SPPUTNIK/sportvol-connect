import { supabase } from "@/lib/supabase";
import { AccreditationRecord } from "@/lib/types";

type AccreditationRow = {
  id: string;
  profile_id: string;
  event_id: string;
  role_id: string;

  volunteer_identifier: string;
  zone: string | null;
  qr_code_data: string | null;
  status: string;

  created_at: string;
  updated_at: string;

  profiles: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;

  events: {
    title: string;
    city: string;
    country: string;
    venue: string;
    cover_url: string | null;
    start_date: string;
    end_date: string;
    start_time: string | null;
    end_time: string | null;
  } | null;

  event_roles: {
    name: string;
  } | null;
};

type ShiftAssignmentRow = {
  id: string;
  status: string;

  event_shifts: {
    id: string;
    title: string;
    location: string | null;
    date: string;
    start_time: string;
    end_time: string;
  } | null;
};

async function getCurrentUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error("You must be signed in.");
  }

  return user.id;
}

function getVolunteerName(
  profile: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null,
): string {
  if (!profile) {
    return "Volunteer";
  }

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim();

  return fullName || profile.email || "Volunteer";
}

export const accreditationService = {
  async getAccreditation(): Promise<AccreditationRecord | null> {
    const profileId = await getCurrentUserId();

    const { data, error } = await supabase
      .from("accreditations")
      .select(
        `
        id,
        profile_id,
        event_id,
        role_id,
        volunteer_identifier,
        zone,
        qr_code_data,
        status,
        created_at,
        updated_at,

        profiles (
          first_name,
          last_name,
          email
        ),

        events (
          title,
          city,
          country,
          venue,
          cover_url,
          start_date,
          end_date,
          start_time,
          end_time
        ),

        event_roles (
          name
        )
      `,
      )
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    const accreditation = data as unknown as AccreditationRow;

    let shiftData: ShiftAssignmentRow | null = null;

    /*
     * Accreditation does not contain shift_id in your schema.
     * Therefore we resolve the volunteer's assignment through
     * shift_assignments -> event_shifts.
     */
    const { data: assignment, error: assignmentError } = await supabase
      .from("shift_assignments")
      .select(
        `
          id,
          status,

          event_shifts (
            id,
            title,
            location,
            date,
            start_time,
            end_time
          )
        `,
      )
      .eq("profile_id", profileId)
      .eq("status", "assigned")
      .order("assigned_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (assignmentError) {
      throw assignmentError;
    }

    if (assignment) {
      shiftData = assignment as unknown as ShiftAssignmentRow;
    }

    const event = accreditation.events;
    const role = accreditation.event_roles;
    const profile = accreditation.profiles;

    if (!event) {
      throw new Error("The accreditation event could not be found.");
    }

    if (!role) {
      throw new Error("The accreditation role could not be found.");
    }

    const shift = shiftData?.event_shifts ?? null;

    return {
      id: accreditation.id,
      profile_id: accreditation.profile_id,
      event_id: accreditation.event_id,
      role_id: accreditation.role_id,

      volunteer_identifier: accreditation.volunteer_identifier,

      zone: accreditation.zone,

      qr_code_data: accreditation.qr_code_data,

      status: accreditation.status,

      created_at: accreditation.created_at,
      updated_at: accreditation.updated_at,

      volunteer_name: getVolunteerName(profile),

      volunteer_email: profile?.email ?? null,

      event_title: event.title,

      event_city: event.city,

      event_country: event.country,

      event_venue: event.venue,

      event_cover_url: event.cover_url ?? null,

      event_start_date: event.start_date,

      event_end_date: event.end_date,

      event_start_time: event.start_time ?? null,

      event_end_time: event.end_time ?? null,

      role_name: role.name,

      shift_id: shift?.id ?? null,

      shift_title: shift?.title ?? null,

      shift_location: shift?.location ?? null,

      shift_date: shift?.date ?? null,

      shift_start_time: shift?.start_time ?? null,

      shift_end_time: shift?.end_time ?? null,

      assignment_status: shiftData?.status ?? null,
    };
  },
};
