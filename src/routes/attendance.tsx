import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { I18nProvider } from "@/lib/i18n";
import { attendanceService } from "@/services/attendanceService";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import type { AttendanceRecord } from "@/lib/types";

export const Route = createFileRoute("/attendance")({
  component: Attendance,
  head: () => ({
    meta: [{ title: "Attendance | VolunSport Morocco" }],
  }),
});

function Attendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    attendanceService
      .getAttendance()
      .then((data) => setRecords(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <I18nProvider>
      <div className="shell min-h-screen py-24">
        <div className="mb-8 space-y-3">
          <p className="eyebrow">Attendance</p>
          <h1 className="display-md text-ink-foreground">Your check-in status</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Review your attendance history and current event check-in status.
          </p>
        </div>

        {loading ? (
          <LoadingState message="Loading attendance records…" />
        ) : error ? (
          <EmptyState title="Error" description={error} />
        ) : records.length === 0 ? (
          <EmptyState
            title="No attendance data"
            description="Your attendance history will appear after your first check-in."
          />
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div
                key={record.id}
                className="rounded-[2rem] border border-hairline-invert bg-card p-6 shadow-[var(--shadow-lift)]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                      {record.event_title}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-foreground">
                      {record.role_name}
                    </h2>
                  </div>
                  <div className="rounded-full bg-background px-4 py-2 text-sm text-muted-foreground">
                    {record.status === "checked-in"
                      ? "Checked in"
                      : record.status === "checked-out"
                        ? "Checked out"
                        : "Pending"}
                  </div>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-3 text-sm text-muted-foreground">
                  <div>
                    <p className="font-semibold text-foreground">Date</p>
                    <p className="mt-2">{record.date}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Check-in</p>
                    <p className="mt-2">{record.check_in_time ?? "Not recorded"}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Check-out</p>
                    <p className="mt-2">{record.check_out_time ?? "Not recorded"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </I18nProvider>
  );
}
