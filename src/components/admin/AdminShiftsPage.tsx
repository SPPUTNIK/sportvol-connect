import { useEffect, useMemo, useState, useCallback } from "react";
import { CalendarDays, Clock3, CreditCard as Edit3, LoaderCircle, MapPin, Plus, Trash2, Users } from "lucide-react";

import { AdminLayout } from "@/components/layouts/AdminLayout";
import {
  VSButton,
  VSCard,
  VSCardContent,
  VSInput,
  VSPageHeader,
  VSTextarea,
  VSLoadingState,
  VSErrorState,
  VSEmptyState,
  VSModal,
  VSModalContent,
  VSModalHeader,
  VSModalTitle,
  VSModalFooter,
} from "@/components/design-system";

import { adminEventService } from "@/services/adminEventService";
import { supabase } from "@/integrations/supabase/client";

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

type EventRow = { id: string; title: string };
type RoleRow = { id: string; name: string; event_id: string };

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

export function AdminShiftsPage() {
  const [shifts, setShifts] = useState<ShiftRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftRow | null>(null);
  const [form, setForm] = useState({
    event_id: "",
    role_id: "",
    title: "",
    location: "",
    date: "",
    start_time: "",
    end_time: "",
    capacity: "1",
    instructions: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [shiftsRes, eventsRes, rolesRes] = await Promise.all([
        supabase
          .from("event_shifts")
          .select("*, event_roles(name)")
          .order("date", { ascending: false }),
        supabase.from("events").select("id, title").order("title"),
        supabase.from("event_roles").select("id, name, event_id").order("name"),
      ]);

      if (shiftsRes.error) throw shiftsRes.error;
      if (eventsRes.error) throw eventsRes.error;
      if (rolesRes.error) throw rolesRes.error;

      setShifts((shiftsRes.data ?? []) as ShiftRow[]);
      setEvents((eventsRes.data ?? []) as EventRow[]);
      setRoles((rolesRes.data ?? []) as RoleRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shifts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const eventTitle = (eventId: string) =>
    events.find((e) => e.id === eventId)?.title ?? "Unknown event";

  const rolesForEvent = (eventId: string) =>
    roles.filter((r) => r.event_id === eventId);

  const openAdd = () => {
    if (roles.length === 0) {
      setError("Create at least one role before adding shifts.");
      return;
    }
    setEditingShift(null);
    setForm({
      event_id: roles[0].event_id,
      role_id: roles[0].id,
      title: "",
      location: "",
      date: "",
      start_time: "",
      end_time: "",
      capacity: "1",
      instructions: "",
    });
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (shift: ShiftRow) => {
    setEditingShift(shift);
    setForm({
      event_id: shift.event_id,
      role_id: shift.role_id,
      title: shift.title,
      location: shift.location ?? "",
      date: shift.date,
      start_time: shift.start_time,
      end_time: shift.end_time,
      capacity: String(shift.capacity),
      instructions: shift.instructions ?? "",
    });
    setFormError(null);
    setModalOpen(true);
  };

  const submit = async () => {
    setSubmitting(true);
    setFormError(null);
    const payload = {
      event_id: form.event_id,
      role_id: form.role_id,
      title: form.title,
      location: form.location || null,
      date: form.date,
      start_time: form.start_time,
      end_time: form.end_time,
      capacity: Number(form.capacity || 1),
      instructions: form.instructions || null,
    };

    if (editingShift) {
      const { error } = await adminEventService.updateShift({ id: editingShift.id, ...payload });
      setSubmitting(false);
      if (error) {
        setFormError(error);
        return;
      }
    } else {
      const { error } = await adminEventService.createShift(payload);
      setSubmitting(false);
      if (error) {
        setFormError(error);
        return;
      }
    }
    setModalOpen(false);
    loadData();
  };

  const remove = async (id: string) => {
    const { error } = await adminEventService.deleteShift(id);
    if (error) {
      setError(error);
      return;
    }
    loadData();
  };

  return (
    <AdminLayout title="Shifts" eyebrow="Event management">
      <div className="mx-auto max-w-7xl">
        <VSPageHeader
          eyebrow="Event management"
          title="Volunteer shifts"
          description="Organize volunteer schedules, time slots, and operational coverage."
          action={
            <VSButton onClick={openAdd} disabled={roles.length === 0}>
              <Plus className="h-4 w-4" />
              Create shift
            </VSButton>
          }
        />

        {roles.length === 0 && (
          <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Create at least one role before adding shifts.
          </p>
        )}

        <div className="mt-8 grid gap-4">
          {loading ? (
            <VSLoadingState />
          ) : error ? (
            <VSErrorState description={error} />
          ) : shifts.length === 0 ? (
            <VSEmptyState
              title="No shifts found"
              description="Create your first shift to start scheduling volunteers."
              action={
                <VSButton onClick={openAdd}>
                  <Plus className="h-4 w-4" />
                  Create shift
                </VSButton>
              }
            />
          ) : (
            shifts.map((shift) => (
              <VSCard key={shift.id} className="rounded-[1.75rem] border-border">
                <VSCardContent className="p-6">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm font-medium text-primary">
                        {eventTitle(shift.event_id)}
                      </p>
                      <h2 className="mt-1 text-lg font-semibold">
                        {shift.title}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {shift.event_roles?.name ?? "Unassigned role"}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          {formatDate(shift.date)}
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock3 className="h-4 w-4" />
                          {shift.start_time} – {shift.end_time}
                        </span>
                        {shift.location && (
                          <span className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {shift.location}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                          Capacity
                        </p>
                        <p className="mt-1 flex items-center gap-2 font-semibold">
                          <Users className="h-4 w-4" />
                          {shift.capacity}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <VSButton variant="outline" size="sm" onClick={() => openEdit(shift)}>
                          <Edit3 className="h-4 w-4" />
                          Edit
                        </VSButton>
                        <VSButton
                          variant="outline"
                          size="sm"
                          aria-label={`Delete ${shift.title}`}
                          onClick={() => remove(shift.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </VSButton>
                      </div>
                    </div>
                  </div>
                </VSCardContent>
              </VSCard>
            ))
          )}
        </div>
      </div>

      {/* Shift modal */}
      <VSModal open={modalOpen} onOpenChange={setModalOpen}>
        <VSModalContent className="max-w-lg">
          <VSModalHeader>
            <VSModalTitle>{editingShift ? "Edit shift" : "Create shift"}</VSModalTitle>
          </VSModalHeader>
          <div className="space-y-4 px-6 py-4">
            <label className="block text-sm font-medium">
              Event
              <select
                className="mt-2 h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm"
                value={form.event_id}
                onChange={(e) => {
                  const eventRoles = rolesForEvent(e.target.value);
                  setForm({
                    ...form,
                    event_id: e.target.value,
                    role_id: eventRoles[0]?.id ?? "",
                  });
                }}
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              Role
              <select
                className="mt-2 h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm"
                value={form.role_id}
                onChange={(e) => setForm({ ...form, role_id: e.target.value })}
              >
                {rolesForEvent(form.event_id).map((r) => (
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
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Morning setup"
              />
            </label>
            <label className="block text-sm font-medium">
              Location
              <VSInput
                className="mt-2"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Start line"
              />
            </label>
            <div className="grid grid-cols-3 gap-4">
              <label className="block text-sm font-medium">
                Date
                <VSInput
                  className="mt-2"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </label>
              <label className="block text-sm font-medium">
                Start
                <VSInput
                  className="mt-2"
                  type="time"
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                />
              </label>
              <label className="block text-sm font-medium">
                End
                <VSInput
                  className="mt-2"
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                />
              </label>
            </div>
            <label className="block text-sm font-medium">
              Capacity
              <VSInput
                className="mt-2"
                type="number"
                min="1"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              />
            </label>
            <label className="block text-sm font-medium">
              Instructions
              <VSTextarea
                className="mt-2"
                rows={2}
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              />
            </label>
            {formError && (
              <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {formError}
              </p>
            )}
          </div>
          <VSModalFooter>
            <VSButton variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </VSButton>
            <VSButton
              onClick={submit}
              disabled={submitting || !form.title || !form.date || !form.start_time || !form.end_time}
            >
              {submitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : editingShift ? (
                "Save changes"
              ) : (
                "Create shift"
              )}
            </VSButton>
          </VSModalFooter>
        </VSModalContent>
      </VSModal>
    </AdminLayout>
  );
}
