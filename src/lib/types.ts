export type UserRole = "volunteer" | "admin";

/*
 * ============================================================
 * DASHBOARD
 * ============================================================
 */

export interface VolunteerDashboardStats {
  upcomingEvents: number;
  volunteerHours: number;
  attendanceRate: number;
  certificates: number;
}

export interface DashboardUpcomingEvent {
  id: string;
  event_id: string;
  title: string;
  status: string;
  date: string;
  role: string;
  shift: string;
  location: string;
  training: string;
  accreditation: string;
  cover_url?: string | null;
}

export interface DashboardApplication {
  id: string;
  event_id: string;
  event: string;
  role: string;
  date: string;
  status: string;
}

export interface DashboardAchievement {
  code: string;
  title: string;
  description: string;
  icon: string | null;
  progress: number;
  unlocked: boolean;
}

export type VolunteerDashboard = {
  upcomingEvents: number;
  volunteerHours: number;
  attendanceRate: number;
  certificates: number;

  upcomingEvent: {
    title: string;
    status: string;
    date: string;
    role: string;
    shift: string;
    location: string;
    training: string;
    accreditation: string;
  } | null;

  upcomingEventsList: DashboardUpcomingEvent[];

  applications: Application[];

  profileCompletion: number;

  achievements: {
    title: string;
    progress: number;
    unlocked: boolean;
  }[];
};

/*
 * ============================================================
 * EVENTS
 * ============================================================
 */

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

export type NotificationCategory =
  | "application"
  | "training"
  | "accreditation"
  | "certificate"
  | "event"
  | "other";

export type TrainingResourceType =
  | "video"
  | "pdf"
  | "text"
  | "link";

export interface EventRole {
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
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  sport: string;
  city: string;
  country: string;
  venue: string;
  cover_url: string | null;
  description: string | null;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  application_deadline: string | null;
  status: EventStatus;
  total_volunteers_needed: number;
  required_languages: string[];
  requirements: string | null;
  event_type: string | null;
  featured: boolean;
  event_roles?: EventRole[];
  registered_volunteers?: number;
}


export interface MyEvent {
  id: string;

  event_id: string;
  event: string;

  location: string;
  date: string;

  role: string;

  shift: string;
  training: string;
  accreditation: string;
  attendance: string;

  application_status: ApplicationStatus;
}


/*
 * ============================================================
 * APPLICATIONS
 * ============================================================
 */

export interface Application {
  id: string;

  event_id: string;

  role_id: string;

  event_title: string;

  role_name: string;

  submitted_at: string;

  status: ApplicationStatus;

  message: string | null;

  availability: string | null;

  experience: string | null;
}


/*
 * ============================================================
 * SHIFTS
 * ============================================================
 */

export interface Shift {
  id: string;
  event_id: string;
  event_title: string;
  role_name: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  instructions: string | null;
}

/*
 * ============================================================
 * TRAINING
 * ============================================================
 */

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

/*
 * ============================================================
 * ATTENDANCE
 * ============================================================
 */

export interface AttendanceRecord {
  id: string;
  event_title: string;
  role_name: string;
  date: string;
  status: string;
  check_in_time: string | null;
  check_out_time: string | null;
}

/*
 * ============================================================
 * CERTIFICATES
 * ============================================================
 */

export interface Certificate {
  id: string;
  event_title: string;
  role_name: string;
  hours: number;
  date: string;
  certificate_id: string;
}

/*
 * ============================================================
 * NOTIFICATIONS
 * ============================================================
 */

export interface Notification {
  id: string;
  title: string;
  body: string;
  date: string;
  event_id: string | null;
  read: boolean;
  category: NotificationCategory;
}

/*
 * ============================================================
 * PROFILE
 * ============================================================
 */

export interface Profile {
  id: string;

  /*
   * Authentication
   */
  email: string | null;
  role: UserRole;

  /*
   * Identity
   */
  first_name: string | null;
  last_name: string | null;

  /*
   * Profile photo
   *
   * Supabase Storage public/signed URL.
   */
  avatar_url: string | null;

  /*
   * Contact
   */
  phone: string | null;
  city: string | null;
  country: string | null;

  /*
   * Personal information
   */
  nationality: string | null;
  cin_or_passport: string | null;
  date_of_birth: string | null;

  /*
   * About volunteer
   */
  bio: string | null;
  experience: string | null;

  /*
   * Multi-select profile data
   */
  interests: string[];
  skills: string[];
  languages: string[];

  /*
   * Platform-managed statistics
   *
   * Volunteers should NOT edit these directly.
   */
  volunteer_hours: number;
  attendance_rate: number;
}

/*
 * ============================================================
 * VOLUNTEER PROFILE
 * ============================================================
 *
 * Used by the volunteer-facing profile service/page.
 */

export interface VolunteerProfile {
  id: string;

  /*
   * Short/display identifier.
   *
   * This can be derived from the profile UUID
   * in the frontend when a dedicated volunteer_id
   * column does not exist.
   */
  volunteer_id: string;

  /*
   * Authentication
   */
  email: string;

  /*
   * Identity
   */
  first_name: string;
  last_name: string;

  /*
   * Profile photo
   */
  avatar_url: string | null;

  /*
   * Contact
   */
  phone: string;
  city: string;
  country: string;

  /*
   * Personal information
   */
  nationality: string | null;
  cin_or_passport: string | null;
  date_of_birth: string | null;

  /*
   * About volunteer
   */
  bio: string | null;
  experience: string | null;

  /*
   * Multi-select profile data
   */
  interests: string[];
  skills: string[];
  languages: string[];

  /*
   * Platform-managed statistics
   */
  volunteer_hours: number;
  attendance_rate: number;
}

/*
 * Backwards compatibility.
 *
 * Existing pages importing Volunteer will continue
 * to work without modification.
 */
export type Volunteer = VolunteerProfile;

/*
 * ============================================================
 * VOLUNTEER HOURS
 * ============================================================
 */

export interface LabelledValue {
  label: string;
  value: number;
}

export interface VolunteerHours {
  total: number;
  current_year: number;
  by_sport: LabelledValue[];
  by_event: LabelledValue[];
}

