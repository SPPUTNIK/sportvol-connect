import { useSyncExternalStore } from "react";

import { adminEvents, adminRoles, adminShifts } from "@/mocks/adminDemo";
import { createSlug } from "@/components/admin/components/adminHelpers";

export type AdminEventRecord = {
  id: string;
  title: string;
  slug: string;
  sport: string;
  city: string;
  country: string;
  venue: string;
  date: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  applicationDeadline: string;
  totalVolunteersNeeded: number;
  description: string;
  status: string;
  volunteers: number;
};

export type AdminRoleRecord = {
  id: string;
  name: string;
  eventId: string;
  event: string;
  description: string;
  volunteers: number;
  required: number;
};

export type AdminShiftRecord = {
  id: string;
  eventId: string;
  event: string;
  roleId: string;
  role: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  volunteers: number;
  capacity: number;
};

type AdminState = {
  events: AdminEventRecord[];
  roles: AdminRoleRecord[];
  shifts: AdminShiftRecord[];
};

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now()
    .toString(36)
    .slice(-3)}`;
}

let state: AdminState = {
  events: adminEvents.map((event) => ({
    id: event.id,
    title: event.title,
    slug: event.slug,
    sport: event.sport,
    city: event.city,
    country: event.country,
    venue: event.venue,
    date: event.start_date,
    startDate: event.start_date,
    endDate: event.end_date,
    startTime: event.start_time,
    endTime: event.end_time,
    applicationDeadline: event.application_deadline,
    totalVolunteersNeeded: event.total_volunteers_needed,
    description: event.description,
    status: event.status.toLowerCase(),
    volunteers: event.volunteers,
  })),

  roles: adminRoles.map((role) => ({
    id: role.id,
    name: role.name,
    eventId: role.event_id,
    event: role.event,
    description: role.description,
    volunteers: role.volunteers,
    required: role.required,
  })),

  shifts: adminShifts.map((shift) => ({
    id: shift.id,
    eventId: shift.eventId,
    event: shift.event,
    roleId: shift.roleId,
    role: shift.role,
    date: shift.date,
    startTime: shift.startTime,
    endTime: shift.endTime,
    location: shift.location,
    volunteers: shift.volunteers,
    capacity: shift.capacity,
  })),
};

const listeners = new Set<() => void>();

function emit(next: AdminState) {
  state = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

export function useAdminStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function roleStatus(role: AdminRoleRecord) {
  return role.volunteers >= role.required ? "Full" : "Open";
}

export const adminStore = {
  getState: getSnapshot,

  /* ------------------------------ events ------------------------------ */

  createEvent(input: Partial<AdminEventRecord> & { title: string }) {
    const event: AdminEventRecord = {
      id: uid("event"),
      title: input.title,
      slug: input.slug || createSlug(input.title),
      sport: input.sport || "Running",
      city: input.city || "",
      country: input.country || "Morocco",
      venue: input.venue || "",
      date: input.startDate || "",
      startDate: input.startDate || "",
      endDate: input.endDate || input.startDate || "",
      startTime: input.startTime || "",
      endTime: input.endTime || "",
      applicationDeadline: input.applicationDeadline || "",
      totalVolunteersNeeded: input.totalVolunteersNeeded ?? 0,
      description: input.description || "",
      status: input.status || "draft",
      volunteers: 0,
    };

    emit({ ...state, events: [event, ...state.events] });
    return event;
  },

  updateEvent(id: string, patch: Partial<AdminEventRecord>) {
    emit({
      ...state,
      events: state.events.map((event) =>
        event.id === id
          ? {
              ...event,
              ...patch,
              date: patch.startDate ?? event.date,
            }
          : event,
      ),
      roles: state.roles.map((role) =>
        role.eventId === id && patch.title ? { ...role, event: patch.title } : role,
      ),
      shifts: state.shifts.map((shift) =>
        shift.eventId === id && patch.title ? { ...shift, event: patch.title } : shift,
      ),
    });
  },

  deleteEvent(id: string) {
    emit({
      events: state.events.filter((event) => event.id !== id),
      roles: state.roles.filter((role) => role.eventId !== id),
      shifts: state.shifts.filter((shift) => shift.eventId !== id),
    });
  },

  /* ------------------------------ roles ------------------------------- */

  createRole(input: { name: string; eventId: string; description?: string; required?: number }) {
    const event = state.events.find((item) => item.id === input.eventId);

    const role: AdminRoleRecord = {
      id: uid("role"),
      name: input.name,
      eventId: input.eventId,
      event: event?.title ?? "Unassigned event",
      description: input.description || "",
      volunteers: 0,
      required: input.required ?? 1,
    };

    emit({ ...state, roles: [role, ...state.roles] });
    return role;
  },

  updateRole(id: string, patch: Partial<AdminRoleRecord>) {
    const event = patch.eventId
      ? state.events.find((item) => item.id === patch.eventId)
      : undefined;

    emit({
      ...state,
      roles: state.roles.map((role) =>
        role.id === id
          ? { ...role, ...patch, event: event ? event.title : role.event }
          : role,
      ),
      shifts: state.shifts.map((shift) =>
        shift.roleId === id && patch.name ? { ...shift, role: patch.name } : shift,
      ),
    });
  },

  deleteRole(id: string) {
    emit({
      ...state,
      roles: state.roles.filter((role) => role.id !== id),
      shifts: state.shifts.filter((shift) => shift.roleId !== id),
    });
  },

  /* ------------------------------ shifts ------------------------------ */

  createShift(input: {
    roleId: string;
    date: string;
    startTime: string;
    endTime: string;
    location?: string;
    capacity?: number;
  }) {
    const role = state.roles.find((item) => item.id === input.roleId);
    const event = state.events.find((item) => item.id === role?.eventId);

    const shift: AdminShiftRecord = {
      id: uid("shift"),
      eventId: role?.eventId ?? "",
      event: event?.title ?? "Unassigned event",
      roleId: input.roleId,
      role: role?.name ?? "Unassigned role",
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      location: input.location || event?.venue || "",
      volunteers: 0,
      capacity: input.capacity ?? 1,
    };

    emit({ ...state, shifts: [shift, ...state.shifts] });
    return shift;
  },

  updateShift(id: string, patch: Partial<AdminShiftRecord> & { roleId?: string }) {
    const role = patch.roleId ? state.roles.find((item) => item.id === patch.roleId) : undefined;
    const event = role ? state.events.find((item) => item.id === role.eventId) : undefined;

    emit({
      ...state,
      shifts: state.shifts.map((shift) =>
        shift.id === id
          ? {
              ...shift,
              ...patch,
              role: role ? role.name : shift.role,
              eventId: role ? role.eventId : shift.eventId,
              event: event ? event.title : shift.event,
            }
          : shift,
      ),
    });
  },

  deleteShift(id: string) {
    emit({ ...state, shifts: state.shifts.filter((shift) => shift.id !== id) });
  },
};
