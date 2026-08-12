export type UserRole = "volunteer" | "admin";

export type EventStatus =
  | "draft"
  | "published"
  | "closed"
  | "completed"
  | "cancelled";

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
