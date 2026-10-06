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
  status:
    | "Assigned"
    | "Checked in"
    | "Pending"
    | "On standby";
  assignedShift: string;
  attendance: string;
  feedbackStatus:
    | "Submitted"
    | "Pending"
    | "Needs follow-up"
    | "Not available";
  feedbackSubmitted: boolean;
  committeeId: string;
  eventId: string;
};

export type LeaderShift = {
  id: string;
  committeeId: string;
  eventId: string;
  title: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "Open" | "Filled" | "Completed";
  assignedVolunteers: string[];
  capacity: number;
  summary: string;
};

export type LeaderShiftMember = {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  role: string;
  assignmentStatus: string;
  attendanceStatus:
    | "Assigned"
    | "Checked in"
    | "Checked out"
    | "Absent";
  checkInTime: string | null;
  checkOutTime: string | null;
};

export type LeaderShiftDetails = LeaderShift & {
  members: LeaderShiftMember[];
};

export type LeaderScannerVolunteer = {
  id: string;
  firstName: string;
  lastName: string;

  role: string;
  roleId?: string;

  committeeId: string;
  committeeName?: string;

  eventId: string;
  eventTitle?: string;

  shiftId?: string;
  shiftTitle?: string;

  accreditationQrCode: string;

  attendanceStatus:
    | "not_checked_in"
    | "checked_in"
    | "checked_out";

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

type VolunteerQrLookupResult =
  | {
      ok: true;
      volunteer: LeaderScannerVolunteer;
    }
  | {
      ok: false;
      reason: string;
    };

async function getCurrentUserId(): Promise<string | null> {
  const { data, error } =
    await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return data.user.id;
}

function getDisplayName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
): string {
  const fullName = [
    firstName,
    lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || "Volunteer";
}

function getMoroccoCalendarDate(date = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Africa/Casablanca",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function isLeaderFeedExpired(eventEndDate: string | null | undefined, graceDays = 1): boolean {
  if (!eventEndDate) {
    return false;
  }

  const currentDate = new Date(`${getMoroccoCalendarDate()}T00:00:00`);
  const cutoffDate = new Date(`${eventEndDate}T00:00:00`);
  cutoffDate.setDate(cutoffDate.getDate() + graceDays);

  return currentDate.getTime() > cutoffDate.getTime();
}

function isLeaderShiftExpired(shiftDate: string | null | undefined, endTime: string | null | undefined, graceDays = 1): boolean {
  if (!shiftDate) {
    return false;
  }

  const normalizedEndTime = String(endTime ?? "").trim();
  const shiftEndValue = normalizedEndTime.includes(":") ? normalizedEndTime : `${normalizedEndTime}:00`;
  const endDateTime = new Date(`${shiftDate}T${shiftEndValue || "00:00:00"}`);

  if (Number.isNaN(endDateTime.getTime())) {
    return false;
  }

  const cutoffTime = endDateTime.getTime() + 1000 * 60 * 60 * 24 * graceDays;
  return Date.now() > cutoffTime;
}

/**
 * Returns the current date/time in Morocco.
 *
 * We explicitly use Africa/Casablanca instead of relying on
 * the browser/server timezone.
 */
function getMoroccoDateTime() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Casablanca",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const getPart = (type: string): string =>
    parts.find(
      (part) => part.type === type,
    )?.value ?? "00";

  const year = getPart("year");
  const month = getPart("month");
  const day = getPart("day");
  const hour = getPart("hour");
  const minute = getPart("minute");
  const second = getPart("second");

  return {
    date: `${year}-${month}-${day}`,
    time: `${hour}:${minute}:${second}`,
    hours: Number(hour),
    minutes: Number(minute),
    seconds: Number(second),
  };
}

/**
 * Database attendance enum:
 *
 * scheduled
 * checked-in
 * checked-out
 * absent
 * late
 */
function normalizeAttendanceStatus(
  value?: string | null,
): LeaderScannerVolunteer["attendanceStatus"] {
  switch (value) {
    case "checked-in":
      return "checked_in";

    case "checked-out":
      return "checked_out";

    default:
      return "not_checked_in";
  }
}

function toStatusLabel(
  status: string | null | undefined,
): LeaderMember["status"] {
  switch (status) {
    case "checked-in":
      return "Checked in";

    case "assigned":
      return "Assigned";

    case "pending":
      return "Pending";

    case "absent":
      return "Pending";

    case "late":
      return "On standby";

    case "checked-out":
      return "Assigned";

    default:
      return "Assigned";
  }
}

function toFeedbackStatus(
  status: string | null | undefined,
): LeaderMember["feedbackStatus"] {
  switch (status) {
    case "submitted":
      return "Submitted";

    case "needs_follow_up":
      return "Needs follow-up";

    case "pending":
      return "Pending";

    case "not_available":
      return "Not available";

    default:
      return "Pending";
  }
}

/**
 * Feedback becomes available only after the event has fully ended.
 *
 * The event end date/time is interpreted using Morocco time.
 */
function isFeedbackWindowOpen(
  endDate: string,
  endTime?: string | null,
): boolean {
  if (!endDate) {
    return false;
  }

  const normalizedEndTime =
    endTime?.slice(0, 8) ||
    "23:59:59";

  const [
    endHour,
    endMinute,
    endSecond,
  ] = normalizedEndTime
    .split(":")
    .map(Number);

  if (
    Number.isNaN(endHour) ||
    Number.isNaN(endMinute) ||
    Number.isNaN(endSecond)
  ) {
    return false;
  }

  const now =
    getMoroccoDateTime();

  if (now.date !== endDate) {
    return now.date > endDate;
  }

  const currentSeconds =
    now.hours * 3600 +
    now.minutes * 60 +
    now.seconds;

  const eventEndSeconds =
    endHour * 3600 +
    endMinute * 60 +
    endSecond;

  return (
    currentSeconds >=
    eventEndSeconds
  );
}

