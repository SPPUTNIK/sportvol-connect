import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Languages,
  MapPin,
  Users,
} from "lucide-react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import {
  VSBadge,
  VSButton,
  VSEmptyState,
  VSErrorState,
  VSLoadingState,
  VSRoleCard,
  VSStatusBadge,
} from "@/components/design-system";
import { useAuth } from "@/lib/auth";
import type { Event } from "@/lib/types";
import { applicationService } from "@/services/volunteer/applicationService";
import { eventService } from "@/services/shared/eventService";
import { AppShell } from "@/components/app/AppShell";

export const Route = createFileRoute("/volunteer/events/$eventId")({
  component: EventDetails,
  head: ({ params }) => ({ meta: [{ title: `Event · ${params.eventId}` }] }),
});

function EventDetails() {
  const params = Route.useParams();
  const { profile } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [availability, setAvailability] = useState("");
  const [experience, setExperience] = useState("");
  const [motivation, setMotivation] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [existingApplication, setExistingApplication] = useState<{
    id: string;
    role_id: string;
    status: string;
  } | null>(null);

  const [checkingApplication, setCheckingApplication] = useState(false);

  useEffect(() => {
    if (!profile?.id || !params.eventId) {
      setExistingApplication(null);
      return;
    }

    let cancelled = false;

    const checkApplication = async () => {
      try {
        setCheckingApplication(true);

        const application = await applicationService.getMyEventApplication(
          params.eventId,
        );

        if (!cancelled) {
          setExistingApplication(application);
        }
      } catch (err) {
        console.error("Unable to check existing application:", err);

        if (!cancelled) {
          setExistingApplication(null);
        }
      } finally {
        if (!cancelled) {
          setCheckingApplication(false);
        }
      }
    };

    void checkApplication();

    return () => {
      cancelled = true;
    };
  }, [profile?.id, params.eventId]);

  useEffect(() => {
    eventService
      .getEventById(params.eventId)
      .then(setEvent)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Unable to load this event."),
      )
      .finally(() => setLoading(false));
  }, [params.eventId]);

  const selectedRole = useMemo(
    () => event?.event_roles?.find((role) => role.id === selectedRoleId) ?? null,
    [event, selectedRoleId],
  );

  if (loading)
    return (
      <AppShell title="Event Details">
        <div className="shell min-h-screen py-24">
          <VSLoadingState message="Loading event details…" />
        </div>
      </AppShell>
    );
  if (error)
    return (
      <AppShell title="Event Details">
        <div className="shell min-h-screen py-24">
          <VSErrorState title="Unable to load event" description={error} />
        </div>
      </AppShell>
    );
  if (!event)
    return (
      <AppShell title="Event Details">

        <div className="shell min-h-screen py-24">
          <VSEmptyState
            title="Event not found"
            description="This opportunity may have moved. Browse the latest events to find another way to contribute."
            action={
              <VSButton asChild>
                <Link to="/events">Browse events</Link>
              </VSButton>
            }
          />
        </div>
      </AppShell>
    );

  const cover = event.cover_url ?? "/images/default-event-cover.jpg";
  const filled = event.event_roles?.reduce((sum, role) => sum + role.filled_positions, 0) ?? 0;
  const remaining = event.total_volunteers_needed - filled;
  const handleSubmit = async (submitEvent: React.FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();
    setSubmitError(null);
    if (!profile) {
      setSubmitError("Sign in to apply for this opportunity.");
      return;
    }
    if (existingApplication) {
      setSubmitError("You have already applied for this event.");
      return;
    }
    if (!selectedRole) {
      setSubmitError("Choose a volunteer role before submitting.");
      return;
    }
    try {
  setSubmitting(true);

  const result = await applicationService.applyForRole({
    eventId: event.id,
    roleId: selectedRole.id,
    availability,
    experience,
    motivation,
  });

  setExistingApplication({
    id: result.applicationId,
    role_id: selectedRole.id,
    status: "pending",
  });

  setSubmitted(true);
    } catch (submitErr) {
      setSubmitError(
        submitErr instanceof Error
          ? submitErr.message
          : "Unable to submit your application.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell title="Event Details">
      <div className="shell min-h-screen">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Link to="/events" className="transition hover:text-primary">
              Events
            </Link>
            <span>/</span>
            <span className="text-foreground">{event.title}</span>
          </div>
          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
            <section className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-[var(--shadow-float)]">
              <div className="relative aspect-[16/8] overflow-hidden bg-ink">
                <img src={cover} alt={event.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4 text-white">
                  <div>
                    <VSBadge variant="dark">{event.sport}</VSBadge>
                    <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">
                      {event.title}
                    </h1>
                  </div>
                  <VSStatusBadge status={event.status ?? "draft"} />
                </div>
              </div>
              <div className="space-y-8 p-6 sm:p-9">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Info
                    icon={<CalendarDays className="h-4 w-4" />}
                    label="Date"
                    value={`${event.start_date} – ${event.end_date}`}
                  />
                  <Info
                    icon={<Clock3 className="h-4 w-4" />}
                    label="Time"
                    value={`${event.start_time ?? "Flexible"} – ${event.end_time ?? "End of shift"}`}
                  />
                  <Info
                    icon={<MapPin className="h-4 w-4" />}
                    label="Venue"
                    value={`${event.venue}, ${event.city}`}
                  />
                  <Info
                    icon={<Users className="h-4 w-4" />}
                    label="Capacity"
                    value={`${remaining} of ${event.total_volunteers_needed} spots open`}
                  />
                </div>
                <div>
                  <p className="eyebrow">About the event</p>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
                    {event.description}
                  </p>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Info
                    icon={<CalendarDays className="h-4 w-4" />}
                    label="Application deadline"
                    value={event.application_deadline ?? "Open until filled"}
                  />
                  <Info
                    icon={<Languages className="h-4 w-4" />}
                    label="Languages"
                    value={
                      Array.isArray(event.required_languages)
                        ? event.required_languages.join(", ") || "Flexible"
                        : "Flexible"
                    }
                  />
                </div>
                {event.requirements && (
                  <div className="rounded-3xl bg-muted/60 p-5">
                    <p className="font-semibold text-foreground">Requirements</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {event.requirements}
                    </p>
                  </div>
                )}
                <div>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                          01
                        </span>
                        <p className="eyebrow">Choose your role</p>
                      </div>

                      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                        How will you contribute?
                      </h2>

                      <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                        Select the role that best matches your skills and experience.
                      </p>
                    </div>

                    <span className="w-fit rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                      {event.event_roles?.length ?? 0} roles available
                    </span>
                  </div>
                  <div className="mt-5 grid gap-4">
                    {event.event_roles?.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setSelectedRoleId(role.id)}
                        className="text-left"
                      >

                        {selectedRoleId === role.id && (
                          <div className="mb-2 flex items-center justify-between px-1">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Selected
                            </span>
                          </div>
                        )}
                        <VSRoleCard
                          name={role.name}
                          description={role.description ?? undefined}
                          available={role.positions - role.filled_positions}
                          capacity={role.positions}
                          requirements={[
                            ...(Array.isArray(role.skills) ? role.skills : []),
                            ...(role.mandatory_training ? ["Training required"] : []),
                          ]}
                          action={
                            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                              Apply for this role <ArrowRight className="h-4 w-4" />
                            </span>
                          }
                          className={
                            selectedRoleId === role.id
                              ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-[0_0_0_1px_hsl(var(--primary)/0.15)]"
                              : "transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-float)]"
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
              <section className="rounded-[2rem] bg-ink p-6 text-white shadow-[var(--shadow-lift)] sm:p-7">
                <p className="eyebrow text-white/60">Ready to join?</p>
                <h2 className="mt-3 text-2xl font-semibold">Make your contribution count.</h2>
                <p className="mt-3 text-sm leading-6 text-white/70">
                  Choose a role above and tell the event team how you can help create a memorable
                  sporting experience.
                </p>
                {!profile && (
                  <Link
                    to="/login"
                    search={{ next: `/events/${event.id}` }}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
                  >
                    Sign in to apply <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
                {selectedRole && (
                  <p className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
                    <span className="font-semibold text-white">Selected:</span> {selectedRole.name}
                  </p>
                )}
              </section>
                <section className="rounded-[2rem] border border-border bg-card p-5 shadow-[var(--shadow-float)] sm:p-7">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                      02
                    </span>

                    <p className="eyebrow">Application</p>
                  </div>

                  <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                    Apply for this role
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    A few details will help the event team understand how you can contribute.
                  </p>
                </div>

                {selectedRole ? (
                  <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                      Selected role
                    </p>

                    <div className="mt-2 flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">
                          {selectedRole.name}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          {selectedRole.positions - selectedRole.filled_positions} spots remaining
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/40 p-4">
                    <p className="text-sm font-semibold text-foreground">
                      Choose a role first
                    </p>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Select one of the volunteer roles above to continue your application.
                    </p>
                  </div>
                )}
                {checkingApplication ? (
                  <div className="mt-6 rounded-3xl border border-border bg-muted/40 p-5">
                    <div className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />

                      <p className="text-sm font-medium text-muted-foreground">
                        Checking your application…
                      </p>
                    </div>
                  </div>
                ) : submitted || existingApplication ? (
                  <ApplicationSubmittedCard
                    status={existingApplication?.status ?? "pending"}
                    roleName={
                      event.event_roles?.find(
                        (role) =>
                          role.id ===
                          (existingApplication?.role_id ?? selectedRoleId),
                      )?.name ?? selectedRole?.name
                    }
                  />
                ) : (
                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    
                    <div>
                      <label className="text-sm font-semibold text-foreground">
                        Availability
                      </label>

                      <p className="mt-1 text-xs text-muted-foreground">
                        When are you available during the event?
                      </p>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {[
                          "Fully available",
                          "Mornings only",
                          "Afternoons only",
                          "Evenings only",
                          "Flexible",
                        ].map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setAvailability(option)}
                            className={[
                              "rounded-xl border px-3 py-3 text-left text-xs font-semibold transition",
                              availability === option
                                ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/20"
                                : "border-border bg-background text-foreground hover:border-primary/40",
                              option === "Flexible" ? "col-span-2" : "",
                            ].join(" ")}
                          >
                            <span
                              className={[
                                "mr-2 inline-block h-2 w-2 rounded-full",
                                availability === option ? "bg-primary" : "bg-muted-foreground/30",
                              ].join(" ")}
                            />

                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                    

                    <div>
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <label className="text-sm font-semibold text-foreground">
                            Experience
                          </label>

                          <p className="mt-1 text-xs text-muted-foreground">
                            Tell us about relevant experience, skills or previous volunteering.
                          </p>
                        </div>

                        <span className="text-[11px] text-muted-foreground">
                          {experience.length}/500
                        </span>
                      </div>

                      <textarea
                        value={experience}
                        onChange={(formEvent) =>
                          setExperience(formEvent.target.value.slice(0, 500))
                        }
                        rows={5}
                        placeholder="Example: I have experience helping at sports events..."
                        required
                        className="mt-3 w-full resize-none rounded-2xl border border-border bg-background px-4 py-3.5 text-sm leading-6 outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </div>

                    <div>
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <label className="text-sm font-semibold text-foreground">
                            Motivation
                          </label>

                          <p className="mt-1 text-xs text-muted-foreground">
                            Why would you like to volunteer at this event?
                          </p>
                        </div>

                        <span className="text-[11px] text-muted-foreground">
                          {motivation.length}/400
                        </span>
                      </div>

                      <textarea
                        value={motivation}
                        onChange={(formEvent) =>
                          setMotivation(formEvent.target.value.slice(0, 400))
                        }
                        rows={4}
                        placeholder="Tell the event team what motivates you..."
                        required
                        className="mt-3 w-full resize-none rounded-2xl border border-border bg-background px-4 py-3.5 text-sm leading-6 outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </div>

                    {submitError && <p className="text-sm text-destructive">{submitError}</p>}
                    {!selectedRole && (
                      <div className="rounded-xl bg-muted/60 px-3 py-2.5 text-xs leading-5 text-muted-foreground">
                        Select a volunteer role above to continue.
                      </div>
                    )}
                    <VSButton
                      type="submit"
                      disabled={submitting || !selectedRole}
                      className="h-12 w-full justify-center rounded-2xl"
                    >
                      {submitting ? "Submitting application…" : "Submit application"}
                      {!submitting && <ArrowRight className="h-4 w-4" />}
                    </VSButton>
                  </form>
                )}
              </section>
            </aside>
          </div>
        </div>
      </div>
    </AppShell>
  );
}


function ApplicationSubmittedCard({
  status,
  roleName,
}: {
  status: string;
  roleName?: string;
}) {
  const statusConfig: Record<
    string,
    {
      label: string;
      description: string;
      className: string;
      dotClassName: string;
    }
  > = {
    pending: {
      label: "Pending review",
      description:
        "Your application has been received. The event team will review it and update your application status.",
      className: "border-amber-200 bg-amber-50",
      dotClassName: "bg-amber-500",
    },

    accepted: {
      label: "Application accepted",
      description:
        "Your application has been accepted. You can follow your event details from My Events.",
      className: "border-emerald-200 bg-emerald-50",
      dotClassName: "bg-emerald-500",
    },

    rejected: {
      label: "Application not accepted",
      description:
        "This application was not selected for the event. You can explore other volunteer opportunities.",
      className: "border-red-200 bg-red-50",
      dotClassName: "bg-red-500",
    },

    waitlisted: {
      label: "Waitlisted",
      description:
        "You are currently on the waiting list. The event team may contact you if a position becomes available.",
      className: "border-blue-200 bg-blue-50",
      dotClassName: "bg-blue-500",
    },

    withdrawn: {
      label: "Application withdrawn",
      description:
        "This application has been withdrawn.",
      className: "border-border bg-muted/50",
      dotClassName: "bg-muted-foreground",
    },
  };

  const config =
    statusConfig[status] ?? {
      label: status,
      description:
        "Your application has already been submitted for this event.",
      className: "border-border bg-muted/50",
      dotClassName: "bg-muted-foreground",
    };

  return (
    <div
      className={`mt-6 rounded-3xl border p-5 ${config.className}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-background/70">
          {status === "accepted" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          ) : (
            <span
              className={`h-2.5 w-2.5 rounded-full ${config.dotClassName}`}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-foreground">
              Application already submitted
            </p>

            <span className="rounded-full bg-background/70 px-2.5 py-1 text-[11px] font-semibold text-foreground">
              {config.label}
            </span>
          </div>

          {roleName && (
            <p className="mt-2 text-sm font-medium text-foreground">
              Role: {roleName}
            </p>
          )}

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {config.description}
          </p>
        </div>
      </div>
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/60 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
