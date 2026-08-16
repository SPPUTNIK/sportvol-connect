import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Plus,
  Settings,
} from "lucide-react";

import { AdminGate } from "../components/AdminGate";
import {
  formatStatus,
  normalizeStatus,
} from "../components/adminHelpers";

import {
  VSButton,
  VSCard,
  VSCardContent,
  VSEmptyState,
  VSPageHeader,
  VSSectionHeader,
  VSStatusBadge,
} from "@/components/design-system";

import { adminService } from "@/services/adminService";

function Info({
  label,
  value,
}: {
  label: string;
  value: string | number;
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

export function AdminEventDetailPage({
  eventId,
}: {
  eventId: string;
}) {
  const events = adminService.getEvents();

  const event =
    events.find((item) => item.id === eventId) ?? null;

  if (!event) {
    return (
      <AdminGate title="Event details">
        <div className="mx-auto max-w-6xl">
          <VSEmptyState
            title="Event not found"
            description="The event you are trying to manage does not exist."
            action={
              <VSButton asChild>
                <Link to="/admin/events">
                  <ArrowLeft className="h-4 w-4" />
                  Back to events
                </Link>
              </VSButton>
            }
          />
        </div>
      </AdminGate>
    );
  }

  return (
    <AdminGate title="Event details">
      <div className="mx-auto max-w-6xl">
        <VSButton asChild variant="ghost" className="mb-5">
          <Link to="/admin/events">
            <ArrowLeft className="h-4 w-4" />
            Back to events
          </Link>
        </VSButton>

        <VSPageHeader
          eyebrow="Event management"
          title={event.title}
          description={`${event.sport} · ${event.city} · ${event.date}`}
          action={
            <VSButton variant="outline">
              <Settings className="h-4 w-4" />
              Edit event
            </VSButton>
          }
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <VSCard className="rounded-[2rem] border-border">
            <VSCardContent className="p-6 sm:p-8">
              <VSSectionHeader
                eyebrow="Roles and shifts"
                title="Volunteer operations"
                action={
                  <VSButton size="sm">
                    <Plus className="h-4 w-4" />
                    Add role
                  </VSButton>
                }
              />

              <div className="mt-6 space-y-3">
                {[
                  "Route support volunteer",
                  "Accreditation support",
                  "Athlete welcome desk",
                ].map((role, index) => (
                  <div
                    key={role}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-border p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {role}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {index + 2} shifts ·{" "}
                        {12 + index * 8} positions
                      </p>
                    </div>

                    <VSButton variant="ghost" size="sm">
                      Edit
                    </VSButton>
                  </div>
                ))}
              </div>
            </VSCardContent>
          </VSCard>

          <VSCard className="rounded-[2rem] border-border">
            <VSCardContent className="p-6 sm:p-8">
              <VSSectionHeader
                eyebrow="Event status"
                title="At a glance"
              />

              <div className="mt-6 space-y-5">
                <Info
                  label="Status"
                  value={formatStatus(event.status)}
                />

                <Info
                  label="Volunteers"
                  value={`${event.volunteers} assigned`}
                />

                <Info
                  label="Shifts"
                  value={`${event.shifts} planned`}
                />

                <Info
                  label="Registration"
                  value={
                    normalizeStatus(event.status) ===
                    "published"
                      ? "Open"
                      : "Closed"
                  }
                />
              </div>
            </VSCardContent>
          </VSCard>
        </div>
      </div>
    </AdminGate>
  );
}