export const leaderService = {
  // ============================================================
  // PROFILE
  // ============================================================

  async getCurrentLeaderProfile(): Promise<LeaderProfile | null> {
    const userId =
      await getCurrentUserId();

    if (!userId) {
      return null;
    }

    const { data, error } =
      await supabase
        .from("profiles")
        .select(`
          id,
          first_name,
          last_name,
          email,
          avatar_url,
          role
        `)
        .eq("id", userId)
        .maybeSingle();

    if (error) {
      console.error(
        "Failed to load leader profile:",
        error,
      );

      return null;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      firstName:
        data.first_name ?? "Leader",
      lastName:
        data.last_name ?? "",
      role:
        String(data.role ?? "leader"),
      email:
        data.email ?? null,
      avatarUrl:
        data.avatar_url ?? null,
    };
  },

  // ============================================================
  // COMMITTEES
  // ============================================================

  async getLeaderCommittees(): Promise<
    LeaderCommittee[]
  > {
    const userId = await getCurrentUserId();

    if (!userId) {
      return [];
    }

    const { data, error } = await supabase
      .from("committees")
      .select(`
        id,
        event_id,
        name,
        description,
        leader_profile_id,
        status,
        created_at
      `)
      .eq("leader_profile_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return [];
    }

    if (!data?.length) {
      return [];
    }

    const leader =
      await this.getCurrentLeaderProfile();

    const committees: LeaderCommittee[] =
      [];

    for (const committee of data) {
      const { count, error: countError } =
        await supabase
          .from("committee_members")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq(
            "committee_id",
            committee.id,
          )
          .eq("status", "assigned");

      if (countError) {
        console.error(
          "Failed to count committee members:",
          countError,
        );
      }

      committees.push({
        id: committee.id,
        eventId:
          committee.event_id,
        name:
          committee.name,
        description:
          committee.description ?? null,
        status:
          String(
            committee.status ??
              "active",
          ),
        leader: leader
          ? getDisplayName(
              leader.firstName,
              leader.lastName,
            )
          : "Leader",
        memberCount:
          count ?? 0,
      });
    }

    return committees;
  },

  async getCurrentCommittee(): Promise<
    LeaderCommittee | null
  > {
    const committees =
      await this.getLeaderCommittees();

    return committees[0] ?? null;
  },

  // ============================================================
  // EVENTS
  // ============================================================

  async getLeaderEvents(): Promise<
    LeaderEvent[]
  > {
    const committees =
      await this.getLeaderCommittees();

    if (!committees.length) {
      return [];
    }

    const eventIds = [
      ...new Set(
        committees
          .map(
            (committee) =>
              committee.eventId,
          )
          .filter(Boolean),
      ),
    ];

    if (!eventIds.length) {
      return [];
    }

    const { data: events, error } =
      await supabase
        .from("events")
        .select(`
          id,
          title,
          description,
          start_date,
          end_date,
          city,
          country,
          venue,
          status,
          cover_url,
          start_time,
          end_time
        `)
        .in("id", eventIds);

    const visibleEvents = (events ?? []).filter((event) => !isLeaderFeedExpired(event.end_date, 1));

    if (error) {
      console.error(
        "Failed to load leader events:",
        error,
      );

      return [];
    }

    if (!events?.length) {
      return [];
    }

    const committeesByEvent =
      new Map<
        string,
        LeaderCommittee[]
      >();

    for (const committee of committees) {
      const existing =
        committeesByEvent.get(
          committee.eventId,
        ) ?? [];

      existing.push(committee);

      committeesByEvent.set(
        committee.eventId,
        existing,
      );
    }

    return visibleEvents
      .map((event) => {
        const eventCommittees =
          committeesByEvent.get(
            event.id,
          ) ?? [];

        const primaryCommittee =
          eventCommittees[0];

        return {
          id:
            event.id,

          title:
            event.title,

          description:
            event.description ?? null,

          startDate:
            event.start_date ?? "",

          endDate:
            event.end_date ?? "",

          location:
            [
              event.venue,
              event.city,
              event.country,
            ]
              .filter(Boolean)
              .join(" — ") || "TBD",

          status:
            String(
              event.status ??
                "draft",
            ),

          coverImage:
            event.cover_url ?? null,

          committeeName:
            primaryCommittee?.name ??
            "Committee",

          leaderName:
            primaryCommittee?.leader ??
            "Leader",

          startTime:
            event.start_time ?? null,

          endTime:
            event.end_time ?? null,
        };
      })
      .sort((a, b) => {
        const dateA =
          a.startDate
            ? new Date(
                a.startDate,
              ).getTime()
            : Number.MAX_SAFE_INTEGER;

        const dateB =
          b.startDate
            ? new Date(
                b.startDate,
              ).getTime()
            : Number.MAX_SAFE_INTEGER;

        return dateA - dateB;
      });
  },

  async getCurrentEvent(): Promise<
    LeaderEvent | null
  > {
    const committee =
      await this.getCurrentCommittee();

    if (!committee?.eventId) {
      return null;
    }

    const { data: event, error } =
      await supabase
        .from("events")
        .select(`
          id,
          title,
          description,
          start_date,
          end_date,
          city,
          country,
          venue,
          status,
          cover_url,
          start_time,
          end_time
        `)
        .eq(
          "id",
          committee.eventId,
        )
        .maybeSingle();

    if (error) {
      console.error(
        "Failed to load current leader event:",
        error,
      );

      return null;
    }

    if (!event) {
      return null;
    }

    return {
      id: event.id,

      title:
        event.title,

      description:
        event.description ?? null,

      startDate:
        event.start_date ?? "",

      endDate:
        event.end_date ?? "",

      location:
        [
          event.venue,
          event.city,
          event.country,
        ]
          .filter(Boolean)
          .join(" — ") || "TBD",

      status:
        String(
          event.status ??
            "draft",
        ),

      coverImage:
        event.cover_url ?? null,

      committeeName:
        committee.name,

      leaderName:
        committee.leader,

      startTime:
        event.start_time ?? null,

      endTime:
        event.end_time ?? null,
    };
  },

  // ============================================================
  // COMMITTEE → SHIFTS
  // ============================================================

  async getLeaderCommitteeShifts(): Promise<any[]> {
    const committees =
      await this.getLeaderCommittees();

    if (!committees.length) {
      return [];
    }

    const committeeIds =
      committees.map(
        (c) => c.id,
      );

    const {
      data: links,
      error: linksError,
    } = await supabase
      .from("committee_shifts")
      .select(`
        id,
        committee_id,
        shift_id
      `)
      .in(
        "committee_id",
        committeeIds,
      );

    if (linksError) {
      console.error(
        "[Leader Shifts] committee_shifts error:",
        linksError,
      );

      return [];
    }

    if (!links?.length) {
      return [];
    }

    const shiftIds =
      links.map(
        (item) =>
          item.shift_id,
      );

    const {
      data: shifts,
      error: shiftsError,
    } = await supabase
      .from("event_shifts")
      .select(`
        id,
        event_id,
        role_id,
        title,
        location,
        date,
        start_time,
        end_time,
        capacity,
        instructions
      `)
      .in(
        "id",
        shiftIds,
      );

    if (shiftsError) {
      console.error(
        "[Leader Shifts] event_shifts error:",
        shiftsError,
      );

      return [];
    }

    const result =
      links
        .map((link) => {
          const shift =
            shifts?.find(
              (item) =>
                item.id ===
                link.shift_id,
            );

          if (!shift) {
            console.warn(
              "[Leader Shifts] Shift not found:",
              link.shift_id,
            );

            return null;
          }

          const committee =
            committees.find(
              (item) =>
                item.id ===
                link.committee_id,
            );

          return {
            id: link.id,
            committee_id:
              link.committee_id,
            shift_id:
              link.shift_id,

            committee: committee
              ? {
                  id: committee.id,
                  event_id:
                    committee.eventId,
                  name:
                    committee.name,
                }
              : null,

            shift,
          };
        })
        .filter(Boolean);

    return result as any[];
  },

  // ============================================================
  // MEMBERS / REAL VOLUNTEERS
  // ============================================================

  async getCommitteeMembers(): Promise<
    LeaderMember[]
  > {
    const committees =
      await this.getLeaderCommittees();

    if (!committees.length) {
      return [];
    }

    const committeeIds =
      committees.map(
        (committee) =>
          committee.id,
      );

    const {
      data: memberRows,
      error: membersError,
    } = await supabase
      .from("committee_members")
      .select(`
        id,
        committee_id,
        profile_id,
        event_role_id,
        status,
        joined_at
      `)
      .in(
        "committee_id",
        committeeIds,
      )
      .eq("status", "assigned")
      .order("joined_at", {
        ascending: true,
      });

    if (membersError) {
      console.error(
        "Failed to load committee members:",
        membersError,
      );

      return [];
    }

    if (!memberRows?.length) {
      return [];
    }

    const profileIds = [
      ...new Set(
        memberRows.map(
          (member) =>
            member.profile_id,
        ),
      ),
    ];

    const {
      data: profiles,
      error: profilesError,
    } = await supabase
      .from("profiles")
      .select(`
        id,
        first_name,
        last_name,
        avatar_url
      `)
      .in("id", profileIds);

    if (profilesError) {
      console.error(
        "Failed to load volunteer profiles:",
        profilesError,
      );

      return [];
    }

    const profilesById =
      new Map(
        (profiles ?? []).map(
          (profile) => [
            profile.id,
            profile,
          ],
        ),
      );

    const committeeShifts =
      await this.getLeaderCommitteeShifts();

    const eventIds = [
      ...new Set(
        committees
          .map(
            (committee) =>
              committee.eventId,
          )
          .filter(Boolean),
      ),
    ];

    const {
      data: events,
      error: eventsError,
    } = await supabase
      .from("events")
      .select(`
        id,
        end_date,
        end_time
      `)
      .in(
        "id",
        eventIds,
      );

    if (eventsError) {
      console.error(
        "Failed to load event feedback dates:",
        eventsError,
      );
    }

    const eventsById =
      new Map(
        (events ?? []).map(
          (event) => [
            event.id,
            event,
          ],
        ),
      );

    const memberProfileIds = [
      ...new Set(
        memberRows.map(
          (member) =>
            member.profile_id,
        ),
      ),
    ];

    const {
      data: feedbackRows,
      error: feedbackError,
    } = await supabase
      .from("committee_feedback")
      .select(`
        committee_id,
        member_profile_id
      `)
      .in(
        "committee_id",
        committeeIds,
      )
      .in(
        "member_profile_id",
        memberProfileIds,
      );

    if (feedbackError) {
      console.error(
        "Failed to load committee feedback:",
        feedbackError,
      );
    }

    const feedbackByMember =
      new Set(
        (feedbackRows ?? []).map(
          (feedback) =>
            `${feedback.committee_id}:${feedback.member_profile_id}`,
        ),
      );

    const members: LeaderMember[] =
      [];

    for (const row of memberRows) {
      const profile =
        profilesById.get(
          row.profile_id,
        );

      if (!profile) {
        console.warn(
          "Profile not found:",
          row.profile_id,
        );

        continue;
      }

      const committee =
        committees.find(
          (item) =>
            item.id ===
            row.committee_id,
        );

      if (!committee) {
        continue;
      }

      const memberShiftRows =
        committeeShifts.filter(
          (item) =>
            item.committee_id ===
              row.committee_id &&
            item.shift,
        );

      const memberShiftIds =
        memberShiftRows
          .map(
            (item) =>
              item.shift_id,
          )
          .filter(Boolean);

      let shiftAssignments: any[] =
        [];

      if (memberShiftIds.length) {
        const {
          data: assignments,
          error: assignmentError,
        } = await supabase
          .from("shift_assignments")
          .select(`
            id,
            shift_id,
            status,
            assigned_at,
            shift:event_shifts(
              id,
              title,
              start_time,
              end_time,
              role_id,
              role:event_roles(
                id,
                name
              )
            )
          `)
          .eq(
            "profile_id",
            row.profile_id,
          )
          .in(
            "shift_id",
            memberShiftIds,
          )
          .eq(
            "status",
            "assigned",
          )
          .order(
            "assigned_at",
            {
              ascending: true,
            },
          );

        if (assignmentError) {
          console.error(
            "Failed to load volunteer shift assignment:",
            assignmentError,
          );
        }

        shiftAssignments =
          assignments ?? [];
      }

      const selectedAssignment =
        shiftAssignments[0] ?? null;

      const shift =
        selectedAssignment?.shift ??
        null;

      const shiftRole =
        shift?.role?.name ??
        "Volunteer";

      let attendanceData: any =
        null;

      if (memberShiftIds.length) {
        const {
          data: attendance,
          error: attendanceError,
        } = await supabase
          .from("attendance_records")
          .select(`
            id,
            shift_id,
            status,
            check_in_time,
            check_out_time,
            updated_at
          `)
          .eq(
            "profile_id",
            row.profile_id,
          )
          .in(
            "shift_id",
            memberShiftIds,
          )
          .order(
            "updated_at",
            {
              ascending: false,
            },
          )
          .limit(1)
          .maybeSingle();

        if (attendanceError) {
          console.error(
            "Failed to load volunteer attendance:",
            attendanceError,
          );
        }

        attendanceData =
          attendance;
      }

      const rawAttendanceStatus =
        attendanceData?.status ??
        "scheduled";

      const displayStatus =
        toStatusLabel(
          rawAttendanceStatus,
        );

      let attendanceLabel =
        "Not checked in";

      if (
        attendanceData?.check_out_time
      ) {
        attendanceLabel =
          "Checked out";
      } else if (
        attendanceData?.check_in_time
      ) {
        attendanceLabel =
          "Checked in";
      }

      const event =
        eventsById.get(
          committee.eventId,
        );

      const feedbackKey =
        `${committee.id}:${row.profile_id}`;

      const feedbackSubmitted =
        feedbackByMember.has(
          feedbackKey,
        );

      const feedbackAvailable =
        isFeedbackWindowOpen(
          event?.end_date ?? "",
          event?.end_time ?? null,
        );

      let feedbackStatus:
        LeaderMember["feedbackStatus"];

      if (feedbackSubmitted) {
        feedbackStatus =
          "Submitted";
      } else if (feedbackAvailable) {
        feedbackStatus =
          "Pending";
      } else {
        feedbackStatus =
          "Not available";
      }

      members.push({
        id:
          profile.id,

        firstName:
          profile.first_name ??
          "Volunteer",

        lastName:
          profile.last_name ??
          "",

        avatar:
          profile.avatar_url ??
          null,

        role:
          shiftRole,

        status:
          displayStatus,

        assignedShift:
          shift?.title ??
          "Unassigned",

        attendance:
          attendanceLabel,

        feedbackStatus,

        feedbackSubmitted,

        committeeId:
          committee.id,

        eventId:
          committee.eventId,
      });
    }

    return members;
  },

  // ============================================================
  // SHIFTS
  // ============================================================

  async getEventShifts(): Promise<LeaderShift[]> {
    const committeeShifts =
      await this.getLeaderCommitteeShifts();

    if (!committeeShifts.length) {
      return [];
    }

    const result: LeaderShift[] =
      [];

    for (const item of committeeShifts) {
      const shift =
        item.shift;

      if (!shift) {
        console.warn(
          "[Leader Shifts] Missing shift:",
          item,
        );

        continue;
      }

      if (isLeaderShiftExpired(shift.date, shift.end_time, 1)) {
        continue;
      }

      const {
        data: assignments,
      } = await supabase
        .from("shift_assignments")
        .select(`
          profile_id,
          status
        `)
        .eq(
          "shift_id",
          shift.id,
        );

      const assigned =
        (assignments ?? []).filter(
          (assignment) =>
            assignment.status ===
            "assigned",
        );

      const assignedProfileIds =
        assigned
          .map(
            (assignment) =>
              assignment.profile_id,
          )
          .filter(Boolean);

      let assignedVolunteers:
        string[] = [];

      if (
        assignedProfileIds.length
      ) {
        const {
          data: profiles,
          error: profilesError,
        } = await supabase
          .from("profiles")
          .select(`
            id,
            first_name,
            last_name
          `)
          .in(
            "id",
            assignedProfileIds,
          );

        if (profilesError) {
          continue;
        } else {
          const profileMap =
            new Map(
              (profiles ?? []).map(
                (profile) => [
                  profile.id,
                  profile,
                ],
              ),
            );

          assignedVolunteers =
            assignedProfileIds.map(
              (profileId) => {
                const profile =
                  profileMap.get(
                    profileId,
                  );

                if (!profile) {
                  return "Volunteer";
                }

                return getDisplayName(
                  profile.first_name,
                  profile.last_name,
                );
              },
            );
        }
      }

      const assignedCount =
        assigned.length;

      const capacity =
        Number(
          shift.capacity ?? 0,
        );

      const now =
        getMoroccoDateTime();

      const today =
        now.date;

      const currentMinutes =
        now.hours * 60 +
        now.minutes;

      const shiftStartTime =
        shift.start_time?.slice(
          0,
          5,
        );

      const shiftEndTime =
        shift.end_time?.slice(
          0,
          5,
        );

      let shiftHasEnded =
        false;

      if (
        shift.date < today
      ) {
        shiftHasEnded = true;
      } else if (
        shift.date === today &&
        shiftEndTime
      ) {
        const [
          endHour,
          endMinute,
        ] =
          shiftEndTime
            .split(":")
            .map(Number);

        const shiftEndMinutes =
          endHour * 60 +
          endMinute;

        shiftHasEnded =
          currentMinutes >
          shiftEndMinutes;
      }

      let status:
        LeaderShift["status"];

      if (shiftHasEnded) {
        status =
          "Completed";
      } else if (
        capacity > 0 &&
        assignedCount >=
          capacity
      ) {
        status =
          "Filled";
      } else {
        status =
          "Open";
      }

      result.push({
        id:
          shift.id,

        committeeId:
          item.committee_id,

        eventId:
          shift.event_id,

        title:
          shift.title,

        location:
          shift.location ??
          "TBD",

        date:
          shift.date,

        startTime:
          shift.start_time,

        endTime:
          shift.end_time,

        status,

        assignedVolunteers,

        capacity,

        summary:
          shift.instructions ??
          "Shift coverage for committee operations.",
      });
    }

    return result;
  },

  async getShiftDetails(
    shiftId: string,
  ): Promise<
    LeaderShiftDetails | null
  > {
    const shifts =
      await this.getEventShifts();

    const shift =
      shifts.find(
        (item) =>
          item.id ===
          shiftId,
      );

    if (!shift) {
      return null;
    }

    const {
      data: assignments,
      error: assignmentsError,
    } = await supabase
      .from("shift_assignments")
      .select(`
        profile_id,
        status,
        assigned_at
      `)
      .eq(
        "shift_id",
        shiftId,
      )
      .eq(
        "status",
        "assigned",
      )
      .order(
        "assigned_at",
        {
          ascending: true,
        },
      );

    if (assignmentsError) {
      throw assignmentsError;
    }

    const profileIds =
      Array.from(
        new Set(
          (assignments ?? [])
            .map(
              (assignment) =>
                assignment.profile_id,
            )
            .filter(Boolean),
        ),
      );

    if (
      profileIds.length ===
      0
    ) {
      return {
        ...shift,
        members: [],
      };
    }

    const [
      {
        data: profiles,
        error: profilesError,
      },
      {
        data: attendance,
        error: attendanceError,
      },
    ] =
      await Promise.all([
        supabase
          .from("profiles")
          .select(`
            id,
            first_name,
            last_name,
            avatar_url
          `)
          .in(
            "id",
            profileIds,
          ),

        supabase
          .from("attendance_records")
          .select(`
            profile_id,
            status,
            check_in_time,
            check_out_time,
            updated_at
          `)
          .eq(
            "shift_id",
            shiftId,
          )
          .in(
            "profile_id",
            profileIds,
          )
          .order(
            "updated_at",
            {
              ascending: false,
            },
          ),
      ]);

    if (profilesError) {
      throw profilesError;
    }

    if (attendanceError) {
      throw attendanceError;
    }

    const profileMap =
      new Map(
        (profiles ?? []).map(
          (profile) => [
            profile.id,
            profile,
          ],
        ),
      );

    const attendanceMap =
      new Map<
        string,
        any
      >();

    for (
      const record of
        attendance ?? []
    ) {
      if (
        !attendanceMap.has(
          record.profile_id,
        )
      ) {
        attendanceMap.set(
          record.profile_id,
          record,
        );
      }
    }

    const members:
      LeaderShiftMember[] =
      (assignments ?? [])
        .map((assignment) => {
          const profile =
            profileMap.get(
              assignment.profile_id,
            );

          if (!profile) {
            return null;
          }

          const attendanceRecord =
            attendanceMap.get(
              assignment.profile_id,
            );

          let attendanceStatus:
            LeaderShiftMember["attendanceStatus"] =
            "Assigned";

          if (
            attendanceRecord?.check_out_time ||
            attendanceRecord?.status ===
              "checked-out" ||
            attendanceRecord?.status ===
              "checked_out"
          ) {
            attendanceStatus =
              "Checked out";
          } else if (
            attendanceRecord?.check_in_time ||
            attendanceRecord?.status ===
              "checked-in" ||
            attendanceRecord?.status ===
              "checked_in"
          ) {
            attendanceStatus =
              "Checked in";
          } else if (
            attendanceRecord?.status ===
            "absent"
          ) {
            attendanceStatus =
              "Absent";
          }

          return {
            id:
              profile.id,

            firstName:
              profile.first_name ??
              "",

            lastName:
              profile.last_name ??
              "",

            avatar:
              profile.avatar_url ??
              null,

            role:
              "Volunteer",

            assignmentStatus:
              assignment.status ??
              "assigned",

            attendanceStatus,

            checkInTime:
              attendanceRecord?.check_in_time ??
              null,

            checkOutTime:
              attendanceRecord?.check_out_time ??
              null,
          };
        })
        .filter(Boolean) as
        LeaderShiftMember[];

    return {
      ...shift,
      members,
    };
  },

  // ============================================================
  // RECENT SCANS
  // ============================================================

  async getRecentScans(): Promise<
    LeaderScanRecord[]
  > {
    const committeeShifts =
      await this.getLeaderCommitteeShifts();

    const shiftIds =
      committeeShifts
        .map(
          (item) =>
            item.shift_id,
        )
        .filter(Boolean);

    if (!shiftIds.length) {
      return [];
    }

    const {
      data,
      error,
    } = await supabase
      .from("attendance_records")
      .select(`
        id,
        profile_id,
        shift_id,
        status,
        updated_at,
        role_id
      `)
      .in(
        "shift_id",
        shiftIds,
      )
      .in(
        "status",
        [
          "checked-in",
          "checked-out",
        ],
      )
      .order(
        "updated_at",
        {
          ascending: false,
        },
      )
      .limit(5);

    if (error) {
      console.error(
        "Failed to load recent leader scans:",
        error,
      );

      return [];
    }

    if (!data?.length) {
      return [];
    }

    const profileIds = [
      ...new Set(
        data.map(
          (record) =>
            record.profile_id,
        ),
      ),
    ];

    const roleIds = [
      ...new Set(
        data
          .map(
            (record) =>
              record.role_id,
          )
          .filter(Boolean),
      ),
    ];

    const [
      { data: profiles },
      { data: roles },
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select(`
          id,
          first_name,
          last_name
        `)
        .in(
          "id",
          profileIds,
        ),

      roleIds.length
        ? supabase
            .from("event_roles")
            .select(`
              id,
              name
            `)
            .in(
              "id",
              roleIds,
            )
        : Promise.resolve({
            data: [],
          }),
    ]);

    const profilesById =
      new Map(
        (profiles ?? []).map(
          (profile) => [
            profile.id,
            profile,
          ],
        ),
      );

    const rolesById =
      new Map(
        (roles ?? []).map(
          (role) => [
            role.id,
            role,
          ],
        ),
      );

    return data.map(
      (record) => {
        const profile =
          profilesById.get(
            record.profile_id,
          );

        return {
          id:
            record.id,

          volunteerId:
            record.profile_id,

          volunteerName:
            getDisplayName(
              profile?.first_name,
              profile?.last_name,
            ),

          role:
            rolesById.get(
              record.role_id,
            )?.name ??
            "Volunteer",

          status:
            record.status ===
            "checked-out"
              ? "checked_out"
              : "checked_in",

          timestamp:
            record.updated_at,
        };
      },
    );
  },

  // ============================================================
  // AUTHORIZED SCANNER VOLUNTEERS
  // ============================================================

  async getAuthorizedVolunteers(): Promise<
    LeaderScannerVolunteer[]
  > {
    const committees =
      await this.getLeaderCommittees();

    if (!committees.length) {
      return [];
    }

    const committeeIds =
      committees.map(
        (committee) =>
          committee.id,
      );

    const {
      data: memberRows,
      error,
    } = await supabase
      .from("committee_members")
      .select(`
        profile_id,
        committee_id,
        event_role_id
      `)
      .in(
        "committee_id",
        committeeIds,
      )
      .eq(
        "status",
        "assigned",
      );

    if (error) {
      console.error(
        "Failed to load authorized volunteers:",
        error,
      );

      return [];
    }

    if (!memberRows?.length) {
      return [];
    }

    const profileIds = [
      ...new Set(
        memberRows.map(
          (row) =>
            row.profile_id,
        ),
      ),
    ];

    const roleIds = [
      ...new Set(
        memberRows
          .map(
            (row) =>
              row.event_role_id,
          )
          .filter(Boolean),
      ),
    ];

    const [
      { data: profiles },
      { data: roles },
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select(`
          id,
          first_name,
          last_name,
          avatar_url
        `)
        .in(
          "id",
          profileIds,
        ),

      roleIds.length
        ? supabase
            .from("event_roles")
            .select(`
              id,
              name
            `)
            .in(
              "id",
              roleIds,
            )
        : Promise.resolve({
            data: [],
          }),
    ]);

    const profilesById =
      new Map(
        (profiles ?? []).map(
          (profile) => [
            profile.id,
            profile,
          ],
        ),
      );

    const rolesById =
      new Map(
        (roles ?? []).map(
          (role) => [
            role.id,
            role,
          ],
        ),
      );

    const volunteers:
      LeaderScannerVolunteer[] =
      [];

    for (const row of memberRows) {
      const profile =
        profilesById.get(
          row.profile_id,
        );

      const committee =
        committees.find(
          (item) =>
            item.id ===
            row.committee_id,
        );

      if (
        !profile ||
        !committee
      ) {
        continue;
      }

      const {
        data: committeeShiftRows,
        error: committeeShiftError,
      } = await supabase
        .from("committee_shifts")
        .select(`
          shift_id
        `)
        .eq(
          "committee_id",
          row.committee_id,
        );

      if (committeeShiftError) {
        console.error(
          "Failed to load volunteer committee shifts:",
          committeeShiftError,
        );
      }

      const shiftIds =
        (committeeShiftRows ?? [])
          .map(
            (item) =>
              item.shift_id,
          )
          .filter(Boolean);

      let attendance: any =
        null;

      if (shiftIds.length) {
        const {
          data: attendanceData,
          error: attendanceError,
        } = await supabase
          .from("attendance_records")
          .select(`
            status,
            check_in_time,
            check_out_time,
            updated_at
          `)
          .eq(
            "profile_id",
            row.profile_id,
          )
          .in(
            "shift_id",
            shiftIds,
          )
          .order(
            "updated_at",
            {
              ascending: false,
            },
          )
          .limit(1)
          .maybeSingle();

        if (attendanceError) {
          console.error(
            "Failed to load scanner attendance:",
            attendanceError,
          );
        }

        attendance =
          attendanceData;
      }

      volunteers.push({
        id:
          profile.id,

        firstName:
          profile.first_name ??
          "Volunteer",

        lastName:
          profile.last_name ??
          "",

        role:
          rolesById.get(
            row.event_role_id,
          )?.name ??
          "Volunteer",

        committeeId:
          row.committee_id,

        eventId:
          committee.eventId,

        accreditationQrCode:
          profile.id,

        attendanceStatus:
          normalizeAttendanceStatus(
            attendance?.status,
          ),

        avatar:
          profile.avatar_url ??
          null,

        checkInTime:
          attendance?.check_in_time ??
          undefined,

        checkOutTime:
          attendance?.check_out_time ??
          undefined,
      });
    }

    return volunteers;
  },

  async getScannerVolunteers(): Promise<
    LeaderScannerVolunteer[]
  > {
    return this.getAuthorizedVolunteers();
  },

  async getVolunteerById(
    id: string,
  ): Promise<
    LeaderScannerVolunteer | null
  > {
    const volunteers =
      await this.getScannerVolunteers();

    return (
      volunteers.find(
        (volunteer) =>
          volunteer.id === id,
      ) ?? null
    );
  },

  // ============================================================
  // QR CODE
  // ============================================================

  async getVolunteerByQrCode(
    qrCode: string,
  ): Promise<VolunteerQrLookupResult> {
    const committees =
      await this.getLeaderCommittees();

    if (!committees.length) {
      console.warn(
        "QR lookup: leader has no committees",
      );

      return {
        ok: false,
        reason: "LEADER_HAS_NO_COMMITTEES",
      };
    }

    const eventIds = [
      ...new Set(
        committees
          .map(
            (committee) =>
              committee.eventId,
          )
          .filter(Boolean),
      ),
    ];

    const normalizedQrCode =
      qrCode.trim();

    const normalizeQrValue = (value: string | null | undefined) =>
      (value ?? "")
        .toString()
        .trim()
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase();

    const normalizedQrValue =
      normalizeQrValue(normalizedQrCode);

    const canonicalVolunteerQr = (
      profileId: string,
      eventId: string,
      roleId: string,
    ) => {
      const seed = `${profileId}${eventId}${roleId}`.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
      const token = seed.slice(-6).padStart(6, "0");
      return `VOL-${token}`;
    };

    console.log(
      "QR lookup:",
      normalizedQrCode,
    );

    let accreditation: any =
      null;

    const matchAccreditationRows = (rows: any[] = []) => {
      return rows.find((item: any) => {
        const legacyQr = `volunteer:${item.profile_id}:${item.event_id}:${item.role_id}`;
        const values = [
          item.qr_code_data,
          item.volunteer_identifier,
          item.profile_id,
          legacyQr,
          canonicalVolunteerQr(item.profile_id, item.event_id, item.role_id),
        ];

        return values.some(
          (value) =>
            normalizeQrValue(value) === normalizedQrValue,
        );
      });
    };

    const [{ data: eventAccreditations, error: eventAccreditationsError }, { data: fallbackAccreditations, error: fallbackAccreditationsError }] = await Promise.all([
      eventIds.length
        ? supabase
            .from("accreditations")
            .select(`
              id,
              profile_id,
              event_id,
              role_id,
              status,
              volunteer_identifier,
              qr_code_data,
              profile:profiles(
                id,
                first_name,
                last_name,
                avatar_url
              )
            `)
            .in("event_id", eventIds)
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from("accreditations")
        .select(`
          id,
          profile_id,
          event_id,
          role_id,
          status,
          volunteer_identifier,
          qr_code_data,
          profile:profiles(
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .limit(500),
    ]);

    if (eventAccreditationsError) {
      console.error(
        "QR lookup event accreditations error:",
        eventAccreditationsError,
      );
    }

    if (fallbackAccreditationsError) {
      console.error(
        "QR lookup fallback accreditations error:",
        fallbackAccreditationsError,
      );
    }

    accreditation =
      matchAccreditationRows(eventAccreditations ?? []) ??
      matchAccreditationRows(fallbackAccreditations ?? []);

    if (!accreditation) {
      console.warn(
        "No accreditation found for QR:",
        normalizedQrCode,
      );

      return {
        ok: false,
        reason:
          "NO_ACCREDITATION",
      };
    }

    if (
      accreditation.status !== "approved"
    ) {
      return {
        ok: false,
        reason:
          "ACCREDITATION_NOT_APPROVED",
      };
    }

    console.log(
      "Accreditation found:",
      {
        id:
          accreditation.id,

        profileId:
          accreditation.profile_id,

        eventId:
          accreditation.event_id,

        roleId:
          accreditation.role_id,

        volunteerIdentifier:
          accreditation.volunteer_identifier,

        qrCodeData:
          accreditation.qr_code_data,
      },
    );

    const leaderCommitteesForEvent =
      committees.filter(
        (committee) =>
          committee.eventId ===
          accreditation.event_id,
      );

    if (
      !leaderCommitteesForEvent.length
    ) {
      console.warn(
        "QR volunteer belongs to an event outside leader committees.",
      );

      return {
        ok: false,
        reason:
          "EVENT_NOT_IN_LEADER_COMMITTEES",
      };
    }

    const profile =
      accreditation.profile ??
      null;

    if (!profile) {
      console.warn(
        "Accreditation profile not found.",
      );

      return {
        ok: false,
        reason:
          "PROFILE_NOT_FOUND",
      };
    }

    const leaderCommitteeIds =
      leaderCommitteesForEvent.map(
        (committee) =>
          committee.id,
      );

    const {
      data: leaderCommitteeShiftRows,
      error: leaderCommitteeShiftError,
    } = await supabase
      .from("committee_shifts")
      .select(`
        committee_id,
        shift_id,
        shift:event_shifts(
          id,
          event_id,
          role_id,
          title,
          location,
          date,
          start_time,
          end_time,
          role:event_roles(
            id,
            name
          )
        )
      `)
      .in(
        "committee_id",
        leaderCommitteeIds,
      );

    if (leaderCommitteeShiftError) {
      console.error(
        "Committee shifts lookup error:",
        leaderCommitteeShiftError,
      );

      return {
        ok: false,
        reason:
          "COMMITTEE_SHIFTS_QUERY_ERROR",
      };
    }

    const leaderShiftIds =
      (leaderCommitteeShiftRows ?? [])
        .map(
          (row: any) =>
            row.shift_id,
        )
        .filter(Boolean);

    if (!leaderShiftIds.length) {
      console.warn(
        "Leader committee has no shifts.",
      );

      return {
        ok: false,
        reason:
          "LEADER_COMMITTEE_HAS_NO_SHIFTS",
      };
    }

    const {
      data: volunteerAssignments,
      error: volunteerAssignmentsError,
    } = await supabase
      .from("shift_assignments")
      .select(`
        id,
        profile_id,
        shift_id,
        status,
        assigned_at,
        shift:event_shifts(
          id,
          event_id,
          role_id,
          title,
          location,
          date,
          start_time,
          end_time,
          role:event_roles(
            id,
            name
          )
        )
      `)
      .eq(
        "profile_id",
        accreditation.profile_id,
      )
      .in(
        "shift_id",
        leaderShiftIds,
      )
      .eq(
        "status",
        "assigned",
      )
      .order(
        "assigned_at",
        {
          ascending: true,
        },
      );

    if (volunteerAssignmentsError) {
      console.error(
        "Shift assignment lookup error:",
        volunteerAssignmentsError,
      );

      return {
        ok: false,
        reason:
          "SHIFT_ASSIGNMENT_QUERY_ERROR",
      };
    }

    const matchingAssignments =
      (volunteerAssignments ?? []).filter(
        (assignment: any) =>
          assignment.shift &&
          assignment.shift.event_id ===
            accreditation.event_id &&
          assignment.shift.role_id ===
            accreditation.role_id,
      );

    if (
      matchingAssignments.length !==
      1
    ) {
      console.warn(
        "Expected exactly one matching shift:",
        {
          profileId:
            accreditation.profile_id,

          roleId:
            accreditation.role_id,

          matches:
            matchingAssignments.length,
        },
      );

      return {
        ok: false,
        reason:
          matchingAssignments.length ===
          0
            ? "NO_EXACT_SHIFT_ASSIGNMENT"
            : "MULTIPLE_EXACT_SHIFT_ASSIGNMENTS",
      };
    }

    const assignment =
      matchingAssignments[0];

    const shift =
      assignment.shift;

    const matchedCommittee =
      leaderCommitteesForEvent.find(
        (committee) =>
          (leaderCommitteeShiftRows ?? []).some(
            (row: any) =>
              row.committee_id ===
                committee.id &&
              row.shift_id ===
                assignment.shift_id,
          ),
      ) ?? null;

    if (!shift || !matchedCommittee) {
      console.warn(
        "Volunteer is not assigned to leader committee.",
      );

      return {
        ok: false,
        reason:
          "NOT_ASSIGNED_TO_LEADER_COMMITTEE",
      };
    }

    const {
      data: event,
    } = await supabase
      .from("events")
      .select(`
        id,
        title
      `)
      .eq(
        "id",
        accreditation.event_id,
      )
      .maybeSingle();

    const {
      data: attendance,
      error: attendanceError,
    } = await supabase
      .from("attendance_records")
      .select(`
        status,
        check_in_time,
        check_out_time,
        updated_at
      `)
      .eq(
        "profile_id",
        accreditation.profile_id,
      )
      .eq(
        "shift_id",
        assignment.shift_id,
      )
      .maybeSingle();

    if (attendanceError) {
      console.error(
        "Attendance lookup error:",
        attendanceError,
      );

      return {
        ok: false,
        reason:
          "ATTENDANCE_QUERY_ERROR",
      };
    }

    return {
      ok: true,

      volunteer: {
        id:
          accreditation.profile_id,

        firstName:
          profile.first_name ??
          "Volunteer",

        lastName:
          profile.last_name ??
          "",

        role:
          shift.role?.name ??
          "Volunteer",

        roleId:
          accreditation.role_id,

        committeeId:
          matchedCommittee.id,

        committeeName:
          matchedCommittee.name,

        eventId:
          accreditation.event_id,

        eventTitle:
          event?.title ??
          undefined,

        shiftId:
          assignment.shift_id,

        shiftTitle:
          shift.title ??
          "Assigned shift",

        accreditationQrCode:
          normalizedQrCode,

        attendanceStatus:
          normalizeAttendanceStatus(
            attendance?.status,
          ),

        avatar:
          profile.avatar_url ??
          null,

        checkInTime:
          attendance?.check_in_time ??
          undefined,

        checkOutTime:
          attendance?.check_out_time ??
          undefined,
      },
    };
  },

  // ============================================================
  // FEEDBACK
  // ============================================================

  async submitCommitteeFeedback({
    committeeId,
    eventId,
    memberProfileId,
    punctuality,
    teamwork,
    communication,
    responsibility,
    overallRating,
    comment,
  }: {
    committeeId: string;
    eventId: string;
    memberProfileId: string;
    punctuality: number;
    teamwork: number;
    communication: number;
    responsibility: number;
    overallRating: number;
    comment?: string | null;
  }): Promise<void> {
    const leaderProfileId =
      await getCurrentUserId();

    if (!leaderProfileId) {
      throw new Error(
        "You must be signed in as a leader.",
      );
    }

    const {
      data: committee,
      error: committeeError,
    } = await supabase
      .from("committees")
      .select(`
        id,
        event_id,
        leader_profile_id,
        status
      `)
      .eq(
        "id",
        committeeId,
      )
      .maybeSingle();

    if (committeeError) {
      throw new Error(
        committeeError.message,
      );
    }

    if (!committee) {
      throw new Error(
        "Committee not found.",
      );
    }

    if (
      committee.leader_profile_id !==
      leaderProfileId
    ) {
      throw new Error(
        "You are not the leader of this committee.",
      );
    }

    if (
      committee.status !==
      "active"
    ) {
      throw new Error(
        "This committee is not active.",
      );
    }

    if (
      committee.event_id !==
      eventId
    ) {
      throw new Error(
        "The feedback event does not match the committee event.",
      );
    }

    const {
      data: event,
      error: eventError,
    } = await supabase
      .from("events")
      .select(`
        id,
        end_date,
        end_time
      `)
      .eq(
        "id",
        eventId,
      )
      .maybeSingle();

    if (eventError) {
      throw new Error(
        eventError.message,
      );
    }

    if (!event) {
      throw new Error(
        "Event not found.",
      );
    }

    if (
      !isFeedbackWindowOpen(
        event.end_date ?? "",
        event.end_time ?? null,
      )
    ) {
      throw new Error(
        "Feedback is not available yet. It becomes available after the event has ended.",
      );
    }

    const {
      data: membership,
      error: membershipError,
    } = await supabase
      .from("committee_members")
      .select(`
        id,
        profile_id,
        committee_id,
        status
      `)
      .eq(
        "committee_id",
        committeeId,
      )
      .eq(
        "profile_id",
        memberProfileId,
      )
      .eq(
        "status",
        "assigned",
      )
      .maybeSingle();

    if (membershipError) {
      throw new Error(
        membershipError.message,
      );
    }

    if (!membership) {
      throw new Error(
        "This volunteer is not assigned to your committee.",
      );
    }

    const ratings = {
      punctuality,
      teamwork,
      communication,
      responsibility,
      overallRating,
    };

    for (
      const [
        field,
        value,
      ] of Object.entries(
        ratings,
      )
    ) {
      if (
        !Number.isInteger(
          value,
        ) ||
        value < 1 ||
        value > 5
      ) {
        throw new Error(
          `${field} must be between 1 and 5.`,
        );
      }
    }

    const {
      error: feedbackError,
    } = await supabase
      .from(
        "committee_feedback",
      )
      .upsert(
        {
          committee_id:
            committeeId,

          member_profile_id:
            memberProfileId,

          leader_profile_id:
            leaderProfileId,

          event_id:
            eventId,

          punctuality,

          teamwork,

          communication,

          responsibility,

          overall_rating:
            overallRating,

          comment:
            comment?.trim() ||
            null,

          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "committee_id,member_profile_id",
        },
      );

    if (feedbackError) {
      console.error(
        "Failed to save committee feedback:",
        feedbackError,
      );

      throw new Error(
        feedbackError.message,
      );
    }
  },

  // ============================================================
  // ATTENDANCE
  // ============================================================

  async updateAttendanceStatus(
    volunteer: LeaderScannerVolunteer,
    action: LeaderScanAction,
  ): Promise<LeaderScannerVolunteer> {
    // ----------------------------------------------------------
    // Morocco local time
    // ----------------------------------------------------------

    const moroccoNow =
      getMoroccoDateTime();

    const timeNow =
      moroccoNow.time;

    const nextStatus =
      action === "check-in"
        ? "checked-in"
        : "checked-out";

    if (!volunteer.shiftId) {
      throw new Error(
        "No assigned shift was found for this volunteer.",
      );
    }

    // ----------------------------------------------------------
    // Validate the volunteer's exact assigned shift
    // ----------------------------------------------------------

    const {
      data: assignedShift,
      error: assignedShiftError,
    } = await supabase
      .from("event_shifts")
      .select(`
        id,
        event_id,
        role_id,
        date,
        start_time,
        end_time
      `)
      .eq(
        "id",
        volunteer.shiftId,
      )
      .maybeSingle();

    if (assignedShiftError) {
      throw new Error(
        `Assigned shift lookup failed: ${assignedShiftError.message}`,
      );
    }

    if (!assignedShift) {
      throw new Error(
        "The assigned shift could not be found.",
      );
    }

    // ----------------------------------------------------------
    // Verify the volunteer is still assigned to this exact shift
    // ----------------------------------------------------------

    const {
      data: exactAssignment,
      error: exactAssignmentError,
    } = await supabase
      .from("shift_assignments")
      .select(`
        id,
        profile_id,
        shift_id,
        status
      `)
      .eq(
        "profile_id",
        volunteer.id,
      )
      .eq(
        "shift_id",
        volunteer.shiftId,
      )
      .eq(
        "status",
        "assigned",
      )
      .maybeSingle();

    if (exactAssignmentError) {
      throw new Error(
        `Shift assignment verification failed: ${exactAssignmentError.message}`,
      );
    }

    if (!exactAssignment) {
      throw new Error(
        "This volunteer is not currently assigned to this shift.",
      );
    }

    // ----------------------------------------------------------
    // Verify event + role still match the volunteer
    // ----------------------------------------------------------

    if (
      volunteer.eventId !==
      assignedShift.event_id
    ) {
      throw new Error(
        "This shift does not belong to the volunteer's event.",
      );
    }

    if (
      volunteer.roleId &&
      volunteer.roleId !==
        assignedShift.role_id
    ) {
      throw new Error(
        "This shift does not match the volunteer's assigned role.",
      );
    }

    // ----------------------------------------------------------
    // Validate exact shift date
    // ----------------------------------------------------------

    const today =
      moroccoNow.date;

    if (
      today !==
      assignedShift.date
    ) {
      throw new Error(
        `This volunteer is assigned to a shift on ${assignedShift.date}, not today.`,
      );
    }

    // ----------------------------------------------------------
    // Validate exact shift time
    // ----------------------------------------------------------

    if (
      !assignedShift.start_time ||
      !assignedShift.end_time
    ) {
      throw new Error(
        "This shift does not have a valid start and end time.",
      );
    }

    const currentMinutes =
      moroccoNow.hours *
        60 +
      moroccoNow.minutes;

    const startTime =
      assignedShift.start_time.slice(
        0,
        5,
      );

    const endTime =
      assignedShift.end_time.slice(
        0,
        5,
      );

    const [
      startHour,
      startMinute,
    ] =
      startTime
        .split(":")
        .map(Number);

    const [
      endHour,
      endMinute,
    ] =
      endTime
        .split(":")
        .map(Number);

    if (
      Number.isNaN(startHour) ||
      Number.isNaN(startMinute) ||
      Number.isNaN(endHour) ||
      Number.isNaN(endMinute)
    ) {
      throw new Error(
        "This shift has an invalid start or end time.",
      );
    }

    const shiftStartMinutes =
      startHour * 60 +
      startMinute;

    const shiftEndMinutes =
      endHour * 60 +
      endMinute;

    // ----------------------------------------------------------
    // Exact same-day shift only
    //
    // Example:
    // 09:00 -> 17:00
    //
    // Allowed:
    // 09:00 <= current <= 17:00
    //
    // Not allowed:
    // before 09:00
    // after 17:00
    // any other date
    // ----------------------------------------------------------

    if (
      shiftEndMinutes <
      shiftStartMinutes
    ) {
      throw new Error(
        "This shift crosses midnight. Attendance is only allowed for same-day shifts.",
      );
    }

    const checkInStartMinutes =
      shiftStartMinutes - 60;

    const checkOutEndMinutes =
      shiftEndMinutes + 60;

    if (action === "check-in") {
      const canCheckIn =
        currentMinutes >= checkInStartMinutes &&
        currentMinutes <= shiftEndMinutes;

      if (!canCheckIn) {
        throw new Error(
          `Check-in is allowed from ${formatTime(checkInStartMinutes)} to ${endTime}.`,
        );
      }
    }

    if (action === "check-out") {
      const canCheckOut =
        currentMinutes >= shiftStartMinutes &&
        currentMinutes <= checkOutEndMinutes;

      if (!canCheckOut) {
        throw new Error(
          `Check-out is allowed from ${startTime} to ${formatTime(checkOutEndMinutes)}.`,
        );
      }
    }

    // ----------------------------------------------------------
    // Get existing attendance for this EXACT volunteer + shift
    // ----------------------------------------------------------

    const {
      data: existing,
      error: existingError,
    } = await supabase
      .from("attendance_records")
      .select(`
        id,
        check_in_time,
        check_out_time,
        status
      `)
      .eq(
        "profile_id",
        volunteer.id,
      )
      .eq(
        "shift_id",
        volunteer.shiftId,
      )
      .maybeSingle();

    if (existingError) {
      throw new Error(
        `Attendance lookup failed: ${existingError.message}`,
      );
    }

    // ----------------------------------------------------------
    // Prevent invalid attendance transitions
    // ----------------------------------------------------------

    if (
      action === "check-in" &&
      existing?.status === "checked-out"
    ) {
      throw new Error(
        "This volunteer has already checked out from this shift.",
      );
    }

    if (
      action === "check-out" &&
      !existing?.check_in_time
    ) {
      throw new Error(
        "The volunteer must check in before checking out.",
      );
    }

    // ----------------------------------------------------------
    // Update existing record
    // ----------------------------------------------------------

    if (existing) {
      const payload: Record<
        string,
        unknown
      > = {
        status:
          nextStatus,

        updated_at:
          new Date().toISOString(),
      };

      if (
        action ===
        "check-in"
      ) {
        payload.check_in_time =
          existing.check_in_time ??
          timeNow;

        payload.check_out_time =
          null;
      } else {
        payload.check_out_time =
          timeNow;

        payload.check_in_time =
          existing.check_in_time ??
          timeNow;
      }

      const {
        error: updateError,
      } = await supabase
        .from(
          "attendance_records",
        )
        .update(
          payload,
        )
        .eq(
          "id",
          existing.id,
        );

      if (updateError) {
        throw new Error(
          `Attendance update failed: ${updateError.message}`,
        );
      }
    }

    // ----------------------------------------------------------
    // Create attendance record if none exists
    // ----------------------------------------------------------

    else {
      const {
        error: insertError,
      } = await supabase
        .from(
          "attendance_records",
        )
        .insert({
          profile_id:
            volunteer.id,

          event_id:
            assignedShift.event_id,

          role_id:
            assignedShift.role_id,

          shift_id:
            assignedShift.id,

          date:
            assignedShift.date,

          status:
            nextStatus,

          check_in_time:
            action ===
            "check-in"
              ? timeNow
              : null,

          check_out_time:
            action ===
            "check-out"
              ? timeNow
              : null,
        });

      if (insertError) {
        throw new Error(
          `Attendance insert failed: ${insertError.message}`,
        );
      }
    }

    // ----------------------------------------------------------
    // Return updated volunteer
    // ----------------------------------------------------------

    return {
      ...volunteer,

      attendanceStatus:
        action ===
        "check-in"
          ? "checked_in"
          : "checked_out",

      checkInTime:
        action ===
        "check-in"
          ? existing?.check_in_time ??
            timeNow
          : volunteer.checkInTime,

      checkOutTime:
        action ===
        "check-out"
          ? timeNow
          : volunteer.checkOutTime,
    };
  },

  // ============================================================
  // LOCAL SCAN RECORD
  // ============================================================

  createRecentScan(
    volunteer: LeaderScannerVolunteer,
    action: LeaderScanAction,
  ): LeaderScanRecord {
    return {
      id:
        `scan-${Date.now()}`,

      volunteerId:
        volunteer.id,

      volunteerName:
        `${volunteer.firstName} ${volunteer.lastName}`
          .trim(),

      role:
        volunteer.role,

      status:
        action ===
        "check-in"
          ? "checked_in"
          : "checked_out",

      timestamp:
        new Date().toISOString(),
    };
  },
};

export default leaderService;

