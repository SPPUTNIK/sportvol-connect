import { supabase } from "@/lib/supabase";

export type LeaderScanAction = "check-in" | "check-out";

export type LeaderProfile = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string | null;
  avatarUrl: string | null;
};

export type LeaderCommittee = {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  status: string;
  leader: string;
  memberCount: number;
};

export type LeaderEvent = {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  location: string;
  status: string;
  coverImage: string | null;
  committeeName: string;
  leaderName: string;
  startTime: string | null;
  endTime: string | null;
};

export type LeaderMember = {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  role: string;
  status: "Assigned" | "Checked in" | "Pending" | "On standby";
  assignedShift: string;
  attendance: string;
  feedbackStatus: "Submitted" | "Pending" | "Needs follow-up";
  committeeId?: string;
  eventId?: string;
};

export type LeaderShift = {
  id: string;
  title: string;
  location: string;
  startTime: string;
  endTime: string;
  status: "Open" | "Filled" | "Completed";
  assignedVolunteers: string[];
  capacity: number;
  summary: string;
};

export type LeaderScannerVolunteer = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  committeeId: string;
  eventId: string;
  accreditationQrCode: string;
  attendanceStatus: "not_checked_in" | "checked_in" | "checked_out";
  avatar: string | null;
  checkInTime?: string;
  checkOutTime?: string;
};

export type LeaderScanRecord = {
  id: string;
  volunteerId: string;
  volunteerName: string;
  role: string;
  status: "checked_in" | "checked_out";
  timestamp: string;
};

async function getCurrentUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user.id;
}

function getDisplayName(firstName: string | null, lastName: string | null) {
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  return fullName || "Volunteer";
}

function normalizeAttendanceStatus(value?: string | null): LeaderScannerVolunteer["attendanceStatus"] {
  switch (value) {
    case "checked_in":
      return "checked_in";
    case "checked_out":
      return "checked_out";
    default:
      return "not_checked_in";
  }
}

function toStatusLabel(status: string | null): LeaderMember["status"] {
  switch (status) {
    case "checked_in":
      return "Checked in";
    case "assigned":
      return "Assigned";
    case "pending":
      return "Pending";
    default:
      return "On standby";
  }
}

function toFeedbackStatus(status: string | null): LeaderMember["feedbackStatus"] {
  switch (status) {
    case "submitted":
      return "Submitted";
    case "needs_follow_up":
      return "Needs follow-up";
    case "pending":
    default:
      return "Pending";
  }
}

