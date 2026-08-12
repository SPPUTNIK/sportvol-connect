import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Award,
  Bell,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Dumbbell,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Trophy,
  UserRound,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";

export type AppShellProps = { children: ReactNode; title: string; eyebrow?: string };

type NavItem = { label: string; href: string; icon: typeof LayoutDashboard };

const groups: { label: string; items: NavItem[] }[] = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Discover Events", href: "/events", icon: Search },
      { label: "My Applications", href: "/applications", icon: CheckCircle2 },
      { label: "My Events", href: "/my-events", icon: CalendarCheck },
      { label: "Schedule", href: "/schedule", icon: CalendarDays },
    ],
  },
  {
    label: "My impact",
    items: [
      { label: "Volunteer Hours", href: "/hours", icon: Clock3 },
      { label: "Certificates", href: "/certificates", icon: Award },
      { label: "Achievements", href: "/achievements", icon: Trophy },
    ],
  },
  {
    label: "Preparation",
    items: [
      { label: "Training", href: "/training", icon: GraduationCap },
      { label: "Accreditation", href: "/accreditation", icon: ShieldCheck },
      { label: "Attendance", href: "/attendance", icon: CalendarCheck },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "My Profile", href: "/profile", icon: UserRound },
      { label: "Notifications", href: "/notifications", icon: Bell },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function AppShell({ children, title, eyebrow = "Volunteer workspace" }: AppShellProps) {
  const [open, setOpen] = useState(false);
  const { profile } = useAuth();
  const firstName = profile?.first_name || "Volunteer";
  const currentPath = typeof window === "undefined" ? "" : window.location.pathname;

  const navigation = (
    <div className="flex min-h-full flex-col px-4 py-6">
      <div className="mb-8 flex items-center justify-between px-3">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Dumbbell className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-ink-foreground">VolunSport</p>
            <p className="text-[0.58rem] uppercase tracking-[0.3em] text-muted-foreground">
              Morocco
            </p>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full p-2 text-muted-foreground lg:hidden"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="space-y-7">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map(({ label, href, icon: Icon }) => {
                const active = currentPath === href;
                return (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition ${active ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/70 hover:bg-muted hover:text-foreground"}`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{label}</span>
                    {active && <ChevronRight className="ml-auto h-4 w-4" />}
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="mt-auto rounded-3xl border border-border bg-background p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">
            {firstName.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{firstName}</p>
            <p className="truncate text-xs text-muted-foreground">Volunteer account</p>
          </div>
        </div>
        <a href="/profile" className="mt-3 block text-xs font-semibold text-primary">
          View profile
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] border-r border-border bg-card lg:block">
        {navigation}
      </aside>
      {open && (
        <>
          <button
            className="fixed inset-0 z-40 bg-ink/45 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close navigation overlay"
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-[min(86vw,320px)] border-r border-border bg-card lg:hidden">
            {navigation}
          </aside>
        </>
      )}
      <div className="lg:pl-[272px]">
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
          <div className="flex h-[72px] items-center justify-between gap-4 px-5 sm:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-xl border border-border p-2 lg:hidden"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="hidden text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground sm:block">
                  {eyebrow}
                </p>
                <h1 className="text-lg font-semibold text-foreground sm:text-xl">{title}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/notifications"
                className="relative rounded-xl border border-border p-2.5 text-muted-foreground transition hover:text-foreground"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
              </a>
              <a
                href="/profile"
                className="flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-1.5 pr-3"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[0.65rem] font-semibold text-white">
                  {firstName.slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden text-sm font-medium text-foreground sm:block">
                  {firstName}
                </span>
              </a>
            </div>
          </div>
        </header>
        <main className="px-5 py-8 sm:px-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
