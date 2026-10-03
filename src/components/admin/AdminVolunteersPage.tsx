import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Search,
  Users,
  CalendarDays,
  Clock3,
  MapPin,
  ArrowUpRight,
  X,
} from "lucide-react";

import { AdminGate } from "./components/AdminGate";
import { formatStatus, getInitials } from "./components/adminHelpers";

import {
  VSButton,
  VSCard,
  VSCardContent,
  VSEmptyState,
  VSErrorState,
  VSInput,
  VSLoadingState,
  VSPageHeader,
  VSStatusBadge,
} from "@/components/design-system";

import { adminService } from "@/services/admin/adminService";
import type { AdminVolunteerSummary } from "@/types/domain";

function VolunteerAvatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl?: string | null;
}) {
  const [imageError, setImageError] = useState(false);

  if (avatarUrl && !imageError) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        onError={() => setImageError(true)}
        className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-background shadow-sm"
      />
    );
  }

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">
      {getInitials(name)}
    </div>
  );
}

export function AdminVolunteersPage() {
  const [query, setQuery] = useState("");

  const [volunteers, setVolunteers] = useState<AdminVolunteerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadVolunteers() {
      setLoading(true);
      setError(null);

      try {
        const data = await adminService.getVolunteers();

        if (!mounted) return;

        setVolunteers(data);
      } catch (err) {
        console.error("Failed to load volunteers:", err);

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load volunteers",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadVolunteers();

    return () => {
      mounted = false;
    };
  }, []);

  const normalizedQuery = query.trim().toLowerCase();

  const rows = useMemo(() => {
    if (!normalizedQuery) {
      return volunteers;
    }

    return volunteers.filter((item) =>
      `${item.name} ${item.city ?? ""} ${item.id} ${item.status}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [volunteers, normalizedQuery]);

  const totalEvents = useMemo(
    () => volunteers.reduce((sum, item) => sum + Number(item.events || 0), 0),
    [volunteers],
  );

  const totalHours = useMemo(
    () => volunteers.reduce((sum, item) => sum + Number(item.hours || 0), 0),
    [volunteers],
  );

  if (loading) {
    return (
      <AdminGate title="Volunteers">
        <div className="mx-auto max-w-7xl">
          <VSLoadingState />
        </div>
      </AdminGate>
    );
  }

  if (error) {
    return (
      <AdminGate title="Volunteers">
        <div className="mx-auto max-w-7xl">
          <VSErrorState description={error} />
        </div>
      </AdminGate>
    );
  }

  return (
    <AdminGate title="Volunteers">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <VSPageHeader
          eyebrow="Volunteer directory"
          title="Volunteers"
          description="Manage volunteers and view their participation across events."
        />

        {/* Simple overview */}
        <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-3 border-y border-border py-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />

            <span className="text-sm text-muted-foreground">
              Volunteers
            </span>

            <span className="text-sm font-semibold text-foreground">
              {volunteers.length}
            </span>
          </div>

          <div className="hidden h-4 w-px bg-border sm:block" />

          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />

            <span className="text-sm text-muted-foreground">Events</span>

            <span className="text-sm font-semibold text-foreground">
              {totalEvents}
            </span>
          </div>

          <div className="hidden h-4 w-px bg-border sm:block" />

          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-muted-foreground" />

            <span className="text-sm text-muted-foreground">Hours</span>

            <span className="text-sm font-semibold text-foreground">
              {totalHours}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              All volunteers
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              {rows.length} {rows.length === 1 ? "volunteer" : "volunteers"}
            </p>
          </div>

          <div className="relative w-full sm:w-[320px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <VSInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search volunteers..."
              className="pl-9 pr-9"
            />

            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Volunteers */}
        <div className="mt-5">
          {rows.length === 0 ? (
            <VSEmptyState
              title="No volunteers found"
              description={
                normalizedQuery
                  ? "Try another name, city, or volunteer ID."
                  : "No volunteer records are available."
              }
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {rows.map((item) => (
                <VSCard
                  key={item.id}
                  className="group rounded-2xl border-border transition-shadow hover:shadow-md"
                >
                  <VSCardContent className="p-5">
                    {/* Volunteer */}
                    <div className="flex items-center gap-4">
                      <VolunteerAvatar
                        name={item.name}
                        avatarUrl={item.avatar_url}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-base font-semibold text-foreground">
                              {item.name}
                            </h3>

                            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5" />

                              <span className="truncate">
                                {item.city || "Location not provided"}
                              </span>
                            </div>
                          </div>

                          <VSStatusBadge
                            status={formatStatus(item.status)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-5 grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-muted/20">
                      <div className="px-3 py-3 text-center">
                        <p className="text-base font-semibold text-foreground">
                          {item.events}
                        </p>

                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          Events
                        </p>
                      </div>

                      <div className="px-3 py-3 text-center">
                        <p className="text-base font-semibold text-foreground">
                          {item.hours}
                        </p>

                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          Hours
                        </p>
                      </div>

                      <div className="px-3 py-3 text-center">
                        <p className="text-base font-semibold text-foreground">
                          {item.attendance}
                        </p>

                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          Attendance
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-4 flex items-center justify-between gap-3">

                      <VSButton
                        asChild
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                      >
                        <Link
                          to="/admin/volunteers/$volunteerId"
                          params={{
                            volunteerId: item.id,
                          }}
                        >
                          View profile
                          <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                      </VSButton>
                    </div>
                  </VSCardContent>
                </VSCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminGate>
  );
}