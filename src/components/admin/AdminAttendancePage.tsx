import { useEffect, useMemo, useState } from "react";
import { Clock3, LoaderCircle, Pencil, Plus, Trash2 } from "lucide-react";

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
  VSTextarea,
} from "@/components/design-system";
import { supabase } from "@/lib/supabase";

type AttendanceRow = {
  id: string;
  profile_id: string;
  event_id: string;
  shift_id: string;
  role_id: string;
  date: string;
  status: string;
  check_in_time: string | null;
  check_out_time: string | null;
  notes: string | null;
  profiles?: { first_name: string | null; last_name: string | null; email?: string | null } | null;
  events?: { title: string | null } | null;
  event_roles?: { name: string | null } | null;
  event_shifts?: { title: string | null; start_time?: string | null; end_time?: string | null } | null;
};

type EventRow = { id: string; title: string };
type ProfileRow = { id: string; first_name: string | null; last_name: string | null; email?: string | null };
type RoleRow = { id: string; event_id: string; name: string };
type ShiftRow = { id: string; event_id: string; title: string; date: string; start_time: string; end_time: string };

type FormState = {
  profile_id: string;
  event_id: string;
  shift_id: string;
  role_id: string;
  date: string;
  status: string;
  check_in_time: string;
  check_out_time: string;
  notes: string;
};

const today = () => new Date().toISOString().slice(0, 10);

