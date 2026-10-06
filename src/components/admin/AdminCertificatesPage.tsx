import { Download, LoaderCircle, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { AdminLayout } from "@/components/layouts/AdminLayout";
import {
  VSButton,
  VSCard,
  VSCardContent,
  VSEmptyState,
  VSInput,
  VSLoadingState,
  VSModal,
  VSModalContent,
  VSModalFooter,
  VSModalHeader,
  VSModalTitle,
  VSErrorState,
  VSPageHeader,
} from "@/components/design-system";
import { supabase } from "@/lib/supabase";

type CertificateRow = {
  id: string;
  profile_id: string;
  event_id: string;
  role_id: string;
  hours: number;
  date: string;
  certificate_id: string;
  file_path: string | null;
  issued_at: string | null;
  profiles?: { first_name: string | null; last_name: string | null; email?: string | null } | null;
  events?: { title: string | null } | null;
  event_roles?: { name: string | null } | null;
};

type EventRow = { id: string; title: string };
type ProfileRow = { id: string; first_name: string | null; last_name: string | null; email?: string | null };
type RoleRow = { id: string; event_id: string; name: string };

type FormState = {
  profile_id: string;
  event_id: string;
  role_id: string;
  hours: string;
  date: string;
  certificate_id: string;
  file_path: string;
  issued_at: string;
};

const defaultForm: FormState = {
  profile_id: "",
  event_id: "",
  role_id: "",
  hours: "0",
  date: new Date().toISOString().slice(0, 10),
  certificate_id: "",
  file_path: "",
  issued_at: new Date().toISOString().slice(0, 16),
};

export function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<CertificateRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [certsRes, profilesRes, eventsRes, rolesRes] = await Promise.all([
        supabase
          .from("certificates")
          .select(
            "*, profiles!certificates_profile_id_fkey(id, first_name, last_name, email), events!certificates_event_id_fkey(id, title), event_roles!certificates_role_id_fkey(id, name)"
          )
          .order("issued_at", { ascending: false }),
        supabase
          .from("profiles")
          .select("id, first_name, last_name, email")
          .order("first_name", { ascending: true }),
        supabase.from("events").select("id, title").order("title", { ascending: true }),
        supabase.from("event_roles").select("id, event_id, name").order("name", { ascending: true }),
      ]);

      if (certsRes.error) throw certsRes.error;
      if (profilesRes.error) throw profilesRes.error;
      if (eventsRes.error) throw eventsRes.error;
      if (rolesRes.error) throw rolesRes.error;

      setCertificates((certsRes.data ?? []) as CertificateRow[]);
      setProfiles((profilesRes.data ?? []) as ProfileRow[]);
      setEvents((eventsRes.data ?? []) as EventRow[]);
      setRoles((rolesRes.data ?? []) as RoleRow[]);
    } catch (err) {
      console.error("Failed to load certificates:", err);
      setError(err instanceof Error ? err.message : "Failed to load certificates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const profileName = (profileId: string) => {
    const profile = profiles.find((item) => item.id === profileId);
    if (!profile) return "Unknown volunteer";
    const fullName = `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim();
    return fullName || profile.email || "Unknown volunteer";
  };

  const eventName = (eventId: string) => events.find((item) => item.id === eventId)?.title ?? "Unknown event";
  const roleName = (roleId: string) => roles.find((item) => item.id === roleId)?.name ?? "Unknown role";

  const availableRoles = form.event_id ? roles.filter((item) => item.event_id === form.event_id) : [];

  const openCreate = () => {
    const firstEvent = events[0];
    const firstRole = firstEvent ? roles.find((item) => item.event_id === firstEvent.id) : null;

    setEditingId(null);
    setForm({
      profile_id: profiles[0]?.id ?? "",
      event_id: firstEvent?.id ?? "",
      role_id: firstRole?.id ?? "",
      hours: "0",
      date: new Date().toISOString().slice(0, 10),
      certificate_id: "",
      file_path: "",
      issued_at: new Date().toISOString().slice(0, 16),
    });
    setModalOpen(true);
  };

  const openEdit = (certificate: CertificateRow) => {
    setEditingId(certificate.id);
    setForm({
      profile_id: certificate.profile_id,
      event_id: certificate.event_id,
      role_id: certificate.role_id,
      hours: String(certificate.hours ?? 0),
      date: certificate.date,
      certificate_id: certificate.certificate_id,
      file_path: certificate.file_path ?? "",
      issued_at: certificate.issued_at ? new Date(certificate.issued_at).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(defaultForm);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this certificate record?");
    if (!confirmed) return;

    const { error } = await supabase.from("certificates").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }

    await loadData();
  };

  const handleSave = async () => {
    if (!form.profile_id || !form.event_id || !form.role_id || !form.date || !form.certificate_id) {
      setError("Volunteer, event, role, date, and certificate ID are required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        profile_id: form.profile_id,
        event_id: form.event_id,
        role_id: form.role_id,
        hours: Number(form.hours || 0),
        date: form.date,
        certificate_id: form.certificate_id,
        file_path: form.file_path || null,
        issued_at: form.issued_at ? new Date(form.issued_at).toISOString() : new Date().toISOString(),
      };

      if (editingId) {
        const { error } = await supabase.from("certificates").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("certificates").insert(payload);
        if (error) throw error;
      }

      closeModal();
      await loadData();
    } catch (err) {
      console.error("Failed to save certificate:", err);
      setError(err instanceof Error ? err.message : "Failed to save certificate.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Certificates" eyebrow="Impact">
      <div className="mx-auto max-w-7xl">
        <VSPageHeader
          eyebrow="Impact"
          title="Certificates"
          description="Issue, track, and manage certificates for volunteer participation."
          action={
            <VSButton onClick={openCreate} disabled={profiles.length === 0 || events.length === 0 || roles.length === 0}>
              <Plus className="h-4 w-4" />
              Generate certificate
            </VSButton>
          }
        />

        {loading ? (
          <div className="mt-8"><VSLoadingState /></div>
        ) : error ? (
          <div className="mt-8"><VSErrorState description={error} /></div>
        ) : certificates.length === 0 ? (
          <div className="mt-8">
            <VSEmptyState
              title="No certificates yet"
              description="Create the first certificate once volunteer impact has been recorded."
              action={
                <VSButton onClick={openCreate} disabled={profiles.length === 0 || events.length === 0 || roles.length === 0}>
                  <Plus className="h-4 w-4" />
                  Generate certificate
                </VSButton>
              }
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {certificates.map((item) => (
              <VSCard key={item.id} className="rounded-[1.75rem] border-border">
                <VSCardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">Issued</span>
                  </div>

                  <p className="mt-5 font-mono text-xs text-muted-foreground">{item.certificate_id}</p>
                  <h2 className="mt-2 text-lg font-semibold text-foreground">{profileName(item.profile_id)}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{eventName(item.event_id)}</p>
                  <div className="mt-5 flex justify-between text-sm">
                    <span>{item.hours} hours</span>
                    <span>{item.date}</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Role: {roleName(item.role_id)}</p>

                  <div className="mt-6 flex gap-2">
                    <VSButton variant="outline" size="sm" onClick={() => openEdit(item)}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </VSButton>
                    <VSButton variant="ghost" size="sm" onClick={() => void handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </VSButton>
                    <VSButton variant="ghost" size="sm" type="button">
                      <Download className="h-4 w-4" />
                    </VSButton>
                  </div>
                </VSCardContent>
              </VSCard>
            ))}
          </div>
        )}
      </div>

      <VSModal open={modalOpen} onOpenChange={(open) => !open && closeModal()}>
        <VSModalContent className="max-w-2xl">
          <VSModalHeader>
            <VSModalTitle>{editingId ? "Edit certificate" : "Generate certificate"}</VSModalTitle>
          </VSModalHeader>

          <div className="space-y-4 px-6 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium">
                Volunteer
                <select
                  value={form.profile_id}
                  onChange={(event) => setForm({ ...form, profile_id: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select volunteer</option>
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {`${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || profile.email || profile.id}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium">
                Certificate ID
                <VSInput
                  className="mt-2"
                  value={form.certificate_id}
                  onChange={(event) => setForm({ ...form, certificate_id: event.target.value })}
                  placeholder="CERT-2026-001"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium">
                Event
                <select
                  value={form.event_id}
                  onChange={(event) => setForm({ ...form, event_id: event.target.value, role_id: "" })}
                  className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select event</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>{event.title}</option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium">
                Role
                <select
                  value={form.role_id}
                  onChange={(event) => setForm({ ...form, role_id: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select role</option>
                  {availableRoles.map((role) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="block text-sm font-medium">
                Hours
                <VSInput
                  className="mt-2"
                  type="number"
                  min="0"
                  value={form.hours}
                  onChange={(event) => setForm({ ...form, hours: event.target.value })}
                />
              </label>

              <label className="block text-sm font-medium">
                Date
                <VSInput
                  className="mt-2"
                  type="date"
                  value={form.date}
                  onChange={(event) => setForm({ ...form, date: event.target.value })}
                />
              </label>

              <label className="block text-sm font-medium">
                Issued at
                <VSInput
                  className="mt-2"
                  type="datetime-local"
                  value={form.issued_at}
                  onChange={(event) => setForm({ ...form, issued_at: event.target.value })}
                />
              </label>
            </div>

            <label className="block text-sm font-medium">
              File URL
              <VSInput
                className="mt-2"
                value={form.file_path}
                onChange={(event) => setForm({ ...form, file_path: event.target.value })}
                placeholder="https://.../certificate.pdf"
              />
            </label>

            {error ? (
              <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}
          </div>

          <VSModalFooter>
            <VSButton variant="outline" onClick={closeModal} disabled={submitting}>
              Cancel
            </VSButton>
            <VSButton onClick={() => void handleSave()} disabled={submitting}>
              {submitting ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : editingId ? (
                "Save changes"
              ) : (
                "Create certificate"
              )}
            </VSButton>
          </VSModalFooter>
        </VSModalContent>
      </VSModal>
    </AdminLayout>
  );
}
