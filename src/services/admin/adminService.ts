import { supabase } from "@/lib/supabase";

import type {
  Admin,
  AdminAnalyticsSummary,
  AdminApplicationSummary,
  AdminAttendanceSummary,
  AdminCertificateSummary,
  AdminEventSummary,
  AdminNotificationSummary,
  AdminReportSummary,
  AdminStats,
  AdminTrainingResultSummary,
  AdminTrainingSummary,
  AdminVolunteerSummary,
} from "@/types/domain";

/**
 * =========================================================
 * ADMIN SERVICE
 * =========================================================
 *
 * Supabase-backed admin service.
 *
 * All methods are async.
 *
 * The service keeps the existing Admin UI shapes so pages do
 * not need to know about the database column names.
 * =========================================================
 */

function fullName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
) {
  return `${firstName ?? ""} ${lastName ?? ""}`.trim() || "Unnamed volunteer";
}

function normalizeStatus(value: unknown) {
  return String(value ?? "").toLowerCase();
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export const adminService = {
  /**
   * ---------------------------------------------------------
   * ADMIN
   * ---------------------------------------------------------
   */

  async getAdmin(): Promise<Admin | null> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      throw authError;
    }

    if (!user) {
      return null;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select(`
        id,
        email,
        first_name,
        last_name,
        avatar_url,
        role
      `)
      .eq("id", user.id)
      .single();

    if (error) {
      throw error;
    }

    if (String(profile.role).toUpperCase() !== "ADMIN") {
      return null;
    }

    return {
      id: profile.id,
      email: profile.email ?? user.email ?? null,
      firstName: profile.first_name ?? "",
      lastName: profile.last_name ?? "",
      avatarUrl: profile.avatar_url ?? null,
      role: "ADMIN",
    };
  },

  /**
   * ---------------------------------------------------------
   * DASHBOARD STATS
   * ---------------------------------------------------------
   */

  async getStats(): Promise<AdminStats> {
    const today = getToday();

    const [
      volunteersResult,
      upcomingEventsResult,
      applicationsResult,
      acceptedApplicationsResult,
      profilesHoursResult,
      attendanceResult,
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "volunteer"),

      supabase
        .from("events")
        .select("id", { count: "exact", head: true })
        .gte("start_date", today)
        .not("status", "eq", "cancelled"),

      supabase
        .from("applications")
        .select("id", { count: "exact", head: true }),

      supabase
        .from("applications")
        .select("profile_id")
        .eq("status", "accepted"),

      supabase
        .from("profiles")
        .select("volunteer_hours")
        .eq("role", "volunteer"),

      supabase
        .from("profiles")
        .select("attendance_rate")
        .eq("role", "volunteer"),
    ]);

    if (volunteersResult.error) throw volunteersResult.error;
    if (upcomingEventsResult.error) throw upcomingEventsResult.error;
    if (applicationsResult.error) throw applicationsResult.error;
    if (acceptedApplicationsResult.error) {
      throw acceptedApplicationsResult.error;
    }
    if (profilesHoursResult.error) throw profilesHoursResult.error;
    if (attendanceResult.error) throw attendanceResult.error;

    const acceptedVolunteers = new Set(
      (acceptedApplicationsResult.data ?? []).map(
        (item) => item.profile_id,
      ),
    ).size;

    const hours = (profilesHoursResult.data ?? []).reduce(
      (total, profile) => total + Number(profile.volunteer_hours ?? 0),
      0,
    );

    const attendanceValues = (attendanceResult.data ?? [])
      .map((profile) => Number(profile.attendance_rate ?? 0))
      .filter((value) => Number.isFinite(value));

    const attendanceAverage =
      attendanceValues.length > 0
        ? attendanceValues.reduce((sum, value) => sum + value, 0) /
          attendanceValues.length
        : 0;

    return {
      volunteers: volunteersResult.count ?? 0,
      upcomingEvents: upcomingEventsResult.count ?? 0,
      applications: applicationsResult.count ?? 0,
      acceptedVolunteers,
      hours,
      attendance: `${Math.round(attendanceAverage)}%`,
    };
  },

  /**
   * ---------------------------------------------------------
   * EVENTS
   * ---------------------------------------------------------
   */

  async getEvents(): Promise<AdminEventSummary[]> {
    const { data, error } = await supabase
      .from("events")
      .select(`
        id,
        title,
        slug,
        sport,
        city,
        country,
        venue,
        start_date,
        end_date,
        start_time,
        end_time,
        application_deadline,
        total_volunteers_needed,
        description,
        status,
        created_at,
        updated_at,
        event_roles (
          id
        ),
        applications (
          id
        ),
        event_shifts (
          id
        )
      `)
      .order("start_date", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map((event) => ({
      id: event.id,

      title: event.title,
      slug: event.slug,

      sport: event.sport,

      city: event.city,
      country: event.country,
      venue: event.venue,

      startDate: event.start_date,
      endDate: event.end_date,

      startTime: event.start_time,
      endTime: event.end_time,

      applicationDeadline: event.application_deadline,

      totalVolunteersNeeded: event.total_volunteers_needed,

      description: event.description,

      status: normalizeStatus(event.status) as AdminEventSummary["status"],

      roles: event.event_roles?.length ?? 0,
      volunteers: event.applications?.length ?? 0,
      shifts: event.event_shifts?.length ?? 0,

      createdAt: event.created_at,
      updatedAt: event.updated_at,
    }));
  },

  /**
   * ---------------------------------------------------------
   * APPLICATIONS
   * ---------------------------------------------------------
   */

  async getApplications(): Promise<AdminApplicationSummary[]> {
    const { data, error } = await supabase
      .from("applications")
      .select(`
        id,
        profile_id,
        event_id,
        role_id,
        status,
        applied_at,

        profiles (
          id,
          first_name,
          last_name,
          avatar_url
        ),

        events (
          id,
          title
        ),

        event_roles (
          id,
          name
        )
      `)
      .order("applied_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map((item) => {
      const profile = Array.isArray(item.profiles)
        ? item.profiles[0]
        : item.profiles;

      const event = Array.isArray(item.events)
        ? item.events[0]
        : item.events;

      const role = Array.isArray(item.event_roles)
        ? item.event_roles[0]
        : item.event_roles;

      return {
        id: item.id,

        volunteerId: item.profile_id,
        volunteer: fullName(
          profile?.first_name,
          profile?.last_name,
        ),

        avatar_url: profile?.avatar_url ?? null,

        eventId: item.event_id,
        event: event?.title ?? "Unknown event",

        roleId: item.role_id,
        role: role?.name ?? "Unknown role",

        date: item.applied_at,

        status: normalizeStatus(
          item.status,
        ) as AdminApplicationSummary["status"],
      };
    });
  },

  /**
   * ---------------------------------------------------------
   * APPLICATION DETAILS
   * ---------------------------------------------------------
   */

  async getApplicationById(id: string) {
    const { data, error } = await supabase
      .from("applications")
      .select(`
        id,
        profile_id,
        event_id,
        role_id,
        status,
        experience,
        availability,
        motivation,
        admin_notes,
        applied_at,
        updated_at,

        profiles (
          id,
          first_name,
          last_name,
          email,
          phone,
          avatar_url,
          city,
          country,
          bio,
          status,
          role,
          created_at
        ),

        events (
          id,
          title,
          sport,
          city,
          country,
          venue,
          start_date,
          end_date,
          start_time,
          end_time,
          description,
          status
        ),

        event_roles (
          id,
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
      throw error;
    }

    if (!data) {
      return null;
    }

    const profile = Array.isArray(data.profiles)
      ? data.profiles[0]
      : data.profiles;

    const event = Array.isArray(data.events)
      ? data.events[0]
      : data.events;

    const role = Array.isArray(data.event_roles)
      ? data.event_roles[0]
      : data.event_roles;

    return {
      id: data.id,

      volunteerId: data.profile_id,

      volunteer: {
        id: profile?.id ?? data.profile_id,
        name: fullName(
          profile?.first_name,
          profile?.last_name,
        ),
        firstName: profile?.first_name ?? "",
        lastName: profile?.last_name ?? "",
        email: profile?.email ?? null,
        phone: profile?.phone ?? null,
        avatarUrl: profile?.avatar_url ?? null,
        city: profile?.city ?? null,
        country: profile?.country ?? null,
        bio: profile?.bio ?? null,
        status: profile?.status ?? null,
        role: profile?.role ?? null,
        createdAt: profile?.created_at ?? null,
      },

      event: {
        id: event?.id ?? data.event_id,
        title: event?.title ?? "Unknown event",
        sport: event?.sport ?? null,
        city: event?.city ?? null,
        country: event?.country ?? null,
        venue: event?.venue ?? null,
        startDate: event?.start_date ?? null,
        endDate: event?.end_date ?? null,
        startTime: event?.start_time ?? null,
        endTime: event?.end_time ?? null,
        description: event?.description ?? null,
        status: event?.status ?? null,
      },

      role: {
        id: role?.id ?? data.role_id,
        name: role?.name ?? "Unknown role",
        description: role?.description ?? null,
        responsibilities: role?.responsibilities ?? null,
        requirements: role?.requirements ?? null,
        skills: role?.skills ?? [],
        positions: role?.positions ?? null,
        filledPositions: role?.filled_positions ?? null,
        minAge: role?.min_age ?? null,
        mandatoryTraining: role?.mandatory_training ?? false,
      },

      status: normalizeStatus(data.status),

      experience: data.experience ?? null,
      availability: data.availability ?? null,
      motivation: data.motivation ?? null,
      adminNotes: data.admin_notes ?? null,

      appliedAt: data.applied_at,
      updatedAt: data.updated_at,
    };
  },

  /**
   * ---------------------------------------------------------
   * UPDATE APPLICATION STATUS
   * ---------------------------------------------------------
   */

  async updateApplicationStatus(
    id: string,
    status: string,
  ) {
    const { data, error } = await supabase
      .from("applications")
      .update({
        status: status as never,
      })
      .eq("id", id)
      .select("id, status, updated_at")
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      status: normalizeStatus(data.status),
      updatedAt: data.updated_at,
    };
  },

  /**
   * ---------------------------------------------------------
   * VOLUNTEERS
   * ---------------------------------------------------------
   *
   * Events:
   *   applications.profile_id
   *
   * Hours:
   *   profiles.volunteer_hours
   *
   * Certificates:
   *   certificates.profile_id
   *
   * Attendance:
   *   profiles.attendance_rate
   * ---------------------------------------------------------
   */

  async getVolunteers(): Promise<AdminVolunteerSummary[]> {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select(`
        id,
        first_name,
        last_name,
        avatar_url,
        email,
        phone,
        city,
        country,
        role,
        volunteer_hours,
        attendance_rate,
        status,
        created_at
      `)
      .neq("role", "admin")
      .order("created_at", { ascending: false });

    if (profilesError) {
      throw profilesError;
    }

    if (!profiles || profiles.length === 0) {
      return [];
    }

    const volunteerIds = profiles.map((profile) => profile.id);

    const [
      applicationsResult,
      certificatesResult,
    ] = await Promise.all([
      supabase
        .from("applications")
        .select("profile_id, event_id")
        .in("profile_id", volunteerIds),

      supabase
        .from("certificates")
        .select("profile_id")
        .in("profile_id", volunteerIds),
    ]);

    if (applicationsResult.error) {
      throw applicationsResult.error;
    }

    if (certificatesResult.error) {
      throw certificatesResult.error;
    }

    return profiles.map((profile) => {
      const events = new Set(
        (applicationsResult.data ?? [])
          .filter((application) => application.profile_id === profile.id)
          .map((application) => application.event_id),
      ).size;

      const certificates = (certificatesResult.data ?? []).filter(
        (certificate) => certificate.profile_id === profile.id,
      ).length;

      return {
        id: profile.id,

        name: fullName(profile.first_name, profile.last_name),
        avatar_url: profile.avatar_url ?? null,

        email: profile.email,
        phone: profile.phone,
        role: (profile.role as AdminVolunteerSummary["role"]) ?? "volunteer",

        city: profile.city ?? "",
        country: profile.country ?? "",

        events,

        hours: Number(profile.volunteer_hours ?? 0),

        attendance: `${Math.round(
          Number(profile.attendance_rate ?? 0),
        )}%`,

        certificates,

        status: profile.status,

        joinedAt: profile.created_at,
      };
    });
  },

  async updateUserRole(userId: string, role: "volunteer" | "leader") {
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", userId);

    if (error) {
      throw new Error(error.message);
    }
  },

  async getVolunteerById(id: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id,
        email,
        role,
        status,
        first_name,
        last_name,
        date_of_birth,
        avatar_url,
        phone,
        city,
        country,
        bio,
        interests,
        skills,
        languages,
        experience,
        volunteer_hours,
        attendance_rate,
        created_at,
        updated_at,
        nationality
      `)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    const [
      applicationsResult,
      certificatesResult,
    ] = await Promise.all([
      supabase
        .from("applications")
        .select(`
          id,
          event_id,
          role_id,
          status,
          applied_at,

          events (
            id,
            title,
            sport,
            city,
            country,
            venue,
            start_date,
            end_date,
            status
          ),

          event_roles (
            id,
            name
          )
        `)
        .eq("profile_id", id)
        .order("applied_at", { ascending: false }),

      supabase
        .from("certificates")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", id),
    ]);

    if (applicationsResult.error) {
      throw applicationsResult.error;
    }

    if (certificatesResult.error) {
      throw certificatesResult.error;
    }

    const applications = (applicationsResult.data ?? []).map((item) => {
      const event = Array.isArray(item.events)
        ? item.events[0]
        : item.events;

      const role = Array.isArray(item.event_roles)
        ? item.event_roles[0]
        : item.event_roles;

      return {
        id: item.id,
        eventId: item.event_id,
        event: event
          ? {
              id: event.id,
              title: event.title,
              sport: event.sport,
              city: event.city,
              country: event.country,
              venue: event.venue,
              startDate: event.start_date,
              endDate: event.end_date,
              status: event.status,
            }
          : null,
        role: role
          ? {
              id: role.id,
              name: role.name,
            }
          : null,
        status: String(item.status ?? "").toLowerCase(),
        appliedAt: item.applied_at,
      };
    });

    return {
      id: data.id,

      name: fullName(
        data.first_name,
        data.last_name,
      ),

      firstName: data.first_name ?? "",
      lastName: data.last_name ?? "",

      email: data.email ?? null,
      phone: data.phone ?? null,

      avatarUrl: data.avatar_url ?? null,

      dateOfBirth: data.date_of_birth ?? null,
      nationality: data.nationality ?? null,

      city: data.city ?? null,
      country: data.country ?? null,

      bio: data.bio ?? null,

      interests: data.interests ?? [],
      skills: data.skills ?? [],
      languages: data.languages ?? [],

      experience: data.experience ?? null,

      role: String(data.role ?? ""),
      status: normalizeStatus(data.status),

      volunteerHours: data.volunteer_hours ?? 0,
      attendanceRate: Number(data.attendance_rate ?? 0),

      createdAt: data.created_at,
      updatedAt: data.updated_at,

      certificates: certificatesResult.count ?? 0,

      applications,
    };
  },


    /**
   * ---------------------------------------------------------
   * TRAINING
   * ---------------------------------------------------------
   */

  async getTrainingResults(trainingId?: string): Promise<AdminTrainingResultSummary[]> {
    let query = supabase
      .from("training_progress")
      .select(`
        id,
        training_id,
        profile_id,
        score,
        total_questions,
        passed,
        completed,
        submitted_at,

        profiles (
          id,
          first_name,
          last_name,
          avatar_url
        ),

        training_modules (
          id,
          title
        )
      `)
      .order("submitted_at", { ascending: false });

    if (trainingId) {
      query = query.eq("training_id", trainingId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => {
      const profile = Array.isArray(row.profiles)
        ? row.profiles[0]
        : row.profiles;

      const module = Array.isArray(row.training_modules)
        ? row.training_modules[0]
        : row.training_modules;

      return {
        id: row.id,
        trainingId: row.training_id,
        trainingTitle: module?.title ?? "Training",
        volunteerId: row.profile_id,
        volunteer: fullName(
          profile?.first_name,
          profile?.last_name,
        ),
        avatarUrl: profile?.avatar_url ?? null,
        score: Number(row.score ?? 0),
        totalQuestions: Number(row.total_questions ?? 0),
        passed: Boolean(row.passed),
        submittedAt: row.submitted_at ?? null,
        completed: Boolean(row.completed),
      };
    });
  },

  async getTraining(): Promise<AdminTrainingSummary[]> {
    const { data: modules, error: modulesError } = await supabase
      .from("training_modules")
      .select(`
        id,
        title,
        description,
        event_id,
        role_id,
        required,
        training_mode,
        zoom_url,
        status,
        published_at,
        created_at,

        events (
          id,
          title
        ),

        event_roles (
          id,
          name
        )
      `)
      .order("created_at", { ascending: false });

    if (modulesError) {
      throw modulesError;
    }

    if (!modules || modules.length === 0) {
      return [];
    }

    const trainingIds = modules.map((module) => module.id);

    const [progressResult, questionsResult] =
      await Promise.all([
        supabase
          .from("training_progress")
          .select(`
            training_id,
            profile_id,
            completed
          `)
          .in("training_id", trainingIds),

        supabase
          .from("training_questions")
          .select(`
            id,
            training_id
          `)
          .in("training_id", trainingIds),
      ]);

    if (progressResult.error) {
      throw progressResult.error;
    }

    if (questionsResult.error) {
      throw questionsResult.error;
    }

    const progress = progressResult.data ?? [];
    const questions = questionsResult.data ?? [];

    return modules.map((module) => {
      const event = Array.isArray(module.events)
        ? module.events[0]
        : module.events;

      const role = Array.isArray(module.event_roles)
        ? module.event_roles[0]
        : module.event_roles;

      const moduleProgress = progress.filter(
        (item) => item.training_id === module.id,
      );

      const moduleQuestions = questions.filter(
        (item) => item.training_id === module.id,
      );

      const assigned = moduleProgress.length;

      const completed = moduleProgress.filter(
        (item) => item.completed === true,
      ).length;

      return {
        id: module.id,

        title: module.title,

        description: module.description ?? "",

        type: module.required
          ? "Required"
          : "Optional",

        duration: 0,

        eventId: module.event_id ?? null,
        event: event?.title ?? null,

        roleId: module.role_id ?? null,
        role: role?.name ?? null,

        trainingMode:
          module.training_mode === "online" ||
          module.training_mode === "hybrid"
            ? module.training_mode
            : "in_person",

        zoomUrl: module.zoom_url ?? null,

        required: module.required,

        questionsCount: moduleQuestions.length,

        assigned,
        completed,

        status:
          module.status === "published"
            ? "published"
            : "draft",

        publishedAt:
          module.published_at ?? null,

        createdAt: module.created_at,
      };
    });
  },

  /**
   * ---------------------------------------------------------
   * CREATE TRAINING
   * ---------------------------------------------------------
   */

  async createTraining({
    title,
    description,
    eventId,
    roleId,
    trainingMode,
    zoomUrl,
    required,
  }: {
    title: string;
    description: string;
    eventId: string | null;
    roleId: string | null;
    trainingMode: "online" | "in_person" | "hybrid";
    zoomUrl: string | null;
    required: boolean;
  }) {
    const { data, error } = await supabase
      .from("training_modules")
      .insert({
        title: title.trim(),

        description:
          description.trim() || null,

        event_id: eventId,

        role_id: roleId,

        training_mode: trainingMode,

        zoom_url:
          trainingMode === "online" ||
          trainingMode === "hybrid"
            ? zoomUrl?.trim() || null
            : null,

        required,

        // New trainings start as draft.
        status: "draft",

        published_at: null,
      })
      .select(`
        id,
        title,
        description,
        event_id,
        role_id,
        required,
        training_mode,
        zoom_url,
        status,
        published_at,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * ---------------------------------------------------------
   * UPDATE TRAINING
   * ---------------------------------------------------------
   */

  async updateTraining({
    id,
    title,
    description,
    eventId,
    roleId,
    trainingMode,
    zoomUrl,
    required,
    status,
  }: {
    id: string;
    title: string;
    description: string;
    eventId: string | null;
    roleId: string | null;
    trainingMode: "online" | "in_person" | "hybrid";
    zoomUrl: string | null;
    required: boolean;
    status: "draft" | "published";
  }) {
    const publishedAt =
      status === "published"
        ? new Date().toISOString()
        : null;

    const { data, error } = await supabase
      .from("training_modules")
      .update({
        title: title.trim(),

        description:
          description.trim() || null,

        event_id: eventId,

        role_id: roleId,

        training_mode: trainingMode,

        zoom_url:
          trainingMode === "online" ||
          trainingMode === "hybrid"
            ? zoomUrl?.trim() || null
            : null,

        required,

        status,

        published_at: publishedAt,
      })
      .eq("id", id)
      .select(`
        id,
        title,
        description,
        event_id,
        role_id,
        required,
        training_mode,
        zoom_url,
        status,
        published_at,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * ---------------------------------------------------------
   * UPDATE TRAINING STATUS
   * ---------------------------------------------------------
   */

  async updateTrainingStatus(
    id: string,
    status: "draft" | "published",
  ) {
    const publishedAt =
      status === "published"
        ? new Date().toISOString()
        : null;

    const { data, error } = await supabase
      .from("training_modules")
      .update({
        status,
        published_at: publishedAt,
      })
      .eq("id", id)
      .select(`
        id,
        status,
        published_at
      `)
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * ---------------------------------------------------------
   * TRAINING QUESTIONS
   * ---------------------------------------------------------
   */

  async getTrainingQuestions(
    trainingId: string,
  ) {
    const { data, error } = await supabase
      .from("training_questions")
      .select(`
        id,
        training_id,
        question_number,
        question,
        options,
        correct_options,
        points,
        created_at,
        updated_at
      `)
      .eq("training_id", trainingId)
      .order("question_number", {
        ascending: true,
      });

    if (error) {
      throw error;
    }

    return (data ?? []).map((item) => ({
      id: item.id,
      trainingId: item.training_id,
      questionNumber: item.question_number,
      question: item.question,

      options: Array.isArray(item.options)
        ? item.options
        : [],

      correctOptions: Array.isArray(
        item.correct_options,
      )
        ? item.correct_options
        : [],

      points: item.points,

      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  },

  async createTrainingQuestion({
    trainingId,
    questionNumber,
    question,
    options,
    correctOptions,
    points = 1,
  }: {
    trainingId: string;
    questionNumber: number;
    question: string;
    options: string[];
    correctOptions: string[];
    points?: number;
  }) {
    if (
      questionNumber < 1 ||
      questionNumber > 20
    ) {
      throw new Error(
        "Question number must be between 1 and 20.",
      );
    }

    if (!question.trim()) {
      throw new Error(
        "Question text is required.",
      );
    }

    if (options.length < 2) {
      throw new Error(
        "A question must have at least 2 options.",
      );
    }

    if (correctOptions.length === 0) {
      throw new Error(
        "Please select at least one correct answer.",
      );
    }

    const { data, error } = await supabase
      .from("training_questions")
      .insert({
        training_id: trainingId,
        question_number: questionNumber,
        question: question.trim(),
        options,
        correct_options: correctOptions,
        points,
      })
      .select(`
        id,
        training_id,
        question_number,
        question,
        options,
        correct_options,
        points,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      trainingId: data.training_id,
      questionNumber: data.question_number,
      question: data.question,

      options: Array.isArray(data.options)
        ? data.options
        : [],

      correctOptions: Array.isArray(
        data.correct_options,
      )
        ? data.correct_options
        : [],

      points: data.points,

      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async updateTrainingQuestion({
    id,
    questionNumber,
    question,
    options,
    correctOptions,
    points = 1,
  }: {
    id: string;
    questionNumber: number;
    question: string;
    options: string[];
    correctOptions: string[];
    points?: number;
  }) {
    if (
      questionNumber < 1 ||
      questionNumber > 20
    ) {
      throw new Error(
        "Question number must be between 1 and 20.",
      );
    }

    if (!question.trim()) {
      throw new Error(
        "Question text is required.",
      );
    }

    if (options.length < 2) {
      throw new Error(
        "A question must have at least 2 options.",
      );
    }

    if (correctOptions.length === 0) {
      throw new Error(
        "Please select at least one correct answer.",
      );
    }

    const { data, error } = await supabase
      .from("training_questions")
      .update({
        question_number: questionNumber,
        question: question.trim(),
        options,
        correct_options: correctOptions,
        points,
      })
      .eq("id", id)
      .select(`
        id,
        training_id,
        question_number,
        question,
        options,
        correct_options,
        points,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      trainingId: data.training_id,
      questionNumber: data.question_number,
      question: data.question,

      options: Array.isArray(data.options)
        ? data.options
        : [],

      correctOptions: Array.isArray(
        data.correct_options,
      )
        ? data.correct_options
        : [],

      points: data.points,

      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async deleteTrainingQuestion(
    id: string,
  ) {
    const { error } = await supabase
      .from("training_questions")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }
  },

  /**
   * ---------------------------------------------------------
   * ATTENDANCE
   * ---------------------------------------------------------
   */

  async getAttendance(): Promise<AdminAttendanceSummary[]> {
    const { data, error } = await supabase
      .from("attendance_records")
      .select(`
        id,
        profile_id,
        event_id,
        shift_id,
        status,
        check_in_time,
        check_out_time,

        profiles (
          id,
          first_name,
          last_name
        ),

        events (
          id,
          title
        ),

        event_shifts (
          id,
          title
        )
      `)
      .order("date", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map((item) => {
      const profile = Array.isArray(item.profiles)
        ? item.profiles[0]
        : item.profiles;

      const event = Array.isArray(item.events)
        ? item.events[0]
        : item.events;

      const shift = Array.isArray(item.event_shifts)
        ? item.event_shifts[0]
        : item.event_shifts;

      return {
        id: item.id,

        eventId: item.event_id,
        event: event?.title ?? "Unknown event",

        volunteerId: item.profile_id,
        volunteer: fullName(
          profile?.first_name,
          profile?.last_name,
        ),

        shiftId: item.shift_id,
        shift: shift?.title ?? "Unknown shift",

        checkIn: item.check_in_time,
        checkOut: item.check_out_time,

        status: normalizeStatus(
          item.status,
        ) as AdminAttendanceSummary["status"],
      };
    });
  },

  /**
   * ---------------------------------------------------------
   * CERTIFICATES
   * ---------------------------------------------------------
   */

  async getCertificates(): Promise<AdminCertificateSummary[]> {
    const { data, error } = await supabase
      .from("certificates")
      .select(`
        id,
        profile_id,
        event_id,
        hours,
        date,
        issued_at,

        profiles (
          id,
          first_name,
          last_name
        ),

        events (
          id,
          title
        )
      `)
      .order("issued_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map((item) => {
      const profile = Array.isArray(item.profiles)
        ? item.profiles[0]
        : item.profiles;

      const event = Array.isArray(item.events)
        ? item.events[0]
        : item.events;

      return {
        id: item.id,

        volunteerId: item.profile_id,

        volunteer: fullName(
          profile?.first_name,
          profile?.last_name,
        ),

        eventId: item.event_id,

        event: event?.title ?? "Unknown event",

        hours: Number(item.hours ?? 0),

        date: item.date,

        issuedAt: item.issued_at,

        status: "issued",
      };
    });
  },

  /**
   * ---------------------------------------------------------
   * NOTIFICATIONS
   * ---------------------------------------------------------
   *
   * Current DB stores one notification per profile.
   *
   * audienceType:
   *   event_id != null -> event_team
   *   event_id == null -> all_volunteers
   *
   * status:
   *   read == true -> sent
   *   read == false -> draft
   *
   * These are UI mappings because the DB does not contain
   * separate audience/status/sent_at columns.
   * ---------------------------------------------------------
   */

  async getNotifications(): Promise<AdminNotificationSummary[]> {
    const { data, error } = await supabase
      .from("notifications")
      .select(`
        id,
        profile_id,
        event_id,
        title,
        body,
        category,
        read,
        created_at,

        profiles (
          id,
          first_name,
          last_name
        ),

        events (
          id,
          title
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map((item) => {
      const profile = Array.isArray(item.profiles)
        ? item.profiles[0]
        : item.profiles;

      const event = Array.isArray(item.events)
        ? item.events[0]
        : item.events;

      return {
        id: item.id,

        title: item.title,

        audienceType: item.event_id
          ? "event_team"
          : "all_volunteers",

        audience: fullName(
          profile?.first_name,
          profile?.last_name,
        ),

        category: normalizeStatus(
          item.category,
        ) as AdminNotificationSummary["category"],

        eventId: item.event_id,

        event: event?.title ?? "All volunteers",

        message: item.body,

        sentAt: item.read ? item.created_at : null,

        status: item.read ? "sent" : "draft",
      };
    });
  },

  /**
   * ---------------------------------------------------------
   * REPORTS
   * ---------------------------------------------------------
   *
   * Reports table stores individual reports, not precomputed
   * dashboard cards.
   *
   * The existing AdminReportSummary is a presentation model,
   * so we aggregate reports by status/type.
   * ---------------------------------------------------------
   */

  async getReports(): Promise<AdminReportSummary[]> {
    const { data, error } = await supabase
      .from("reports")
      .select(`
        id,
        target_type,
        report_type,
        status,
        created_at
      `)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const reports = data ?? [];

    const openCount = reports.filter(
      (report) => normalizeStatus(report.status) === "open",
    ).length;

    const resolvedCount = reports.filter(
      (report) => normalizeStatus(report.status) === "resolved",
    ).length;

    const totalCount = reports.length;

    const byType = new Map<string, number>();

    for (const report of reports) {
      const type = report.report_type || "other";
      byType.set(type, (byType.get(type) ?? 0) + 1);
    }

    const result: AdminReportSummary[] = [
      {
        label: "Total reports",
        value: String(totalCount),
        change: "",
        description: "Total reports submitted to the platform.",
      },
      {
        label: "Open reports",
        value: String(openCount),
        change: "",
        description: "Reports that still require attention.",
      },
      {
        label: "Resolved reports",
        value: String(resolvedCount),
        change: "",
        description: "Reports that have been resolved.",
      },
    ];

    for (const [type, count] of byType) {
      result.push({
        label: type,
        value: String(count),
        change: "",
        description: `Reports classified as ${type}.`,
      });
    }

    return result;
  },

  /**
   * ---------------------------------------------------------
   * ANALYTICS
   * ---------------------------------------------------------
   */

  async getAnalytics(): Promise<AdminAnalyticsSummary[]> {
    const [
      volunteersResult,
      eventsResult,
      applicationsResult,
      attendanceResult,
      certificatesResult,
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "volunteer"),

      supabase
        .from("events")
        .select("id", { count: "exact", head: true }),

      supabase
        .from("applications")
        .select("id", { count: "exact", head: true }),

      supabase
        .from("attendance_records")
        .select("id", { count: "exact", head: true }),

      supabase
        .from("certificates")
        .select("id", { count: "exact", head: true }),
    ]);

    if (volunteersResult.error) throw volunteersResult.error;
    if (eventsResult.error) throw eventsResult.error;
    if (applicationsResult.error) throw applicationsResult.error;
    if (attendanceResult.error) throw attendanceResult.error;
    if (certificatesResult.error) throw certificatesResult.error;

    return [
      {
        label: "Volunteers",
        value: volunteersResult.count ?? 0,
        color: "bg-primary",
      },
      {
        label: "Events",
        value: eventsResult.count ?? 0,
        color: "bg-ink",
      },
      {
        label: "Applications",
        value: applicationsResult.count ?? 0,
        color: "bg-primary/70",
      },
      {
        label: "Attendance records",
        value: attendanceResult.count ?? 0,
        color: "bg-ink/70",
      },
      {
        label: "Certificates",
        value: certificatesResult.count ?? 0,
        color: "bg-primary/50",
      },
    ];
  },

  /**
   * ---------------------------------------------------------
   * ACCREDITATIONS
   * ---------------------------------------------------------
   */

  async getAccreditations() {
    const { data, error } = await supabase
      .from("accreditations")
      .select(`
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
          id,
          first_name,
          last_name,
          avatar_url
        ),

        events (
          id,
          title
        ),

        event_roles (
          id,
          name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map((item) => {
      const profile = Array.isArray(item.profiles)
        ? item.profiles[0]
        : item.profiles;

      const event = Array.isArray(item.events)
        ? item.events[0]
        : item.events;

      const role = Array.isArray(item.event_roles)
        ? item.event_roles[0]
        : item.event_roles;

      return {
        id: item.id,
        volunteerId: item.profile_id,
        volunteer: fullName(
          profile?.first_name,
          profile?.last_name,
        ),
        avatar_url: profile?.avatar_url ?? null,
        eventId: item.event_id,
        event: event?.title ?? "Unknown event",
        roleId: item.role_id,
        role: role?.name ?? "Unknown role",
        volunteerIdentifier: item.volunteer_identifier,
        zone: item.zone,
        qrCodeData: item.qr_code_data,
        status: item.status,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      };
    });
  },

  async getAccreditationById(id: string) {
    const { data, error } = await supabase
      .from("accreditations")
      .select(`
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
          id,
          first_name,
          last_name,
          email,
          phone,
          avatar_url,
          date_of_birth,
          nationality,
          city,
          country,
          bio,
          interests,
          skills,
          languages,
          experience,
          volunteer_hours,
          attendance_rate,
          status
        ),

        events (
          id,
          title,
          sport,
          city,
          country,
          venue,
          start_date,
          end_date,
          start_time,
          end_time,
          description,
          status
        ),

        event_roles (
          id,
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
      throw error;
    }

    if (!data) {
      return null;
    }

    const profile = Array.isArray(data.profiles)
      ? data.profiles[0]
      : data.profiles;

    const event = Array.isArray(data.events)
      ? data.events[0]
      : data.events;

    const role = Array.isArray(data.event_roles)
      ? data.event_roles[0]
      : data.event_roles;

    return {
      id: data.id,

      volunteer: {
        id: profile?.id ?? data.profile_id,
        name: fullName(
          profile?.first_name,
          profile?.last_name,
        ),
        firstName: profile?.first_name ?? "",
        lastName: profile?.last_name ?? "",
        email: profile?.email ?? null,
        phone: profile?.phone ?? null,
        avatarUrl: profile?.avatar_url ?? null,
        dateOfBirth: profile?.date_of_birth ?? null,
        nationality: profile?.nationality ?? null,
        city: profile?.city ?? null,
        country: profile?.country ?? null,
        bio: profile?.bio ?? null,
        interests: profile?.interests ?? [],
        skills: profile?.skills ?? [],
        languages: profile?.languages ?? [],
        experience: profile?.experience ?? null,
        volunteerHours: profile?.volunteer_hours ?? 0,
        attendanceRate: Number(
          profile?.attendance_rate ?? 0,
        ),
        status: profile?.status ?? null,
      },

      event: {
        id: event?.id ?? data.event_id,
        title: event?.title ?? "Unknown event",
        sport: event?.sport ?? null,
        city: event?.city ?? null,
        country: event?.country ?? null,
        venue: event?.venue ?? null,
        startDate: event?.start_date ?? null,
        endDate: event?.end_date ?? null,
        startTime: event?.start_time ?? null,
        endTime: event?.end_time ?? null,
        description: event?.description ?? null,
        status: event?.status ?? null,
      },

      role: {
        id: role?.id ?? data.role_id,
        name: role?.name ?? "Unknown role",
        description: role?.description ?? null,
        responsibilities:
          role?.responsibilities ?? null,
        requirements: role?.requirements ?? null,
        skills: role?.skills ?? [],
        positions: role?.positions ?? null,
        filledPositions:
          role?.filled_positions ?? null,
        minAge: role?.min_age ?? null,
        mandatoryTraining:
          role?.mandatory_training ?? false,
      },

      volunteerIdentifier:
        data.volunteer_identifier,

      zone: data.zone ?? null,

      qrCodeData:
        data.qr_code_data ?? null,

      status: normalizeStatus(data.status),

      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

async updateAccreditationStatus(
  id: string,
  status: string,
) {
  const { data, error } = await supabase
    .from("accreditations")
    .update({
      status,
    })
    .eq("id", id)
    .select("id, status, updated_at")
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    status: normalizeStatus(data.status),
    updatedAt: data.updated_at,
  };
},

  /**
   * ---------------------------------------------------------
   * ADMIN PROFILE
   * ---------------------------------------------------------
   */

  async getAdminProfile() {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      throw authError;
    }

    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id,
        email,
        first_name,
        last_name,
        avatar_url,
        phone,
        city,
        country,
        bio,
        status,
        role,
        created_at,
        updated_at
      `)
      .eq("id", user.id)
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      email: data.email ?? user.email ?? null,
      firstName: data.first_name ?? "",
      lastName: data.last_name ?? "",
      avatarUrl: data.avatar_url ?? null,
      phone: data.phone,
      city: data.city,
      country: data.country,
      bio: data.bio,
      status: data.status,
      role: data.role,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async updateAdminProfile({
    firstName,
    lastName,
    email,
  }: {
    firstName: string;
    lastName: string;
    email: string;
  }) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;
    if (!user) {
      throw new Error("No authenticated user found.");
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
      })
      .eq("id", user.id)
      .select("id, first_name, last_name, email")
      .single();

    if (error) throw error;

    return {
      id: data.id,
      firstName: data.first_name ?? "",
      lastName: data.last_name ?? "",
      email: data.email ?? "",
    };
  },

  /**
   * ---------------------------------------------------------
   * EVENT ROLES
   * ---------------------------------------------------------
   */

  async getRoles() {
    const { data, error } = await supabase
      .from("event_roles")
      .select(`
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
        mandatory_training,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map((role) => ({
      id: role.id,
      eventId: role.event_id,

      name: role.name,
      description: role.description,
      responsibilities: role.responsibilities,
      requirements: role.requirements,

      skills: role.skills ?? [],

      positions: role.positions,
      filledPositions: role.filled_positions,

      minAge: role.min_age,
      mandatoryTraining: role.mandatory_training,

      createdAt: role.created_at,
      updatedAt: role.updated_at,
    }));
  },

  /**
   * ---------------------------------------------------------
   * SHIFTS
   * ---------------------------------------------------------
   */

  async getShifts() {
    const { data, error } = await supabase
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
        instructions,
        created_at,
        updated_at,

        events (
          id,
          title
        ),

        event_roles (
          id,
          name
        )
      `)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []).map((shift) => {
      const event = Array.isArray(shift.events)
        ? shift.events[0]
        : shift.events;

      const role = Array.isArray(shift.event_roles)
        ? shift.event_roles[0]
        : shift.event_roles;

      return {
        id: shift.id,

        eventId: shift.event_id,
        eventTitle: event?.title ?? "Unknown event",

        roleId: shift.role_id,
        roleName: role?.name ?? "Unknown role",

        title: shift.title,

        date: shift.date,

        startTime: shift.start_time,
        endTime: shift.end_time,

        location: shift.location ?? "",

        capacity: shift.capacity,

        instructions: shift.instructions,

        createdAt: shift.created_at,
        updatedAt: shift.updated_at,
      };
    });
  },
};
