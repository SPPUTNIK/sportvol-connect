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
  shift: string;
  shiftId: string | null;
  training: string;
  accreditation: string;
  attendance: string;
}

async function getEventsWithRegistrationCounts(): Promise<Event[]> {
  /*
   * ============================================================
   * EVENTS
   * ============================================================
   */

  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select(`
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
    `)
    .eq("status", "published")
    .order("start_date", {
      ascending: true,
    });

  if (eventsError) {
    throw new Error(eventsError.message);
  }

  if (!events) {
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

  const { data: applications, error: applicationsError } =
    await supabase
      .from("applications")
      .select(`
        id,
        event_id,
        status
      `)
      .in(
        "status",
        ["pending", "accepted", "waitlisted"],
      );

  if (applicationsError) {
    throw new Error(applicationsError.message);
  }

  /*
   * ============================================================
   * COUNT APPLICATIONS PER EVENT
   * ============================================================
   */

  const registrationCounts = new Map<
    string,
    number
  >();

  for (const application of applications ?? []) {
    const current =
      registrationCounts.get(application.event_id) ?? 0;

    registrationCounts.set(
      application.event_id,
      current + 1,
    );
  }

  /*
   * ============================================================
   * MAP EVENTS
   * ============================================================
   */

  return events.map((event) => {
    const registered =
      registrationCounts.get(event.id) ?? 0;

    return {
      ...(event as EventRow),

      event_roles:
        event.event_roles ?? [],

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
  async getEventById(
    id: string,
  ): Promise<Event | null> {
    const { data: event, error } = await supabase
      .from("events")
      .select(`
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
      `)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!event) {
      return null;
    }

    /*
     * Get applications for this event.
     */
    const { count, error: applicationsError } =
      await supabase
        .from("applications")
        .select(
          "id",
          {
            count: "exact",
            head: true,
          },
        )
        .eq("event_id", id)
        .in(
          "status",
          ["pending", "accepted", "waitlisted"],
        );

    if (applicationsError) {
      throw new Error(
        applicationsError.message,
      );
    }

    return {
      ...(event as EventRow),

      event_roles:
        event.event_roles ?? [],

      registered_volunteers:
        count ?? 0,
    } as Event;
  },

  /**
   * ============================================================
   * GET EVENT BY SLUG
   * ============================================================
   */
  async getEventBySlug(
    slug: string,
  ): Promise<Event | null> {
    const { data: event, error } = await supabase
      .from("events")
      .select(`
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
      `)
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!event) {
      return null;
    }

    const { count, error: applicationsError } =
      await supabase
        .from("applications")
        .select(
          "id",
          {
            count: "exact",
            head: true,
          },
        )
        .eq("event_id", event.id)
        .in(
          "status",
          ["pending", "accepted", "waitlisted"],
        );

    if (applicationsError) {
      throw new Error(
        applicationsError.message,
      );
    }

    return {
      ...(event as EventRow),

      event_roles:
        event.event_roles ?? [],

      registered_volunteers:
        count ?? 0,
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
    /**
     * ----------------------------------------------------------
     * 1. Get authenticated user
     * ----------------------------------------------------------
     */
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

    /**
     * ----------------------------------------------------------
     * 2. Get accepted applications
     * ----------------------------------------------------------
     */
    const { data: applications, error: applicationsError } =
      await supabase
        .from("applications")
        .select(`
          id,
          event_id,
          role_id,
          status,

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
        `)
        .eq("profile_id", user.id)
        .eq("status", "accepted")
        .order("applied_at", {
          ascending: false,
        });

    if (applicationsError) {
      throw new Error(applicationsError.message);
    }

    if (!applications?.length) {
      return [];
    }

    /**
     * ----------------------------------------------------------
     * 3. Build result
     * ----------------------------------------------------------
     */
    const result: MyEvent[] = [];

    for (const application of applications) {
      const event = Array.isArray(application.events)
        ? application.events[0]
        : application.events;

      const role = Array.isArray(application.event_roles)
        ? application.event_roles[0]
        : application.event_roles;

      if (!event || !role) {
        continue;
      }

      /**
       * --------------------------------------------------------
       * 4. Get volunteer shift
       * --------------------------------------------------------
       */
      const { data: shifts, error: shiftError } =
        await supabase
          .from("shift_assignments")
          .select(`
            id,
            status,

            event_shifts (
              id,
              title,
              location,
              date,
              start_time,
              end_time,
              instructions
            )
          `)
          .eq("profile_id", user.id);

      if (shiftError) {
        throw new Error(shiftError.message);
      }

      const assignedShift = (shifts ?? []).find((assignment) => {
        const shift = Array.isArray(assignment.event_shifts)
          ? assignment.event_shifts[0]
          : assignment.event_shifts;

        return shift && application.event_id === event.id;
      });

      const shift = assignedShift
        ? Array.isArray(assignedShift.event_shifts)
          ? assignedShift.event_shifts[0]
          : assignedShift.event_shifts
        : null;

      /**
       * --------------------------------------------------------
       * 5. Get training
       * --------------------------------------------------------
       */
      const { data: trainingModules, error: trainingError } =
        await supabase
          .from("training_modules")
          .select(`
            id,
            title,
            required,
            training_progress (
              completed,
              profile_id
            )
          `)
          .eq("event_id", event.id);

      if (trainingError) {
        throw new Error(trainingError.message);
      }

      const eventTraining = trainingModules ?? [];

      let trainingLabel = "Not required";

      if (eventTraining.length > 0) {
        const completed = eventTraining.filter((training) => {
          const progress = Array.isArray(training.training_progress)
            ? training.training_progress.find(
                (item) => item.profile_id === user.id,
              )
            : training.training_progress;

          return progress?.completed === true;
        }).length;

        trainingLabel =
          `${completed}/${eventTraining.length} completed`;
      }

      /**
       * --------------------------------------------------------
       * 6. Get accreditation
       * --------------------------------------------------------
       */
      const { data: accreditation, error: accreditationError } =
        await supabase
          .from("accreditations")
          .select(`
            id,
            volunteer_identifier,
            zone,
            status,
            qr_code_data
          `)
          .eq("profile_id", user.id)
          .eq("event_id", event.id)
          .eq("role_id", role.id)
          .maybeSingle();

      if (accreditationError) {
        throw new Error(accreditationError.message);
      }

      const accreditationLabel = accreditation
        ? accreditation.status === "approved"
          ? "Approved"
          : accreditation.status
        : "Pending";

      /**
       * --------------------------------------------------------
       * 7. Get attendance
       * --------------------------------------------------------
       */
      const { data: attendance, error: attendanceError } =
        await supabase
          .from("attendance_records")
          .select(`
            id,
            status,
            check_in_time,
            check_out_time
          `)
          .eq("profile_id", user.id)
          .eq("event_id", event.id)
          .maybeSingle();

      if (attendanceError) {
        throw new Error(attendanceError.message);
      }

      let attendanceLabel = "Scheduled";

      if (attendance) {
        switch (attendance.status) {
          case "present":
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

      /**
       * --------------------------------------------------------
       * 8. Format shift
       * --------------------------------------------------------
       */
      let shiftLabel = "Not assigned";

      if (shift) {
        const location = shift.location
          ? ` · ${shift.location}`
          : "";

        shiftLabel =
          `${shift.date} · ${shift.start_time} – ${shift.end_time}${location}`;
      }

      /**
       * --------------------------------------------------------
       * 9. Add My Event
       * --------------------------------------------------------
       */
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