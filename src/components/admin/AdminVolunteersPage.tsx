import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { AdminGate } from "./components/AdminGate";
import {
  formatStatus,
  getInitials,
} from "./components/adminHelpers";

import {
  VSButton,
  VSCard,
  VSCardContent,
  VSEmptyState,
  VSInput,
  VSPageHeader,
  VSStatusBadge,
} from "@/components/design-system";

import { adminService } from "@/services/adminService";

function Stat({
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

export function AdminVolunteersPage() {
  const [query, setQuery] = useState("");

  const rows = adminService
    .getVolunteers()
    .filter((item) =>
      `${item.name} ${item.city} ${item.id}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );

  return (
    <AdminGate title="Volunteers">
      <div className="mx-auto max-w-7xl">
        <VSPageHeader
          eyebrow="Volunteer directory"
          title="Volunteers"
          description="Understand the people powering every event and the impact they are building."
        />

        <div className="mt-8 max-w-xl">
          <VSInput
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Search by name, city, or volunteer ID"
          />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {rows.length === 0 ? (
            <div className="lg:col-span-2">
              <VSEmptyState
                title="No volunteers found"
                description="Try searching by name, city, or volunteer ID."
              />
            </div>
          ) : (
            rows.map((item) => (
              <VSCard
                key={item.id}
                className="rounded-[1.75rem] border-border"
              >
                <VSCardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">
                        {getInitials(item.name)}
                      </div>

                      <div>
                        <h2 className="text-lg font-semibold text-foreground">
                          {item.name}
                        </h2>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.id} · {item.city}
                        </p>
                      </div>
                    </div>

                    <VSStatusBadge
                      status={formatStatus(item.status)}
                    />
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-4">
                    <Stat
                      label="Events"
                      value={item.events}
                    />

                    <Stat
                      label="Hours"
                      value={item.hours}
                    />

                    <Stat
                      label="Attendance"
                      value={item.attendance}
                    />
                  </div>

                  <VSButton
                    asChild
                    variant="outline"
                    size="sm"
                  >
                    <Link
                      to="/admin/volunteers/$volunteerId"
                      params={{
                        volunteerId: item.id,
                      }}
                    >
                      View profile
                    </Link>
                  </VSButton>
                </VSCardContent>
              </VSCard>
            ))
          )}
        </div>
      </div>
    </AdminGate>
  );
}