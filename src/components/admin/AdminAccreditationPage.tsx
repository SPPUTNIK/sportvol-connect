import {
  BadgeCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileCheck2,
  Globe2,
  Mail,
  MapPin,
  Phone,
  QrCode,
  Search,
  ShieldCheck,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AdminLayout } from "@/components/layouts/AdminLayout";

import {
  VSButton,
  VSCard,
  VSCardContent,
  VSInput,
  VSStatusBadge,
} from "@/components/design-system";

import { adminService } from "@/services/admin/adminService";

function StatusIcon({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  if (
    normalized === "approved" ||
    normalized === "accepted"
  ) {
    return <CheckCircle2 className="h-4 w-4" />;
  }

  if (normalized === "rejected") {
    return <XCircle className="h-4 w-4" />;
  }

  return <Clock3 className="h-4 w-4" />;
}

function formatStatus(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "approved") return "Approved";
  if (normalized === "accepted") return "Accepted";
  if (normalized === "rejected") return "Rejected";
  if (normalized === "pending") return "Pending";

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not provided";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "Not provided";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium text-foreground">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

function TagList({
  items,
}: {
  items: string[];
}) {
  if (!items.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Not provided
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className="rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export function AdminAccreditationPage() {
  const [query, setQuery] = useState("");

  const [
    accreditations,
    setAccreditations,
  ] = useState<
    Awaited<
      ReturnType<typeof adminService.getAccreditations>
    >
  >([]);

  const [loading, setLoading] = useState(true);

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [details, setDetails] =
    useState<
      Awaited<
        ReturnType<
          typeof adminService.getAccreditationById
        >
      >
    >(null);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [savingStatus, setSavingStatus] =
    useState(false);

  const [detailsError, setDetailsError] =
    useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadAccreditations() {
      try {
        const data =
          await adminService.getAccreditations();

        if (mounted) {
          setAccreditations(data);
        }
      } catch (error) {
        console.error(
          "Failed to load accreditations:",
          error,
        );

        if (mounted) {
          setAccreditations([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadAccreditations();

    return () => {
      mounted = false;
    };
  }, []);

  const rows = useMemo(() => {
    const normalized = query
      .toLowerCase()
      .trim();

    if (!normalized) {
      return accreditations;
    }

    return accreditations.filter((item) =>
      [
        item.volunteer,
        item.event,
        item.role,
        item.badge,
        item.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [accreditations, query]);

  async function openReview(id: string) {
    setSelectedId(id);
    setDetails(null);
    setDetailsError(null);
    setDetailsLoading(true);

    try {
      const data =
        await adminService.getAccreditationById(id);

      setDetails(data);
    } catch (error) {
      console.error(
        "Failed to load accreditation:",
        error,
      );

      setDetailsError(
        error instanceof Error
          ? error.message
          : "Failed to load accreditation details.",
      );
    } finally {
      setDetailsLoading(false);
    }
  }

  function closeReview() {
    if (savingStatus) return;

    setSelectedId(null);
    setDetails(null);
    setDetailsError(null);
  }

  async function updateStatus(
    nextStatus: string,
  ) {
    if (!details) return;

    setSavingStatus(true);

    try {
      const result =
        await adminService.updateAccreditationStatus(
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

      setAccreditations((current) =>
        current.map((item) =>
          item.id === details.id
            ? {
                ...item,
                status: result.status,
              }
            : item,
        ),
      );
    } catch (error) {
      console.error(
        "Failed to update accreditation:",
        error,
      );
    } finally {
      setSavingStatus(false);
    }
  }

  return (
    <AdminLayout
      title="Accreditation"
      eyebrow="Operations"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Operations
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Volunteer accreditation
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Review volunteer accreditation requests and manage
              event access.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Accreditation requests
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {rows.length}{" "}
              {rows.length === 1
                ? "request"
                : "requests"}
            </p>
          </div>

          <div className="relative w-full sm:w-[360px]">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <VSInput
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search volunteer, event, badge..."
              className="pl-10 pr-10"
            />

            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        {/* List */}
        <div className="mt-5 space-y-3">
          {loading ? (
            <VSCard className="rounded-2xl border-border">
              <VSCardContent className="p-6">
                <p className="text-sm text-muted-foreground">
                  Loading accreditations...
                </p>
              </VSCardContent>
            </VSCard>
          ) : rows.length === 0 ? (
            <VSCard className="rounded-2xl border-border">
              <VSCardContent className="p-8 text-center">
                <BadgeCheck className="mx-auto h-8 w-8 text-muted-foreground" />

                <p className="mt-3 text-sm font-semibold text-foreground">
                  No accreditations found
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Try changing your search.
                </p>
              </VSCardContent>
            </VSCard>
          ) : (
            rows.map((item) => (
              <VSCard
                key={item.id}
                className="rounded-2xl border-border transition-shadow hover:shadow-md"
              >
                <VSCardContent className="p-4 sm:p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      {/* Avatar */}
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                        {item.avatar_url ? (
                          <img
                            src={item.avatar_url}
                            alt={item.volunteer}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-foreground">
                            {initials(item.volunteer)}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate text-sm font-semibold text-foreground">
                          {item.volunteer}
                        </h2>

                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {item.event}
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span>
                            {item.role}
                          </span>

                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 lg:justify-end">
                      <div className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium">
                        <StatusIcon
                          status={item.status}
                        />

                        {formatStatus(item.status)}
                      </div>

                      <VSButton
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          void openReview(item.id)
                        }
                      >
                        Review
                        <ExternalLink className="ml-1 h-3.5 w-3.5" />
                      </VSButton>
                    </div>
                  </div>
                </VSCardContent>
              </VSCard>
            ))
          )}
        </div>
      </div>

      {/* REVIEW MODAL */}
      {selectedId ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !savingStatus
            ) {
              closeReview();
            }
          }}
        >
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[1.75rem] border border-border bg-background shadow-2xl">
            {/* Modal header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4 sm:px-7">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Accreditation review
                </p>

                <h2 className="mt-1 text-lg font-semibold text-foreground">
                  Review request
                </h2>
              </div>

              <button
                type="button"
                onClick={closeReview}
                disabled={savingStatus}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
              {detailsLoading ? (
                <div className="flex min-h-[350px] items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    Loading accreditation details...
                  </p>
                </div>
              ) : detailsError ? (
                <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5">
                  <p className="text-sm text-destructive">
                    {detailsError}
                  </p>
                </div>
              ) : details ? (
                <div className="space-y-6">
                  {/* Volunteer */}
                  <section>
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                        <UserRound className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          Volunteer
                        </p>

                        <h3 className="text-base font-semibold text-foreground">
                          Volunteer information
                        </h3>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border p-5">
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                        {details.volunteer.avatarUrl ? (
                          <img
                            src={
                              details.volunteer.avatarUrl
                            }
                            alt={
                              details.volunteer.name
                            }
                            className="h-20 w-20 shrink-0 rounded-full object-cover ring-4 ring-muted"
                          />
                        ) : (
                          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-ink text-xl font-semibold text-white ring-4 ring-muted">
                            {initials(
                              details.volunteer.name,
                            )}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-bold text-foreground">
                              {details.volunteer.name}
                            </h3>

                            <VSStatusBadge
                              status={formatStatus(
                                details.volunteer.status ||
                                  "active",
                              )}
                            />
                          </div>

                          <p className="mt-1 text-xs font-mono text-muted-foreground">
                            {details.volunteer.id}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        <InfoItem
                          icon={Mail}
                          label="Email"
                          value={
                            details.volunteer.email
                          }
                        />

                        <InfoItem
                          icon={Phone}
                          label="Phone"
                          value={
                            details.volunteer.phone
                          }
                        />

                        <InfoItem
                          icon={MapPin}
                          label="Location"
                          value={[
                            details.volunteer.city,
                            details.volunteer.country,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        />

                        <InfoItem
                          icon={Globe2}
                          label="Nationality"
                          value={
                            details.volunteer.nationality
                          }
                        />

                        <InfoItem
                          icon={CalendarDays}
                          label="Date of birth"
                          value={formatDate(
                            details.volunteer
                              .dateOfBirth,
                          )}
                        />

                        <InfoItem
                          icon={Clock3}
                          label="Volunteer hours"
                          value={
                            details.volunteer
                              .volunteerHours
                          }
                        />
                      </div>

                      {details.volunteer.bio ? (
                        <div className="mt-5 border-t border-border pt-5">
                          <p className="text-xs font-medium text-muted-foreground">
                            Bio
                          </p>

                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
                            {details.volunteer.bio}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </section>

                  {/* Event */}
                  <section>
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                        <CalendarDays className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          Event
                        </p>

                        <h3 className="text-base font-semibold text-foreground">
                          Event information
                        </h3>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border p-5">
                      <h3 className="text-lg font-semibold text-foreground">
                        {details.event.title}
                      </h3>

                      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        <InfoItem
                          icon={BadgeCheck}
                          label="Sport"
                          value={
                            details.event.sport
                          }
                        />

                        <InfoItem
                          icon={MapPin}
                          label="Venue"
                          value={
                            details.event.venue
                          }
                        />

                        <InfoItem
                          icon={MapPin}
                          label="City"
                          value={[
                            details.event.city,
                            details.event.country,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        />

                        <InfoItem
                          icon={CalendarDays}
                          label="Start date"
                          value={formatDate(
                            details.event
                              .startDate,
                          )}
                        />

                        <InfoItem
                          icon={CalendarDays}
                          label="End date"
                          value={formatDate(
                            details.event
                              .endDate,
                          )}
                        />

                        <InfoItem
                          icon={Clock3}
                          label="Time"
                          value={[
                            details.event
                              .startTime,
                            details.event.endTime,
                          ]
                            .filter(Boolean)
                            .join(" - ")}
                        />
                      </div>

                      {details.event.description ? (
                        <p className="mt-5 border-t border-border pt-5 text-sm leading-6 text-muted-foreground">
                          {details.event.description}
                        </p>
                      ) : null}
                    </div>
                  </section>

                  {/* Role */}
                  <section>
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                        <ShieldCheck className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          Assignment
                        </p>

                        <h3 className="text-base font-semibold text-foreground">
                          Requested role
                        </h3>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border p-5">
                      <h3 className="text-lg font-semibold text-foreground">
                        {details.role.name}
                      </h3>

                      {details.role.description ? (
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {details.role.description}
                        </p>
                      ) : null}

                      <div className="mt-5 grid gap-5 sm:grid-cols-2">
                        <InfoItem
                          icon={UserRound}
                          label="Positions"
                          value={
                            details.role.positions
                          }
                        />

                        <InfoItem
                          icon={Check}
                          label="Filled positions"
                          value={
                            details.role
                              .filledPositions
                          }
                        />

                        <InfoItem
                          icon={UserRound}
                          label="Minimum age"
                          value={
                            details.role.minAge
                          }
                        />

                        <InfoItem
                          icon={ShieldCheck}
                          label="Mandatory training"
                          value={
                            details.role
                              .mandatoryTraining
                              ? "Required"
                              : "Not required"
                          }
                        />
                      </div>

                      {details.role.skills.length ? (
                        <div className="mt-5">
                          <p className="mb-2 text-xs font-medium text-muted-foreground">
                            Required skills
                          </p>

                          <TagList
                            items={
                              details.role.skills
                            }
                          />
                        </div>
                      ) : null}

                      {details.role.requirements ? (
                        <div className="mt-5">
                          <p className="mb-2 text-xs font-medium text-muted-foreground">
                            Requirements
                          </p>

                          <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                            {details.role.requirements}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </section>

                  {/* Accreditation */}
                  <section>
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                        <FileCheck2 className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          Accreditation
                        </p>

                        <h3 className="text-base font-semibold text-foreground">
                          Accreditation details
                        </h3>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border p-5">
                      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        <InfoItem
                          icon={BadgeCheck}
                          label="Volunteer identifier"
                          value={
                            details.volunteerIdentifier
                          }
                        />

                        <InfoItem
                          icon={MapPin}
                          label="Access zone"
                          value={
                            details.zone
                          }
                        />

                        <InfoItem
                          icon={CalendarDays}
                          label="Created"
                          value={formatDateTime(
                            details.createdAt,
                          )}
                        />

                        <InfoItem
                          icon={Clock3}
                          label="Last updated"
                          value={formatDateTime(
                            details.updatedAt,
                          )}
                        />

                        <InfoItem
                          icon={QrCode}
                          label="QR code"
                          value={
                            details.qrCodeData
                              ? "Available"
                              : "Not generated"
                          }
                        />
                      </div>

                      {details.qrCodeData ? (
                        <div className="mt-5 rounded-xl bg-muted/40 p-4">
                          <p className="text-xs font-medium text-muted-foreground">
                            QR code data
                          </p>

                          <p className="mt-2 break-all font-mono text-xs text-foreground">
                            {details.qrCodeData}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </section>

                  {/* Status */}
                  <section>
                    <div className="rounded-2xl border border-border bg-muted/20 p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground">
                            Review decision
                          </p>

                          <h3 className="mt-1 text-base font-semibold text-foreground">
                            Accreditation status
                          </h3>

                          <p className="mt-1 text-xs text-muted-foreground">
                            Choose the current status of this accreditation.
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <VSStatusBadge
                            status={formatStatus(
                              details.status,
                            )}
                          />

                          <select
                            value={details.status}
                            disabled={savingStatus}
                            onChange={(event) =>
                              void updateStatus(
                                event.target.value,
                              )
                            }
                            className="h-9 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="pending">
                              Pending
                            </option>

                            <option value="approved">
                              Approved
                            </option>

                            <option value="rejected">
                              Rejected
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              ) : null}
            </div>

            {/* Modal footer */}
            <div className="flex shrink-0 items-center justify-between border-t border-border bg-muted/20 px-5 py-4 sm:px-7">
              <p className="text-xs text-muted-foreground">
                {details
                  ? `Updated ${formatDateTime(
                      details.updatedAt,
                    )}`
                  : ""}
              </p>

              <VSButton
                variant="outline"
                size="sm"
                onClick={closeReview}
                disabled={savingStatus}
              >
                Close
              </VSButton>
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
}