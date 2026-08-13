import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { I18nProvider } from "@/lib/i18n";
import { applicationService } from "@/services/applicationService";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import type { Application } from "@/lib/types";

export const Route = createFileRoute("/accreditation")({
  component: Accreditation,
  head: () => ({
    meta: [{ title: "Accreditation | VolunSport Morocco" }],
  }),
});

function Accreditation() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    applicationService
      .getApplications()
      .then((data) => setApplications(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const application = applications.find((app) => app.status === "accepted");

  return (
    <I18nProvider>
      <div className="shell min-h-screen py-24">
        <div className="mb-8 space-y-3">
          <p className="eyebrow">Accreditation</p>
          <h1 className="display-md text-ink-foreground">Your accreditation card</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Use this ID at event check-in and show your approved volunteer assignment to staff.
          </p>
        </div>

        {loading ? (
          <LoadingState message="Loading accreditation…" />
        ) : error ? (
          <EmptyState title="Error" description={error} />
        ) : !application ? (
          <EmptyState
            title="No accreditation assigned"
            description="Accept an event to receive your accreditation details."
          />
        ) : (
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-hairline-invert bg-card p-8 shadow-[var(--shadow-lift)]">
            <div className="flex flex-wrap items-center justify-between gap-6 rounded-[1.5rem] bg-gradient-to-r from-primary to-accent p-8 text-foreground">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-primary-foreground/80">
                  Volunteer accreditation
                </p>
                <h2 className="mt-3 text-3xl font-semibold">{application.role_name}</h2>
                <p className="mt-2 text-sm text-primary-foreground/80">{application.event_title}</p>
              </div>
              <div className="rounded-3xl bg-white/15 px-5 py-4 text-sm text-primary-foreground">
                <p className="font-semibold">Volunteer ID</p>
                <p className="mt-2 text-xl">SV-{application.id.toUpperCase()}</p>
              </div>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="rounded-3xl bg-background p-6 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Name</p>
                <p className="mt-2">Volunteer Name</p>
              </div>
              <div className="rounded-3xl bg-background p-6 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Role</p>
                <p className="mt-2">{application.role_name}</p>
              </div>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="rounded-3xl bg-background p-6 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Zone</p>
                <p className="mt-2">Event Support Zone</p>
              </div>
              <div className="rounded-3xl bg-background p-6 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Status</p>
                <p className="mt-2 text-emerald-900">Approved</p>
              </div>
            </div>
            <div className="mt-8 rounded-[1.5rem] border border-border bg-background p-8 text-center">
              <div className="mx-auto mb-6 h-40 w-40 rounded-3xl bg-muted" />
              <p className="text-sm text-muted-foreground">
                QR code placeholder — this will be used at event check-in.
              </p>
            </div>
          </div>
        )}
      </div>
    </I18nProvider>
  );
}
