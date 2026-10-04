import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  LogIn,
  LogOut,
  MapPin,
  ShieldCheck,
  Users,
  RefreshCw,
  ChevronRight,
} from "lucide-react";

import { AppShell } from "@/components/app/AppShell";

import {
  VSBadge,
  VSCard,
  VSCardContent,
  VSPageHeader,
} from "@/components/design-system";

import { attendanceService } from "@/services/volunteer/attendanceService";
import type { AttendanceRecord } from "@/lib/types";

export const Route = createFileRoute("/volunteer/attendance")({
  component: Attendance,
  head: () => ({
    meta: [
      {
        title: "Attendance | VolunSport Morocco",
      },
      {
        name: "description",
        content:
          "Review your VolunSport volunteer attendance and event check-in history.",
      },
    ],
  }),
});

type AttendanceGroup = {
  key: string;
  eventId: string;
  eventTitle: string;
  roleId?: string;
  roleName: string;
  city: string | null;
  venue: string | null;
  shifts: AttendanceRecord[];
};

function Attendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await attendanceService.getAttendance();

      setRecords(data);
    } catch (err: unknown) {
      console.error("Failed to load attendance:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load attendance.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const stats = useMemo(() => {
    const completed = records.filter(
      (record) => normalizeAttendanceStatus(record.status) === "checked-out",
    ).length;

    const checkedIn = records.filter(
      (record) => normalizeAttendanceStatus(record.status) === "checked-in",
    ).length;

    const scheduled = records.filter(
      (record) => normalizeAttendanceStatus(record.status) === "scheduled",
    ).length;

    return {
      total: records.length,
      completed,
      checkedIn,
      upcoming: scheduled,
    };
  }, [records]);

  const groups = useMemo<AttendanceGroup[]>(() => {
    const map = new Map<string, AttendanceGroup>();

    for (const record of records) {
      /*
       * One card = one Event + one Role.
       *
       * The individual shifts remain separate inside the card
       * because attendance belongs to a specific shift.
       */
      const key = `${record.event_id}::${record.role_name}`;

      const existing = map.get(key);

      if (existing) {
        existing.shifts.push(record);
        continue;
      }

      map.set(key, {
        key,
        eventId: record.event_id,
        eventTitle: record.event_title,
        roleName: record.role_name,
        city: record.city ?? null,
        venue: record.venue ?? null,
        shifts: [record],
      });
    }

    return Array.from(map.values()).map((group) => ({
      ...group,
      shifts: [...group.shifts].sort((a, b) => {
        const dateA = `${a.date} ${a.shift_start_time ?? "00:00:00"}`;
        const dateB = `${b.date} ${b.shift_start_time ?? "00:00:00"}`;

        return dateA.localeCompare(dateB);
      }),
    }));
  }, [records]);

  return (
    <AppShell title="Attendance">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* ============================================================
            HEADER
        ============================================================ */}
        <VSPageHeader
          eyebrow="Volunteer attendance"
          title="Your attendance"
          description="Track your assigned shifts, check-in activity and completed participation."
          action={
            !loading && records.length > 0 ? (
              <VSBadge variant="soft">
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                {stats.completed} completed
              </VSBadge>
            ) : undefined
          }
        />

        {/* ============================================================
            LOADING
        ============================================================ */}
        {loading && <AttendanceLoading />}

        {/* ============================================================
            ERROR
        ============================================================ */}
        {!loading && error && (
          <VSCard className="mx-auto max-w-2xl overflow-hidden rounded-[2rem] border-border">
            <VSCardContent className="p-8 text-center sm:p-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <ShieldCheck className="h-7 w-7" />
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Something went wrong
              </p>

              <h2 className="mt-3 text-2xl font-semibold text-foreground">
                Unable to load attendance
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                {error}
              </p>

              <button
                type="button"
                onClick={loadAttendance}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </button>
            </VSCardContent>
          </VSCard>
        )}

        {/* ============================================================
            EMPTY
        ============================================================ */}
        {!loading && !error && records.length === 0 && (
          <VSCard className="mx-auto max-w-2xl overflow-hidden rounded-[2rem] border-border">
            <VSCardContent className="p-8 text-center sm:p-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <CalendarDays className="h-7 w-7" />
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                No assignments yet
              </p>

              <h2 className="mt-3 text-2xl font-semibold text-foreground">
                No attendance records
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                Your assigned volunteer shifts will appear here. Attendance
                will be recorded after you check in at an event.
              </p>
            </VSCardContent>
          </VSCard>
        )}

        {/* ============================================================
            CONTENT
        ============================================================ */}
        {!loading && !error && records.length > 0 && (
          <div className="space-y-6">
            {/* ========================================================
                SUMMARY
            ======================================================== */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                icon={CalendarDays}
                label="Total shifts"
                value={stats.total}
              />

              <SummaryCard
                icon={Clock3}
                label="Upcoming"
                value={stats.upcoming}
              />

              <SummaryCard
                icon={LogIn}
                label="Checked in"
                value={stats.checkedIn}
                accent="primary"
              />

              <SummaryCard
                icon={CheckCircle2}
                label="Completed"
                value={stats.completed}
                accent="success"
              />
            </div>

            {/* ========================================================
                INFO BAR
            ======================================================== */}
            <div className="flex flex-col gap-3 rounded-[1.5rem] border border-primary/10 bg-primary/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Attendance is linked to your assigned shifts
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Each shift below is an individual assignment within its
                    event role.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={loadAttendance}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-xs font-semibold text-foreground transition hover:bg-muted"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </button>
            </div>

            {/* ========================================================
                GROUPED RECORDS
            ======================================================== */}
            <div className="space-y-5">
              {groups.map((group) => (
                <AttendanceGroupCard
                  key={group.key}
                  group={group}
                />
              ))}
            </div>

            {/* ========================================================
                PRIVACY
            ======================================================== */}
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/30 p-4">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

              <p className="text-xs leading-5 text-muted-foreground">
                Attendance records are linked to your volunteer assignments
                and are used to verify participation and completed event
                hours.
              </p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

/* ===============================================================
   GROUPED EVENT + ROLE CARD
================================================================ */

function AttendanceGroupCard({
  group,
}: {
  group: AttendanceGroup;
}) {
  const completedCount = group.shifts.filter(
    (shift) => normalizeAttendanceStatus(shift.status) === "checked-out",
  ).length;

  const checkedInCount = group.shifts.filter(
    (shift) => normalizeAttendanceStatus(shift.status) === "checked-in",
  ).length;

  const scheduledCount = group.shifts.filter(
    (shift) => normalizeAttendanceStatus(shift.status) === "scheduled",
  ).length;

  return (
    <VSCard className="overflow-hidden rounded-[2rem] border-border">
      <VSCardContent className="p-0">
        {/* ==========================================================
            GROUP HEADER
        ========================================================== */}
        <div className="border-b border-border bg-muted/[0.18] px-5 py-6 sm:px-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />

                <p className="truncate text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {group.eventTitle}
                </p>
              </div>

              <h2 className="mt-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {group.roleName}
              </h2>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                {group.city && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {group.city}
                  </span>
                )}

                {group.venue && (
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    {group.venue}
                  </span>
                )}

                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  {group.shifts.length}{" "}
                  {group.shifts.length === 1 ? "shift" : "shifts"}
                </span>
              </div>
            </div>

            {/* Group summary */}
            <div className="flex flex-wrap gap-2">
              {completedCount > 0 && (
                <StatusCount
                  icon={CheckCircle2}
                  value={completedCount}
                  label="Completed"
                  variant="success"
                />
              )}

              {checkedInCount > 0 && (
                <StatusCount
                  icon={LogIn}
                  value={checkedInCount}
                  label="Active"
                  variant="primary"
                />
              )}

              {scheduledCount > 0 && (
                <StatusCount
                  icon={Clock3}
                  value={scheduledCount}
                  label="Scheduled"
                  variant="muted"
                />
              )}
            </div>
          </div>
        </div>

        {/* ==========================================================
            SHIFTS
        ========================================================== */}
        <div className="p-4 sm:p-6">
          <div className="space-y-3">
            {group.shifts.map((shift, index) => (
              <ShiftRow
                key={shift.id}
                record={shift}
                index={index}
              />
            ))}
          </div>
        </div>
      </VSCardContent>
    </VSCard>
  );
}

/* ===============================================================
   SHIFT ROW
================================================================ */

function normalizeAttendanceStatus(status: string | null | undefined): string {
  return (status ?? "scheduled").trim().toLowerCase().replace(/_/g, "-");
}

function ShiftRow({
  record,
  index,
}: {
  record: AttendanceRecord;
  index: number;
}) {
  const normalizedStatus = normalizeAttendanceStatus(record.status);
  const checkedOut = normalizedStatus === "checked-out";
  const checkedIn = normalizedStatus === "checked-in";

  return (
    <div className="rounded-2xl border border-border bg-background p-4 transition-colors hover:bg-muted/[0.18] sm:p-5">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
        {/* Number + date */}
        <div className="flex items-center gap-4 xl:w-[220px] xl:shrink-0">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
              checkedOut
                ? "bg-emerald-500/10 text-emerald-600"
                : checkedIn
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {checkedOut ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              String(index + 1).padStart(2, "0")
            )}
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {formatDate(record.date)}
            </p>

            <p className="mt-1 text-sm font-bold text-foreground">
              {record.shift_title || "Volunteer shift"}
            </p>
          </div>
        </div>

        {/* Time */}
        <div className="flex items-center gap-3 xl:min-w-[190px]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-primary">
            <Clock3 className="h-4 w-4" />
          </div>

          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Shift time
            </p>

            <p className="mt-1 text-sm font-semibold text-foreground">
              {formatTime(record.shift_start_time)}
              <span className="mx-1.5 text-muted-foreground">—</span>
              {formatTime(record.shift_end_time)}
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-primary">
            <MapPin className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Location
            </p>

            <p className="mt-1 truncate text-sm font-medium text-foreground">
              {record.shift_location ||
                record.venue ||
                record.city ||
                "Location not specified"}
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="xl:w-[150px] xl:shrink-0">
          <ShiftStatus status={record.status} />
        </div>
      </div>

      {/* ============================================================
          ATTENDANCE TIMES
      ============================================================ */}
      {(record.check_in_time || record.check_out_time) && (
        <div className="mt-4 border-t border-border pt-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <MiniAttendanceTime
              icon={LogIn}
              label="Check-in"
              value={
                record.check_in_time
                  ? formatDateTime(record.check_in_time)
                  : "Not recorded"
              }
              active={Boolean(record.check_in_time)}
            />

            <MiniAttendanceTime
              icon={LogOut}
              label="Check-out"
              value={
                record.check_out_time
                  ? formatDateTime(record.check_out_time)
                  : "Not recorded"
              }
              active={Boolean(record.check_out_time)}
            />
          </div>
        </div>
      )}

      {/* Notes */}
      {record.notes && (
        <div className="mt-4 rounded-xl bg-muted/40 px-4 py-3">
          <p className="text-xs leading-5 text-muted-foreground">
            <span className="font-semibold text-foreground">Note:</span>{" "}
            {record.notes}
          </p>
        </div>
      )}
    </div>
  );
}

/* ===============================================================
   SHIFT STATUS
================================================================ */

function ShiftStatus({
  status,
}: {
  status: string;
}) {
  const normalizedStatus = normalizeAttendanceStatus(status);

  if (normalizedStatus === "checked-out") {
    return (
      <div className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-600">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Completed
      </div>
    );
  }

  if (normalizedStatus === "checked-in") {
    return (
      <div className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
        <LogIn className="h-3.5 w-3.5" />
        Checked in
      </div>
    );
  }

  if (normalizedStatus === "late") {
    return (
      <div className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-600">
        <Clock3 className="h-3.5 w-3.5" />
        Late
      </div>
    );
  }

  if (normalizedStatus === "absent") {
    return (
      <div className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-600">
        <ShieldCheck className="h-3.5 w-3.5" />
        Absent
      </div>
    );
  }

  return (
    <div className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground">
      <Clock3 className="h-3.5 w-3.5" />
      Scheduled
    </div>
  );
}

/* ===============================================================
   STATUS COUNT
================================================================ */

function StatusCount({
  icon: Icon,
  value,
  label,
  variant,
}: {
  icon: typeof CalendarDays;
  value: number;
  label: string;
  variant: "success" | "primary" | "muted";
}) {
  const styles = {
    success:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
    primary: "border-primary/20 bg-primary/10 text-primary",
    muted: "border-border bg-muted text-muted-foreground",
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold ${styles[variant]}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {value} {label}
    </div>
  );
}

/* ===============================================================
   SUMMARY CARD
================================================================ */

function SummaryCard({
  icon: Icon,
  label,
  value,
  accent = "default",
}: {
  icon: typeof CalendarDays;
  label: string;
  value: number;
  accent?: "default" | "primary" | "success";
}) {
  const iconClass =
    accent === "success"
      ? "bg-emerald-500/10 text-emerald-600"
      : accent === "primary"
        ? "bg-primary/10 text-primary"
        : "bg-muted text-muted-foreground";

  const valueClass =
    accent === "success"
      ? "text-emerald-600"
      : accent === "primary"
        ? "text-primary"
        : "text-foreground";

  return (
    <VSCard className="rounded-[1.75rem] border-border">
      <VSCardContent className="p-5">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="h-4 w-4" />
        </div>

        <p className="mt-5 text-xs font-medium text-muted-foreground">
          {label}
        </p>

        <p className={`mt-1 text-2xl font-bold ${valueClass}`}>
          {value}
        </p>
      </VSCardContent>
    </VSCard>
  );
}

/* ===============================================================
   MINI ATTENDANCE TIME
================================================================ */

function MiniAttendanceTime({
  icon: Icon,
  label,
  value,
  active,
}: {
  icon: typeof LogIn;
  label: string;
  value: string;
  active: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/[0.18] px-3 py-2.5">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          active
            ? "bg-emerald-500/10 text-emerald-600"
            : "bg-muted text-muted-foreground"
        }`}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>

      <div className="min-w-0">
        <p className="text-[0.65rem] font-medium text-muted-foreground">
          {label}
        </p>

        <p
          className={`mt-0.5 truncate text-xs font-semibold ${
            active ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/* ===============================================================
   LOADING
================================================================ */

function AttendanceLoading() {
  return (
    <VSCard className="overflow-hidden rounded-[2rem] border-border">
      <VSCardContent className="p-6 sm:p-8">
        <div className="animate-pulse space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="h-3 w-32 rounded-full bg-muted" />
              <div className="h-7 w-52 rounded-lg bg-muted" />
              <div className="h-4 w-64 rounded-full bg-muted" />
            </div>

            <div className="h-9 w-28 rounded-full bg-muted" />
          </div>

          <div className="space-y-3">
            <div className="h-20 rounded-2xl bg-muted" />
            <div className="h-20 rounded-2xl bg-muted" />
            <div className="h-20 rounded-2xl bg-muted" />
          </div>
        </div>
      </VSCardContent>
    </VSCard>
  );
}

/* ===============================================================
   FORMAT HELPERS
================================================================ */

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatTime(value: string | null) {
  if (!value) {
    return "—";
  }

  // PostgreSQL `time without time zone` is already a local clock time.
  // Do not parse it through `new Date()`.
  return value.slice(0, 5);
}

