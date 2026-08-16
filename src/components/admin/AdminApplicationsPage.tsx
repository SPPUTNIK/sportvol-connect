import { useState } from "react";

import { AdminGate } from "./components/AdminGate";
import {
  formatDate,
  formatStatus,
  normalizeStatus,
  type AdminStatus,
} from "./components/adminHelpers";

import {
  VSButton,
  VSEmptyState,
  VSInput,
  VSPageHeader,
  VSStatusBadge,
} from "@/components/design-system";

import { adminService } from "@/services/adminService";

export function AdminApplicationsPage() {
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");

  const [items, setItems] = useState(() =>
    adminService.getApplications().map((item) => ({
      ...item,
      status: normalizeStatus(item.status),
    })),
  );

  const rows = items.filter((item) => {
    const search = query.toLowerCase().trim();

    const matchesQuery =
      !search ||
      `${item.volunteer} ${item.event} ${item.role}`
        .toLowerCase()
        .includes(search);

    const matchesStatus =
      status === "all" ||
      normalizeStatus(item.status) ===
        normalizeStatus(status);

    return matchesQuery && matchesStatus;
  });

  const update = (
    id: string,
    next: AdminStatus,
  ) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status: next,
            }
          : item,
      ),
    );
  };

  return (
    <AdminGate title="Applications">
      <div className="mx-auto max-w-7xl">
        <VSPageHeader
          eyebrow="Volunteers"
          title="Applications"
          description="Review, triage, and place volunteers into the right opportunities."
        />

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <VSInput
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search applicants, events, or roles"
            />
          </div>

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            className="h-11 rounded-2xl border border-border bg-card px-4 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="waitlisted">Waitlisted</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>

        <div className="mt-6 overflow-hidden rounded-[2rem] border border-border bg-card">
          {rows.length === 0 ? (
            <div className="p-8">
              <VSEmptyState
                title="No applications found"
                description="Try another search or status filter."
              />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {rows.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between lg:p-6"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {item.volunteer}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.event} · {item.role}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Applied {formatDate(item.date)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <VSStatusBadge
                      status={formatStatus(item.status)}
                    />

                    <VSButton variant="outline" size="sm">
                      Assign role
                    </VSButton>

                    <VSButton
                      size="sm"
                      onClick={() =>
                        update(item.id, "accepted")
                      }
                    >
                      Accept
                    </VSButton>

                    <VSButton
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        update(item.id, "rejected")
                      }
                    >
                      Reject
                    </VSButton>

                    <VSButton
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        update(item.id, "waitlisted")
                      }
                    >
                      Waitlist
                    </VSButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminGate>
  );
}