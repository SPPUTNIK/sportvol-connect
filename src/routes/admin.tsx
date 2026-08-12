import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, ClipboardList, Clock3, ShieldCheck, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
  head: () => ({ meta: [{ title: "Admin Dashboard | SportVol Morocco" }] }),
});

const db = supabase;

type Stats = { volunteers: number; events: number; applications: number; hours: number };

function AdminDashboard() {
  const { user, profile, loading } = useAuth();
  const [stats, setStats] = useState<Stats>({
    volunteers: 0,
    events: 0,
    applications: 0,
    hours: 0,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading || !user || profile?.role !== "admin") return;
    let active = true;
    Promise.all([
      db.from("profiles").select("id", { count: "exact", head: true }),
      db
        .from("events")
        .select("id", { count: "exact", head: true })
        .in("status", ["draft", "published"]),
      db.from("applications").select("id", { count: "exact", head: true }),
      db.from("volunteer_hours").select("hours"),
    ]).then(([volunteers, events, applications, hours]) => {
      if (!active) return;
      const problem = volunteers.error || events.error || applications.error || hours.error;
      if (problem) {
        setError("Metrics are temporarily unavailable.");
        return;
      }
      setStats({
        volunteers: volunteers.count ?? 0,
        events: events.count ?? 0,
        applications: applications.count ?? 0,
        hours: (hours.data ?? []).reduce(
          (sum: number, row: { hours?: number }) => sum + Number(row.hours ?? 0),
          0,
        ),
      });
    });
    return () => {
      active = false;
    };
  }, [loading, user, profile?.role]);

  if (loading)
    return (
      <div className="shell min-h-screen py-24">
        <div className="rounded-[2rem] border border-hairline-invert bg-card p-10 text-center text-sm text-muted-foreground">
          Loading admin workspace…
        </div>
      </div>
    );
  if (!user || profile?.role !== "admin")
    return (
      <div className="shell min-h-screen py-24">
        <div className="mx-auto max-w-lg rounded-[2rem] border border-hairline-invert bg-card p-10 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-5 text-2xl font-semibold text-foreground">Admin access required</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Sign in with an administrator account to manage the platform.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            Go to login
          </Link>
        </div>
      </div>
    );

  const cards = [
    ["Volunteers", stats.volunteers, Users, "bg-sky-50 text-sky-700"],
    ["Active events", stats.events, CalendarDays, "bg-amber-50 text-amber-700"],
    ["Applications", stats.applications, ClipboardList, "bg-violet-50 text-violet-700"],
    ["Official hours", stats.hours, Clock3, "bg-emerald-50 text-emerald-700"],
  ] as const;
  const workspaces = [
    "Events",
    "Applications",
    "Volunteers",
    "Training",
    "Attendance",
    "Notifications",
  ];

  return (
    <div className="shell min-h-screen py-16">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Platform control</p>
          <h1 className="display-md mt-3 text-ink-foreground">Admin dashboard</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Keep events, applications, attendance, and volunteer impact moving in one place.
          </p>
        </div>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground"
        >
          View public events <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {error && (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, Icon, tone]) => (
          <div
            key={label}
            className="rounded-[1.75rem] border border-hairline-invert bg-card p-6 shadow-[var(--shadow-lift)]"
          >
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-6 text-3xl font-semibold text-foreground">{value.toLocaleString()}</p>
            <p className="mt-1 text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="rounded-[2rem] border border-hairline-invert bg-card p-7">
          <p className="eyebrow">Management</p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">Run the platform</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {workspaces.map((item) => (
              <Link
                key={item}
                to="/dashboard"
                className="group rounded-3xl border border-border bg-background p-5 hover:border-primary"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{item}</h3>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Open the {item.toLowerCase()} workspace and keep records current.
                </p>
              </Link>
            ))}
          </div>
        </section>
        <aside className="rounded-[2rem] bg-ink p-7 text-white">
          <p className="eyebrow text-white/60">Admin principle</p>
          <h2 className="mt-3 text-2xl font-semibold">Build trust at every handoff.</h2>
          <p className="mt-4 text-sm leading-6 text-white/70">
            Accurate events, considered applications, reliable attendance, and certificates
            volunteers can share with pride.
          </p>
          <Link
            to="/applications"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white"
          >
            Review applications <ArrowRight className="h-4 w-4" />
          </Link>
        </aside>
      </div>
    </div>
  );
}
