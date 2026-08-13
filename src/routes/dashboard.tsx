import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Award,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Heart,
  HeartHandshake,
  Menu,
  MapPin,
  Trophy,
  UserRound,
  X,
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({
    meta: [{ title: "Dashboard | VolunSport Morocco" }],
  }),
});

function Dashboard() {
  const { user, profile, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login";
    }
  }, [user, loading]);

  if (loading) {
    return <DashboardLoading />;
  }

  if (!user) {
    return null;
  }

  const firstName = profile?.first_name || "Volunteer";
  const volunteerHours = profile?.volunteer_hours ?? 0;
  const attendanceRate = Math.round(profile?.attendance_rate ?? 0);

  return (
    <I18nProvider>
      <div className="min-h-screen bg-background text-foreground">
        {/* ============================================================ */}
        {/* MOBILE SIDEBAR OVERLAY                                       */}
        {/* ============================================================ */}

        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ============================================================ */}
        {/* SIDEBAR                                                      */}
        {/* ============================================================ */}

        <aside
          className={[
            "fixed inset-y-0 left-0 z-50 w-[280px]",
            "border-r border-hairline-invert",
            "bg-primary text-primary-foreground",
            "transition-transform duration-300 ease-out",
            "lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <div className="relative flex h-full flex-col overflow-hidden">
            {/* Moroccan pattern */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.055]"
              style={{
                backgroundImage: "url('/moroccan-pattern.png')",
                backgroundPosition: "center",
                backgroundSize: "420px",
              }}
            />

            <div className="relative flex h-full flex-col">
              {/* ------------------------------------------------------ */}
              {/* LOGO                                                    */}
              {/* ------------------------------------------------------ */}

              <div className="flex h-[88px] items-center justify-between border-b border-primary-foreground/10 px-6">
                <Link
                  to="/"
                  className="flex items-center gap-3"
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-background">
                    <img
                      src="/logo.png"
                      alt="VolunSport Morocco"
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-bold tracking-[0.12em]">VOLUNSPORT</p>

                    <p className="mt-0.5 text-[8px] uppercase tracking-[0.2em] text-accent">
                      Morocco
                    </p>
                  </div>
                </Link>

                <button
                  type="button"
                  aria-label="Close sidebar"
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-xl p-2 text-primary-foreground/60 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground lg:hidden"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* ------------------------------------------------------ */}
              {/* NAVIGATION                                              */}
              {/* ------------------------------------------------------ */}

              <nav className="flex-1 overflow-y-auto px-4 py-6">
                <SidebarLabel>MAIN</SidebarLabel>

                <div className="space-y-1">
                  <SidebarItem
                    to="/dashboard"
                    icon={<CalendarDays className="h-4 w-4" />}
                    label="Dashboard"
                    active
                    onClick={() => setSidebarOpen(false)}
                  />

                  <SidebarItem
                    to="/events"
                    icon={<HeartHandshake className="h-4 w-4" />}
                    label="Discover Events"
                    onClick={() => setSidebarOpen(false)}
                  />

                  <SidebarItem
                    to="/applications"
                    icon={<CalendarDays className="h-4 w-4" />}
                    label="My Applications"
                    onClick={() => setSidebarOpen(false)}
                  />

                  <SidebarItem
                    to="/my-events"
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    label="My Events"
                    onClick={() => setSidebarOpen(false)}
                  />
                </div>

                <SidebarLabel className="mt-8">MY IMPACT</SidebarLabel>

                <div className="space-y-1">
                  <SidebarItem
                    to="/hours"
                    icon={<Clock3 className="h-4 w-4" />}
                    label="Volunteer Hours"
                    onClick={() => setSidebarOpen(false)}
                  />

                  <SidebarItem
                    to="/certificates"
                    icon={<Award className="h-4 w-4" />}
                    label="Certificates"
                    onClick={() => setSidebarOpen(false)}
                  />

                  <SidebarItem
                    to="/achievements"
                    icon={<Trophy className="h-4 w-4" />}
                    label="Achievements"
                    onClick={() => setSidebarOpen(false)}
                  />
                </div>

                <SidebarLabel className="mt-8">ACCOUNT</SidebarLabel>

                <div className="space-y-1">
                  <SidebarItem
                    to="/profile"
                    icon={<UserRound className="h-4 w-4" />}
                    label="My Profile"
                    onClick={() => setSidebarOpen(false)}
                  />

                  <SidebarItem
                    to="/notifications"
                    icon={<Bell className="h-4 w-4" />}
                    label="Notifications"
                    onClick={() => setSidebarOpen(false)}
                  />
                </div>
              </nav>

              {/* ------------------------------------------------------ */}
              {/* USER CARD                                                */}
              {/* ------------------------------------------------------ */}

              <div className="border-t border-primary-foreground/10 p-4">
                <Link
                  to="/profile"
                  onClick={() => setSidebarOpen(false)}
                  className="group flex items-center gap-3 rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-3 transition-colors hover:bg-primary-foreground/10"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-sm font-bold text-accent-foreground">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={firstName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      firstName.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{firstName}</p>

                    <p className="mt-0.5 text-[11px] text-primary-foreground/50">Volunteer</p>
                  </div>

                  <ChevronRight className="h-4 w-4 text-primary-foreground/40 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* ============================================================ */}
        {/* MAIN                                                         */}
        {/* ============================================================ */}

        <div className="lg:pl-[280px]">
          {/* ---------------------------------------------------------- */}
          {/* TOP BAR                                                    */}
          {/* ---------------------------------------------------------- */}

          <header className="sticky top-0 z-30 border-b border-hairline-invert bg-background/90 backdrop-blur-xl">
            <div className="flex h-[72px] items-center justify-between px-5 sm:px-8 lg:px-10">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  aria-label="Open navigation"
                  onClick={() => setSidebarOpen(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-hairline-invert bg-card text-foreground lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div className="hidden sm:block">
                  <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                    Volunteer Portal
                  </p>

                  <p className="mt-0.5 text-sm font-medium">Your impact starts here.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/notifications"
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-hairline-invert bg-card transition-colors hover:bg-background"
                >
                  <Bell className="h-4 w-4" />

                  <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-destructive" />
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center gap-2 rounded-xl border border-hairline-invert bg-card px-2 py-1.5 transition-colors hover:bg-background"
                >
                  <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={firstName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      firstName.charAt(0).toUpperCase()
                    )}
                  </div>

                  <span className="hidden max-w-[120px] truncate text-xs font-medium sm:block">
                    {firstName}
                  </span>
                </Link>
              </div>
            </div>
          </header>

          {/* ---------------------------------------------------------- */}
          {/* CONTENT                                                     */}
          {/* ---------------------------------------------------------- */}

          <main className="shell py-8 sm:py-10 lg:py-12">
            <div className="mx-auto max-w-7xl">
              {/* ====================================================== */}
              {/* PAGE INTRO                                             */}
              {/* ====================================================== */}

              <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
                    Your dashboard
                  </p>

                  <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    Welcome back
                    {profile?.first_name ? `, ${profile.first_name}` : ""}.
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                    Your volunteer journey, upcoming events and impact — all in one place.
                  </p>
                </div>

                <Link
                  to="/events"
                  className="group inline-flex w-fit items-center gap-2 rounded-full border border-hairline-invert bg-card px-5 py-3 text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
                >
                  Explore events
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              {/* ====================================================== */}
              {/* HERO                                                    */}
              {/* ====================================================== */}

              <section className="relative overflow-hidden rounded-[2rem] bg-primary p-7 text-primary-foreground shadow-[var(--shadow-lift)] sm:p-10">
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.07]"
                  style={{
                    backgroundImage: "url('/moroccan-pattern.png')",
                    backgroundPosition: "center",
                    backgroundSize: "520px",
                  }}
                />

                <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-primary-foreground/10" />

                <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border border-primary-foreground/10" />

                <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                  <div className="max-w-2xl">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-foreground/15 bg-primary-foreground/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em]">
                      <Heart className="h-3.5 w-3.5" />
                      Moroccan Sports Volunteers
                    </div>

                    <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
                      Make an impact.
                      <br />
                      <span className="text-accent">Be part of something bigger.</span>
                    </h2>

                    <p className="mt-5 max-w-xl text-sm leading-7 text-primary-foreground/65 sm:text-base">
                      Every hour you give helps create better sporting experiences and stronger
                      communities across Morocco.
                    </p>
                  </div>

                  <Link
                    to="/events"
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    Find an opportunity
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </section>

              {/* ====================================================== */}
              {/* STATS                                                   */}
              {/* ====================================================== */}

              <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  icon={<CalendarDays className="h-5 w-5" />}
                  label="Events"
                  value="0"
                  description="Upcoming events assigned to you"
                />

                <StatCard
                  icon={<Clock3 className="h-5 w-5" />}
                  label="Volunteer hours"
                  value={volunteerHours}
                  description="Verified volunteer hours"
                  accent
                />

                <StatCard
                  icon={<CheckCircle2 className="h-5 w-5" />}
                  label="Attendance"
                  value={`${attendanceRate}%`}
                  description="Your attendance rate"
                />

                <StatCard
                  icon={<Award className="h-5 w-5" />}
                  label="Certificates"
                  value="0"
                  description="Certificates earned"
                  accent
                />
              </section>

              {/* ====================================================== */}
              {/* MAIN GRID                                               */}
              {/* ====================================================== */}

              <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
                {/* Upcoming event */}
                <section className="rounded-[2rem] border border-hairline-invert bg-card p-6 shadow-[var(--shadow-lift)] sm:p-8">
                  <SectionHeading
                    eyebrow="Your schedule"
                    title="Upcoming event"
                    href="/my-events"
                  />

                  <div className="mt-7 overflow-hidden rounded-[1.5rem] border border-hairline-invert bg-background">
                    <div className="relative aspect-[16/7] overflow-hidden bg-primary/5">
                      <div
                        className="absolute inset-0 opacity-[0.06]"
                        style={{
                          backgroundImage: "url('/moroccan-pattern.png')",
                          backgroundSize: "360px",
                        }}
                      />

                      <div className="relative flex h-full items-center justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-hairline-invert bg-card">
                          <CalendarDays className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                        No event assigned
                      </p>

                      <h3 className="mt-2 text-xl font-semibold">
                        Your next opportunity is waiting.
                      </h3>

                      <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                        Explore upcoming sporting events and find an opportunity that matches your
                        interests and skills.
                      </p>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <MetaPill icon={<MapPin className="h-3.5 w-3.5" />} label="Morocco" />

                        <MetaPill icon={<Heart className="h-3.5 w-3.5" />} label="Community" />
                      </div>

                      <Link
                        to="/events"
                        className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold"
                      >
                        Discover events
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </section>

                {/* Quick access */}
                <section className="rounded-[2rem] border border-hairline-invert bg-card p-6 shadow-[var(--shadow-lift)] sm:p-8">
                  <SectionHeading eyebrow="Quick access" title="Your journey" />

                  <div className="mt-7 space-y-3">
                    <QuickAction
                      icon={<CalendarDays className="h-4 w-4" />}
                      title="Discover events"
                      description="Find volunteer opportunities"
                      to="/events"
                    />

                    <QuickAction
                      icon={<UserRound className="h-4 w-4" />}
                      title="My profile"
                      description="Update your information"
                      to="/profile"
                    />

                    <QuickAction
                      icon={<Clock3 className="h-4 w-4" />}
                      title="My hours"
                      description="Track your contribution"
                      to="/hours"
                    />

                    <QuickAction
                      icon={<Trophy className="h-4 w-4" />}
                      title="Achievements"
                      description="See your milestones"
                      to="/achievements"
                    />
                  </div>
                </section>
              </div>

              {/* ====================================================== */}
              {/* LOWER GRID                                              */}
              {/* ====================================================== */}

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <section className="rounded-[2rem] border border-hairline-invert bg-card p-6 shadow-[var(--shadow-lift)] sm:p-8">
                  <SectionHeading eyebrow="Applications" title="Recent applications" />

                  <EmptyState
                    icon={<CalendarDays className="h-5 w-5" />}
                    title="No applications yet"
                    description="When you apply to an event, your applications will appear here."
                    action="Explore events"
                    to="/events"
                  />
                </section>

                <section className="rounded-[2rem] border border-hairline-invert bg-card p-6 shadow-[var(--shadow-lift)] sm:p-8">
                  <SectionHeading eyebrow="Your impact" title="Achievements" />

                  <EmptyState
                    icon={<Trophy className="h-5 w-5" />}
                    title="Your first achievement is waiting"
                    description="Participate in events and start building your VOLUNSPORT journey."
                    action="View achievements"
                    to="/achievements"
                  />
                </section>
              </div>

              {/* ====================================================== */}
              {/* PROFILE CTA                                             */}
              {/* ====================================================== */}

              <section className="mt-6 overflow-hidden rounded-[2rem] border border-accent/30 bg-accent/10 p-6 sm:p-8">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                      <UserRound className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="font-semibold">Complete your volunteer profile</p>

                      <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                        Add your skills, interests and city so VOLUNSPORT can help match you with
                        the right opportunities.
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5"
                  >
                    Complete profile
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </section>

              {/* ====================================================== */}
              {/* FOOTER                                                  */}
              {/* ====================================================== */}

              <footer className="py-10 text-center">
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                  VolunSport Morocco
                </p>

                <p className="mt-2 text-xs text-muted-foreground/70">Together, we create impact.</p>
              </footer>
            </div>
          </main>
        </div>
      </div>
    </I18nProvider>
  );
}

