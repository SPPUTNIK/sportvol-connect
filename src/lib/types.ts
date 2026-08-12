export type UserRole = "volunteer" | "admin";

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

export type TrainingResourceType = "video" | "pdf" | "text" | "link";

export interface Profile {
  id: string;
  email: string | null;
  role: UserRole;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  bio: string | null;
  interests: string[];
  skills: string[];
  languages: string[];
  experience: string | null;
  volunteer_hours: number;
  attendance_rate: number;
}

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
}

<<<<<<< HEAD
export type ApplicationStatus = "pending" | "accepted" | "waitlisted" | "rejected" | "withdrawn";

=======
>>>>>>> 90df118 (supabase)
export interface Application {
  id: string;
  event_id: string;
  event_title: string;
  role_name: string;
  submitted_at: string;
  status: ApplicationStatus;
  message: string | null;
}

export interface Shift {
  id: string;
  event_id: string;
  event_title: string;
  role_name: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
<<<<<<< HEAD
  instructions: string | null;
}

export interface TrainingResource {
  type: string;
=======
  instructions: string;
}

export interface TrainingResource {
  type: TrainingResourceType;
>>>>>>> 90df118 (supabase)
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

export interface AttendanceRecord {
  id: string;
  event_title: string;
  role_name: string;
  date: string;
  status: string;
  check_in_time: string | null;
  check_out_time: string | null;
}

export interface Certificate {
  id: string;
  event_title: string;
  role_name: string;
  hours: number;
  date: string;
  certificate_id: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  date: string;
  event_id: string | null;
  read: boolean;
<<<<<<< HEAD
  category: string;
}

export interface LabelledValue {
  label: string;
  value: number;
=======
  category: NotificationCategory;
>>>>>>> 90df118 (supabase)
}

export interface VolunteerHours {
  total: number;
  current_year: number;
<<<<<<< HEAD
  by_sport: LabelledValue[];
  by_event: LabelledValue[];
=======
  by_sport: Array<{ label: string; value: number }>;
  by_event: Array<{ label: string; value: number }>;
>>>>>>> 90df118 (supabase)
}
