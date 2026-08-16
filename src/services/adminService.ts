import {
  adminAnalytics,
  adminApplications,
  adminAttendance,
  adminCertificates,
  adminEvents,
  adminNotifications,
  adminReports,
  adminStats,
  adminTraining,
  adminVolunteers,
  adminAccreditations,
  adminProfile,
  adminRoles,
  adminShifts,
} from "@/mocks/adminDemo";

import type {
  AdminAnalyticsSummary,
  AdminApplicationSummary,
  AdminAttendanceSummary,
  AdminCertificateSummary,
  AdminEventSummary,
  AdminNotificationSummary,
  AdminReportSummary,
  AdminStats,
  AdminTrainingSummary,
  AdminVolunteerSummary,
} from "@/types/domain";

/**
 * =========================================================
 * ADMIN MOCK SERVICE
 * =========================================================
 *
 * FRONTEND ONLY
 *
 * This service currently uses local mock data.
 *
 * Later, when Supabase is ready, replace the implementations
 * here without changing the Admin UI components.
 *
 * IMPORTANT:
 * These methods are intentionally NOT async for now.
 * AdminPages.tsx consumes them synchronously.
 * =========================================================
 */

export const adminService = {
  /**
   * ---------------------------------------------------------
   * ADMIN
   * ---------------------------------------------------------
   */

  getAdmin() {
    return {
      id: "admin-demo",
      email: "admin@volunsport.ma",
      firstName: "VolunSport",
      lastName: "Admin",
      avatarUrl: null,
      role: "ADMIN" as const,
    };
  },

  /**
   * ---------------------------------------------------------
   * DASHBOARD STATS
   * ---------------------------------------------------------
   */

  getStats(): AdminStats {
    return {
      ...adminStats,
    };
  },

  /**
   * ---------------------------------------------------------
   * EVENTS
   * ---------------------------------------------------------
   */

  getEvents(): AdminEventSummary[] {
    return adminEvents.map((event) => ({
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

      status:
        event.status.toLowerCase() as AdminEventSummary["status"],

      roles: event.roles,
      volunteers: event.volunteers,
      shifts: event.shifts,

      createdAt: event.created_at,
      updatedAt: event.updated_at,
    }));
  },

  /**
   * ---------------------------------------------------------
   * APPLICATIONS
   * ---------------------------------------------------------
   */

  getApplications(): AdminApplicationSummary[] {
    return adminApplications.map((item) => ({
      id: item.id,

      volunteerId: item.volunteer_id,
      volunteer: item.volunteer,

      eventId: item.event_id,
      event: item.event,

      roleId: item.role_id,
      role: item.role,

      date: item.applied_at,

      status:
        item.status.toLowerCase() as AdminApplicationSummary["status"],
    }));
  },

  /**
   * ---------------------------------------------------------
   * VOLUNTEERS
   * ---------------------------------------------------------
   */

  getVolunteers(): AdminVolunteerSummary[] {
    return adminVolunteers.map((item) => ({
      id: item.id,

      name: item.name,

      email: item.email,
      phone: item.phone,

      city: item.city,
      country: item.country,

      events: item.events,
      hours: item.hours,

      attendance: item.attendance,

      certificates: item.certificates,

      status: item.status,

      joinedAt: item.joined_at,
    }));
  },

  /**
   * ---------------------------------------------------------
   * TRAINING
   * ---------------------------------------------------------
   */

  getTraining(): AdminTrainingSummary[] {
    return adminTraining.map((item) => ({
      id: item.id,

      title: item.title,

      type: item.type,

      description: item.description,

      duration: item.duration,

      assigned: item.assigned,
      completed: item.completed,

      status:
        item.status.toLowerCase() as AdminTrainingSummary["status"],

      createdAt: item.created_at,
      publishedAt: item.published_at,
    }));
  },

  /**
   * ---------------------------------------------------------
   * ATTENDANCE
   * ---------------------------------------------------------
   */

  getAttendance(): AdminAttendanceSummary[] {
    return adminAttendance.map((item) => ({
      id: item.id,

      eventId: item.event_id,
      event: item.event,

      volunteerId: item.volunteer_id,
      volunteer: item.volunteer,

      shiftId: item.shift_id,
      shift: item.shift,

      checkIn: item.check_in,
      checkOut: item.check_out,

      status:
        item.status.toLowerCase() as AdminAttendanceSummary["status"],
    }));
  },

  /**
   * ---------------------------------------------------------
   * CERTIFICATES
   * ---------------------------------------------------------
   */

  getCertificates(): AdminCertificateSummary[] {
    return adminCertificates.map((item) => ({
      id: item.id,

      volunteerId: item.volunteer_id,
      volunteer: item.volunteer,

      eventId: item.event_id,
      event: item.event,

      hours: item.hours,

      date: item.date,
      issuedAt: item.issued_at,

      status:
        item.status.toLowerCase() as AdminCertificateSummary["status"],
    }));
  },

  /**
   * ---------------------------------------------------------
   * NOTIFICATIONS
   * ---------------------------------------------------------
   */

  getNotifications(): AdminNotificationSummary[] {
    return adminNotifications.map((item) => ({
      id: item.id,

      title: item.title,

      audienceType: item.audience_type,
      audience: item.audience,

      category:
        item.category.toLowerCase() as AdminNotificationSummary["category"],

      eventId: item.event_id,
      event: item.event,

      message: item.message,

      sentAt: item.sent_at,

      status:
        item.status.toLowerCase() as AdminNotificationSummary["status"],
    }));
  },

  /**
   * ---------------------------------------------------------
   * REPORTS
   * ---------------------------------------------------------
   */

  getReports(): AdminReportSummary[] {
    return adminReports.map((item) => ({
      label: item.label,
      value: item.value,
      change: item.change,
      description: item.description,
    }));
  },

  /**
   * ---------------------------------------------------------
   * ANALYTICS
   * ---------------------------------------------------------
   */

  getAnalytics(): AdminAnalyticsSummary[] {
    return adminAnalytics.map((item) => ({
      label: item.label,
      value: item.value,
      color: item.color,
    }));
  },


  getAccreditations() {
    return adminAccreditations;
  },

  getAdminProfile() {
    return adminProfile;
  },

  getRoles() {
    return adminRoles;
  },

  getShifts() {
    return adminShifts;
  },
};

