import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import {
  demoAchievements,
  demoCertificates,
  demoSchedule,
  demoTraining,
} from "@/mocks/frontendDemo";

export function MyEventsPage() {
  return (
    <AppShell title="My events">
      <PageIntro
        eyebrow="Your commitments"
        title="The events you are part of"
        description="Everything you need before the event day, from your role to your accreditation."
      />
      <section className="grid gap-5 lg:grid-cols-2">
        {[
          {
            title: "Marrakech International Marathon",
            date: "18 Oct 2026",
            role: "Route support volunteer",
            shift: "06:00 — 12:30",
            location: "Menara Gardens",
            training: "Ready",
            accreditation: "Issued",
            attendance: "Not started",
          },
        ].map((event) => (
          <article
            key={event.title}
            className="rounded-[2rem] border border-border bg-card p-6 sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Accepted
                </span>
                <h2 className="mt-4 text-2xl font-semibold text-foreground">{event.title}</h2>
                <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </p>
              </div>
              <CalendarDays className="h-6 w-6 text-primary" />
            </div>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <Info label="Date" value={event.date} />
              <Info label="Role" value={event.role} />
              <Info label="Shift" value={event.shift} />
              <Info label="Training" value={event.training} />
            </div>
            <a
              href="/accreditation"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
              View accreditation <ArrowRight className="h-4 w-4" />
            </a>
          </article>
        ))}
      </section>
    </AppShell>
  );
}

export function SchedulePage() {
  return (
    <AppShell title="Schedule">
      <PageIntro
        eyebrow="Event day view"
        title="Your schedule at a glance"
        description="A mobile-first view for the moments when you need the right information quickly."
      />
      <div className="space-y-4">
        {demoSchedule.map((item) => (
          <article
            key={`${item.date}-${item.event}`}
            className="rounded-[1.75rem] border border-border bg-card p-5 sm:p-6"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-ink text-white">
                <span className="text-xs uppercase text-white/60">Oct</span>
                <span className="text-xl font-semibold">{item.date.split(" ")[0]}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {item.time}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-foreground">{item.event}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.role} · {item.location}
                </p>
              </div>
              <Clock3 className="hidden h-5 w-5 text-muted-foreground sm:block" />
            </div>
            <div className="mt-5 rounded-2xl bg-background p-4 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Instructions: </span>
              {item.note}
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}

export function HoursPage() {
  return (
    <AppShell title="Volunteer hours">
      <PageIntro
        eyebrow="Your impact"
        title="Every hour counts"
        description="Track the time, consistency, and community impact behind your volunteer journey."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Total hours" value="12" />
        <Metric label="Current year" value="12" />
        <Metric label="Events completed" value="02" />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-[2rem] border border-border bg-card p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-foreground">Hours over time</h2>
          <div className="mt-8 flex h-52 items-end gap-3 border-b border-border pb-0">
            {["25%", "42%", "35%", "68%", "52%", "86%"].map((height, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-xl bg-primary/80" style={{ height }} />
                <span className="text-[0.65rem] text-muted-foreground">
                  {["May", "Jun", "Jul", "Aug", "Sep", "Oct"][index]}
                </span>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-[2rem] border border-border bg-card p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-foreground">Hours by event</h2>
          <div className="mt-6 space-y-5">
            {[
              ["Rabat Beach Games", "8h"],
              ["Atlas Youth Cup", "4h"],
              ["Marrakech Marathon", "Upcoming"],
            ].map(([event, hours]) => (
              <div key={event}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">{event}</span>
                  <span className="text-muted-foreground">{hours}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted">
                  <div className="h-full w-2/3 rounded-full bg-primary" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export function AchievementsPage() {
  return (
    <AppShell title="Achievements">
      <PageIntro
        eyebrow="Keep growing"
        title="Milestones worth celebrating"
        description="Small commitments become a track record you can carry with you."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {demoAchievements.map((item) => (
          <article key={item.title} className="rounded-[1.75rem] border border-border bg-card p-6">
            <Trophy
              className={`h-7 w-7 ${item.unlocked ? "text-primary" : "text-muted-foreground"}`}
            />
            <h2 className="mt-6 text-lg font-semibold text-foreground">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
            <div className="mt-6 h-2 rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${item.unlocked ? "bg-primary" : "bg-muted-foreground/40"}`}
                style={{ width: `${item.progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs font-semibold text-muted-foreground">
              {item.progress}% complete
            </p>
          </article>
        ))}
      </div>
    </AppShell>
  );
}

export function CertificatesPage() {
  return (
    <AppShell title="Certificates">
      <PageIntro
        eyebrow="Proof of impact"
        title="Certificates you have earned"
        description="Keep a record of the events and hours that shaped your volunteer journey."
      />
      <div className="grid gap-5 lg:grid-cols-2">
        {demoCertificates.map((certificate) => (
          <article
            key={certificate.id}
            className="overflow-hidden rounded-[2rem] border border-border bg-card"
          >
            <div className="bg-ink p-7 text-white">
              <div className="flex items-center justify-between">
                <ShieldCheck className="h-7 w-7 text-primary" />
                <span className="text-xs font-mono text-white/60">{certificate.id}</span>
              </div>
              <p className="mt-12 text-xs uppercase tracking-[0.22em] text-white/55">
                Certificate of contribution
              </p>
              <h2 className="mt-3 text-2xl font-semibold">{certificate.event}</h2>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-3">
              <Info label="Role" value={certificate.role} />
              <Info label="Hours" value={`${certificate.hours} hours`} />
              <Info label="Issued" value={certificate.date} />
            </div>
            <div className="border-t border-border px-6 py-4">
              <button type="button" className="text-sm font-semibold text-primary">
                Preview certificate <ArrowRight className="ml-1 inline h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}

function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8 max-w-3xl">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-border bg-card p-6">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-3 text-4xl font-semibold text-foreground">{value}</p>
      <p className="mt-2 text-xs text-muted-foreground">Verified in your volunteer record</p>
    </div>
  );
}
