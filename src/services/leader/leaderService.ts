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
  feedbackStatus:
    | "Submitted"
    | "Pending"
    | "Needs follow-up";
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
    default:
      return "Pending";
  }
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
    const userId =
      await getCurrentUserId();

    if (!userId) {
      return [];
    }

    const { data, error } =
      await supabase
        .from("committees")
        .select(`
          id,
          event_id,
          name,
          description,
          status,
          created_at
        `)
        .eq(
          "leader_profile_id",
          userId,
        )
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      console.error(
        "Failed to load leader committees:",
        error,
      );

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

    return events
      .map((event) => {
        const eventCommittees =
          committeesByEvent.get(
            event.id,
          ) ?? [];

        const primaryCommittee =
          eventCommittees[0];

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

  async getLeaderCommitteeShifts(): Promise<
    any[]
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

    const { data, error } =
      await supabase
        .from("committee_shifts")
        .select(`
          id,
          committee_id,
          shift_id,
          committee:committees(
            id,
            event_id,
            name
          ),
          shift:event_shifts(
            id,
            event_id,
            role_id,
            title,
            location,
            date,
            start_time,
            end_time,
            capacity,
            instructions,
            role:event_roles(
              id,
              name
            )
          )
        `)
        .in(
          "committee_id",
          committeeIds,
        );

    if (error) {
      console.error(
        "Failed to load leader committee shifts:",
        error,
      );

      return [];
    }

    return (data ?? []) as any[];
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

    // ----------------------------------------------------------
    // 1. Get real committee memberships
    // ----------------------------------------------------------

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

    // ----------------------------------------------------------
    // 2. Get REAL volunteer profiles
    // ----------------------------------------------------------

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

    // ----------------------------------------------------------
    // 3. Get committee → shift mapping
    // ----------------------------------------------------------

    const committeeShifts =
      await this.getLeaderCommitteeShifts();

    const members: LeaderMember[] =
      [];

    // ----------------------------------------------------------
    // 4. Build every real volunteer
    // ----------------------------------------------------------

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

      // --------------------------------------------------------
      // Shifts linked to this committee
      // --------------------------------------------------------

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

      // --------------------------------------------------------
      // Volunteer actual shift assignment
      // --------------------------------------------------------

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

      // --------------------------------------------------------
      // Volunteer attendance
      // --------------------------------------------------------

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

        feedbackStatus:
          toFeedbackStatus(
            null,
          ),

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

  async getEventShifts(): Promise<
    LeaderShift[]
  > {
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
        continue;
      }

      const {
        data: assignments,
        error: assignmentsError,
      } = await supabase
        .from("shift_assignments")
        .select(`
          profile_id,
          status
        `)
        .eq(
          "shift_id",
          shift.id,
        )
        .eq(
          "status",
          "assigned",
        );

      if (assignmentsError) {
        console.error(
          "Failed to load shift assignments:",
          assignmentsError,
        );
      }

      const assigned =
        assignments ?? [];

      const assignedProfileIds =
        assigned.map(
          (assignment) =>
            assignment.profile_id,
        );

      let assignedVolunteers: string[] =
        [];

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
          console.error(
            "Failed to load shift volunteer profiles:",
            profilesError,
          );
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

        assignedVolunteers =
          assignedProfileIds.map(
            (profileId) => {
              const profile =
                profilesById.get(
                  profileId,
                );

              return getDisplayName(
                profile?.first_name,
                profile?.last_name,
              );
            },
          );
      }

      const assignedCount =
        assigned.length;

      const now =
        new Date();

      const shiftEnd =
        new Date(
          `${shift.date}T${shift.end_time}`,
        );

      let status:
        LeaderShift["status"];

      if (shiftEnd < now) {
        status =
          "Completed";
      } else if (
        assignedCount >=
        Number(
          shift.capacity ?? 0,
        )
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

        capacity:
          Number(
            shift.capacity ?? 0,
          ),

        summary:
          shift.instructions ??
          "Shift coverage for committee operations.",
      });
    }

    return result;
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
        .in("id", profileIds),

      roleIds.length
        ? supabase
            .from("event_roles")
            .select(`
              id,
              name
            `)
            .in("id", roleIds)
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
        .in("id", profileIds),

      roleIds.length
        ? supabase
            .from("event_roles")
            .select(`
              id,
              name
            `)
            .in("id", roleIds)
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

    const volunteers: LeaderScannerVolunteer[] =
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

      if (!profile || !committee) {
        continue;
      }

      // --------------------------------------------------------
      // Shifts linked to this committee
      // --------------------------------------------------------

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

      // --------------------------------------------------------
      // Attendance
      // --------------------------------------------------------

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
          .map((committee) => committee.eventId)
          .filter(Boolean),
      ),
    ];

    const normalizedQrCode =
      qrCode.trim();

    console.log(
      "QR lookup:",
      normalizedQrCode,
    );

    // ----------------------------------------------------------
    // 1. Find accreditation
    // ----------------------------------------------------------

    let accreditation: any = null;

    const {
      data: qrData,
      error: qrError,
    } = await supabase
      .from("accreditations")
      .select(`
        id,
        profile_id,
        event_id,
        role_id,
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
      .eq(
        "qr_code_data",
        normalizedQrCode,
      )
      .maybeSingle();

    if (qrError) {
      console.error(
        "QR lookup qr_code_data error:",
        qrError,
      );
    }

    accreditation = qrData;

    // Fallback: volunteer_identifier
    if (!accreditation) {
      const {
        data: identifierData,
        error: identifierError,
      } = await supabase
        .from("accreditations")
        .select(`
          id,
          profile_id,
          event_id,
          role_id,
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
        .eq(
          "volunteer_identifier",
          normalizedQrCode,
        )
        .maybeSingle();

      if (identifierError) {
        console.error(
          "QR lookup volunteer_identifier error:",
          identifierError,
        );
      }

      accreditation =
        identifierData;
    }

    if (!accreditation) {
      console.warn(
        "No accreditation found for QR:",
        normalizedQrCode,
      );

      return {
        ok: false,
        reason: "NO_ACCREDITATION",
      };
    }

    console.log(
      "Accreditation found:",
      {
        id: accreditation.id,
        profileId: accreditation.profile_id,
        eventId: accreditation.event_id,
        roleId: accreditation.role_id,
        volunteerIdentifier:
          accreditation.volunteer_identifier,
        qrCodeData:
          accreditation.qr_code_data,
      },
    );

    // ----------------------------------------------------------
    // 2. Find leader committee for this event
    // ----------------------------------------------------------

    const leaderCommitteesForEvent =
      committees.filter(
        (committee) =>
          committee.eventId ===
          accreditation.event_id,
      );

    if (!leaderCommitteesForEvent.length) {
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
      accreditation.profile ?? null;

    if (!profile) {
      console.warn(
        "Accreditation profile not found.",
      );

      return {
        ok: false,
        reason: "PROFILE_NOT_FOUND",
      };
    }

    // ----------------------------------------------------------
    // 3. Check committee membership
    // ----------------------------------------------------------

    let matchedCommittee: any = null;
    let matchedMembership: any = null;

    for (
      const committee of leaderCommitteesForEvent
    ) {
      const {
        data: membership,
        error: membershipError,
      } = await supabase
        .from("committee_members")
        .select(`
          id,
          committee_id,
          profile_id,
          event_role_id,
          status
        `)
        .eq(
          "committee_id",
          committee.id,
        )
        .eq(
          "profile_id",
          accreditation.profile_id,
        )
        .eq(
          "status",
          "assigned",
        )
        .maybeSingle();

      if (membershipError) {
        console.error(
          "Committee membership lookup error:",
          membershipError,
        );

        continue;
      }

      if (membership) {
        matchedCommittee =
          committee;

        matchedMembership =
          membership;

        break;
      }
    }

    if (
      !matchedCommittee ||
      !matchedMembership
    ) {
      console.warn(
        "Volunteer is not assigned to leader committee.",
      );

      return {
        ok: false,
        reason:
          "NOT_ASSIGNED_TO_LEADER_COMMITTEE",
      };
    }

    // ----------------------------------------------------------
    // 4. Role must match accreditation role
    // ----------------------------------------------------------

    if (
      matchedMembership.event_role_id !==
      accreditation.role_id
    ) {
      console.warn(
        "Role mismatch:",
        {
          committeeRole:
            matchedMembership.event_role_id,
          accreditationRole:
            accreditation.role_id,
        },
      );

      return {
        ok: false,
        reason: "ROLE_MISMATCH",
      };
    }

    // ----------------------------------------------------------
    // 5. Get shifts attached to leader committee
    // ----------------------------------------------------------

    const {
      data: committeeShifts,
      error: committeeShiftsError,
    } = await supabase
      .from("committee_shifts")
      .select(`
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
      .eq(
        "committee_id",
        matchedCommittee.id,
      );

    if (committeeShiftsError) {
      console.error(
        "Committee shifts lookup error:",
        committeeShiftsError,
      );

      return {
        ok: false,
        reason:
          "COMMITTEE_SHIFTS_QUERY_ERROR",
      };
    }

    const shiftIds =
      (committeeShifts ?? [])
        .map(
          (row: any) =>
            row.shift_id,
        )
        .filter(Boolean);

    if (!shiftIds.length) {
      console.warn(
        "Leader committee has no shifts.",
      );

      return {
        ok: false,
        reason:
          "LEADER_COMMITTEE_HAS_NO_SHIFTS",
      };
    }

    // ----------------------------------------------------------
    // 6. Find volunteer's exact assigned shift
    // ----------------------------------------------------------

    const {
      data: assignments,
      error: assignmentError,
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
        shiftIds,
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
        "Shift assignment lookup error:",
        assignmentError,
      );

      return {
        ok: false,
        reason:
          "SHIFT_ASSIGNMENT_QUERY_ERROR",
      };
    }

    const matchingAssignments =
      (assignments ?? []).filter(
        (assignment: any) =>
          assignment.shift &&
          assignment.shift.event_id ===
            accreditation.event_id &&
          assignment.shift.role_id ===
            accreditation.role_id,
      );

    // We need exactly one exact shift.
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
          matchingAssignments.length === 0
            ? "NO_EXACT_SHIFT_ASSIGNMENT"
            : "MULTIPLE_EXACT_SHIFT_ASSIGNMENTS",
      };
    }

    const assignment =
      matchingAssignments[0];

    const shift =
      assignment.shift;

    if (!shift) {
      return {
        ok: false,
        reason: "SHIFT_NOT_FOUND",
      };
    }

    // ----------------------------------------------------------
    // 7. Event
    // ----------------------------------------------------------

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

    // ----------------------------------------------------------
    // 8. Attendance
    // ----------------------------------------------------------

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

    // ----------------------------------------------------------
    // 9. Return verified volunteer
    // ----------------------------------------------------------

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

    // ----------------------------------------------------------
    // 1. Verify that the current user leads this committee
    // ----------------------------------------------------------

    const { data: committee, error: committeeError } =
      await supabase
        .from("committees")
        .select(`
          id,
          event_id,
          leader_profile_id,
          status
        `)
        .eq("id", committeeId)
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

    if (committee.status !== "active") {
      throw new Error(
        "This committee is not active.",
      );
    }

    if (
      committee.event_id !== eventId
    ) {
      throw new Error(
        "The feedback event does not match the committee event.",
      );
    }

    // ----------------------------------------------------------
    // 2. Verify volunteer belongs to this committee
    // ----------------------------------------------------------

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

    // ----------------------------------------------------------
    // 3. Validate ratings
    // ----------------------------------------------------------

    const ratings = {
      punctuality,
      teamwork,
      communication,
      responsibility,
      overallRating,
    };

    for (const [
      field,
      value,
    ] of Object.entries(ratings)) {
      if (
        !Number.isInteger(value) ||
        value < 1 ||
        value > 5
      ) {
        throw new Error(
          `${field} must be between 1 and 5.`,
        );
      }
    }

    // ----------------------------------------------------------
    // 4. Save feedback
    // ----------------------------------------------------------

    const {
      error: feedbackError,
    } = await supabase
      .from("committee_feedback")
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
            comment?.trim() || null,

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
    // IMPORTANT:
    // These are the actual database enum values.
    const nextStatus =
      action === "check-in"
        ? "checked-in"
        : "checked-out";

    const now =
      new Date().toISOString();

    // ----------------------------------------------------------
    // 1. Verify committee membership
    // ----------------------------------------------------------

    const {
      data: membership,
      error: membershipError,
    } = await supabase
      .from("committee_members")
      .select(`
        id,
        event_role_id
      `)
      .eq(
        "committee_id",
        volunteer.committeeId,
      )
      .eq(
        "profile_id",
        volunteer.id,
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

    // ----------------------------------------------------------
    // 2. Get committee shifts
    // ----------------------------------------------------------

    const {
      data: committeeShifts,
      error: shiftsError,
    } = await supabase
      .from("committee_shifts")
      .select(`
        shift_id,
        shift:event_shifts(
          id,
          event_id,
          role_id,
          date,
          start_time,
          end_time
        )
      `)
      .eq(
        "committee_id",
        volunteer.committeeId,
      );

    if (shiftsError) {
      throw new Error(
        shiftsError.message,
      );
    }

    const shiftRows =
      (committeeShifts ??
        []) as any[];

    const shiftIds =
      shiftRows
        .map(
          (row) =>
            row.shift_id,
        )
        .filter(Boolean);

    if (!shiftIds.length) {
      throw new Error(
        "No shifts are assigned to this committee.",
      );
    }

    // ----------------------------------------------------------
    // 3. Find the volunteer's EXACT assigned shift.
    // ----------------------------------------------------------

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
          event_id,
          role_id,
          title,
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
        volunteer.id,
      )
      .in(
        "shift_id",
        shiftIds,
      )
      .eq(
        "status",
        "assigned",
      )
      .order("assigned_at", {
        ascending: true,
      });

    if (assignmentError) {
      throw new Error(
        assignmentError.message,
      );
    }

    const matchingAssignments =
      (assignments ?? []).filter(
        (item: any) =>
          item.shift &&
          item.shift.event_id ===
            volunteer.eventId &&
          (
            !volunteer.roleId ||
            item.shift.role_id ===
              volunteer.roleId
          ) &&
          (
            !volunteer.shiftId ||
            item.shift_id ===
              volunteer.shiftId
          ),
      );

    if (matchingAssignments.length !== 1) {
      throw new Error(
        "This volunteer does not have one exact assigned role and shift in your committee.",
      );
    }

    const assignment =
      matchingAssignments[0];

    const shift =
      assignment.shift;

    if (!shift) {
      throw new Error(
        "The assigned shift could not be found.",
      );
    }

    // Extra safety: event must match.
    if (
      shift.event_id !==
      volunteer.eventId
    ) {
      throw new Error(
        "This volunteer belongs to a different event.",
      );
    }

    // Extra safety: role must match.
    if (
      volunteer.roleId &&
      shift.role_id !==
        volunteer.roleId
    ) {
      throw new Error(
        "This volunteer is assigned to a different role.",
      );
    }

    // Extra safety: shift must match.
    if (
      volunteer.shiftId &&
      assignment.shift_id !==
        volunteer.shiftId
    ) {
      throw new Error(
        "This volunteer is assigned to a different shift.",
      );
    }

    // ----------------------------------------------------------
    // 4. Existing attendance for exact shift
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
        assignment.shift_id,
      )
      .maybeSingle();

    if (existingError) {
      throw new Error(
        existingError.message,
      );
    }

    // ----------------------------------------------------------
    // 5. Update existing attendance
    // ----------------------------------------------------------

    if (existing) {
      const updatePayload: Record<
        string,
        unknown
      > = {
        status:
          nextStatus,

        updated_at:
          now,
      };

      if (
        action === "check-in"
      ) {
        updatePayload.check_in_time =
          existing.check_in_time ??
          now;

        updatePayload.check_out_time =
          null;
      } else {
        updatePayload.check_out_time =
          now;

        updatePayload.check_in_time =
          existing.check_in_time ??
          now;
      }

      const {
        error: updateError,
      } = await supabase
        .from(
          "attendance_records",
        )
        .update(
          updatePayload,
        )
        .eq(
          "id",
          existing.id,
        );

      if (updateError) {
        throw new Error(
          updateError.message,
        );
      }
    } else {
      // --------------------------------------------------------
      // 6. Create attendance record
      // --------------------------------------------------------

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
            shift.event_id,

          role_id:
            shift.role_id,

          shift_id:
            assignment.shift_id,

          date:
            shift.date ??
            new Date()
              .toISOString()
              .slice(0, 10),

          status:
            nextStatus,

          check_in_time:
            action ===
            "check-in"
              ? now
              : null,

          check_out_time:
            action ===
            "check-out"
              ? now
              : null,
        });

      if (insertError) {
        throw new Error(
          insertError.message,
        );
      }
    }

    return {
      ...volunteer,

      attendanceStatus:
        action === "check-in"
          ? "checked_in"
          : "checked_out",

      checkInTime:
        action === "check-in"
          ? now
          : volunteer.checkInTime,

      checkOutTime:
        action === "check-out"
          ? now
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
        action === "check-in"
          ? "checked_in"
          : "checked_out",

      timestamp:
        new Date().toISOString(),
    };
  },
};

export default leaderService;