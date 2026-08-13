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
import { eventCoverDefaults } from "@/lib/mock-data";
import type { Event } from "@/lib/types";
import { applicationService } from "@/services/applicationService";
import { eventService } from "@/services/eventService";

export const Route = createFileRoute("/events/$slug")({
  component: EventDetails,
  head: ({ params }) => ({ meta: [{ title: `Event · ${params.slug}` }] }),
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

  useEffect(() => {
    eventService
      .getEventBySlug(params.slug)
      .then(setEvent)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Unable to load this event."),
      )
      .finally(() => setLoading(false));
  }, [params.slug]);

  const selectedRole = useMemo(
    () => event?.event_roles?.find((role) => role.id === selectedRoleId) ?? null,
    [event, selectedRoleId],
  );

  if (loading)
    return (
      <PublicLayout>
        <div className="shell min-h-screen py-24">
          <VSLoadingState message="Loading event details…" />
        </div>
      </PublicLayout>
    );
  if (error)
    return (
      <PublicLayout>
        <div className="shell min-h-screen py-24">
          <VSErrorState title="Unable to load event" description={error} />
        </div>
      </PublicLayout>
    );
  if (!event)
    return (
      <PublicLayout>
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
      </PublicLayout>
    );

  const cover = event.cover_url ?? eventCoverDefaults[event.sport] ?? eventCoverDefaults.Running;
  const filled = event.event_roles?.reduce((sum, role) => sum + role.filled_positions, 0) ?? 0;
  const remaining = event.total_volunteers_needed - filled;
  const handleSubmit = async (submitEvent: React.FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();
    setSubmitError(null);
    if (!profile) {
      setSubmitError("Sign in to apply for this opportunity.");
      return;
    }
    if (!selectedRole) {
      setSubmitError("Choose a volunteer role before submitting.");
      return;
    }
    try {
      setSubmitting(true);
      await applicationService.applyForRole({
        eventId: event.id,
        roleId: selectedRole.id,
        availability,
        experience,
        motivation,
      });
      setSubmitted(true);
    } catch (submitErr) {
      setSubmitError(
        submitErr instanceof Error ? submitErr.message : "Unable to submit your application.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <div className="shell min-h-screen py-24">
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
                  <VSStatusBadge status={event.status} />
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
                    value={event.required_languages.join(", ") || "Flexible"}
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
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="eyebrow">Find your role</p>
                      <h2 className="mt-2 text-2xl font-semibold text-foreground">
                        How will you contribute?
                      </h2>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {event.event_roles?.length ?? 0} roles
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
                        <VSRoleCard
                          name={role.name}
                          description={role.description ?? undefined}
                          available={role.positions - role.filled_positions}
                          capacity={role.positions}
                          requirements={[
                            ...role.skills,
                            ...(role.mandatory_training ? ["Training required"] : []),
                          ]}
                          action={
                            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                              Apply for this role <ArrowRight className="h-4 w-4" />
                            </span>
                          }
                          className={
                            selectedRoleId === role.id
                              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                              : ""
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
                    search={{ next: `/events/${event.slug}` }}
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
              <section className="rounded-[2rem] border border-border bg-card p-6 shadow-[var(--shadow-float)]">
                <p className="eyebrow">Application</p>
                <h2 className="mt-2 text-2xl font-semibold text-foreground">Tell us about you.</h2>
                {submitted ? (
                  <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                    <p className="mt-3 font-semibold text-foreground">Application submitted</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      The event team will review your application and update you soon.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <label className="block text-sm font-medium text-foreground">
                      Availability
                      <input
                        value={availability}
                        onChange={(formEvent) => setAvailability(formEvent.target.value)}
                        placeholder="Days and times available"
                        required
                        className="mt-2 h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none focus:border-primary"
                      />
                    </label>
                    <label className="block text-sm font-medium text-foreground">
                      Experience
                      <textarea
                        value={experience}
                        onChange={(formEvent) => setExperience(formEvent.target.value)}
                        rows={4}
                        placeholder="What experience would you bring?"
                        required
                        className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                      />
                    </label>
                    <label className="block text-sm font-medium text-foreground">
                      Motivation
                      <textarea
                        value={motivation}
                        onChange={(formEvent) => setMotivation(formEvent.target.value)}
                        rows={3}
                        placeholder="What excites you about this event?"
                        required
                        className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                      />
                    </label>
                    {submitError && <p className="text-sm text-destructive">{submitError}</p>}
                    <VSButton
                      type="submit"
                      disabled={submitting || !selectedRole}
                      className="w-full"
                    >
                      {submitting ? "Submitting…" : "Submit application"}
                      <ArrowRight className="h-4 w-4" />
                    </VSButton>
                  </form>
                )}
              </section>
            </aside>
          </div>
        </div>
      </div>
    </PublicLayout>
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
