import { Link } from "@tanstack/react-router";
import {
  Award,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  FileBarChart,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

type AdminNavItem = { label: string; href: string; icon: typeof LayoutDashboard };
type AdminNavGroup = { label: string; items: AdminNavItem[] };

export type AdminLayoutProps = { children: ReactNode; title: string; eyebrow?: string };

export const adminNavigation: AdminNavGroup[] = [
  { label: "Overview", items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }] },
  {
    label: "Event management",
    items: [
      { label: "Events", href: "/admin/events", icon: CalendarDays },
      { label: "Roles", href: "/admin/roles", icon: Users },
      { label: "Shifts", href: "/admin/shifts", icon: Clock3 },
    ],
  },
  {
    label: "Volunteers",
    items: [
      { label: "Applications", href: "/admin/applications", icon: ClipboardList },
      { label: "Volunteers", href: "/admin/volunteers", icon: Users },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Training", href: "/admin/training", icon: GraduationCap },
      { label: "Attendance", href: "/admin/attendance", icon: CheckCircle2 },
      { label: "Accreditation", href: "/admin/accreditation", icon: ShieldCheck },
    ],
  },
  {
    label: "Impact",
    items: [
      { label: "Hours", href: "/admin/hours", icon: Clock3 },
      { label: "Certificates", href: "/admin/certificates", icon: Award },
    ],
  },
  {
    label: "Communication",
    items: [{ label: "Notifications", href: "/admin/notifications", icon: Bell }],
  },
  {
    label: "Reporting",
    items: [
      { label: "Reports", href: "/admin/reports", icon: FileBarChart },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Profile", href: "/profile", icon: UserRound },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

function AdminNavigation({ onNavigate }: { onNavigate: () => void }) {
  const { profile } = useAuth();
  const name = profile?.first_name || "Administrator";
  const currentPath = typeof window === "undefined" ? "" : window.location.pathname;

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden px-4 py-6">
      <div className="pointer-events-none absolute inset-0 zellij-tile opacity-[0.09]" />
      <div className="relative flex min-h-full flex-col">
        <div className="mb-8 flex items-center justify-between px-3">
          <Link to="/" className="flex items-center gap-3" onClick={onNavigate}>
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-background">
              <img
                src="/logo.png"
                alt="VolunSport Morocco"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-ink-foreground">VOLUNSPORT</p>
              <p className="text-[0.58rem] uppercase tracking-[0.3em] text-primary">Morocco</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={onNavigate}
            className="rounded-full p-2 text-muted-foreground lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-7">
          {adminNavigation.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map(({ label, href, icon: Icon }) => {
                  const active = currentPath === href;
                  return (
                    <Link
                      key={href}
                      to={href}
                      onClick={onNavigate}
                      className={cn(
                        "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition",
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-foreground/70 hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{label}</span>
                      {active && <ChevronRight className="ml-auto h-4 w-4" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <Link
          to="/profile"
          onClick={onNavigate}
          className="mt-auto rounded-3xl border border-border bg-background p-4 transition hover:border-primary/40"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">
              {name.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{name}</p>
              <p className="truncate text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
          <p className="mt-3 text-xs font-semibold text-primary">View profile</p>
        </Link>
      </div>
    </div>
  );
}

export function AdminLayout({ children, title, eyebrow = "Platform control" }: AdminLayoutProps) {
  const [open, setOpen] = useState(false);
  const { profile } = useAuth();
  const name = profile?.first_name || "Administrator";

  return (
    <div className="min-h-screen bg-background/70 text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] border-r border-border bg-card/80 lg:block">
        <AdminNavigation onNavigate={() => setOpen(false)} />
      </aside>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-ink/45 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close navigation overlay"
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-[min(86vw,320px)] border-r border-border bg-card/80 lg:hidden">
            <AdminNavigation onNavigate={() => setOpen(false)} />
          </aside>
        </>
      )}
      <div className="lg:pl-[272px]">
        <header className="sticky top-0 z-30 border-b border-border bg-background/60 backdrop-blur-xl">
          <div className="flex h-[72px] items-center justify-between gap-4 px-5 sm:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-xl border border-border p-2 lg:hidden"
                aria-label="Open admin navigation"
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
              <Link
                to="/notifications"
                className="relative rounded-xl border border-border p-2.5 text-muted-foreground transition hover:text-foreground"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-1.5 pr-3"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[0.65rem] font-semibold text-white">
                  {name.slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden text-sm font-medium text-foreground sm:block">{name}</span>
              </Link>
            </div>
          </div>
        </header>
        <main className="px-5 py-8 sm:px-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
