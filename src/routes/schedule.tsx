import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/app/AppShell";
import { scheduleService } from "@/services/scheduleService";

import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";

import type { Shift } from "@/lib/types";

export const Route = createFileRoute("/schedule")({
  component: Schedule,

  head: () => ({
    meta: [
      {
        title: "Schedule | VolunSport Morocco",
      },
    ],
  }),
});

function Schedule() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    scheduleService
      .getShifts()
      .then((data) => {
        setShifts(data);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load schedule.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <AppShell title="Schedule">
      <main className="mx-auto max-w-7xl space-y-8">

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <header className="space-y-3">
          <p className="eyebrow">
            Schedule
          </p>

          <h1 className="display-md">
            Your upcoming volunteer shifts
          </h1>

          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            A clear overview of your volunteer shifts,
            roles, locations and event-day instructions.
          </p>
        </header>

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading && (
          <LoadingState
            message="Loading your schedule…"
          />
        )}

        {/* =====================================================
            ERROR
        ===================================================== */}

        {!loading && error && (
          <EmptyState
            title="Unable to load schedule"
            description={error}
          />
        )}

        {/* =====================================================
            EMPTY
        ===================================================== */}

        {!loading && !error && shifts.length === 0 && (
          <EmptyState
            title="No shifts scheduled"
            description="Accept an event to see your next volunteer assignments here."
          />
        )}

        {/* =====================================================
            SHIFTS
        ===================================================== */}

        {!loading && !error && shifts.length > 0 && (
          <div className="space-y-5">

            {shifts.map((shift) => (
              <div
                key={shift.id}
                className="
                  overflow-hidden
                  rounded-[2rem]
                  border
                  border-border
                  bg-card
                  shadow-[var(--shadow-lift)]
                "
              >

                {/* =============================================
                    TOP
                ============================================= */}

                <div className="p-6 sm:p-7">

                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

                    <div className="min-w-0">

                      <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        {shift.event_title}
                      </p>

                      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                        {shift.role_name}
                      </h2>

                      <p className="mt-2 text-sm text-muted-foreground">
                        {shift.date}
                        {" · "}
                        {shift.start_time}
                        {" – "}
                        {shift.end_time}
                      </p>

                    </div>

                    {/* =========================================
                        LOCATION
                    ========================================= */}

                    <div className="shrink-0 rounded-2xl border border-border bg-background px-5 py-4">

                      <p className="text-xs font-medium text-muted-foreground">
                        Location
                      </p>

                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {shift.location}
                      </p>

                    </div>

                  </div>

                  {/* ===========================================
                      INSTRUCTIONS
                  =========================================== */}

                  <div className="mt-6 rounded-2xl border border-primary/10 bg-primary/[0.04] p-5">

                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Event-day instructions
                    </p>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {shift.instructions}
                    </p>

                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

      </main>
    </AppShell>
  );
}