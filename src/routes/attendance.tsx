import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  LogIn,
  LogOut,
  ShieldCheck,
} from "lucide-react";

import { AppShell } from "@/components/app/AppShell";

import {
  VSBadge,
  VSCard,
  VSCardContent,
  VSPageHeader,
} from "@/components/design-system";

import { attendanceService } from "@/services/attendanceService";
import type { AttendanceRecord } from "@/lib/types";

export const Route = createFileRoute("/attendance")({
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

function Attendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    attendanceService
      .getAttendance()
      .then(setRecords)
      .catch((err: unknown) =>
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load attendance.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const completedRecords = records.filter(
    (record) =>
      record.status === "checked-out",
  ).length;

  const upcomingRecords = records.filter(
    (record) =>
      record.status === "pending",
  ).length;

  return (
    <AppShell title="Attendance">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <VSPageHeader
          eyebrow="Event attendance"
          title="Your check-in status"
          description="Review your attendance history, check-in times and current event participation."
          action={
            !loading && records.length > 0 ? (
              <VSBadge variant="soft">
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                {completedRecords} completed
              </VSBadge>
            ) : undefined
          }
        />

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading && (
          <VSCard className="rounded-[2rem] border-border">
            <VSCardContent className="flex min-h-[320px] items-center justify-center p-8">
              <div className="text-center">

                <div className="mx-auto flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Clock3 className="h-6 w-6" />
                </div>

                <p className="mt-5 text-sm font-semibold text-foreground">
                  Loading attendance…
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                  Preparing your event attendance records.
                </p>

              </div>
            </VSCardContent>
          </VSCard>
        )}

        {/* =====================================================
            ERROR
        ===================================================== */}

        {!loading && error && (
          <VSCard className="mx-auto max-w-2xl rounded-[2rem] border-border">
            <VSCardContent className="p-8 text-center sm:p-12">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-600">
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

            </VSCardContent>
          </VSCard>
        )}

        {/* =====================================================
            EMPTY
        ===================================================== */}

        {!loading && !error && records.length === 0 && (
          <VSCard className="mx-auto max-w-2xl rounded-[2rem] border-border">
            <VSCardContent className="p-8 text-center sm:p-12">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Clock3 className="h-7 w-7" />
              </div>

              <h2 className="mt-6 text-2xl font-semibold text-foreground">
                No attendance data
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                Your attendance history will appear after your
                first event check-in.
              </p>

            </VSCardContent>
          </VSCard>
        )}

        {/* =====================================================
            ATTENDANCE CONTENT
        ===================================================== */}

        {!loading && !error && records.length > 0 && (
          <div className="space-y-6">

            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="grid gap-4 sm:grid-cols-3">

              <SummaryCard
                icon={CalendarDays}
                label="Total records"
                value={records.length}
              />

              <SummaryCard
                icon={CheckCircle2}
                label="Completed"
                value={completedRecords}
                accent
              />

              <SummaryCard
                icon={Clock3}
                label="Upcoming"
                value={upcomingRecords}
              />

            </div>

            {/* =================================================
                RECORDS
            ================================================= */}

            <div className="space-y-4">

              {records.map((record) => {
                const checkedOut =
                  record.status === "checked-out";

                const checkedIn =
                  record.status === "checked-in";

                return (
                  <VSCard
                    key={record.id}
                    className="overflow-hidden rounded-[2rem] border-border"
                  >
                    <VSCardContent className="p-6 sm:p-8">

                      {/* TOP */}

                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                        <div className="min-w-0">

                          <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            {record.event_title}
                          </p>

                          <h2 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">
                            {record.role_name}
                          </h2>

                          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">

                            <span className="flex items-center gap-1.5">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {record.date}
                            </span>

                          </div>

                        </div>

                        {/* STATUS */}

                        <div>
                          {checkedOut ? (
                            <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-600">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Completed
                            </div>
                          ) : checkedIn ? (
                            <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary">
                              <LogIn className="h-3.5 w-3.5" />
                              Checked in
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground">
                              <Clock3 className="h-3.5 w-3.5" />
                              Upcoming
                            </div>
                          )}
                        </div>

                      </div>

                      {/* TIMES */}

                      <div className="mt-7 grid gap-4 sm:grid-cols-2">

                        <AttendanceTimeCard
                          icon={LogIn}
                          label="Check-in"
                          value={
                            record.check_in_time ??
                            "Not recorded"
                          }
                          active={Boolean(
                            record.check_in_time,
                          )}
                        />

                        <AttendanceTimeCard
                          icon={LogOut}
                          label="Check-out"
                          value={
                            record.check_out_time ??
                            "Not recorded"
                          }
                          active={Boolean(
                            record.check_out_time,
                          )}
                        />

                      </div>

                    </VSCardContent>
                  </VSCard>
                );
              })}

            </div>

            {/* =================================================
                PRIVACY NOTE
            ================================================= */}

            <div className="flex items-start gap-3 rounded-2xl border border-primary/10 bg-primary/[0.04] p-4">

              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

              <p className="text-xs leading-5 text-muted-foreground">
                Attendance records are linked to your volunteer
                assignments and are used to verify participation
                and completed event hours.
              </p>

            </div>

          </div>
        )}
      </div>
    </AppShell>
  );
}

/* ===============================================================
   SUMMARY CARD
================================================================ */

function SummaryCard({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <VSCard className="rounded-[1.75rem] border-border">
      <VSCardContent className="p-5">

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            accent
              ? "bg-emerald-500/10 text-emerald-600"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>

        <p className="mt-5 text-xs font-medium text-muted-foreground">
          {label}
        </p>

        <p
          className={`mt-1 text-2xl font-semibold ${
            accent
              ? "text-emerald-600"
              : "text-foreground"
          }`}
        >
          {value}
        </p>

      </VSCardContent>
    </VSCard>
  );
}

/* ===============================================================
   ATTENDANCE TIME CARD
================================================================ */

function AttendanceTimeCard({
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
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-background p-4">

      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          active
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">
          {label}
        </p>

        <p
          className={`mt-1 text-sm font-semibold ${
            active
              ? "text-foreground"
              : "text-muted-foreground"
          }`}
        >
          {value}
        </p>
      </div>

    </div>
  );
}