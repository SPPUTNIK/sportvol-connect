import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/app/AppShell";
import { applicationService } from "@/services/applicationService";

import {
  VSCard,
  VSCardContent,
  VSPageHeader,
  VSEmptyState,
  VSLoadingState,
  VSErrorState,
} from "@/components/design-system";

import { StatusPill } from "@/components/ui/status-pill";

import type { Application } from "@/lib/types";

export const Route = createFileRoute("/applications")({
  component: MyApplications,

  head: () => ({
    meta: [
      {
        title: "My Applications | VolunSport Morocco",
      },
    ],
  }),
});

function MyApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    applicationService
      .getApplications()
      .then((data) => {
        setApplications(data);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your applications.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <AppShell title="My Applications">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* =====================================================
            PAGE HEADER
        ====================================================== */}

        <VSPageHeader
          eyebrow="Applications"
          title="Track your volunteer applications"
          description="See the current status of each application and review your submitted role requests."
        />

        {/* =====================================================
            LOADING
        ====================================================== */}

        {loading && (
          <VSLoadingState message="Loading your applications…" />
        )}

        {/* =====================================================
            ERROR
        ====================================================== */}

        {!loading && error && (
          <VSErrorState
            title="Applications are unavailable"
            description={error}
            action={undefined}
          />
        )}

        {/* =====================================================
            EMPTY
        ====================================================== */}

        {!loading && !error && applications.length === 0 && (
          <VSEmptyState
            title="No applications yet"
            description="Apply for an event to see your application status here."
          />
        )}

        {/* =====================================================
            APPLICATIONS
        ====================================================== */}

        {!loading && !error && applications.length > 0 && (
          <VSCard className="overflow-hidden rounded-[2rem] border-border">
            <VSCardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Event
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Role
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Status
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Applied
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {applications.map((application) => (
                      <tr
                        key={application.id}
                        className="border-b border-border last:border-0 transition hover:bg-muted/30"
                      >
                        {/* EVENT */}

                        <td className="px-6 py-5">
                          <div>
                            <p className="font-semibold text-foreground">
                              {application.event_title}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                              Application #{application.id}
                            </p>
                          </div>
                        </td>

                        {/* ROLE */}

                        <td className="px-6 py-5">
                          <p className="text-sm text-foreground">
                            {application.role_name}
                          </p>
                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-5">
                          <StatusPill
                            status={application.status}
                          />
                        </td>

                        {/* DATE */}

                        <td className="px-6 py-5">
                          <p className="text-sm text-muted-foreground">
                            {application.submitted_at}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </VSCardContent>
          </VSCard>
        )}
      </div>
    </AppShell>
  );
}