import {
  Application,
  AttendanceRecord,
  Certificate,
  Event,
  Shift,
  Training,
  VolunteerHours,
  Notification,
} from "@/lib/types";
import {
  mockApplications,
  mockAttendance,
  mockCertificates,
  mockEvents,
  mockEventSlugs,
  mockHours,
  mockNotifications,
  mockShifts,
  mockTraining,
  mockVolunteerStats,
} from "@/lib/mock-data";

export function getAllEvents(): Promise<Event[]> {
  return Promise.resolve(mockEvents);
}

export function getEventBySlug(slug: string): Promise<Event | null> {
  return Promise.resolve(mockEventSlugs[slug] ?? null);
}

export function getApplications(): Promise<Application[]> {
  return Promise.resolve(mockApplications);
}

export function getAcceptedEvents(): Promise<Event[]> {
  const accepted = mockApplications
    .filter((application) => application.status === "accepted")
    .map((application) => mockEvents.find((event) => event.id === application.event_id))
    .filter((event): event is Event => Boolean(event));
  return Promise.resolve(accepted);
}

export function getShifts(): Promise<Shift[]> {
  return Promise.resolve(mockShifts);
}

export function getTraining(): Promise<Training[]> {
  return Promise.resolve(mockTraining);
}

export function getAttendance(): Promise<AttendanceRecord[]> {
  return Promise.resolve(mockAttendance);
}

export function getCertificates(): Promise<Certificate[]> {
  return Promise.resolve(mockCertificates);
}

export function getNotifications(): Promise<Notification[]> {
  return Promise.resolve(mockNotifications);
}

export function getVolunteerHours(): Promise<VolunteerHours> {
  return Promise.resolve(mockHours);
}

export function getVolunteerStats() {
  return Promise.resolve(mockVolunteerStats);
}
