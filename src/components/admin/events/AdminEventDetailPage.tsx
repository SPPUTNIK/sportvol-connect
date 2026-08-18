import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  Pencil,
  Plus,
  Settings,
  Trash2,
  LoaderCircle,
  Users,
} from "lucide-react";

import { AdminGate } from "../components/AdminGate";
import { createSlug } from "../components/adminHelpers";
import {
  VSButton,
  VSCard,
  VSCardContent,
  VSEmptyState,
  VSInput,
  VSPageHeader,
  VSSectionHeader,
  VSStatusBadge,
  VSTextarea,
  VSLoadingState,
  VSErrorState,
} from "@/components/design-system";
import {
  VSModal,
  VSModalContent,
  VSModalHeader,
  VSModalTitle,
  VSModalFooter,
} from "@/components/design-system";

import { adminEventService } from "@/services/adminEventService";

type RoleRow = {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  responsibilities: string | null;
  requirements: string | null;
  positions: number;
  filled_positions: number;
  min_age: number | null;
  mandatory_training: boolean;
};

type ShiftRow = {
  id: string;
  event_id: string;
  role_id: string;
  title: string;
  location: string | null;
  date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  instructions: string | null;
  event_roles: { name: string } | null;
};

function Info({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

export function AdminEventDetailPage({ eventId }: { eventId: string }) {
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [shifts, setShifts] = useState<ShiftRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // role dialog state
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleRow | null>(null);
  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    positions: "1",
    requirements: "",
    responsibilities: "",
    minAge: "",
    mandatoryTraining: false,
  });
  const [roleSubmitting, setRoleSubmitting] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);

  // shift dialog state
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftRow | null>(null);
  const [shiftForm, setShiftForm] = useState({
    role_id: "",
    title: "",
    location: "",
    date: "",
    start_time: "",
    end_time: "",
    capacity: "1",
    instructions: "",
  });
  const [shiftSubmitting, setShiftSubmitting] = useState(false);
  const [shiftError, setShiftError] = useState<string | null>(null);

  // edit event dialog state
  const [editEventOpen, setEditEventOpen] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    slug: "",
    city: "",
    venue: "",
    start_date: "",
    end_date: "",
    description: "",
  });
  const [eventSubmitting, setEventSubmitting] = useState(false);
  const [eventEditError, setEventEditError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ eventData, rolesData, shiftsData ] = await Promise.all([
        adminEventService.getEventById(eventId),
        adminEventService.getRolesForEvent(eventId),
        adminEventService.getShiftsForEvent(eventId),
      ]);
      setEvent(eventData);
      setRoles(rolesData as RoleRow[]);
      setShifts(shiftsData as ShiftRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load event");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openAddRole = () => {
    setEditingRole(null);
    setRoleForm({
      name: "",
      description: "",
      positions: "1",
      requirements: "",
      responsibilities: "",
      minAge: "",
      mandatoryTraining: false,
    });
    setRoleError(null);
    setRoleModalOpen(true);
  };

  const openEditRole = (role: RoleRow) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      description: role.description ?? "",
      positions: String(role.positions),
      requirements: role.requirements ?? "",
      responsibilities: role.responsibilities ?? "",
      minAge: role.min_age != null ? String(role.min_age) : "",
      mandatoryTraining: role.mandatory_training,
    });
    setRoleError(null);
    setRoleModalOpen(true);
  };

  const submitRole = async () => {
    setRoleSubmitting(true);
    setRoleError(null);
    const payload = {
      event_id: eventId,
      name: roleForm.name,
      description: roleForm.description || null,
      positions: Number(roleForm.positions || 1),
      requirements: roleForm.requirements || null,
      responsibilities: roleForm.responsibilities || null,
      min_age: roleForm.minAge ? Number(roleForm.minAge) : null,
      mandatory_training: roleForm.mandatoryTraining,
    };

    if (editingRole) {
      const { error } = await adminEventService.updateRole({ id: editingRole.id, ...payload });
      setRoleSubmitting(false);
      if (error) {
        setRoleError(error);
        return;
      }
    } else {
      const { error } = await adminEventService.createRole(payload);
      setRoleSubmitting(false);
      if (error) {
        setRoleError(error);
        return;
      }
    }
    setRoleModalOpen(false);
    loadData();
  };

  const deleteRole = async (id: string) => {
    const { error } = await adminEventService.deleteRole(id);
    if (error) {
      setError(error);
      return;
    }
    loadData();
  };

  const openAddShift = () => {
    if (roles.length === 0) {
      setError("Add at least one role before creating shifts.");
      return;
    }
    setEditingShift(null);
    setShiftForm({
      role_id: roles[0].id,
      title: "",
      location: "",
      date: "",
      start_time: "",
      end_time: "",
      capacity: "1",
      instructions: "",
    });
    setShiftError(null);
    setShiftModalOpen(true);
  };

  const openEditShift = (shift: ShiftRow) => {
    setEditingShift(shift);
    setShiftForm({
      role_id: shift.role_id,
      title: shift.title,
      location: shift.location ?? "",
      date: shift.date,
      start_time: shift.start_time,
      end_time: shift.end_time,
      capacity: String(shift.capacity),
      instructions: shift.instructions ?? "",
    });
    setShiftError(null);
    setShiftModalOpen(true);
  };

  const submitShift = async () => {
    setShiftSubmitting(true);
    setShiftError(null);
    const payload = {
      event_id: eventId,
      role_id: shiftForm.role_id,
      title: shiftForm.title,
      location: shiftForm.location || null,
      date: shiftForm.date,
      start_time: shiftForm.start_time,
      end_time: shiftForm.end_time,
      capacity: Number(shiftForm.capacity || 1),
      instructions: shiftForm.instructions || null,
    };

    if (editingShift) {
      const { error } = await adminEventService.updateShift({ id: editingShift.id, ...payload });
      setShiftSubmitting(false);
      if (error) {
        setShiftError(error);
        return;
      }
    } else {
      const { error } = await adminEventService.createShift(payload);
      setShiftSubmitting(false);
      if (error) {
        setShiftError(error);
        return;
      }
    }
    setShiftModalOpen(false);
    loadData();
  };

  const deleteShift = async (id: string) => {
    const { error } = await adminEventService.deleteShift(id);
    if (error) {
      setError(error);
      return;
    }
    loadData();
  };

  const openEditEvent = () => {
    if (!event) return;
    setEventForm({
      title: event.title ?? "",
      slug: event.slug ?? "",
      city: event.city ?? "",
      venue: event.venue ?? "",
      start_date: event.start_date ?? "",
      end_date: event.end_date ?? "",
      description: event.description ?? "",
    });
    setEventEditError(null);
    setEditEventOpen(true);
  };

  const submitEventEdit = async () => {
    setEventSubmitting(true);
    setEventEditError(null);
    const { error } = await adminEventService.updateEvent({
      id: eventId,
      title: eventForm.title,
      slug: eventForm.slug,
      city: eventForm.city,
      venue: eventForm.venue,
      start_date: eventForm.start_date,
      end_date: eventForm.end_date,
      description: eventForm.description || null,
    });
    setEventSubmitting(false);
    if (error) {
      setEventEditError(error);
      return;
    }
    setEditEventOpen(false);
    loadData();
  };

  if (loading) {
    return (
      <AdminGate title="Event details">
        <div className="mx-auto max-w-6xl">
          <VSLoadingState />
        </div>
      </AdminGate>
    );
  }

  if (error || !event) {
    return (
      <AdminGate title="Event details">
        <div className="mx-auto max-w-6xl">
          <VSErrorState
            title={error ? "Failed to load event" : "Event not found"}
            description={error ?? "The event you are trying to manage does not exist."}
            action={
              <VSButton asChild>
                <Link to="/admin/events">
                  <ArrowLeft className="h-4 w-4" />
                  Back to events
                </Link>
              </VSButton>
            }
          />
        </div>
      </AdminGate>
    );
  }

  return (
    <AdminGate title="Event details">
      <div className="mx-auto max-w-6xl">
        <VSButton asChild variant="ghost" className="mb-5">
          <Link to="/admin/events">
            <ArrowLeft className="h-4 w-4" />
            Back to events
          </Link>
        </VSButton>

        <VSPageHeader
          eyebrow="Event management"
          title={event.title}
          description={`${event.sport} · ${event.city} · ${event.start_date}`}
          action={
            <VSButton variant="outline" onClick={openEditEvent}>
              <Settings className="h-4 w-4" />
              Edit event
            </VSButton>
          }
        />

        {error && (
          <p className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Roles and shifts */}
          <VSCard className="rounded-[2rem] border-border">
            <VSCardContent className="p-6 sm:p-8">
              <VSSectionHeader
                eyebrow="Roles and shifts"
                title="Volunteer operations"
                action={
                  <VSButton size="sm" onClick={openAddRole}>
                    <Plus className="h-4 w-4" />
                    Add role
                  </VSButton>
                }
              />

              <div className="mt-6 space-y-3">
                {roles.length === 0 ? (
                  <VSEmptyState
                    title="No roles yet"
                    description="Add your first volunteer role to start building the event team."
                    action={
                      <VSButton size="sm" onClick={openAddRole}>
                        <Plus className="h-4 w-4" />
                        Add role
                      </VSButton>
                    }
                  />
                ) : (
                  roles.map((role) => (
                    <div
                      key={role.id}
                      className="rounded-2xl border border-border p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground">{role.name}</p>
                          {role.description && (
                            <p className="mt-1 text-xs text-muted-foreground">{role.description}</p>
                          )}
                          <p className="mt-2 text-xs text-muted-foreground">
                            {role.filled_positions}/{role.positions} positions filled
                            {role.mandatory_training ? " · mandatory training" : ""}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <VSButton variant="ghost" size="sm" onClick={() => openEditRole(role)}>
                            <Pencil className="h-4 w-4" />
                            Edit
                          </VSButton>
                          <VSButton
                            variant="ghost"
                            size="sm"
                            aria-label={`Delete ${role.name}`}
                            onClick={() => deleteRole(role.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </VSButton>
                        </div>
                      </div>

                      {/* Shifts for this role */}
                      <div className="mt-3 space-y-2 border-t border-border pt-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Shifts
                          </p>
                          <VSButton
                            size="sm"
                            variant="outline"
                            onClick={openAddShift}
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add shift
                          </VSButton>
                        </div>
                        {shifts.filter((s) => s.role_id === role.id).length === 0 ? (
                          <p className="text-xs text-muted-foreground">No shifts scheduled.</p>
                        ) : (
                          shifts
                            .filter((s) => s.role_id === role.id)
                            .map((shift) => (
                              <div
                                key={shift.id}
                                className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 px-3 py-2"
                              >
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1 font-medium text-foreground">
                                    {shift.title}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <CalendarDays className="h-3 w-3" />
                                    {shift.date}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock3 className="h-3 w-3" />
                                    {shift.start_time}–{shift.end_time}
                                  </span>
                                  {shift.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {shift.location}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {shift.capacity}
                                  </span>
                                </div>
                                <div className="flex gap-1">
                                  <VSButton
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditShift(shift)}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </VSButton>
                                  <VSButton
                                    variant="ghost"
                                    size="sm"
                                    aria-label={`Delete ${shift.title}`}
                                    onClick={() => deleteShift(shift.id)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </VSButton>
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </VSCardContent>
          </VSCard>

          {/* Event summary */}
          <VSCard className="rounded-[2rem] border-border">
            <VSCardContent className="p-6 sm:p-8">
              <VSSectionHeader eyebrow="Event status" title="At a glance" />
              <div className="mt-6 space-y-5">
                <Info label="Status" value={event.status} />
                <Info label="Sport" value={event.sport} />
                <Info label="Venue" value={event.venue} />
                <Info label="Start date" value={event.start_date} />
                <Info label="End date" value={event.end_date} />
                <Info label="Volunteers needed" value={event.total_volunteers_needed} />
                <Info label="Roles" value={roles.length} />
                <Info label="Shifts" value={shifts.length} />
              </div>
            </VSCardContent>
          </VSCard>
        </div>
      </div>

      {/* Role modal */}
      <VSModal open={roleModalOpen} onOpenChange={setRoleModalOpen}>
        <VSModalContent className="max-w-lg">
          <VSModalHeader>
            <VSModalTitle>{editingRole ? "Edit role" : "Add role"}</VSModalTitle>
          </VSModalHeader>
          <div className="space-y-4 px-6 py-4">
            <label className="block text-sm font-medium">
              Role name
              <VSInput
                className="mt-2"
                value={roleForm.name}
                onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                placeholder="Route support volunteer"
              />
            </label>
            <label className="block text-sm font-medium">
              Description
              <VSInput
                className="mt-2"
                value={roleForm.description}
                onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                placeholder="Brief summary of what this role does"
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm font-medium">
                Positions
                <VSInput
                  className="mt-2"
                  type="number"
                  min="1"
                  value={roleForm.positions}
                  onChange={(e) => setRoleForm({ ...roleForm, positions: e.target.value })}
                />
              </label>
              <label className="block text-sm font-medium">
                Minimum age
                <VSInput
                  className="mt-2"
                  type="number"
                  min="0"
                  value={roleForm.minAge}
                  onChange={(e) => setRoleForm({ ...roleForm, minAge: e.target.value })}
                  placeholder="18"
                />
              </label>
            </div>
            <label className="block text-sm font-medium">
              Requirements
              <VSTextarea
                className="mt-2"
                rows={2}
                value={roleForm.requirements}
                onChange={(e) => setRoleForm({ ...roleForm, requirements: e.target.value })}
                placeholder="Any specific requirements"
              />
            </label>
            <label className="block text-sm font-medium">
              Responsibilities
              <VSTextarea
                className="mt-2"
                rows={2}
                value={roleForm.responsibilities}
                onChange={(e) => setRoleForm({ ...roleForm, responsibilities: e.target.value })}
                placeholder="What the volunteer will be responsible for"
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={roleForm.mandatoryTraining}
                onChange={(e) =>
                  setRoleForm({ ...roleForm, mandatoryTraining: e.target.checked })
                }
              />
              Mandatory training required
            </label>
            {roleError && (
              <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {roleError}
              </p>
            )}
          </div>
          <VSModalFooter>
            <VSButton variant="ghost" onClick={() => setRoleModalOpen(false)}>
              Cancel
            </VSButton>
            <VSButton onClick={submitRole} disabled={roleSubmitting || !roleForm.name}>
              {roleSubmitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : editingRole ? (
                "Save changes"
              ) : (
                "Add role"
              )}
            </VSButton>
          </VSModalFooter>
        </VSModalContent>
      </VSModal>

      {/* Shift modal */}
      <VSModal open={shiftModalOpen} onOpenChange={setShiftModalOpen}>
        <VSModalContent className="max-w-lg">
          <VSModalHeader>
            <VSModalTitle>{editingShift ? "Edit shift" : "Add shift"}</VSModalTitle>
          </VSModalHeader>
          <div className="space-y-4 px-6 py-4">
            <label className="block text-sm font-medium">
              Role
              <select
                className="mt-2 h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm"
                value={shiftForm.role_id}
                onChange={(e) => setShiftForm({ ...shiftForm, role_id: e.target.value })}
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              Shift title
              <VSInput
                className="mt-2"
                value={shiftForm.title}
                onChange={(e) => setShiftForm({ ...shiftForm, title: e.target.value })}
                placeholder="Morning setup"
              />
            </label>
            <label className="block text-sm font-medium">
              Location
              <VSInput
                className="mt-2"
                value={shiftForm.location}
                onChange={(e) => setShiftForm({ ...shiftForm, location: e.target.value })}
                placeholder="Start line"
              />
            </label>
            <div className="grid grid-cols-3 gap-4">
              <label className="block text-sm font-medium">
                Date
                <VSInput
                  className="mt-2"
                  type="date"
                  value={shiftForm.date}
                  onChange={(e) => setShiftForm({ ...shiftForm, date: e.target.value })}
                />
              </label>
              <label className="block text-sm font-medium">
                Start
                <VSInput
                  className="mt-2"
                  type="time"
                  value={shiftForm.start_time}
                  onChange={(e) => setShiftForm({ ...shiftForm, start_time: e.target.value })}
                />
              </label>
              <label className="block text-sm font-medium">
                End
                <VSInput
                  className="mt-2"
                  type="time"
                  value={shiftForm.end_time}
                  onChange={(e) => setShiftForm({ ...shiftForm, end_time: e.target.value })}
                />
              </label>
            </div>
            <label className="block text-sm font-medium">
              Capacity
              <VSInput
                className="mt-2"
                type="number"
                min="1"
                value={shiftForm.capacity}
                onChange={(e) => setShiftForm({ ...shiftForm, capacity: e.target.value })}
              />
            </label>
            <label className="block text-sm font-medium">
              Instructions
              <VSTextarea
                className="mt-2"
                rows={2}
                value={shiftForm.instructions}
                onChange={(e) => setShiftForm({ ...shiftForm, instructions: e.target.value })}
                placeholder="Special instructions for volunteers"
              />
            </label>
            {shiftError && (
              <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {shiftError}
              </p>
            )}
          </div>
          <VSModalFooter>
            <VSButton variant="ghost" onClick={() => setShiftModalOpen(false)}>
              Cancel
            </VSButton>
            <VSButton
              onClick={submitShift}
              disabled={shiftSubmitting || !shiftForm.title || !shiftForm.date || !shiftForm.start_time || !shiftForm.end_time}
            >
              {shiftSubmitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : editingShift ? (
                "Save changes"
              ) : (
                "Add shift"
              )}
            </VSButton>
          </VSModalFooter>
        </VSModalContent>
      </VSModal>

      {/* Edit event modal */}
      <VSModal open={editEventOpen} onOpenChange={setEditEventOpen}>
        <VSModalContent className="max-w-lg">
          <VSModalHeader>
            <VSModalTitle>Edit event</VSModalTitle>
          </VSModalHeader>
          <div className="space-y-4 px-6 py-4">
            <label className="block text-sm font-medium">
              Title
              <VSInput
                className="mt-2"
                value={eventForm.title}
                onChange={(e) =>
                  setEventForm({
                    ...eventForm,
                    title: e.target.value,
                    slug: createSlug(e.target.value),
                  })
                }
              />
            </label>
            <label className="block text-sm font-medium">
              Slug
              <VSInput
                className="mt-2"
                value={eventForm.slug}
                onChange={(e) => setEventForm({ ...eventForm, slug: e.target.value })}
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm font-medium">
                City
                <VSInput
                  className="mt-2"
                  value={eventForm.city}
                  onChange={(e) => setEventForm({ ...eventForm, city: e.target.value })}
                />
              </label>
              <label className="block text-sm font-medium">
                Venue
                <VSInput
                  className="mt-2"
                  value={eventForm.venue}
                  onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm font-medium">
                Start date
                <VSInput
                  className="mt-2"
                  type="date"
                  value={eventForm.start_date}
                  onChange={(e) => setEventForm({ ...eventForm, start_date: e.target.value })}
                />
              </label>
              <label className="block text-sm font-medium">
                End date
                <VSInput
                  className="mt-2"
                  type="date"
                  value={eventForm.end_date}
                  onChange={(e) => setEventForm({ ...eventForm, end_date: e.target.value })}
                />
              </label>
            </div>
            <label className="block text-sm font-medium">
              Description
              <VSTextarea
                className="mt-2"
                rows={3}
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              />
            </label>
            {eventEditError && (
              <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {eventEditError}
              </p>
            )}
          </div>
          <VSModalFooter>
            <VSButton variant="ghost" onClick={() => setEditEventOpen(false)}>
              Cancel
            </VSButton>
            <VSButton onClick={submitEventEdit} disabled={eventSubmitting}>
              {eventSubmitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                "Save changes"
              )}
            </VSButton>
          </VSModalFooter>
        </VSModalContent>
      </VSModal>
    </AdminGate>
  );
}
