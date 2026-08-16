import {
  CalendarDays,
  Clock3,
  Download,
  TrendingUp,
  Users,
} from "lucide-react";

import { AdminLayout } from "@/components/layouts/AdminLayout";
import {
  VSButton,
  VSCard,
  VSCardContent,
  VSPageHeader,
} from "@/components/design-system";

import { adminService } from "@/services/adminService";

export function AdminHoursPage() {
  const volunteers = adminService.getVolunteers();

  const totalHours = volunteers.reduce(
    (sum, volunteer) => sum + volunteer.hours,
    0,
  );

  const totalEvents = volunteers.reduce(
    (sum, volunteer) => sum + volunteer.events,
    0,
  );

  const averageHours =
    volunteers.length > 0
      ? Math.round(totalHours / volunteers.length)
      : 0;

  return (
    <AdminLayout title="Volunteer hours" eyebrow="Impact">
      <div className="mx-auto max-w-7xl">
        <VSPageHeader
          eyebrow="Impact"
          title="Volunteer hours"
          description="Track volunteer contribution, participation, and accumulated service hours."
          action={
            <VSButton variant="outline">
              <Download className="h-4 w-4" />
              Export report
            </VSButton>
          }
        />

        {/* Summary */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <VSCard className="rounded-[1.5rem]">
            <VSCardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Total hours
                </p>

                <Clock3 className="h-5 w-5 text-primary" />
              </div>

              <p className="mt-3 text-3xl font-semibold">
                {totalHours}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Recorded volunteer hours
              </p>
            </VSCardContent>
          </VSCard>

          <VSCard className="rounded-[1.5rem]">
            <VSCardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Volunteers
                </p>

                <Users className="h-5 w-5 text-primary" />
              </div>

              <p className="mt-3 text-3xl font-semibold">
                {volunteers.length}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                With recorded activity
              </p>
            </VSCardContent>
          </VSCard>

          <VSCard className="rounded-[1.5rem]">
            <VSCardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Events supported
                </p>

                <CalendarDays className="h-5 w-5 text-primary" />
              </div>

              <p className="mt-3 text-3xl font-semibold">
                {totalEvents}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Volunteer event participation
              </p>
            </VSCardContent>
          </VSCard>

          <VSCard className="rounded-[1.5rem]">
            <VSCardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Avg. hours
                </p>

                <TrendingUp className="h-5 w-5 text-primary" />
              </div>

              <p className="mt-3 text-3xl font-semibold">
                {averageHours}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Hours per volunteer
              </p>
            </VSCardContent>
          </VSCard>
        </div>

        {/* Volunteer table */}
        <VSCard className="mt-6 rounded-[1.75rem]">
          <VSCardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Volunteer
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Events
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Hours
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>

                    <th className="px-6 py-5" />
                  </tr>
                </thead>

                <tbody>
                  {volunteers.map((volunteer) => (
                    <tr
                      key={volunteer.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {volunteer.name
                              .slice(0, 1)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="font-medium">
                              {volunteer.name}
                            </p>

                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {volunteer.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm">
                        {volunteer.events}
                      </td>

                      <td className="px-6 py-5">
                        <span className="font-semibold">
                          {volunteer.hours}h
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-full border border-border px-3 py-1.5 text-xs font-medium">
                          {volunteer.status}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-right">
                        <VSButton
                          variant="outline"
                          size="sm"
                        >
                          View
                        </VSButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </VSCardContent>
        </VSCard>
      </div>
    </AdminLayout>
  );
}