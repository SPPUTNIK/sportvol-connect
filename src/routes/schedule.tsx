import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { I18nProvider } from "@/lib/i18n";
import { getShifts } from "@/services/mockService";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Shift } from "@/lib/types";

export const Route = createFileRoute("/schedule")({
  component: Schedule,
  head: () => ({
    meta: [{ title: "Schedule | VolunSport Morocco" }],
  }),
});

function Schedule() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getShifts()
      .then((data) => setShifts(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <I18nProvider>
      <div className="shell min-h-screen py-24">
        <div className="mb-8 space-y-3">
          <p className="eyebrow">Schedule</p>
          <h1 className="display-md text-ink-foreground">Your upcoming volunteer shifts</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            A mobile-friendly overview of your shift dates, roles and location instructions.
          </p>
        </div>

        {loading ? (
          <LoadingState message="Loading schedule…" />
        ) : error ? (
          <EmptyState title="Error" description={error} />
        ) : shifts.length === 0 ? (
          <EmptyState title="No shifts scheduled" description="Accept an event to see your next assignments here." />
        ) : (
          <div className="space-y-4">
            {shifts.map((shift) => (
              <div key={shift.id} className="rounded-[2rem] border border-hairline-invert bg-card p-6 shadow-[var(--shadow-lift)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{shift.event_title}</p>
                    <h2 className="mt-2 text-2xl font-semibold text-foreground">{shift.role_name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{shift.date} · {shift.start_time} – {shift.end_time}</p>
                  </div>
                  <div className="rounded-3xl bg-background p-4 text-sm">
                    <p className="text-muted-foreground">Location</p>
                    <p className="mt-2 font-semibold text-foreground">{shift.location}</p>
                  </div>
                </div>
                <div className="mt-6 rounded-3xl bg-muted/30 p-4 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">Instructions</p>
                  <p className="mt-2">{shift.instructions}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </I18nProvider>
  );
}
