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
};