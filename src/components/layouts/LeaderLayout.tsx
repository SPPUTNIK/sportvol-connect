import { Link, useLocation } from "@tanstack/react-router";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Clock3,
  LayoutDashboard,
  Menu,
  QrCode,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { leaderService } from "@/services/leader/leaderService";

export type LeaderLayoutProps = {
  children: ReactNode;
};

type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const leaderNavigation: NavGroup[] = [
  {
    label: "Leader",
    items: [
      { label: "Dashboard", href: "/leader/dashboard", icon: LayoutDashboard },
      { label: "My Event", href: "/leader/event", icon: CalendarDays },
      { label: "My Committee", href: "/leader/committee", icon: Users },
      { label: "Volunteers", href: "/leader/volunteers", icon: Users },
      { label: "Shifts", href: "/leader/shifts", icon: Clock3 },
      { label: "QR Scanner", href: "/leader/scanner", icon: QrCode },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Notifications", href: "/leader/notifications", icon: Bell },
      { label: "Profile", href: "/leader/profile", icon: UserRound },
    ],
  },
];

function LeaderNavigation({ onNavigate }: { onNavigate: () => void }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { profile } = useAuth();
  const leaderName = profile ? `${profile.first_name ?? "Leader"} ${profile.last_name ?? ""}`.trim() : "Leader";
  const badge = (leaderName || "L").slice(0, 1).toUpperCase();

  return (
    <div className="relative flex h-full flex-col overflow-y-auto overflow-x-hidden scrollbar-hide px-4 py-6">
      <div className="pointer-events-none absolute inset-0 zellij-sidebar-bg opacity-[0.02]" />

      <div className="relative flex min-h-max flex-col">
        <div className="mb-8 flex items-center justify-between px-3">
          <Link to="/" className="flex items-center gap-3" onClick={onNavigate}>
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-primary/10">
              <img
                src="/logo.png"
                alt="VolunSport Morocco"
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <p className="font-display text-lg font-semibold tracking-tight">SPORTVOL</p>
              <p className="text-[0.58rem] uppercase tracking-[0.3em] text-primary">CONNECT</p>
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
          {leaderNavigation.map((group) => (
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
                      {active ? <ChevronRight className="ml-auto h-4 w-4" /> : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-8 rounded-3xl border border-border bg-background p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">
              {badge}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{leaderName}</p>
              <p className="truncate text-xs text-muted-foreground">Committee Leader</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LeaderLayout({ children }: LeaderLayoutProps) {
  const [open, setOpen] = useState(false);
  const { profile } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    void leaderService.getRecentScans().then((items) => {
      setNotificationCount(items.length);
    });
  }, []);

  const leaderName = profile ? `${profile.first_name ?? "Leader"} ${profile.last_name ?? ""}`.trim() : "Leader";
  const displayName = leaderName.split(" ")[0] ?? "Leader";

  return (
    <div className="min-h-screen bg-background/70 text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] overflow-hidden border-r border-border bg-card/80 lg:block">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[url('./assets/zellij-pattern.jpg')] bg-[length:520px_auto] bg-repeat bg-top opacity-[0.06]"
        />
        <div className="relative z-10 h-full">
          <LeaderNavigation onNavigate={() => setOpen(false)} />
        </div>
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
            <LeaderNavigation onNavigate={() => setOpen(false)} />
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
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div>
                <p className="hidden text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground sm:block">
                  LEADER
                </p>
                <h1 className="text-lg font-semibold text-foreground sm:text-xl">
                  Your event operations
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/leader/notifications"
                className="relative rounded-xl border border-border p-2.5 text-muted-foreground transition hover:text-foreground"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -right-1.5 -top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
                  {notificationCount || 0}
                </span>
              </Link>

              <Link
                to="/leader/profile"
                className="flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-1.5 pr-3"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-[0.65rem] font-semibold text-white">
                  {displayName.slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden text-sm font-medium text-foreground sm:block">{displayName}</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="px-5 py-8 sm:px-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
