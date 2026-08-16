import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileBarChart,
  ShieldCheck,
  Users,
} from "lucide-react";

import { AdminGate } from "./components/AdminGate";

import {
  VSButton,
  VSCard,
  VSCardContent,
  VSPageHeader,
  VSSectionHeader,
  VSStatCard,
} from "@/components/design-system";

import { adminService } from "@/services/adminService";

export function AdminDashboardPage() {
  const stats = adminService.getStats();

  const actions = [
    ["Events", "/admin/events", CalendarDays],
    ["Applications", "/admin/applications", ClipboardList],
    ["Volunteers", "/admin/volunteers", Users],
    ["Reports", "/admin/reports", FileBarChart],
  ] as const;

  return (
    <AdminGate title="Admin dashboard">
      <div className="mx-auto max-w-7xl">
        <VSPageHeader
          eyebrow="Platform control"
          title="Keep the movement moving."
          description="A clear view of volunteers, events, applications, attendance, and impact."
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <VSStatCard
            label="Total volunteers"
            value={(stats.volunteers ?? 0).toLocaleString()}
            icon={<Users className="h-5 w-5" />}
          />

          <VSStatCard
            label="Upcoming events"
            value={stats.upcomingEvents}
            icon={<CalendarDays className="h-5 w-5" />}
            accent
          />

          <VSStatCard
            label="Applications"
            value={stats.applications}
            icon={<ClipboardList className="h-5 w-5" />}
          />

          <VSStatCard
            label="Accepted"
            value={stats.acceptedVolunteers}
            icon={<CheckCircle2 className="h-5 w-5" />}
            accent
          />

          <VSStatCard
            label="Official hours"
            value={(stats.hours ?? 0).toLocaleString()}
            icon={<BarChart3 className="h-5 w-5" />}
          />

          <VSStatCard
            label="Attendance"
            value={stats.attendance}
            icon={<ShieldCheck className="h-5 w-5" />}
            accent
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <VSCard className="rounded-[2rem] border-border">
            <VSCardContent className="p-6 sm:p-8">
              <VSSectionHeader
                eyebrow="Action centre"
                title="Keep records current"
              />

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {actions.map(([label, href, Icon]) => (
                  <Link
                    key={label}
                    to={href}
                    className="group rounded-3xl border border-border bg-background p-5 transition hover:border-primary"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-3 text-sm font-semibold text-foreground">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </span>

                        {label}
                      </span>

                      <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
                    </div>

                    <p className="mt-3 text-xs leading-5 text-muted-foreground">
                      Open the {label.toLowerCase()} workspace.
                    </p>
                  </Link>
                ))}
              </div>
            </VSCardContent>
          </VSCard>

          <VSCard className="rounded-[2rem] bg-ink text-white">
            <VSCardContent className="p-6 sm:p-8">
              <p className="eyebrow text-white/60">
                Admin principle
              </p>

              <h2 className="mt-3 text-3xl font-semibold">
                Build trust at every handoff.
              </h2>

              <p className="mt-4 text-sm leading-7 text-white/70">
                Accurate event records, considered applications,
                reliable attendance, and certificates volunteers
                can share with pride.
              </p>

              <Link
                to="/admin/applications"
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white"
              >
                Review applications
                <ArrowRight className="h-4 w-4" />
              </Link>
            </VSCardContent>
          </VSCard>
        </div>
      </div>
    </AdminGate>
  );
}