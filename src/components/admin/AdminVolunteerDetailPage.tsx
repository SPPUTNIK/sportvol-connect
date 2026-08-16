import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { AdminGate } from "./components/AdminGate";
import {
  VSButton,
  VSCard,
  VSCardContent,
  VSEmptyState,
  VSPageHeader,
  VSSectionHeader,
  VSStatCard,
  VSStatusBadge,
} from "@/components/design-system";

import { adminService } from "@/services/adminService";

export function AdminVolunteerDetailPage({
  volunteerId,
}: {
  volunteerId: string;
}) {
  const volunteers = adminService.getVolunteers();

  const volunteer =
    volunteers.find(
      (item) => item.id === volunteerId,
    ) ?? null;

  if (!volunteer) {
    return (
      <AdminGate title="Volunteer profile">
        <div className="mx-auto max-w-6xl">
          <VSEmptyState
            title="Volunteer not found"
            description="The volunteer record you are trying to access does not exist."
            action={
              <VSButton asChild>
                <Link to="/admin/volunteers">
                  <ArrowLeft className="h-4 w-4" />
                  Back to volunteers
                </Link>
              </VSButton>
            }
          />
        </div>
      </AdminGate>
    );
  }

  const applications = adminService.getApplications();
  const allEvents = adminService.getEvents();

  /**
   * Find only the events connected to this volunteer
   * through their applications.
   */
  const volunteerEventIds = new Set(
    applications
      .filter(
        (application) =>
          application.volunteerId === volunteer.id,
      )
      .map((application) => application.eventId),
  );

  const events = allEvents.filter((event) =>
    volunteerEventIds.has(event.id),
  );

  return (
    <AdminGate title="Volunteer profile">
      <div className="mx-auto max-w-6xl">
        <VSButton
          asChild
          variant="ghost"
          className="mb-5"
        >
          <Link to="/admin/volunteers">
            <ArrowLeft className="h-4 w-4" />
            Back to volunteers
          </Link>
        </VSButton>

        <VSPageHeader
          eyebrow="Volunteer record"
          title={volunteer.name}
          description={`${volunteer.id} · ${volunteer.city}`}
          action={
            <VSButton variant="outline">
              <Mail className="h-4 w-4" />
              Contact
            </VSButton>
          }
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <VSStatCard
            label="Events supported"
            value={volunteer.events}
            icon={<CalendarDays className="h-5 w-5" />}
          />

          <VSStatCard
            label="Official hours"
            value={volunteer.hours}
            icon={<BarChart3 className="h-5 w-5" />}
            accent
          />

          <VSStatCard
            label="Certificates"
            value={volunteer.certificates}
            icon={<ShieldCheck className="h-5 w-5" />}
          />
        </div>

        <VSCard className="mt-6 rounded-[2rem] border-border">
          <VSCardContent className="p-6 sm:p-8">
            <VSSectionHeader
              eyebrow="Volunteer history"
              title="Event participation"
            />

            <div className="mt-5 space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-border p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {event.title}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {event.startDate} · {event.sport}
                    </p>
                  </div>

                  <VSStatusBadge status="Completed" />
                </div>
              ))}

              {events.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No event participation recorded.
                </p>
              )}
            </div>
          </VSCardContent>
        </VSCard>
      </div>
    </AdminGate>
  );
}