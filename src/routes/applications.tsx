import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { I18nProvider } from "@/lib/i18n";
import { applicationService } from "@/services/applicationService";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusPill } from "@/components/ui/status-pill";
import type { Application } from "@/lib/types";

export const Route = createFileRoute("/applications")({
  component: MyApplications,
  head: () => ({
    meta: [{ title: "My Applications | VolunSport Morocco" }],
  }),
});

function MyApplications() {
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

  return (
    <I18nProvider>
      <div className="shell min-h-screen py-24">
        <div className="mb-8 space-y-3">
          <p className="eyebrow">Applications</p>
          <h1 className="display-md text-ink-foreground">Track your volunteer applications</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            See the current status of each application and review your submitted role requests.
          </p>
        </div>

        {loading ? (
          <LoadingState message="Loading your applications…" />
        ) : error ? (
          <EmptyState title="Error" description={error} />
        ) : applications.length === 0 ? (
          <EmptyState
            title="No applications yet"
            description="Apply for an event to see your status here."
          />
        ) : (
          <Table className="rounded-[2rem] border border-hairline-invert bg-card">
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>{application.event_title}</TableCell>
                  <TableCell>{application.role_name}</TableCell>
                  <TableCell>
                    <StatusPill status={application.status} />
                  </TableCell>
                  <TableCell>{application.submitted_at}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </I18nProvider>
  );
}
