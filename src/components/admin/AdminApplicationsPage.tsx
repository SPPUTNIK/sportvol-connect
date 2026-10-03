import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  Clock3,
  ExternalLink,
  Filter,
  Mail,
  MapPin,
  Phone,
  Search,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { AdminGate } from "./components/AdminGate";
import {
  formatDate,
  formatStatus,
  normalizeStatus,
  type AdminStatus,
} from "./components/adminHelpers";

import {
  VSButton,
  VSEmptyState,
  VSInput,
  VSPageHeader,
  VSStatusBadge,
} from "@/components/design-system";

import { adminService } from "@/services/admin/adminService";

type ApplicationDetails = Awaited<
  ReturnType<typeof adminService.getApplicationById>
>;

export function AdminApplicationsPage() {
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");

  const [items, setItems] = useState<
    Awaited<ReturnType<typeof adminService.getApplications>>
  >([]);

  const [loading, setLoading] = useState(true);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [details, setDetails] = useState<ApplicationDetails>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadApplications() {
      try {
        const data = await adminService.getApplications();

        if (mounted) {
          setItems(
            data.map((item) => ({
              ...item,
              status: normalizeStatus(item.status),
            })),
          );
        }
      } catch (error) {
        console.error("Failed to load applications:", error);

        if (mounted) {
          setItems([]);
          toast.error("Failed to load applications.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadApplications();

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const normalized = items.map((item) => normalizeStatus(item.status));

    return {
      total: items.length,
      pending: normalized.filter((value) => value === "pending").length,
      accepted: normalized.filter((value) => value === "accepted").length,
      rejected: normalized.filter((value) => value === "rejected").length,
    };
  }, [items]);

  const rows = useMemo(() => {
    const search = query.toLowerCase().trim();

    return items.filter((item) => {
      const matchesQuery =
        !search ||
        `${item.volunteer} ${item.event} ${item.role}`
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        status === "all" ||
        normalizeStatus(item.status) === normalizeStatus(status);

      return matchesQuery && matchesStatus;
    });
  }, [items, query, status]);

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (!parts.length) return "V";

    return parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  };

  const openApplication = async (id: string) => {
    setSelectedId(id);
    setDetails(null);
    setDetailsError(null);
    setDetailsLoading(true);

    try {
      const result = await adminService.getApplicationById(id);

      if (!result) {
        setDetailsError("Application not found.");
        return;
      }

      setDetails(result);
    } catch (error) {
      console.error("Failed to load application:", error);

      setDetailsError(
        error instanceof Error
          ? error.message
          : "Failed to load application details.",
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeApplication = () => {
    if (savingStatus) return;

    setSelectedId(null);
    setDetails(null);
    setDetailsError(null);
  };

  const updateStatus = async (nextStatus: AdminStatus) => {
    if (!details) return;

    const previousStatus = details.status;

    if (normalizeStatus(previousStatus) === normalizeStatus(nextStatus)) {
      return;
    }

    try {
      setSavingStatus(true);

      const result = await adminService.updateApplicationStatus(
        details.id,
        nextStatus,
      );

      setDetails((current) =>
        current
          ? {
              ...current,
              status: result.status,
              updatedAt: result.updatedAt,
            }
          : current,
      );

      setItems((current) =>
        current.map((item) =>
          item.id === details.id
            ? {
                ...item,
                status: result.status as typeof item.status,
              }
            : item,
        ),
      );

      toast.success(
        `Application marked as ${formatStatus(result.status)}.`,
      );
    } catch (error) {
      console.error("Failed to update application status:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update application status.",
      );
    } finally {
      setSavingStatus(false);
    }
  };

  return (
    <AdminGate title="Applications">
      <div className="mx-auto max-w-7xl">
        <VSPageHeader
          eyebrow="Volunteers"
          title="Applications"
          description="Review, triage, and place volunteers into the right opportunities."
        />

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-[1.5rem] border border-border bg-card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Total
                </p>

                <p className="mt-1 text-2xl font-bold text-foreground">
                  {stats.total}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-border bg-card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Pending
                </p>

                <p className="mt-1 text-2xl font-bold text-foreground">
                  {stats.pending}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                <Clock3 className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-border bg-card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Accepted
                </p>

                <p className="mt-1 text-2xl font-bold text-foreground">
                  {stats.accepted}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                <UserCheck className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-border bg-card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Rejected
                </p>

                <p className="mt-1 text-2xl font-bold text-foreground">
                  {stats.rejected}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                <X className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 rounded-[1.75rem] border border-border bg-card p-3 sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <VSInput
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search volunteers, events, or roles..."
                className="pl-11"
              />
            </div>

            <div className="relative lg:w-56">
              <Filter className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-11 w-full appearance-none rounded-2xl border border-border bg-background pl-11 pr-10 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="waitlisted">Waitlisted</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
          </div>

          {(query || status !== "all") && (
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
              <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {rows.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {items.length}
                </span>{" "}
                applications
              </p>

              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setStatus("all");
                }}
                className="text-xs font-semibold text-primary transition hover:opacity-80"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Applications */}
        <div className="mt-5 overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
          {loading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse p-5 sm:p-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-muted" />

                    <div className="min-w-0 flex-1">
                      <div className="h-4 w-40 rounded bg-muted" />
                      <div className="mt-2 h-3 w-64 max-w-full rounded bg-muted" />
                      <div className="mt-2 h-3 w-28 rounded bg-muted" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="p-8 sm:p-12">
              <VSEmptyState
                title="No applications found"
                description={
                  query || status !== "all"
                    ? "Try another search or change the status filter."
                    : "There are no applications to review yet."
                }
              />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {rows.map((item) => {
                const currentStatus = normalizeStatus(item.status);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => void openApplication(item.id)}
                    className="group block w-full p-4 text-left transition hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/20 sm:p-6"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
                      <div className="flex min-w-0 flex-1 items-start gap-4">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-primary/10">
                          {item.avatar_url ? (
                            <img
                              src={item.avatar_url}
                              alt={item.volunteer}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-primary">
                              {getInitials(item.volunteer)}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold text-foreground sm:text-base">
                              {item.volunteer}
                            </p>

                            <VSStatusBadge
                              status={formatStatus(item.status)}
                            />
                          </div>

                          <p className="mt-1 truncate text-sm text-muted-foreground">
                            {item.event}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground/80">
                              {item.role}
                            </span>

                            <span>•</span>

                            <span>
                              Applied {formatDate(item.date)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <span className="hidden sm:inline">
                          View application
                        </span>

                        <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          APPLICATION DETAILS MODAL
          ===================================================== */}

      {selectedId && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeApplication();
            }
          }}
        >
          <div
            className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Application details"
          >
            {/* Modal header */}
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-7 sm:py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Application
                </p>

                <h2 className="mt-1 text-lg font-bold text-foreground sm:text-xl">
                  Application details
                </h2>
              </div>

              <button
                type="button"
                onClick={closeApplication}
                disabled={savingStatus}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal content */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              {detailsLoading ? (
                <div className="space-y-6 p-5 sm:p-7">
                  <div className="animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-3xl bg-muted" />

                      <div className="space-y-2">
                        <div className="h-5 w-48 rounded bg-muted" />
                        <div className="h-4 w-64 rounded bg-muted" />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="h-32 animate-pulse rounded-2xl bg-muted" />
                    <div className="h-32 animate-pulse rounded-2xl bg-muted" />
                  </div>

                  <div className="h-40 animate-pulse rounded-2xl bg-muted" />
                </div>
              ) : detailsError ? (
                <div className="p-8 text-center sm:p-12">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10">
                    <X className="h-5 w-5 text-red-600" />
                  </div>

                  <h3 className="mt-4 font-semibold text-foreground">
                    Could not load application
                  </h3>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {detailsError}
                  </p>

                  <VSButton
                    className="mt-5"
                    variant="outline"
                    onClick={() => {
                      if (selectedId) {
                        void openApplication(selectedId);
                      }
                    }}
                  >
                    Try again
                  </VSButton>
                </div>
              ) : details ? (
                <div className="space-y-6 p-5 sm:p-7">
                  {/* Volunteer */}
                  <section className="rounded-[1.5rem] border border-border bg-background p-4 sm:p-5">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-3xl bg-primary/10">
                        {details.volunteer.avatarUrl ? (
                          <img
                            src={details.volunteer.avatarUrl}
                            alt={details.volunteer.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xl font-bold text-primary">
                            {getInitials(details.volunteer.name)}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-bold text-foreground">
                            {details.volunteer.name}
                          </h3>

                          <VSStatusBadge
                            status={formatStatus(details.status)}
                          />
                        </div>

                        <div className="mt-2 flex flex-col gap-1.5 text-sm text-muted-foreground">
                          {details.volunteer.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 shrink-0" />
                              <span className="truncate">
                                {details.volunteer.email}
                              </span>
                            </div>
                          )}

                          {details.volunteer.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 shrink-0" />
                              <span>
                                {details.volunteer.phone}
                              </span>
                            </div>
                          )}

                          {(details.volunteer.city ||
                            details.volunteer.country) && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 shrink-0" />

                              <span>
                                {[
                                  details.volunteer.city,
                                  details.volunteer.country,
                                ]
                                  .filter(Boolean)
                                  .join(", ")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {details.volunteer.bio && (
                      <div className="mt-5 border-t border-border pt-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Bio
                        </p>

                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground/80">
                          {details.volunteer.bio}
                        </p>
                      </div>
                    )}
                  </section>

                  {/* Status */}
                  <section className="rounded-[1.5rem] border border-border bg-background p-4 sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Application status
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Update the volunteer's application status.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={normalizeStatus(details.status)}
                          disabled={savingStatus}
                          onChange={(event) => {
                            void updateStatus(
                              event.target.value as AdminStatus,
                            );
                          }}
                          className="h-11 min-w-[170px] rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <option value="pending">Pending</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                          <option value="waitlisted">Waitlisted</option>
                          <option value="withdrawn">Withdrawn</option>
                        </select>

                        {savingStatus && (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Event + Role */}
                  <div className="grid gap-4 lg:grid-cols-2">
                    <section className="rounded-[1.5rem] border border-border bg-background p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                          <CalendarDays className="h-5 w-5 text-primary" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Event
                          </p>

                          <h3 className="mt-1 text-base font-bold text-foreground">
                            {details.event.title}
                          </h3>

                          {(details.event.sport ||
                            details.event.venue) && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {[
                                details.event.sport,
                                details.event.venue,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          )}

                          {details.event.startDate && (
                            <p className="mt-3 text-xs text-muted-foreground">
                              {formatDate(details.event.startDate)}
                              {details.event.endDate &&
                                details.event.endDate !==
                                  details.event.startDate &&
                                ` → ${formatDate(details.event.endDate)}`}
                            </p>
                          )}
                        </div>
                      </div>
                    </section>

                    <section className="rounded-[1.5rem] border border-border bg-background p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                          <UserCheck className="h-5 w-5 text-primary" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Requested role
                          </p>

                          <h3 className="mt-1 text-base font-bold text-foreground">
                            {details.role.name}
                          </h3>

                          {details.role.description && (
                            <p className="mt-1 text-sm leading-5 text-muted-foreground">
                              {details.role.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* Application answers */}
                  <section className="rounded-[1.5rem] border border-border bg-background p-5 sm:p-6">
                    <div className="mb-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                        Application answers
                      </p>

                      <h3 className="mt-1 text-lg font-bold text-foreground">
                        Volunteer information
                      </h3>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Motivation
                        </p>

                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                          {details.motivation?.trim() ||
                            "No motivation provided."}
                        </p>
                      </div>

                      <div className="border-t border-border pt-5">
                        <p className="text-sm font-semibold text-foreground">
                          Experience
                        </p>

                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                          {details.experience?.trim() ||
                            "No experience information provided."}
                        </p>
                      </div>

                      <div className="border-t border-border pt-5">
                        <p className="text-sm font-semibold text-foreground">
                          Availability
                        </p>

                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                          {details.availability?.trim() ||
                            "No availability information provided."}
                        </p>
                      </div>
                    </div>
                  </section>


                  {/* Dates */}
                  <div className="grid gap-3 text-xs text-muted-foreground sm:grid-cols-2">
                    <div className="rounded-xl bg-muted/50 px-4 py-3">
                      <span className="font-semibold text-foreground">
                        Applied:
                      </span>{" "}
                      {formatDate(details.appliedAt)}
                    </div>

                    <div className="rounded-xl bg-muted/50 px-4 py-3">
                      <span className="font-semibold text-foreground">
                        Last updated:
                      </span>{" "}
                      {formatDate(details.updatedAt)}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal footer */}
            {details && (
              <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <p className="text-xs text-muted-foreground">
                  Changes to the status are saved immediately.
                </p>

                <VSButton
                  variant="outline"
                  onClick={closeApplication}
                  disabled={savingStatus}
                >
                  Close
                </VSButton>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminGate>
  );
}