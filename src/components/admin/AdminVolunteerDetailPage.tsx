import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Globe2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
  BriefcaseBusiness,
  Languages,
  Heart,
  Award,
} from "lucide-react";

import { AdminGate } from "./components/AdminGate";
import { getInitials, formatStatus } from "./components/adminHelpers";

import {
  VSButton,
  VSCard,
  VSCardContent,
  VSEmptyState,
  VSErrorState,
  VSLoadingState,
  VSStatusBadge,
} from "@/components/design-system";

import { adminService } from "@/services/admin/adminService";

type VolunteerDetails = Awaited<
  ReturnType<typeof adminService.getVolunteerById>
>;

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

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>

        <p className="mt-0.5 break-words text-sm font-medium text-foreground">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

function TagList({
  items,
  emptyText = "No information provided",
}: {
  items: string[];
  emptyText?: string;
}) {
  if (!items.length) {
    return (
      <p className="text-sm text-muted-foreground">
        {emptyText}
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

function EventStatus({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  let label = "Pending";

  if (
    normalized === "accepted" ||
    normalized === "approved"
  ) {
    label = "Accepted";
  } else if (
    normalized === "rejected" ||
    normalized === "declined"
  ) {
    label = "Rejected";
  } else if (
    normalized === "waitlisted" ||
    normalized === "waitlist"
  ) {
    label = "Waitlisted";
  } else if (
    normalized === "withdrawn"
  ) {
    label = "Withdrawn";
  } else if (
    normalized === "completed"
  ) {
    label = "Completed";
  }

  return <VSStatusBadge status={label} />;
}

export function AdminVolunteerDetailPage({
  volunteerId,
}: {
  volunteerId: string;
}) {
  const [volunteer, setVolunteer] =
    useState<VolunteerDetails>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadVolunteer() {
      setLoading(true);
      setError(null);

      try {
        const data =
          await adminService.getVolunteerById(volunteerId);

        if (!mounted) return;

        setVolunteer(data);
      } catch (err) {
        console.error(
          "Failed to load volunteer profile:",
          err,
        );

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load volunteer profile",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadVolunteer();

    return () => {
      mounted = false;
    };
  }, [volunteerId]);

  const acceptedApplications = useMemo(() => {
    if (!volunteer) return [];

    return volunteer.applications.filter(
      (application) =>
        application.status === "accepted" ||
        application.status === "approved" ||
        application.status === "completed",
    );
  }, [volunteer]);

  if (loading) {
    return (
      <AdminGate title="Volunteer profile">
        <div className="mx-auto max-w-6xl">
          <VSLoadingState />
        </div>
      </AdminGate>
    );
  }

  if (error) {
    return (
      <AdminGate title="Volunteer profile">
        <div className="mx-auto max-w-6xl">
          <VSErrorState description={error} />
        </div>
      </AdminGate>
    );
  }

  if (!volunteer) {
    return (
      <AdminGate title="Volunteer profile">
        <div className="mx-auto max-w-6xl">
          <VSEmptyState
            title="Volunteer not found"
            description="The volunteer record you are trying to access does not exist."
            action={
              <VSButton asChild>
                <Link to="/admin/volunteers">
                  <ArrowLeft className="h-4 w-4" />
                  Back to volunteers
                </Link>
              </VSButton>
            }
          />
        </div>
      </AdminGate>
    );
  }

  return (
    <AdminGate title="Volunteer profile">
      <div className="mx-auto max-w-6xl">
        {/* Back */}
        <VSButton
          asChild
          variant="ghost"
          size="sm"
          className="mb-5 -ml-2"
        >
          <Link to="/admin/volunteers">
            <ArrowLeft className="h-4 w-4" />
            Back to volunteers
          </Link>
        </VSButton>

        {/* Profile header */}
        <VSCard className="overflow-hidden rounded-[2rem] border-border">
          <VSCardContent className="p-0">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-5">
                  {volunteer.avatarUrl ? (
                    <img
                      src={volunteer.avatarUrl}
                      alt={volunteer.name}
                      className="h-24 w-24 shrink-0 rounded-full object-cover ring-4 ring-muted"
                    />
                  ) : (
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-ink text-2xl font-semibold text-white ring-4 ring-muted">
                      {getInitials(volunteer.name)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        {volunteer.name}
                      </h1>

                      <VSStatusBadge
                        status={formatStatus(volunteer.status)}
                      />
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground">
                      Volunteer
                      {volunteer.city
                        ? ` · ${volunteer.city}`
                        : ""}
                      {volunteer.country
                        ? `, ${volunteer.country}`
                        : ""}
                    </p>

                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  {volunteer.email ? (
                    <VSButton asChild size="sm">
                      <a href={`mailto:${volunteer.email}`}>
                        <Mail className="h-4 w-4" />
                        Email
                      </a>
                    </VSButton>
                  ) : null}

                  {volunteer.phone ? (
                    <VSButton
                      asChild
                      variant="outline"
                      size="sm"
                    >
                      <a href={`tel:${volunteer.phone}`}>
                        <Phone className="h-4 w-4" />
                        Call
                      </a>
                    </VSButton>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Main stats */}
            <div className="grid border-t border-border sm:grid-cols-4">
              <div className="border-b border-border p-5 sm:border-b-0 sm:border-r">
                <p className="text-xs text-muted-foreground">
                  Events
                </p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {volunteer.applications.length}
                </p>
              </div>

              <div className="border-b border-border p-5 sm:border-b-0 sm:border-r">
                <p className="text-xs text-muted-foreground">
                  Accepted
                </p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {acceptedApplications.length}
                </p>
              </div>

              <div className="border-b border-border p-5 sm:border-b-0 sm:border-r">
                <p className="text-xs text-muted-foreground">
                  Volunteer hours
                </p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {volunteer.volunteerHours}
                </p>
              </div>

              <div className="p-5">
                <p className="text-xs text-muted-foreground">
                  Attendance
                </p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {volunteer.attendanceRate}%
                </p>
              </div>
            </div>
          </VSCardContent>
        </VSCard>

        {/* Content */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Left */}
          <div className="space-y-6">
            {/* About */}
            <VSCard className="rounded-[1.75rem] border-border">
              <VSCardContent className="p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                    <UserRound className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      About
                    </p>
                    <h2 className="text-lg font-semibold text-foreground">
                      Personal information
                    </h2>
                  </div>
                </div>

                {volunteer.bio ? (
                  <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                    {volunteer.bio}
                  </p>
                ) : (
                  <p className="mt-5 text-sm text-muted-foreground">
                    No biography has been provided.
                  </p>
                )}

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <InfoItem
                    icon={Mail}
                    label="Email"
                    value={volunteer.email}
                  />

                  <InfoItem
                    icon={Phone}
                    label="Phone"
                    value={volunteer.phone}
                  />

                  <InfoItem
                    icon={CalendarDays}
                    label="Date of birth"
                    value={formatDate(
                      volunteer.dateOfBirth,
                    )}
                  />

                  <InfoItem
                    icon={Globe2}
                    label="Nationality"
                    value={volunteer.nationality}
                  />

                  <InfoItem
                    icon={MapPin}
                    label="City"
                    value={volunteer.city}
                  />

                  <InfoItem
                    icon={Globe2}
                    label="Country"
                    value={volunteer.country}
                  />

                  <InfoItem
                    icon={ShieldCheck}
                    label="Account role"
                    value={volunteer.role}
                  />

                  <InfoItem
                    icon={Clock3}
                    label="Member since"
                    value={formatDate(
                      volunteer.createdAt,
                    )}
                  />
                </div>
              </VSCardContent>
            </VSCard>

            {/* Experience */}
            <VSCard className="rounded-[1.75rem] border-border">
              <VSCardContent className="p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                    <BriefcaseBusiness className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Background
                    </p>
                    <h2 className="text-lg font-semibold text-foreground">
                      Experience
                    </h2>
                  </div>
                </div>

                <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                  {volunteer.experience ||
                    "No experience information has been provided."}
                </p>
              </VSCardContent>
            </VSCard>

            {/* Skills */}
            <VSCard className="rounded-[1.75rem] border-border">
              <VSCardContent className="p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                    <Award className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Capabilities
                    </p>
                    <h2 className="text-lg font-semibold text-foreground">
                      Skills
                    </h2>
                  </div>
                </div>

                <div className="mt-5">
                  <TagList items={volunteer.skills} />
                </div>
              </VSCardContent>
            </VSCard>

            {/* Events */}
            <VSCard className="rounded-[1.75rem] border-border">
              <VSCardContent className="p-6 sm:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                      <CalendarDays className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        Participation
                      </p>
                      <h2 className="text-lg font-semibold text-foreground">
                        Events
                      </h2>
                    </div>
                  </div>

                  <span className="text-xs text-muted-foreground">
                    {volunteer.applications.length} total
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {volunteer.applications.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No event applications recorded.
                    </p>
                  ) : (
                    volunteer.applications.map(
                      (application) => (
                        <div
                          key={application.id}
                          className="rounded-2xl border border-border p-4"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-semibold text-foreground">
                                {application.event?.title ||
                                  "Unknown event"}
                              </h3>

                              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                {application.role?.name ? (
                                  <span>
                                    {application.role.name}
                                  </span>
                                ) : null}

                                {application.event?.sport ? (
                                  <span>
                                    {application.event.sport}
                                  </span>
                                ) : null}

                                {application.event?.city ? (
                                  <span>
                                    {application.event.city}
                                  </span>
                                ) : null}
                              </div>

                              <p className="mt-2 text-[11px] text-muted-foreground">
                                Applied{" "}
                                {formatDateTime(
                                  application.appliedAt,
                                )}
                              </p>
                            </div>

                            <EventStatus
                              status={application.status}
                            />
                          </div>
                        </div>
                      ),
                    )
                  )}
                </div>
              </VSCardContent>
            </VSCard>
          </div>

          {/* Right */}
          <div className="space-y-6">
            {/* Contact */}
            <VSCard className="rounded-[1.75rem] border-border">
              <VSCardContent className="p-6">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Contact
                </p>

                <h2 className="mt-1 text-lg font-semibold text-foreground">
                  Contact details
                </h2>

                <div className="mt-5 space-y-5">
                  <InfoItem
                    icon={Mail}
                    label="Email"
                    value={volunteer.email}
                  />

                  <InfoItem
                    icon={Phone}
                    label="Phone"
                    value={volunteer.phone}
                  />

                  <InfoItem
                    icon={MapPin}
                    label="Location"
                    value={
                      [volunteer.city, volunteer.country]
                        .filter(Boolean)
                        .join(", ") || null
                    }
                  />
                </div>
              </VSCardContent>
            </VSCard>

            {/* Languages */}
            <VSCard className="rounded-[1.75rem] border-border">
              <VSCardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Languages className="h-4 w-4 text-muted-foreground" />

                  <h2 className="font-semibold text-foreground">
                    Languages
                  </h2>
                </div>

                <div className="mt-4">
                  <TagList items={volunteer.languages} />
                </div>
              </VSCardContent>
            </VSCard>

            {/* Interests */}
            <VSCard className="rounded-[1.75rem] border-border">
              <VSCardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Heart className="h-4 w-4 text-muted-foreground" />

                  <h2 className="font-semibold text-foreground">
                    Interests
                  </h2>
                </div>

                <div className="mt-4">
                  <TagList items={volunteer.interests} />
                </div>
              </VSCardContent>
            </VSCard>

            {/* Account */}
            <VSCard className="rounded-[1.75rem] border-border">
              <VSCardContent className="p-6">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Account
                </p>

                <h2 className="mt-1 text-lg font-semibold text-foreground">
                  Account information
                </h2>

                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-muted-foreground">
                      Status
                    </span>

                    <VSStatusBadge
                      status={formatStatus(
                        volunteer.status,
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-muted-foreground">
                      Role
                    </span>

                    <span className="text-sm font-medium text-foreground">
                      {volunteer.role || "Volunteer"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-muted-foreground">
                      Certificates
                    </span>

                    <span className="text-sm font-semibold text-foreground">
                      {volunteer.certificates}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-muted-foreground">
                      Updated
                    </span>

                    <span className="text-right text-xs text-muted-foreground">
                      {formatDateTime(
                        volunteer.updatedAt,
                      )}
                    </span>
                  </div>
                </div>
              </VSCardContent>
            </VSCard>
          </div>
        </div>
      </div>
    </AdminGate>
  );
}