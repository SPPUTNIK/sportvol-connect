// src/types/domain.ts

// ============================================================
// Core / Auth
// ============================================================

export type UserRole = "VOLUNSPORT" | "ADMIN";

export interface Admin {
  id: string;
  email: string | null;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: "ADMIN";
}

export interface Volunteer {
  id: string;
  email: string | null;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  phone: string | null;
  city: string | null;
  country: string;
  bio: string | null;
  interests: string[];
  skills: string[];
  languages: string[];
  experience: string | null;
  volunteerHours: number;
  attendanceRate: number;
}

// ============================================================
// Common enums
// ============================================================

export type EventStatus =
  | "draft"
  | "published"
  | "closed"
  | "completed"
  | "cancelled";

export type ApplicationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "withdrawn"
  | "waitlisted";

export type AttendanceStatus =
  | "scheduled"
  | "checked_in"
  | "complete"
  | "absent"
  | "excused";

export type CertificateStatus =
  | "queued"
  | "issued";

export type TrainingStatus =
  | "draft"
  | "published";

export type NotificationStatus =
  | "draft"
  | "sent";

export type NotificationCategory =
  | "application"
  | "training"
  | "accreditation"
  | "certificate"
  | "event"
  | "general"
  | "other";

export type NotificationAudienceType =
  | "all_volunteers"
  | "accepted_volunteers"
  | "event_team";

export type TrainingResourceType =
  | "video"
  | "pdf"
  | "text"
  | "link";

// ============================================================
// Sport
// ============================================================

export interface Sport {
  id: string;
  name: string;
  slug: string;
  eventCount: number;
}

// ============================================================
// Events
// ============================================================

export interface EventRole {
  id: string;
  eventId: string;

  name: string;
  description: string | null;
  responsibilities: string | null;
  requirements: string | null;

  skills: string[];

  positions: number;
  filledPositions: number;

  minAge: number | null;
  mandatoryTraining: boolean;
}

export interface Event {
  id: string;

  title: string;
  slug: string;

  sport: string;

  city: string;
  country: string;
  venue: string;

  coverUrl: string | null;

  description: string | null;

  startDate: string;
  endDate: string;

  startTime: string | null;
  endTime: string | null;

  applicationDeadline: string | null;

  totalVolunteersNeeded: number;

  requiredLanguages: string[];
  requirements: string | null;

  eventType: string | null;

  featured: boolean;

  status: EventStatus;

  eventRoles?: EventRole[];

  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Applications
// ============================================================

export interface Application {
  id: string;

  volunteerId: string;
  volunteerName: string;

  eventId: string;
  eventTitle: string;

  roleId: string;
  roleName: string;

  submittedAt: string;

  status: ApplicationStatus;

  message: string | null;
}

// ============================================================
// Shifts
// ============================================================

export interface Shift {
  id: string;

  eventId: string;
  eventTitle: string;

  roleId?: string;
  roleName: string;

  date: string;

  startTime: string;
  endTime: string;

  location: string;

  instructions: string | null;
}

// ============================================================
// Training
// ============================================================

export interface TrainingResource {
  type: TrainingResourceType;
  title: string;
  url: string;
}

export interface Training {
  id: string;

  title: string;

  description: string;

  type: string;

  duration: number;

  assigned: number;
  completed: number;

  status: TrainingStatus;

  createdAt: string;
  publishedAt: string | null;

  resources: TrainingResource[];
}

export interface TrainingProgress {
  id: string;

  trainingId: string;
  volunteerId: string;

  completed: boolean;

  progressPercent: number;

  completedAt: string | null;
}

// ============================================================
// Accreditation
// ============================================================

export interface Accreditation {
  volunteer: string;
  volunteerId: string;

  event: string;
  role: string;

  zone: string;

  status: string;

  qrValue?: string;
}

// ============================================================
// Attendance
// ============================================================

export interface Attendance {
  id: string;

  eventId: string;
  eventTitle: string;

  volunteerId: string;
  volunteerName: string;

  shiftId: string;
  shift: string;

  checkInTime: string | null;
  checkOutTime: string | null;

  status: AttendanceStatus;
}

// ============================================================
// Certificates
// ============================================================

export interface Certificate {
  id: string;

  volunteerId: string;
  volunteerName: string;

  eventId: string;
  eventTitle: string;

  hours: number;

  date: string | null;
  issuedAt: string | null;

  status: CertificateStatus;
}

// ============================================================
// Volunteer hours
// ============================================================

export interface VolunteerHours {
  total: number;
  currentYear: number;

