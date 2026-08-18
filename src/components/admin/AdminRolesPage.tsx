import { useEffect, useMemo, useState, useCallback } from "react";
import { CreditCard as Edit3, LoaderCircle, Plus, Search, ShieldCheck, Trash2, Users } from "lucide-react";

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

type EventRow = { id: string; title: string };

export function AdminRolesPage() {
  const [query, setQuery] = useState("");
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleRow | null>(null);
  const [form, setForm] = useState({
    event_id: "",
    name: "",
    description: "",
    positions: "1",
    requirements: "",
    responsibilities: "",
    minAge: "",
    mandatoryTraining: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rolesRes, eventsRes] = await Promise.all([
        supabase
          .from("event_roles")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("events").select("id, title").order("title", { ascending: true }),
      ]);

      if (rolesRes.error) throw rolesRes.error;
      if (eventsRes.error) throw eventsRes.error;

      setRoles((rolesRes.data ?? []) as RoleRow[]);
      setEvents((eventsRes.data ?? []) as EventRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load roles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredRoles = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return roles;
    return roles.filter((r) =>
      `${r.name} ${r.description ?? ""}`.toLowerCase().includes(normalized),
    );
  }, [roles, query]);

  const eventTitle = (eventId: string) =>
    events.find((e) => e.id === eventId)?.title ?? "Unknown event";

  const openAdd = () => {
    setEditingRole(null);
    setForm({
      event_id: events[0]?.id ?? "",
      name: "",
      description: "",
      positions: "1",
      requirements: "",
      responsibilities: "",
      minAge: "",
      mandatoryTraining: false,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (role: RoleRow) => {
    setEditingRole(role);
    setForm({
      event_id: role.event_id,
      name: role.name,
      description: role.description ?? "",
      positions: String(role.positions),
      requirements: role.requirements ?? "",
      responsibilities: role.responsibilities ?? "",
      minAge: role.min_age != null ? String(role.min_age) : "",
      mandatoryTraining: role.mandatory_training,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const submit = async () => {
    setSubmitting(true);
    setFormError(null);
    const payload = {
      event_id: form.event_id,
      name: form.name,
      description: form.description || null,
      positions: Number(form.positions || 1),
      requirements: form.requirements || null,
      responsibilities: form.responsibilities || null,
      min_age: form.minAge ? Number(form.minAge) : null,
      mandatory_training: form.mandatoryTraining,
    };

    if (editingRole) {
      const { error } = await adminEventService.updateRole({ id: editingRole.id, ...payload });
      setSubmitting(false);
      if (error) {
        setFormError(error);
        return;
      }
    } else {
      const { error } = await adminEventService.createRole(payload);
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
    const { error } = await adminEventService.deleteRole(id);
    if (error) {
      setError(error);
      return;
    }
    loadData();
  };

  return (
    <AdminLayout title="Roles" eyebrow="Event management">
      <div className="mx-auto max-w-7xl">
        <VSPageHeader
          eyebrow="Event management"
          title="Volunteer roles"
          description="Define the roles volunteers can take during sporting events."
          action={
            <VSButton onClick={openAdd} disabled={events.length === 0}>
              <Plus className="h-4 w-4" />
              Create role
            </VSButton>
          }
        />

        {events.length === 0 && (
          <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Create an event first before adding roles.
          </p>
        )}

        <div className="mt-8">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <VSInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search roles"
              className="pl-11"
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {loading ? (
            <VSLoadingState />
          ) : error ? (
            <VSErrorState description={error} />
          ) : filteredRoles.length === 0 ? (
            <VSEmptyState
              title="No roles found"
              description="Create your first volunteer role to get started."
              action={
                <VSButton onClick={openAdd}>
                  <Plus className="h-4 w-4" />
                  Create role
                </VSButton>
              }
            />
          ) : (
            filteredRoles.map((role) => (
              <VSCard key={role.id} className="rounded-[1.75rem] border-border">
                <VSCardContent className="p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold">{role.name}</h2>
                        <p className="mt-1 text-sm text-primary">
                          {eventTitle(role.event_id)}
                        </p>
                        {role.description && (
                          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                            {role.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                          Volunteers
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">
                            {role.filled_positions}/{role.positions}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <VSButton variant="outline" size="sm" onClick={() => openEdit(role)}>
                          <Edit3 className="h-4 w-4" />
                          Edit
                        </VSButton>
                        <VSButton
                          variant="outline"
                          size="sm"
                          aria-label={`Delete ${role.name}`}
                          onClick={() => remove(role.id)}
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

      {/* Role modal */}
      <VSModal open={modalOpen} onOpenChange={setModalOpen}>
        <VSModalContent className="max-w-lg">
          <VSModalHeader>
            <VSModalTitle>{editingRole ? "Edit role" : "Create role"}</VSModalTitle>
          </VSModalHeader>
          <div className="space-y-4 px-6 py-4">
            <label className="block text-sm font-medium">
              Event
              <select
                className="mt-2 h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm"
                value={form.event_id}
                onChange={(e) => setForm({ ...form, event_id: e.target.value })}
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              Role name
              <VSInput
                className="mt-2"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Route support volunteer"
              />
            </label>
            <label className="block text-sm font-medium">
              Description
              <VSInput
                className="mt-2"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief summary"
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm font-medium">
                Positions
                <VSInput
                  className="mt-2"
                  type="number"
                  min="1"
                  value={form.positions}
                  onChange={(e) => setForm({ ...form, positions: e.target.value })}
                />
              </label>
              <label className="block text-sm font-medium">
                Minimum age
                <VSInput
                  className="mt-2"
                  type="number"
                  min="0"
                  value={form.minAge}
                  onChange={(e) => setForm({ ...form, minAge: e.target.value })}
                  placeholder="18"
                />
              </label>
            </div>
            <label className="block text-sm font-medium">
              Requirements
              <VSTextarea
                className="mt-2"
                rows={2}
                value={form.requirements}
                onChange={(e) => setForm({ ...form, requirements: e.target.value })}
              />
            </label>
            <label className="block text-sm font-medium">
              Responsibilities
              <VSTextarea
                className="mt-2"
                rows={2}
                value={form.responsibilities}
                onChange={(e) => setForm({ ...form, responsibilities: e.target.value })}
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.mandatoryTraining}
                onChange={(e) => setForm({ ...form, mandatoryTraining: e.target.checked })}
              />
              Mandatory training required
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
            <VSButton onClick={submit} disabled={submitting || !form.name || !form.event_id}>
              {submitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : editingRole ? (
                "Save changes"
              ) : (
                "Create role"
              )}
            </VSButton>
          </VSModalFooter>
        </VSModalContent>
      </VSModal>
    </AdminLayout>
  );
}