/* ========================================================================== */
/* SIDEBAR COMPONENTS                                                         */
/* ========================================================================== */

function SidebarLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`mb-3 px-3 text-[9px] font-medium tracking-[0.25em] text-primary-foreground/35 ${className}`}
    >
      {children}
    </p>
  );
}

function SidebarItem({
  to,
  icon,
  label,
  active = false,
  onClick,
}: {
  to: string;
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={[
        "group flex items-center gap-3 rounded-2xl px-3 py-2.5",
        "transition-all duration-200",
        active
          ? "bg-primary-foreground/10 text-primary-foreground"
          : "text-primary-foreground/55 hover:bg-primary-foreground/5 hover:text-primary-foreground",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
          "transition-colors",
          active
            ? "bg-accent text-accent-foreground"
            : "bg-primary-foreground/5 text-primary-foreground/55 group-hover:bg-primary-foreground/10 group-hover:text-primary-foreground",
        ].join(" ")}
      >
        {icon}
      </span>

      <span className="flex-1 text-sm">{label}</span>

      {active && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
    </Link>
  );
}

/* ========================================================================== */
/* CONTENT COMPONENTS                                                         */
/* ========================================================================== */

function StatCard({
  icon,
  label,
  value,
  description,
  accent = false,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  description: string;
  accent?: boolean;
}) {
  return (
    <div className="group rounded-[1.75rem] border border-hairline-invert bg-card p-5 shadow-[var(--shadow-lift)] transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div
          className={[
            "flex h-10 w-10 items-center justify-center rounded-xl",
            accent ? "bg-accent text-accent-foreground" : "bg-primary/5 text-primary",
          ].join(" ")}
        >
          {icon}
        </div>

        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/20 transition-colors group-hover:bg-accent" />
      </div>

      <p className="mt-5 text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>

      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  href,
}: {
  eyebrow: string;
  title: string;
  href?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-xl font-semibold tracking-tight">{title}</h2>
      </div>

      {href && (
        <Link
          to={href}
          className="group inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

function QuickAction({
  icon,
  title,
  description,
  to,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-2xl border border-hairline-invert bg-background p-3 transition-all duration-200 hover:-translate-y-0.5 hover:bg-card hover:shadow-sm"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>

        <p className="mt-0.5 truncate text-xs text-muted-foreground">{description}</p>
      </div>

      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
  to,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action: string;
  to: string;
}) {
  return (
    <div className="mt-6 rounded-[1.5rem] border border-dashed border-hairline-invert bg-background p-7">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary">
        {icon}
      </div>

      <h3 className="mt-5 text-sm font-semibold">{title}</h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>

      <Link to={to} className="group mt-5 inline-flex items-center gap-2 text-xs font-semibold">
        {action}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

function MetaPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-hairline-invert bg-card px-3 py-2 text-xs text-muted-foreground">
      {icon}
      {label}
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-[2rem] border border-hairline-invert bg-card p-10 text-center shadow-[var(--shadow-lift)]">
        <div className="mx-auto flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-primary/10">
          <HeartHandshake className="h-6 w-6 text-primary" />
        </div>

        <h2 className="mt-5 text-lg font-semibold">Loading your dashboard</h2>

        <p className="mt-2 text-sm text-muted-foreground">Preparing your VOLUNSPORT experience…</p>
      </div>
    </div>
  );
}