  eventsCompleted?: number;

  bySport: Array<{
    label: string;
    value: number;
  }>;

  byEvent: Array<{
    label: string;
    value: number;
  }>;
}

// ============================================================
// Achievements
// ============================================================

export interface Achievement {
  id: string;

  title: string;
  description: string;

  unlocked: boolean;

  progress: number;
  target: number;

  icon?: string;
}

// ============================================================
// Notifications / Announcements
// ============================================================

export interface Notification {
  id: string;

  title: string;
  body: string;

  date: string;

  eventId: string | null;

  read: boolean;

  category: NotificationCategory;
}

export interface AdminNotification {
  id: string;

  title: string;

  audienceType: NotificationAudienceType;
  audience: string;

  category: NotificationCategory;

  eventId: string | null;
  event: string;

  message: string;

  sentAt: string | null;

  status: NotificationStatus;
}

// ============================================================
// Admin dashboard
// ============================================================

export interface AdminStats {
  volunteers: number;
  upcomingEvents: number;
  applications: number;
  acceptedVolunteers: number;
  hours: number;
  attendance: string;
}

// ============================================================
// Admin Event
// ============================================================

/**
 * Admin-specific event representation.
 *
 * The public Event model describes the actual event.
 * This model additionally contains operational counters
 * used by the admin dashboard.
 */
export interface AdminEventSummary {
  id: string;

  title: string;
  slug: string;

  sport: string;

  city: string;
  country: string;
  venue: string;

  startDate: string;
  endDate: string;

  startTime: string | null;
  endTime: string | null;

  applicationDeadline: string | null;

  totalVolunteersNeeded: number;

  description: string | null;

  status: EventStatus;

  roles: number;
  volunteers: number;
  shifts: number;

  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Admin Applications
// ============================================================

export interface AdminApplicationSummary {
  id: string;

  volunteerId: string;
  volunteer: string;

  eventId: string;
  event: string;

  roleId: string;
  role: string;

  date: string;

  status: ApplicationStatus;
}

// ============================================================
// Admin Volunteers
// ============================================================

export interface AdminVolunteerSummary {
  id: string;

  name: string;

  email: string | null;
  phone: string | null;

  city: string;
  country: string;

  events: number;
  hours: number;

  attendance: string;

  certificates: number;

  status: string;

  joinedAt: string;
}

// ============================================================
// Admin Training
// ============================================================

export interface AdminTrainingSummary {
  id: string;

  title: string;

  type: string;

  description: string;

  duration: number;

  assigned: number;
  completed: number;

  status: TrainingStatus;

  createdAt: string;
  publishedAt: string | null;
}

// ============================================================
// Admin Attendance
// ============================================================

export interface AdminAttendanceSummary {
  id: string;

  eventId: string;
  event: string;

  volunteerId: string;
  volunteer: string;

  shiftId: string;
  shift: string;

  checkIn: string | null;
  checkOut: string | null;

  status: AttendanceStatus;
}

// ============================================================
// Admin Certificates
// ============================================================

export interface AdminCertificateSummary {
  id: string;

  volunteerId: string;
  volunteer: string;

  eventId: string;
  event: string;

  hours: number;

  date: string | null;
  issuedAt: string | null;

  status: CertificateStatus;
}

// ============================================================
// Admin Notifications
// ============================================================

export interface AdminNotificationSummary {
  id: string;

  title: string;

  audienceType: NotificationAudienceType;
  audience: string;

  category: NotificationCategory;

  eventId: string | null;
  event: string;

  message: string;

  sentAt: string | null;

  status: NotificationStatus;
}

// ============================================================
// Admin Reports
// ============================================================

export interface AdminReportSummary {
  label: string;

  value: string;

  change: string;

  description: string;
}

// ============================================================
// Admin Analytics
// ============================================================

export interface AdminAnalyticsSummary {
  label: string;

  value: number;

  /**
   * Tailwind class used by the current UI.
   * Example: "bg-primary", "bg-ink".
   */
  color: string;
}

// ============================================================
// Admin Data Snapshot
// ============================================================

export interface AdminDataSnapshot {
  stats: AdminStats;

  events: AdminEventSummary[];

  applications: AdminApplicationSummary[];

  volunteers: AdminVolunteerSummary[];

  training: AdminTrainingSummary[];

  attendance: AdminAttendanceSummary[];

  certificates: AdminCertificateSummary[];

  notifications: AdminNotificationSummary[];

  reports: AdminReportSummary[];

  analytics: AdminAnalyticsSummary[];
}