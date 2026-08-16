import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  Plus,
} from "lucide-react";

import { AdminLayout } from "@/components/layouts/AdminLayout";
import {
  VSButton,
  VSCard,
  VSCardContent,
  VSEmptyState,
  VSInput,
  VSPageHeader,
  VSStatusBadge,
} from "@/components/design-system";

import { adminService } from "@/services/adminService";

function normalizeStatus(status: string) {
  return status.toLowerCase().replace(/\s+/g, "_");
}

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}

export function AdminEventsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const events = adminService.getEvents();

  const rows = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();

    return events.filter((event) => {
      const matchesQuery =
        !normalizedQuery ||
        `${event.title} ${event.city} ${event.sport}`
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesStatus =
        status === "all" ||
        normalizeStatus(event.status) ===
          normalizeStatus(status);

      return matchesQuery && matchesStatus;
    });
  }, [events, query, status]);

  return (
    <AdminLayout title="Events">
      <div className="mx-auto max-w-7xl">
        <VSPageHeader
          eyebrow="Event management"
          title="Events"
          description="Create and manage the sporting moments that bring volunteers together."
          action={
            <VSButton asChild>
              <Link to="/admin/events/create">
                <Plus className="h-4 w-4" />
                Create event
              </Link>
            </VSButton>
          }
        />

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <VSInput
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search events, cities, or sports"
            />
          </div>

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            className="h-11 rounded-2xl border border-border bg-card px-4 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="closed">Closed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="mt-6 grid gap-4">
          {rows.length === 0 ? (
            <VSEmptyState
              title="No events found"
              description="Try another search or status filter."
            />
          ) : (
            rows.map((event) => (
              <VSCard
                key={event.id}
                className="rounded-[1.75rem] border-border"
              >
                <VSCardContent className="p-6">
                  <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <CalendarDays className="h-5 w-5" />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-lg font-semibold text-foreground">
                            {event.title}
                          </h2>

                          <VSStatusBadge
                            status={formatStatus(event.status)}
                          />
                        </div>

                        <p className="mt-2 text-sm text-muted-foreground">
                          {event.sport} · {event.city} ·{" "}
                          {event.date}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-5 text-sm lg:min-w-[360px]">
                      <Stat
                        label="Roles"
                        value={event.roles}
                      />

                      <Stat
                        label="Volunteers"
                        value={event.volunteers}
                      />

                      <Stat
                        label="Shifts"
                        value={event.shifts}
                      />
                    </div>

                    <VSButton
                      asChild
                      variant="outline"
                      size="sm"
                    >
                      <Link
                        to="/admin/events/$eventId"
                        params={{
                          eventId: event.id,
                        }}
                      >
                        Manage
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </VSButton>
                  </div>
                </VSCardContent>
              </VSCard>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}