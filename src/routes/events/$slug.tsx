import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { getEventBySlug } from "@/services/mockService";
import { RoleCard } from "@/components/ui/role-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { eventCoverDefaults } from "@/lib/mock-data";
import type { EventRole } from "@/lib/types";

export const Route = createFileRoute("/events/$slug")({
  component: EventDetails,
  head: ({ params }) => ({
    meta: [{ title: `Event · ${params.slug}` }],
  }),
});

function EventDetails() {
  const { t } = useI18n();
  const params = Route.useParams();
  const [event, setEvent] = useState<Awaited<ReturnType<typeof getEventBySlug>>>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [availability, setAvailability] = useState("");
  const [experience, setExperience] = useState("");
  const [motivation, setMotivation] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getEventBySlug(params.slug)
      .then((data) => setEvent(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.slug]);

  const selectedRole = useMemo(() => {
    return event?.event_roles?.find((role) => role.id === selectedRoleId) ?? event?.event_roles?.[0] ?? null;
  }, [event, selectedRoleId]);

  if (loading) return <LoadingState message="Loading event details…" />;
  if (error) return <EmptyState title="Unable to load event" description={error} />;
  if (!event) return <EmptyState title="Event not found" description="Check the event link or browse the event list." />;

  const cover = event.cover_url ?? eventCoverDefaults[event.sport] ?? eventCoverDefaults.Running;
  const filled = event.event_roles?.reduce((sum, role) => sum + role.filled_positions, 0) ?? 0;
  const remaining = event.total_volunteers_needed - filled;

  const handleSubmit = (eventSubmit: React.FormEvent<HTMLFormElement>) => {
    eventSubmit.preventDefault();
    setSubmitted(true);
  };

  return (
    <I18nProvider>
      <div className="shell min-h-screen py-24">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
          <section className="space-y-8 rounded-[2rem] border border-hairline-invert bg-card p-8 shadow-[var(--shadow-lift)]">
            <div className="overflow-hidden rounded-[1.5rem] bg-slate-950">
              <img src={cover} alt={event.title} className="h-72 w-full object-cover" />
            </div>
            <div className="space-y-4">
              <p className="eyebrow">{event.event_type}</p>
              <h1 className="display-md text-ink-foreground">{event.title}</h1>
              <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{event.description}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-background p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Date</p>
                <p className="mt-3 text-lg font-semibold text-foreground">{event.start_date} – {event.end_date}</p>
                <p className="mt-1 text-sm text-muted-foreground">{event.start_time} – {event.end_time}</p>
              </div>
              <div className="rounded-3xl bg-background p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Venue</p>
                <p className="mt-3 text-lg font-semibold text-foreground">{event.venue}</p>
                <p className="mt-1 text-sm text-muted-foreground">{event.city}, {event.country}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-background p-6 text-sm">
                <p className="text-muted-foreground">Capacity</p>
                <p className="mt-2 font-semibold text-foreground">{event.total_volunteers_needed}</p>
              </div>
              <div className="rounded-3xl bg-background p-6 text-sm">
                <p className="text-muted-foreground">Available positions</p>
                <p className="mt-2 font-semibold text-foreground">{remaining}</p>
              </div>
              <div className="rounded-3xl bg-background p-6 text-sm">
                <p className="text-muted-foreground">Application deadline</p>
                <p className="mt-2 font-semibold text-foreground">{event.application_deadline}</p>
              </div>
            </div>
            <div className="rounded-3xl bg-background p-6 text-sm">
              <h2 className="font-semibold text-foreground">Requirements</h2>
              <p className="mt-3 text-muted-foreground">{event.requirements}</p>
            </div>
            <div className="rounded-3xl bg-background p-6 text-sm">
              <h2 className="font-semibold text-foreground">Volunteer roles</h2>
              <div className="mt-6 grid gap-4">
                {event.event_roles?.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRoleId(role.id)}
                    className={`w-full rounded-3xl border p-4 text-left transition ${selectedRoleId === role.id ? "border-primary bg-primary/5" : "border-border bg-background"}`}
                  >
                    <p className="font-semibold text-foreground">{role.name}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{role.description}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-3xl bg-background p-6 text-sm">
              <h2 className="font-semibold text-foreground">Application form</h2>
              {submitted ? (
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-foreground">
                  <p className="font-semibold">Application submitted</p>
                  <p className="mt-2 text-sm text-muted-foreground">You&apos;ll receive an update once the organizer reviews your submission.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-medium text-foreground">
                      Selected role
                      <input value={selectedRole?.name ?? "Choose a role above"} readOnly className="mt-2 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none" />
                    </label>
                    <label className="block text-sm font-medium text-foreground">
                      Availability
                      <input value={availability} onChange={(event) => setAvailability(event.target.value)} placeholder="Days and times available" className="mt-2 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none" required />
                    </label>
                  </div>
                  <label className="block text-sm font-medium text-foreground">
                    Your experience
                    <textarea value={experience} onChange={(event) => setExperience(event.target.value)} rows={4} className="mt-2 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none" placeholder="Briefly describe why you&apos;re a great match." required />
                  </label>
                  <label className="block text-sm font-medium text-foreground">
                    Motivation
                    <textarea value={motivation} onChange={(event) => setMotivation(event.target.value)} rows={3} className="mt-2 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none" placeholder="What excites you about this event?" required />
                  </label>
                  <button
                    type="submit"
                    className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                  >
                    Submit application
                  </button>
                </form>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            {selectedRole ? <RoleCard role={selectedRole as EventRole} /> : null}
            <div className="rounded-[2rem] border border-hairline-invert bg-card p-6 text-sm">
              <h2 className="font-semibold text-foreground">Quick event facts</h2>
              <ul className="mt-4 space-y-3 text-muted-foreground">
                <li><strong className="text-foreground">Languages</strong>: {event.required_languages.join(", ")}</li>
                <li><strong className="text-foreground">Total volunteers needed</strong>: {event.total_volunteers_needed}</li>
                <li><strong className="text-foreground">Filled positions</strong>: {filled}</li>
                <li><strong className="text-foreground">Remaining positions</strong>: {remaining}</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </I18nProvider>
  );
}
