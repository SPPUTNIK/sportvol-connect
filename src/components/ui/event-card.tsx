import { Link } from "@tanstack/react-router";
import { MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Event } from "@/lib/types";
import { eventCoverDefaults } from "@/lib/mock-data";

export function EventCard({ event }: { event: Event }) {
  const filled = event.event_roles?.reduce((sum, role) => sum + role.filled_positions, 0) ?? 0;
  const available = event.total_volunteers_needed - filled;
  const cover = event.cover_url ?? eventCoverDefaults[event.sport] ?? eventCoverDefaults.Running;

  return (
    <Card className="group overflow-hidden">
      <div className="h-52 overflow-hidden bg-slate-950">
        <img
          src={cover}
          alt={event.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{event.title}</CardTitle>
            <CardDescription>
              {event.city} · {event.venue}
            </CardDescription>
          </div>
          <div className="rounded-full bg-muted px-3 py-1 text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground">
            {event.sport}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl bg-background p-4 text-sm">
            <p className="text-muted-foreground">Date</p>
            <p className="font-medium text-foreground">{event.start_date}</p>
          </div>
          <div className="rounded-3xl bg-background p-4 text-sm">
            <p className="text-muted-foreground">Available roles</p>
            <p className="font-medium text-foreground">{available}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {filled} / {event.total_volunteers_needed} filled
          </p>
          <Link
            to="/events/$eventId"
            params={{ eventId: event.id }}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            View role
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
