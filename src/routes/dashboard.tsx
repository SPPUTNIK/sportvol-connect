import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  PlayCircle,
  Trophy,
  GraduationCap,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import {
  demoAchievements,
  demoApplications,
  demoTraining,
  demoUpcomingEvent,
} from "@/mocks/frontendDemo";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard | VolunSport Morocco" }] }),
});

const statusStyles: Record<string, string> = {
  accepted: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  waitlisted: "bg-violet-50 text-violet-700",
};

function Dashboard() {
  const { user, profile, loading } = useAuth();
  const firstName = profile?.first_name || "Volunteer";
  if (loading)
    return (
      <div className="shell min-h-screen py-24">
        <div className="rounded-[2rem] border border-hairline-invert bg-card p-10 text-center text-sm text-muted-foreground">
          Loading your volunteer workspace…
        </div>
      </div>
    );
  if (!user)
    return (
      <div className="shell min-h-screen py-24">
        <div className="mx-auto max-w-lg rounded-[2rem] border border-hairline-invert bg-card p-10 text-center">
          <h1 className="text-2xl font-semibold text-foreground">Sign in to continue</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Your volunteer journey, schedule, and impact are waiting for you.
          </p>
          <a
            href="/login"
            className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            Go to login
          </a>
        </div>
      </div>
    );
  const stats = [
    ["Upcoming events", "01", CalendarDays, "Your next assignment"],
    ["Volunteer hours", String(profile?.volunteer_hours ?? 12), Clock3, "Verified impact"],
    [
      "Attendance rate",
      `${Math.round(profile?.attendance_rate ?? 96)}%`,
      CheckCircle2,
      "Reliability score",
    ],
    ["Certificates", "01", Award, "Ready to share"],
  ] as const;
  const actions = [
    ["Discover events", "/events", CalendarDays],
    ["Review applications", "/applications", CheckCircle2],
    ["Open my schedule", "/schedule", Clock3],
    ["Continue training", "/training", PlayCircle],
  ] as const;
  return (
    <AppShell title="Dashboard">
      <div className="mx-auto max-w-[1440px] space-y-8">
        <section className="relative overflow-hidden rounded-[2rem] bg-ink px-7 py-9 text-white shadow-[var(--shadow-lift)] sm:px-10">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border-[36px] border-primary/30" />
          <div className="relative max-w-2xl">
            <p className="eyebrow text-white/60">Your volunteer journey</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Welcome back, {firstName}.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/70">
              Upcoming events, new opportunities, and the impact you are building across Morocco—all
              in one place.
            </p>
            <a
              href="/events"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              Explore events <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(([label, value, Icon, helper]) => (
            <div key={label} className="rounded-[1.5rem] border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-2xl font-semibold text-foreground">{value}</span>
              </div>
              <p className="mt-5 text-sm font-semibold text-foreground">{label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
            </div>
          ))}
        </section>
        <div className="grid gap-8 xl:grid-cols-[1.35fr_0.65fr]">
          <section className="rounded-[2rem] border border-border bg-card p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Next assignment</p>
                <h2 className="mt-2 text-2xl font-semibold text-foreground">Your upcoming event</h2>
              </div>
              <a href="/my-events" className="text-sm font-semibold text-primary">
                View all
              </a>
            </div>
            <div className="mt-7 overflow-hidden rounded-3xl bg-background">
              <div className="flex min-h-48 items-end bg-[linear-gradient(120deg,#153d35,#2e8066_58%,#d9a441)] p-6">
                <div>
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                    {demoUpcomingEvent.status}
                  </span>
                  <h3 className="mt-3 max-w-md text-2xl font-semibold text-white">
                    {demoUpcomingEvent.title}
                  </h3>
                  <p className="mt-2 flex items-center gap-2 text-sm text-white/75">
                    <MapPin className="h-4 w-4" />
                    {demoUpcomingEvent.location}
                  </p>
                </div>
              </div>
              <div className="grid gap-4 p-5 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Date</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {demoUpcomingEvent.date}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Role</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {demoUpcomingEvent.role}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Shift</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {demoUpcomingEvent.shift}
                  </p>
                </div>
              </div>
            </div>
          </section>
          <section className="rounded-[2rem] border border-border bg-card p-6 sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="eyebrow">Keep moving</p>
                <h2 className="mt-2 text-2xl font-semibold text-foreground">Quick actions</h2>
              </div>
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div className="mt-7 space-y-3">
              {actions.map(([label, href, Icon]) => (
                <a
                  key={href}
                  href={href}
                  className="group flex items-center gap-3 rounded-2xl border border-border p-4 transition hover:border-primary hover:bg-muted"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1 text-sm font-semibold text-foreground">{label}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
                </a>
              ))}
            </div>
          </section>
        </div>
        <div className="grid gap-8 xl:grid-cols-2">
          <section className="rounded-[2rem] border border-border bg-card p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">Applications</p>
                <h2 className="mt-2 text-2xl font-semibold text-foreground">Recent applications</h2>
              </div>
              <a href="/applications" className="text-sm font-semibold text-primary">
                View all
              </a>
            </div>
            <div className="mt-6 divide-y divide-border">
              {demoApplications.map((application) => (
                <div
                  key={application.event}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{application.event}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {application.role} · {application.date}
                    </p>
                  </div>
                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[application.status]}`}
                  >
                    {application.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-[2rem] border border-border bg-card p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">Preparation</p>
                <h2 className="mt-2 text-2xl font-semibold text-foreground">Training progress</h2>
              </div>
              <a href="/training" className="text-sm font-semibold text-primary">
                Continue
              </a>
            </div>
            <div className="mt-6 flex items-end justify-between">
              <p className="text-3xl font-semibold text-foreground">
                {demoTraining.filter((item) => item.complete).length}{" "}
                <span className="text-base font-normal text-muted-foreground">
                  / {demoTraining.length} completed
                </span>
              </p>
              <GraduationCap className="h-7 w-7 text-primary" />
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-2/3 rounded-full bg-primary" />
            </div>
            <div className="mt-5 space-y-3">
              {demoTraining.map((item) => (
                <div key={item.title} className="flex items-center gap-3">
                  <CheckCircle2
                    className={`h-4 w-4 ${item.complete ? "text-emerald-600" : "text-muted-foreground"}`}
                  />
                  <span className="flex-1 text-sm text-foreground">{item.title}</span>
                  <span className="text-xs text-muted-foreground">{item.duration}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
        <section className="rounded-[2rem] border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Achievements</p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">Your momentum</h2>
            </div>
            <a href="/achievements" className="text-sm font-semibold text-primary">
              See all
            </a>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {demoAchievements.map((achievement) => (
              <div key={achievement.title} className="rounded-3xl bg-background p-5">
                <div className="flex items-center justify-between">
                  <Trophy
                    className={`h-5 w-5 ${achievement.unlocked ? "text-primary" : "text-muted-foreground"}`}
                  />
                  <span className="text-xs font-semibold text-muted-foreground">
                    {achievement.progress}%
                  </span>
                </div>
                <h3 className="mt-5 text-sm font-semibold text-foreground">{achievement.title}</h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {achievement.description}
                </p>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${achievement.unlocked ? "bg-primary" : "bg-muted-foreground/40"}`}
                    style={{ width: `${achievement.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
