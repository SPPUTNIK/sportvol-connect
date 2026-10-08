import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Search,
  ShieldCheck,
  CalendarCheck,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const bottomNavigation = [
  {
    label: "Dashboard",
    href: "/volunteer/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Discover",
    href: "/volunteer/events",
    icon: Search,
  },
  {
    label: "Accreditation",
    href: "/volunteer/accreditation",
    icon: ShieldCheck,
    featured: true,
  },
  {
    label: "My Events",
    href: "/volunteer/my-events",
    icon: CalendarCheck,
  },
  {
    label: "Attendance",
    href: "/volunteer/attendance",
    icon: ClipboardCheck,
  },
];

export function VolunteerBottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav
      aria-label="Volunteer mobile navigation"
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 lg:hidden",
        "border-t border-border/60",
        "bg-background/90 backdrop-blur-2xl",
        "shadow-[0_-10px_40px_rgba(0,0,0,0.10)]",
        "pb-[env(safe-area-inset-bottom)]",
      )}
    >
      <div className="relative mx-auto grid h-[76px] w-full max-w-xl grid-cols-5 items-stretch px-2 sm:px-4">
        {bottomNavigation.map(
          ({ label, href, icon: Icon, featured }) => {
            const active =
              currentPath === href ||
              currentPath.startsWith(`${href}/`);

            if (featured) {
              return (
                <Link
                  key={href}
                  to={href}
                  aria-label={label}
                  aria-current={active ? "page" : undefined}
                  className="group relative flex min-w-0 flex-col items-center justify-end"
                >
                  {/* Featured accreditation action */}
                  <span
                    className={cn(
                      "absolute top-[-19px] flex h-[58px] w-[58px]",
                      "items-center justify-center rounded-[21px]",
                      "border-[4px] border-background",
                      "transition-all duration-300 ease-out",
                      "group-active:scale-95",
                      active
                        ? [
                            "bg-primary text-primary-foreground",
                            "shadow-[0_6px_20px_rgba(22,101,52,0.30)]",
                            "-translate-y-1",
                          ]
                        : [
                            "bg-primary text-primary-foreground",
                            "shadow-[0_5px_16px_rgba(22,101,52,0.20)]",
                            "group-hover:-translate-y-1",
                          ],
                    )}
                  >
                    <Icon
                      className="h-[25px] w-[25px]"
                      strokeWidth={2.2}
                    />
                  </span>

                  <span
                    className={cn(
                      "mb-[9px] mt-[39px] max-w-full truncate",
                      "px-0.5 text-center text-[9px] leading-tight",
                      "transition-colors duration-200 sm:text-[10px]",
                      active
                        ? "font-bold text-primary"
                        : "font-semibold text-foreground/80",
                    )}
                  >
                    {label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={href}
                to={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex min-w-0 flex-col",
                  "items-center justify-center gap-[6px]",
                  "rounded-2xl transition-colors duration-200",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {/* Active indicator */}
                <span
                  className={cn(
                    "absolute top-0 h-[3px] w-7 rounded-b-full",
                    "bg-primary transition-opacity duration-200",
                    active ? "opacity-100" : "opacity-0",
                  )}
                />

                <span
                  className={cn(
                    "flex h-8 w-10 items-center justify-center rounded-xl",
                    "transition-all duration-200",
                    active
                      ? "bg-primary/10"
                      : "bg-transparent group-hover:bg-muted/70",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-[21px] w-[21px] shrink-0",
                      "transition-transform duration-200",
                      active && "scale-105",
                    )}
                    strokeWidth={active ? 2.3 : 1.8}
                  />
                </span>

                <span
                  className={cn(
                    "max-w-full truncate px-0.5",
                    "text-center text-[9px] leading-tight",
                    "sm:text-[10px]",
                    active ? "font-bold" : "font-medium",
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          },
        )}
      </div>
    </nav>
  );
}