export const leaderService = {
  async getCurrentLeaderProfile(): Promise<LeaderProfile | null> {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email, avatar_url, role")
      .eq("id", userId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      firstName: data.first_name ?? "Leader",
      lastName: data.last_name ?? "",
      role: String(data.role ?? "leader"),
      email: data.email,
      avatarUrl: data.avatar_url,
    };
  },

  async getCurrentCommittee(): Promise<LeaderCommittee | null> {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from("committees")
      .select(`*, event:events(id, title, description, start_date, end_date, city, venue, cover_url, status, start_time, end_time)`) 
      .eq("leader_profile_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    const event = Array.isArray((data as any).event) ? (data as any).event[0] : (data as any).event;

    return {
      id: data.id,
      eventId: data.event_id,
      name: data.name,
      description: data.description,
      status: String(data.status ?? "active"),
      leader: getDisplayName((await this.getCurrentLeaderProfile())?.firstName ?? null, (await this.getCurrentLeaderProfile())?.lastName ?? null),
      memberCount: 0,
    };
  },

  async getCurrentEvent(): Promise<LeaderEvent | null> {
    const committee = await this.getCurrentCommittee();
    if (!committee) return null;

    const { data, error } = await supabase
      .from("events")
      .select("id, title, description, start_date, end_date, city, venue, cover_url, status, start_time, end_time")
      .eq("id", committee.eventId)
      .maybeSingle();

    if (error || !data) return null;

    const leader = await this.getCurrentLeaderProfile();

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      startDate: data.start_date,
      endDate: data.end_date,
      location: [data.city, data.venue].filter(Boolean).join(", ") || "TBD",
      status: String(data.status ?? "published"),
      coverImage: data.cover_url,
      committeeName: committee.name,
      leaderName: leader ? `${leader.firstName} ${leader.lastName}`.trim() : committee.leader,
      startTime: data.start_time,
      endTime: data.end_time,
    };
  },

  async getCommitteeMembers(): Promise<LeaderMember[]> {
    const committee = await this.getCurrentCommittee();
    if (!committee) return [];

    const { data, error } = await supabase
      .from("committee_members")
      .select(`*, profile:profiles(id, first_name, last_name, avatar_url)`) 
      .eq("committee_id", committee.id)
      .eq("status", "assigned")
      .order("joined_at", { ascending: true });

    if (error || !data) return [];

    const members: LeaderMember[] = [];

    for (const row of data as any[]) {
      const profile = row.profile ?? null;
      const memberId = row.profile_id;

      const { data: attendanceData } = await supabase
        .from("attendance_records")
        .select("status, check_in_time, check_out_time")
        .eq("profile_id", memberId)
        .eq("event_id", committee.eventId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: shiftData } = await supabase
        .from("shift_assignments")
        .select(`event_shifts(title, location, start_time, end_time)`) 
        .eq("profile_id", memberId)
        .eq("status", "assigned")
        .order("assigned_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const shift = (shiftData as any)?.event_shifts ?? null;
      const attendance = attendanceData?.status ?? "scheduled";

      members.push({
        id: memberId,
        firstName: profile?.first_name ?? "Volunteer",
        lastName: profile?.last_name ?? "",
        avatar: profile?.avatar_url ?? null,
        role: "Volunteer",
        status: toStatusLabel(attendance),
        assignedShift: shift?.title ?? "Unassigned",
        attendance: `${Math.max(0, Math.min(100, Number(attendanceData?.status ? 92 : 0) || 0))}%`,
        feedbackStatus: "Pending",
        committeeId: committee.id,
        eventId: committee.eventId,
      });
    }

    return members;
  },

  async getEventShifts(): Promise<LeaderShift[]> {
    const committee = await this.getCurrentCommittee();
    if (!committee) return [];

    const { data, error } = await supabase
      .from("event_shifts")
      .select(`*, role:event_roles(name), assignments:shift_assignments(profile_id, status)`) 
      .eq("event_id", committee.eventId)
      .order("date", { ascending: true });

    if (error || !data) return [];

    return (data as any[]).map((shift) => {
      const assigned = (shift.assignments ?? []).filter((item: any) => item.status === "assigned");
      return {
        id: shift.id,
        title: shift.title,
        location: shift.location ?? "TBD",
        startTime: shift.start_time,
        endTime: shift.end_time,
        status: assigned.length >= shift.capacity ? "Filled" : "Open",
        assignedVolunteers: assigned.map((_: any) => "Volunteer"),
        capacity: shift.capacity ?? 0,
        summary: shift.instructions ?? "Shift coverage for committee operations.",
      };
    });
  },

  async getRecentScans(): Promise<LeaderScanRecord[]> {
    const committee = await this.getCurrentCommittee();
    if (!committee) return [];

    const { data, error } = await supabase
      .from("attendance_records")
      .select(`id, profile_id, status, updated_at, profile:profiles(first_name, last_name), event:event_roles(name)`) 
      .eq("event_id", committee.eventId)
      .order("updated_at", { ascending: false })
      .limit(5);

    if (error || !data) return [];

    return (data as any[]).map((record) => ({
      id: record.id,
      volunteerId: record.profile_id,
      volunteerName: getDisplayName(record.profile?.first_name, record.profile?.last_name),
      role: record.event?.name ?? "Volunteer",
      status: record.status === "checked_out" ? "checked_out" : "checked_in",
      timestamp: record.updated_at,
    }));
  },

  async getAuthorizedVolunteers(): Promise<LeaderScannerVolunteer[]> {
    const members = await this.getCommitteeMembers();
    return members.map((member) => ({
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      role: member.role,
      committeeId: member.committeeId ?? "",
      eventId: member.eventId ?? "",
      accreditationQrCode: member.id,
      attendanceStatus: normalizeAttendanceStatus("not_checked_in"),
      avatar: member.avatar,
    }));
  },

  async getScannerVolunteers(): Promise<LeaderScannerVolunteer[]> {
    return this.getAuthorizedVolunteers();
  },

  async getVolunteerById(id: string): Promise<LeaderScannerVolunteer | null> {
    const volunteers = await this.getScannerVolunteers();
    return volunteers.find((volunteer) => volunteer.id === id) ?? null;
  },

  async getVolunteerByQrCode(qrCode: string): Promise<LeaderScannerVolunteer | null> {
    const committee = await this.getCurrentCommittee();
    if (!committee) return null;

    const { data, error } = await supabase
      .from("accreditations")
      .select(`id, profile_id, qr_code_data, profile:profiles(first_name, last_name, avatar_url)`) 
      .eq("event_id", committee.eventId)
      .eq("qr_code_data", qrCode)
      .maybeSingle();

    if (error || !data) return null;

    const profile = (data as any).profile ?? null;
    return {
      id: data.profile_id,
      firstName: profile?.first_name ?? "Volunteer",
      lastName: profile?.last_name ?? "",
      role: "Volunteer",
      committeeId: committee.id,
      eventId: committee.eventId,
      accreditationQrCode: qrCode,
      attendanceStatus: normalizeAttendanceStatus("not_checked_in"),
      avatar: profile?.avatar_url ?? null,
    };
  },

  async updateAttendanceStatus(
    volunteer: LeaderScannerVolunteer,
    action: LeaderScanAction,
  ): Promise<LeaderScannerVolunteer> {
    const nextStatus = action === "check-in" ? "checked_in" : "checked_out";
    const now = new Date().toISOString();

    const { data: existing } = await supabase
      .from("attendance_records")
      .select("id")
      .eq("profile_id", volunteer.id)
      .eq("event_id", volunteer.eventId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("attendance_records")
        .update({
          status: nextStatus,
          check_in_time: action === "check-in" ? now : existing.check_in_time ?? now,
          check_out_time: action === "check-out" ? now : null,
          updated_at: now,
        })
        .eq("id", existing.id);

      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("attendance_records").insert({
        profile_id: volunteer.id,
        event_id: volunteer.eventId,
        role_id: (await supabase.from("event_roles").select("id").eq("event_id", volunteer.eventId).limit(1).maybeSingle()).data?.id ?? "",
        shift_id: (await supabase.from("shift_assignments").select("shift_id").eq("profile_id", volunteer.id).eq("status", "assigned").limit(1).maybeSingle()).data?.shift_id ?? "",
        date: new Date().toISOString().slice(0, 10),
        status: nextStatus,
        check_in_time: action === "check-in" ? now : null,
        check_out_time: action === "check-out" ? now : null,
      });

      if (error) throw new Error(error.message);
    }

    return {
      ...volunteer,
      attendanceStatus: nextStatus,
      checkInTime: action === "check-in" ? now : volunteer.checkInTime,
      checkOutTime: action === "check-out" ? now : volunteer.checkOutTime,
    };
  },

  createRecentScan(volunteer: LeaderScannerVolunteer, action: LeaderScanAction): LeaderScanRecord {
    const status = action === "check-in" ? "checked_in" : "checked_out";
    return {
      id: `scan-${Date.now()}`,
      volunteerId: volunteer.id,
      volunteerName: `${volunteer.firstName} ${volunteer.lastName}`,
      role: volunteer.role,
      status,
      timestamp: new Date().toISOString(),
    };
  },
};

export default leaderService;
