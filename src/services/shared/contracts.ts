import type {
  Application,
  AttendanceRecord,
  Certificate,
  Event,
  Notification,
  Shift,
  Training,
  VolunteerHours,
} from "@/lib/types";
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
  AdminTrainingSummary,
  AdminVolunteerSummary,
  Sport,
  Volunteer,
} from "@/types";

export interface EventFilters {
  search?: string;
  sport?: string;
  city?: string;
  featured?: boolean;
}

export interface ApplicationInput {
  eventId: string;
  roleId: string;
  availability: string;
  experience: string;
  motivation: string;
}

export interface EventService {
  getEvents(filters?: EventFilters): Promise<Event[]>;
  getEventBySlug(slug: string): Promise<Event | null>;
  getEventById(id: string): Promise<Event | null>;
  getSports(): Promise<Sport[]>;
}

export interface ApplicationService {
  getApplications(): Promise<Application[]>;
  applyForRole(input: ApplicationInput): Promise<void>;
}

export interface VolunteerService {
  getCurrentVolunteer(): Promise<Volunteer | null>;
  getAcceptedEvents(): Promise<Event[]>;
  getVolunteerHours(): Promise<VolunteerHours>;
  getVolunteerStats(): Promise<{ totalHours: number; currentYearHours: number }>;
}

export interface TrainingService {
  getTraining(): Promise<Training[]>;
  getTrainingById(id: string): Promise<Training | null>;
}

export interface AttendanceService {
  getAttendance(): Promise<AttendanceRecord[]>;
}

export interface CertificateService {
  getCertificates(): Promise<Certificate[]>;
  getCertificateById(id: string): Promise<Certificate | null>;
}

export interface NotificationService {
  getNotifications(): Promise<Notification[]>;
  markAsRead(id: string): Promise<void>;
}

export interface AdminService {
  getAdmin(): Promise<Admin | null>;
  getStats(): AdminStats;
  getEvents(): AdminEventSummary[];
  getApplications(): AdminApplicationSummary[];
  getVolunteers(): AdminVolunteerSummary[];
  getTraining(): AdminTrainingSummary[];
  getAttendance(): AdminAttendanceSummary[];
  getCertificates(): AdminCertificateSummary[];
  getNotifications(): AdminNotificationSummary[];
  getReports(): AdminReportSummary[];
  getAnalytics(): AdminAnalyticsSummary[];
}
