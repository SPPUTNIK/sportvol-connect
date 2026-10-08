import { Link, useLocation } from "@tanstack/react-router";
import {
  CalendarDays,
  Clock3,
  LayoutDashboard,
  QrCode,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

type BottomNavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
};

const navigation: BottomNavItem[] = [
  {
    label: "Dashboard",
    href: "/leader/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My Event",
    href: "/leader/event",
    icon: CalendarDays,
  },
  {
    label: "Scanner",
    href: "/leader/scanner",
    icon: QrCode,
  },
  {
    label: "Volunteers",
    href: "/leader/volunteers",
    icon: Users,
  },
  {
    label: "Shifts",
    href: "/leader/shifts",
    icon: Clock3,
  },
];

export function LeaderBottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (href: string) =>
    currentPath === href ||
    (href !== "/leader/dashboard" &&
      currentPath.startsWith(`${href}/`));

  return (
    <nav
      aria-label="Leader mobile navigation"
      className="fixed inset-x-0 bottom-0 z-[99999] block lg:hidden"
    >
      <div className="relative w-full border-t border-border/60 bg-background/95 shadow-[0_-12px_35px_rgba(0,0,0,0.12)] backdrop-blur-2xl">
        <div className="mx-auto grid h-[76px] w-full max-w-lg grid-cols-5 px-2 pb-[env(safe-area-inset-bottom)] sm:px-4">
          {navigation.map(({ label, href, icon: Icon }, index) => {
            const active = isActive(href);
            const isScanner = index === 2;

            return (
              <Link
                key={href}
                to={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-w-0 flex-col items-center",
                  isScanner
                    ? "justify-end"
                    : "justify-center gap-1 pt-2",
                )}
              >
                {isScanner ? (
                  <>
                    {/* Floating scanner button */}
                    <span
                      className={cn(
                        "absolute -top-8 flex h-[64px] w-[64px] items-center justify-center rounded-full border-[5px] border-background bg-primary text-primary-foreground shadow-[0_8px_25px_rgba(0,0,0,0.22)] transition-all duration-300",
                        active
                          ? "scale-105 shadow-[0_10px_30px_rgba(0,0,0,0.28)]"
                          : "hover:scale-105",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-[48px] w-[48px] items-center justify-center rounded-full border border-white/20",
                          active ? "bg-white/10" : "bg-black/5",
                        )}
                      >
                        <QrCode className="h-7 w-7 stroke-[2.2]" />
                      </span>
                    </span>

                    {/* Scanner label */}
                    <span
                      className={cn(
                        "mb-1.5 text-[0.62rem] font-bold leading-none transition-colors",
                        active
                          ? "text-primary"
                          : "text-muted-foreground",
                      )}
                    >
                      Scanner
                    </span>
                  </>
                ) : (
                  <>
                    {/* Active indicator */}
                    <span
                      className={cn(
                        "absolute top-0 h-0.5 w-7 rounded-full bg-primary transition-all duration-300",
                        active
                          ? "scale-100 opacity-100"
                          : "scale-50 opacity-0",
                      )}
                    />

                    {/* Regular icon */}
                    <span
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300",
                        active ? "bg-primary/10" : "bg-transparent",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-[19px] w-[19px] transition-all duration-300",
                          active && "stroke-[2.5]",
                        )}
                      />
                    </span>

                    <span className="max-w-full truncate text-[0.62rem] font-medium leading-none">
                      {label}
                    </span>
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}