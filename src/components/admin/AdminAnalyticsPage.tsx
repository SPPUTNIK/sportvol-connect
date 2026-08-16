import { AdminGate } from "./components/AdminGate";

import {
  VSCard,
  VSCardContent,
  VSPageHeader,
  VSSectionHeader,
} from "@/components/design-system";

import { adminService } from "@/services/adminService";

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}

export function AdminAnalyticsPage() {
  const analytics = adminService.getAnalytics();
  const reports = adminService.getReports();

  const max =
    analytics.length > 0
      ? Math.max(...analytics.map((item) => item.value))
      : 1;

  const attendance =
    reports.find((item) => item.label === "Attendance")?.value ??
    "—";

  const training =
    reports.find((item) => item.label === "Training")?.value ??
    "—";

  const hours =
    reports.find((item) => item.label === "Hours")?.value ??
    "—";

  return (
    <AdminGate title="Analytics">
      <div className="mx-auto max-w-7xl">
        <VSPageHeader
          eyebrow="Reporting"
          title="Analytics"
          description="Understand the mix of volunteers, events, sports, roles, attendance, and hours."
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <VSCard className="rounded-[2rem] border-border">
            <VSCardContent className="p-6 sm:p-8">
              <VSSectionHeader
                eyebrow="Sports"
                title="Volunteer interest by sport"
              />

              <div className="mt-8 space-y-5">
                {analytics.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">
                        {item.label}
                      </span>

                      <span className="text-muted-foreground">
                        {item.value}%
                      </span>
                    </div>

                    <div className="mt-2 h-3 rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{
                          width: `${(item.value / max) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </VSCardContent>
          </VSCard>

          <VSCard className="rounded-[2rem] border-border">
            <VSCardContent className="p-6 sm:p-8">
              <VSSectionHeader
                eyebrow="Operational health"
                title="What to watch"
              />

              <div className="mt-6 space-y-5">
                <Info
                  label="Attendance"
                  value={`${attendance} verified`}
                />

                <Info
                  label="Training completion"
                  value={`${training} of assigned volunteers`}
                />

                <Info
                  label="Hours this cycle"
                  value={`${hours} official hours`}
                />

                <Info
                  label="Role coverage"
                  value="—"
                />
              </div>
            </VSCardContent>
          </VSCard>
        </div>
      </div>
    </AdminGate>
  );
}