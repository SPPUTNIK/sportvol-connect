import { supabase } from "@/lib/supabase";
import type {
  Application,
  EventRole,
} from "@/lib/types";

export const applicationService = {
  /**
   * ============================================================
   * GET APPLICATIONS
   * ============================================================
   */

  async getApplications(): Promise<Application[]> {
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

    const { data, error } = await supabase
      .from("applications")
      .select(
        `
        id,
        event_id,
        role_id,
        status,
        applied_at,
        experience,
        availability,
        motivation,
        events (
          title
        ),
        event_roles (
          name
        )
      `,
      )
      .eq("profile_id", user.id)
      .order("applied_at", {
        ascending: false,
      });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map(
      (application) => {
        const event = Array.isArray(
          application.events,
        )
          ? application.events[0]
          : application.events;

        const role = Array.isArray(
          application.event_roles,
        )
          ? application.event_roles[0]
          : application.event_roles;

        return {
          id: application.id,

          event_id: application.event_id,

          role_id: application.role_id,

          event_title:
            event?.title ?? "Unknown event",

          role_name:
            role?.name ?? "Volunteer",

          submitted_at:
            application.applied_at,

          status: application.status,

          message:
            application.motivation ?? null,

          availability:
            application.availability ?? null,

          experience:
            application.experience ?? null,
        };
      },
    ) as Application[];
  },

  /**
   * ============================================================
   * GET EVENT ROLES
   * ============================================================
   */

  async getEventRoles(
    eventId: string,
  ): Promise<EventRole[]> {
    if (!eventId) {
      throw new Error(
        "Event ID is required.",
      );
    }

    const { data, error } =
      await supabase
        .from("event_roles")
        .select(
          `
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
        `,
        )
        .eq("event_id", eventId)
        .order("name", {
          ascending: true,
        });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as EventRole[];
  },

  /**
   * ============================================================
   * APPLY FOR ROLE
   * ============================================================
   */

  async applyForRole(input: {
    eventId: string;
    roleId: string;
    availability?: string;
    experience?: string;
    motivation?: string;
  }): Promise<{
    ok: true;
    applicationId: string;
  }> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      throw new Error(authError.message);
    }

    if (!user) {
      throw new Error(
        "You must be signed in to apply for an event.",
      );
    }

    if (!input.eventId) {
      throw new Error("Event is required.");
    }

    if (!input.roleId) {
      throw new Error(
        "Volunteer role is required.",
      );
    }

    /**
     * One application per event.
     */

    const {
      data: existingApplication,
      error: existingError,
    } = await supabase
      .from("applications")
      .select(
        "id, status, role_id",
      )
      .eq("profile_id", user.id)
      .eq("event_id", input.eventId)
      .maybeSingle();

    if (existingError) {
      throw new Error(
        existingError.message,
      );
    }

    if (existingApplication) {
      throw new Error(
        "You have already applied for this event.",
      );
    }

    /**
     * Verify role belongs to event.
     */

    const { data: role, error: roleError } =
      await supabase
        .from("event_roles")
        .select(
          `
          id,
          event_id,
          positions,
          filled_positions
        `,
        )
        .eq("id", input.roleId)
        .eq("event_id", input.eventId)
        .maybeSingle();

    if (roleError) {
      throw new Error(
        roleError.message,
      );
    }

    if (!role) {
      throw new Error(
        "The selected volunteer role does not exist.",
      );
    }

    const remaining =
      role.positions -
      role.filled_positions;

    if (remaining <= 0) {
      throw new Error(
        "This volunteer role is already full.",
      );
    }

    /**
     * Insert.
     */

    const {
      data: application,
      error: insertError,
    } = await supabase
      .from("applications")
      .insert({
        profile_id: user.id,
        event_id: input.eventId,
        role_id: input.roleId,
        status: "pending",

        availability:
          input.availability?.trim() ||
          null,

        experience:
          input.experience?.trim() ||
          null,

        motivation:
          input.motivation?.trim() ||
          null,
      })
      .select("id")
      .single();

    if (insertError) {
      throw new Error(
        insertError.message,
      );
    }

    if (!application) {
      throw new Error(
        "Application was not created.",
      );
    }

    return {
      ok: true,
      applicationId:
        application.id,
    };
  },

  /**
   * ============================================================
   * UPDATE APPLICATION
   * ============================================================
   */

  async updateApplication(input: {
    applicationId: string;
    roleId: string;
    availability: string;
    experience: string;
    motivation: string;
  }): Promise<{ ok: true }> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      throw new Error(
        authError.message,
      );
    }

    if (!user) {
      throw new Error(
        "You must be signed in.",
      );
    }

    if (!input.applicationId) {
      throw new Error(
        "Application is required.",
      );
    }

    if (!input.roleId) {
      throw new Error(
        "Volunteer role is required.",
      );
    }

    /**
     * ----------------------------------------------------------
     * 1. Load current application
     * ----------------------------------------------------------
     */

    const {
      data: application,
      error: applicationError,
    } = await supabase
      .from("applications")
      .select(
        `
        id,
        profile_id,
        event_id,
        role_id,
        status
        `,
      )
      .eq(
        "id",
        input.applicationId,
      )
      .eq(
        "profile_id",
        user.id,
      )
      .maybeSingle();

    if (applicationError) {
      throw new Error(
        applicationError.message,
      );
    }

    if (!application) {
      throw new Error(
        "Application not found.",
      );
    }

    /**
     * ----------------------------------------------------------
     * 2. Only pending / waitlisted can be edited
     * ----------------------------------------------------------
     */

    if (
      application.status !==
        "pending" &&
      application.status !==
        "waitlisted"
    ) {
      throw new Error(
        "This application can no longer be edited.",
      );
    }

    /**
     * ----------------------------------------------------------
     * 3. Verify selected role belongs to same event
     * ----------------------------------------------------------
     */

    const {
      data: role,
      error: roleError,
    } = await supabase
      .from("event_roles")
      .select(
        `
        id,
        event_id,
        positions,
        filled_positions
        `,
      )
      .eq(
        "id",
        input.roleId,
      )
      .eq(
        "event_id",
        application.event_id,
      )
      .maybeSingle();

    if (roleError) {
      throw new Error(
        roleError.message,
      );
    }

    if (!role) {
      throw new Error(
        "The selected role does not belong to this event.",
      );
    }

    /**
     * ----------------------------------------------------------
     * 4. Check role capacity
     *
     * If user keeps the same role, don't block them
     * because their own application is already counted.
     * ----------------------------------------------------------
     */

    if (
      input.roleId !==
      application.role_id
    ) {
      const remaining =
        role.positions -
        role.filled_positions;

      if (remaining <= 0) {
        throw new Error(
          "This volunteer role is already full.",
        );
      }
    }

    /**
     * ----------------------------------------------------------
     * 5. Update
     * ----------------------------------------------------------
     */

    const {
      error: updateError,
    } = await supabase
      .from("applications")
      .update({
        role_id: input.roleId,

        availability:
          input.availability.trim() ||
          null,

        experience:
          input.experience.trim() ||
          null,

        motivation:
          input.motivation.trim() ||
          null,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        input.applicationId,
      )
      .eq(
        "profile_id",
        user.id,
      );

    if (updateError) {
      throw new Error(
        updateError.message,
      );
    }

    return {
      ok: true,
    };
  },
};
