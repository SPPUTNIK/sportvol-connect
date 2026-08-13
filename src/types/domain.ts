export type UserRole = "VOLUNSPORT" | "ADMIN";

export type EventStatus = "draft" | "published" | "closed" | "completed" | "cancelled";
export type ApplicationStatus = "pending" | "accepted" | "rejected" | "withdrawn" | "waitlisted";
export type AttendanceStatus = "scheduled" | "checked_in" | "complete" | "absent" | "excused";
export type NotificationCategory =
  "application" | "training" | "accreditation" | "certificate" | "event" | "other";
export type TrainingResourceType = "video" | "pdf" | "text" | "link";

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

export interface Admin {
  id: string;
  email: string | null;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: "ADMIN";
}

export interface Sport {
  id: string;
  name: string;
  slug: string;
  eventCount: number;
}

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
  status: EventStatus;
  totalVolunteersNeeded: number;
  requiredLanguages: string[];
  requirements: string | null;
  eventType: string | null;
  featured: boolean;
  eventRoles?: EventRole[];
}

export interface Application {
  id: string;
  volunteerId?: string;
  eventId: string;
  eventTitle: string;
  roleName: string;
  submittedAt: string;
  status: ApplicationStatus;
  message: string | null;
}

export interface Shift {
  id: string;
  eventId: string;
  eventTitle: string;
  roleName: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  instructions: string | null;
}

export interface TrainingResource {
  type: TrainingResourceType;
  title: string;
  url: string;
}

export interface Training {
  id: string;
  title: string;
  description: string;
  completed: boolean;
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

export interface Accreditation {
  volunteer: string;
  volunteerId: string;
  event: string;
  role: string;
  zone: string;
  status: string;
  qrValue?: string;
}

export interface Attendance {
  id: string;
  eventId?: string;
  eventTitle: string;
  roleName: string;
  date: string;
  status: AttendanceStatus | string;
  checkInTime: string | null;
  checkOutTime: string | null;
}

export interface VolunteerHours {
  total: number;
  currentYear: number;
  eventsCompleted?: number;
  bySport: Array<{ label: string; value: number }>;
  byEvent: Array<{ label: string; value: number }>;
}

export interface Certificate {
  id: string;
  eventTitle: string;
  roleName: string;
  hours: number;
  date: string;
  certificateId: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress: number;
  target: number;
  icon?: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  date: string;
  eventId: string | null;
  read: boolean;
  category: NotificationCategory;
}

export interface AdminStats {
  volunteers: number;
  upcomingEvents: number;
  applications: number;
  acceptedVolunteers: number;
  hours: number;
  attendance: string;
}

export interface AdminEventSummary {
  id: string;
  title: string;
  sport: string;
  city: string;
  date: string;
  status: string;
  roles: number;
  volunteers: number;
  shifts: number;
}

export interface AdminApplicationSummary {
  id: string;
  volunteer: string;
  event: string;
  role: string;
  date: string;
  status: string;
}

export interface AdminVolunteerSummary {
  id: string;
  name: string;
  city: string;
  events: number;
  hours: number;
  attendance: string;
  certificates: number;
  status: string;
}

export interface AdminTrainingSummary {
  id: string;
  title: string;
  type: string;
  assigned: number;
  completed: number;
  status: string;
}

export interface AdminAttendanceSummary {
  id: string;
  event: string;
  volunteer: string;
  shift: string;
  checkIn: string;
  checkOut: string;
  status: string;
}

export interface AdminCertificateSummary {
  id: string;
  volunteer: string;
  event: string;
  date: string;
  hours: number;
  status: string;
}

export interface AdminNotificationSummary {
  id: string;
  title: string;
  audience: string;
  category: string;
  event: string;
  sent: string;
  status: string;
}

export interface AdminReportSummary {
  label: string;
  value: string;
  change: string;
  description: string;
}

export interface AdminAnalyticsSummary {
  label: string;
  value: number;
  color: string;
}

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