const attendanceStatusOptions = [
  { value: "scheduled", label: "Scheduled" },
  { value: "checked-in", label: "Checked in" },
  { value: "checked-out", label: "Checked out" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
];

const getAttendanceStatusLabel = (status: string) =>
  attendanceStatusOptions.find((option) => option.value === status)?.label ?? status;

const defaultForm: FormState = {
  profile_id: "",
  event_id: "",
  shift_id: "",
  role_id: "",
  date: today(),
  status: "scheduled",
  check_in_time: "",
  check_out_time: "",
  notes: "",
};

export function AdminAttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [shifts, setShifts] = useState<ShiftRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [attendanceRes, profilesRes, eventsRes, rolesRes, shiftsRes] = await Promise.all([
        supabase
          .from("attendance_records")
          .select(
            "*, profiles!attendance_records_profile_id_fkey(id, first_name, last_name, email), events!attendance_records_event_id_fkey(id, title), event_roles!attendance_records_role_id_fkey(id, name), event_shifts!attendance_records_shift_id_fkey(id, title, date, start_time, end_time)"
          )
          .order("date", { ascending: false }),
        supabase
          .from("profiles")
          .select("id, first_name, last_name, email")
          .order("first_name", { ascending: true }),
        supabase.from("events").select("id, title").order("title", { ascending: true }),
        supabase.from("event_roles").select("id, event_id, name").order("name", { ascending: true }),
        supabase
          .from("event_shifts")
          .select("id, event_id, title, date, start_time, end_time")
          .order("date", { ascending: false }),
      ]);

      if (attendanceRes.error) throw attendanceRes.error;
      if (profilesRes.error) throw profilesRes.error;
      if (eventsRes.error) throw eventsRes.error;
      if (rolesRes.error) throw rolesRes.error;
      if (shiftsRes.error) throw shiftsRes.error;

      setAttendance((attendanceRes.data ?? []) as AttendanceRow[]);
      setProfiles((profilesRes.data ?? []) as ProfileRow[]);
      setEvents((eventsRes.data ?? []) as EventRow[]);
      setRoles((rolesRes.data ?? []) as RoleRow[]);
      setShifts((shiftsRes.data ?? []) as ShiftRow[]);
    } catch (err) {
      console.error("Failed to load attendance records:", err);
      setError(err instanceof Error ? err.message : "Failed to load attendance records.");
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
  const shiftName = (shiftId: string) => shifts.find((item) => item.id === shiftId)?.title ?? "Unknown shift";

  const availableRoles = form.event_id ? roles.filter((item) => item.event_id === form.event_id) : [];
  const availableShifts = form.event_id ? shifts.filter((item) => item.event_id === form.event_id) : [];

  const openCreate = () => {
    const firstEvent = events[0];
    const firstRole = firstEvent ? roles.find((item) => item.event_id === firstEvent.id) : null;
    const firstShift = firstEvent ? shifts.find((item) => item.event_id === firstEvent.id) : null;

    setEditingId(null);
    setForm({
      profile_id: profiles[0]?.id ?? "",
      event_id: firstEvent?.id ?? "",
      shift_id: firstShift?.id ?? "",
      role_id: firstRole?.id ?? "",
      date: today(),
      status: "scheduled",
      check_in_time: "",
      check_out_time: "",
      notes: "",
    });
    setModalOpen(true);
  };

  const openEdit = (record: AttendanceRow) => {
    setEditingId(record.id);
    setForm({
      profile_id: record.profile_id,
      event_id: record.event_id,
      shift_id: record.shift_id,
      role_id: record.role_id,
      date: record.date,
      status: record.status,
      check_in_time: record.check_in_time ?? "",
      check_out_time: record.check_out_time ?? "",
      notes: record.notes ?? "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(defaultForm);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this attendance record?");
    if (!confirmed) return;

    const { error } = await supabase.from("attendance_records").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }

    await loadData();
  };

  const handleSave = async () => {
    if (!form.profile_id || !form.event_id || !form.role_id || !form.shift_id || !form.date) {
      setError("Volunteer, event, role, shift, and date are required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        profile_id: form.profile_id,
        event_id: form.event_id,
        shift_id: form.shift_id,
        role_id: form.role_id,
        date: form.date,
        status: form.status,
        check_in_time: form.check_in_time || null,
        check_out_time: form.check_out_time || null,
        notes: form.notes || null,
      };

      if (editingId) {
        const { error } = await supabase.from("attendance_records").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("attendance_records").insert(payload);
        if (error) throw error;
      }

      closeModal();
      await loadData();
    } catch (err) {
      console.error("Failed to save attendance record:", err);
      setError(err instanceof Error ? err.message : "Failed to save attendance record.");
    } finally {
      setSubmitting(false);
    }
  };

  const stats = useMemo(
    () => ({
      total: attendance.length,
      scheduled: attendance.filter((item) => item.status === "scheduled").length,
      checkedIn: attendance.filter((item) => item.status === "checked-in").length,
      checkedOut: attendance.filter((item) => item.status === "checked-out").length,
      absent: attendance.filter((item) => item.status === "absent").length,
      late: attendance.filter((item) => item.status === "late").length,
    }),
    [attendance],
  );

  const filteredAttendance = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return attendance.filter((record) => {
      const volunteerName = profileName(record.profile_id).toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        volunteerName.includes(normalizedSearch) ||
        eventName(record.event_id).toLowerCase().includes(normalizedSearch) ||
        shiftName(record.shift_id).toLowerCase().includes(normalizedSearch);

      const matchesDate = !dateFilter || record.date === dateFilter;
      return matchesSearch && matchesDate;
    });
  }, [attendance, dateFilter, search]);

  const groupedAttendance = useMemo(() => {
    const groups = new Map<string, AttendanceRow[]>();

    filteredAttendance.forEach((record) => {
      const key = record.profile_id;
      const next = groups.get(key) ?? [];
      next.push(record);
      groups.set(key, next.sort((a, b) => b.date.localeCompare(a.date)));
    });

    return Array.from(groups.entries())
      .map(([profileId, records]) => ({
        profileId,
        name: profileName(profileId),
        records: records.sort((a, b) => b.date.localeCompare(a.date)),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredAttendance]);

  return (
    <AdminLayout title="Attendance" eyebrow="Operations">
      <div className="mx-auto max-w-7xl">
        <VSPageHeader
          eyebrow="Operations"
          title="Attendance records"
          description="Track volunteer check-ins, shift participation, and attendance status."
          action={
            <VSButton onClick={openCreate} disabled={profiles.length === 0 || events.length === 0 || roles.length === 0 || shifts.length === 0}>
              <Plus className="h-4 w-4" />
              Add record
            </VSButton>
          }
        />

        <div className="mt-8 grid gap-4 md:grid-cols-5">
          <VSCard className="rounded-[1.5rem] border-border">
            <VSCardContent className="p-5">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="mt-2 text-3xl font-semibold">{stats.total}</p>
            </VSCardContent>
          </VSCard>
          <VSCard className="rounded-[1.5rem] border-border">
            <VSCardContent className="p-5">
              <p className="text-sm text-muted-foreground">Scheduled</p>
              <p className="mt-2 text-3xl font-semibold">{stats.scheduled}</p>
            </VSCardContent>
          </VSCard>
          <VSCard className="rounded-[1.5rem] border-border">
            <VSCardContent className="p-5">
              <p className="text-sm text-muted-foreground">Checked-in</p>
              <p className="mt-2 text-3xl font-semibold">{stats.checkedIn}</p>
            </VSCardContent>
          </VSCard>
          <VSCard className="rounded-[1.5rem] border-border">
            <VSCardContent className="p-5">
              <p className="text-sm text-muted-foreground">Checked-out</p>
              <p className="mt-2 text-3xl font-semibold">{stats.checkedOut}</p>
            </VSCardContent>
          </VSCard>
          <VSCard className="rounded-[1.5rem] border-border">
            <VSCardContent className="p-5">
              <p className="text-sm text-muted-foreground">Late / absent</p>
              <p className="mt-2 text-3xl font-semibold">{stats.late + stats.absent}</p>
            </VSCardContent>
          </VSCard>
        </div>

        <div className="mt-8 flex flex-col gap-3 rounded-[1.5rem] border border-border bg-card p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <VSInput
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by volunteer name"
              className="pr-10"
            />
          </div>

          <div className="flex items-center gap-2 md:w-auto">
            <label className="text-sm text-muted-foreground">Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary/20"
            />
            {dateFilter ? (
              <button
                type="button"
                onClick={() => setDateFilter("")}
                className="rounded-lg border border-input px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>

        {loading ? (
          <div className="mt-8"><VSLoadingState /></div>
        ) : error ? (
          <div className="mt-8"><VSErrorState description={error} /></div>
        ) : attendance.length === 0 ? (
          <div className="mt-8">
            <VSEmptyState
              title="No attendance records yet"
              description="Add the first attendance record for a volunteer shift."
              action={
                <VSButton onClick={openCreate} disabled={profiles.length === 0 || events.length === 0 || roles.length === 0 || shifts.length === 0}>
                  <Plus className="h-4 w-4" />
                  Add record
                </VSButton>
              }
            />
          </div>
        ) : groupedAttendance.length === 0 ? (
          <div className="mt-8">
            <VSEmptyState
              title="No matching attendance records"
              description="Try another volunteer name or clear the date filter."
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-4">
            {groupedAttendance.map(({ profileId, name, records }) => (
              <VSCard key={profileId} className="rounded-[1.5rem] border-border">
                <VSCardContent className="p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Clock3 className="h-5 w-5" />
                      </div>

                      <div>
                        <h3 className="text-base font-semibold">{name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {records.length} {records.length === 1 ? "attendance record" : "attendance records"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {records.map((record) => (
                      <div
                        key={record.id}
                        className="rounded-2xl border border-border bg-muted/20 p-4"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {eventName(record.event_id)} · {shiftName(record.shift_id)}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {record.date} · {roleName(record.role_id)}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                              {getAttendanceStatusLabel(record.status)}
                            </span>

                            <VSButton variant="outline" size="sm" onClick={() => openEdit(record)}>
                              <Pencil className="h-4 w-4" />
                              Edit
                            </VSButton>

                            <VSButton variant="outline" size="sm" onClick={() => void handleDelete(record.id)}>
                              <Trash2 className="h-4 w-4" />
                            </VSButton>
                          </div>
                        </div>
                      </div>
                    ))}
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
            <VSModalTitle>{editingId ? "Edit attendance record" : "Create attendance record"}</VSModalTitle>
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
                Event
                <select
                  value={form.event_id}
                  onChange={(event) => setForm({ ...form, event_id: event.target.value, role_id: "", shift_id: "" })}
                  className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select event</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>{event.title}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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

              <label className="block text-sm font-medium">
                Shift
                <select
                  value={form.shift_id}
                  onChange={(event) => setForm({ ...form, shift_id: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select shift</option>
                  {availableShifts.map((shift) => (
                    <option key={shift.id} value={shift.id}>{shift.title} · {shift.date}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
                Status
                <select
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-primary/20"
                >
                  {attendanceStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium">
                Check-in time
                <VSInput
                  className="mt-2"
                  type="time"
                  value={form.check_in_time}
                  onChange={(event) => setForm({ ...form, check_in_time: event.target.value })}
                />
              </label>

              <label className="block text-sm font-medium">
                Check-out time
                <VSInput
                  className="mt-2"
                  type="time"
                  value={form.check_out_time}
                  onChange={(event) => setForm({ ...form, check_out_time: event.target.value })}
                />
              </label>
            </div>

            <label className="block text-sm font-medium">
              Notes
              <VSTextarea
                className="mt-2"
                rows={3}
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                placeholder="Optional notes about the volunteer attendance"
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
                "Create record"
              )}
            </VSButton>
          </VSModalFooter>
        </VSModalContent>
      </VSModal>
    </AdminLayout>
  );
}
