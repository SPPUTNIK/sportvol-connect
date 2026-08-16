import {
  CalendarDays,
  Clock3,
  MapPin,
  Plus,
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

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

export function AdminShiftsPage() {
  const shifts = adminService.getShifts();

  return (
    <AdminLayout title="Shifts" eyebrow="Event management">
      <div className="mx-auto max-w-7xl">
        <VSPageHeader
          eyebrow="Event management"
          title="Volunteer shifts"
          description="Organize volunteer schedules, time slots, and operational coverage."
          action={
            <VSButton>
              <Plus className="h-4 w-4" />
              Create shift
            </VSButton>
          }
        />

        <div className="mt-8 grid gap-4">
          {shifts.map((shift) => (
            <VSCard
              key={shift.id}
              className="rounded-[1.75rem] border-border"
            >
              <VSCardContent className="p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary">
                      {shift.event}
                    </p>

                    <h2 className="mt-1 text-lg font-semibold">
                      {shift.role}
                    </h2>

                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        {formatDate(shift.date)}
                      </span>

                      <span className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4" />
                        {shift.startTime} – {shift.endTime}
                      </span>

                      <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {shift.location}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        Volunteers
                      </p>

                      <p className="mt-1 flex items-center gap-2 font-semibold">
                        <Users className="h-4 w-4" />
                        {shift.volunteers}/{shift.capacity}
                      </p>
                    </div>

                    <VSButton variant="outline" size="sm">
                      Manage
                    </VSButton>
                  </div>
                </div>
              </VSCardContent>
            </VSCard>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}