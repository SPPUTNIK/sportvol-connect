import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Users,
  CheckCircle2,
  FileClock,
  Archive,
  CalendarDays,
} from "lucide-react";

import {
  VSPageHeader,
  VSCard,
  VSCardContent,
  VSCardHeader,
  VSCardTitle,
  VSButton,
  VSLoadingState,
  VSEmptyState,
  VSModal,
  VSModalContent,
  VSModalHeader,
  VSModalTitle,
  VSModalFooter,
  VSStatusBadge,
} from "@/components/design-system";

import committeeService from "@/services/admin/committeeService";

import type { Committee } from "@/types/domain";

import CommitteeForm from "@/components/admin/CommitteeForm";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/committees/")({
  component: AdminCommitteesRoute,
});

function formatStatus(status: string) {
  switch (status) {
    case "active":
      return "Active";
    case "inactive":
      return "Inactive";
    case "archived":
      return "Archived";
    default:
      return status;
  }
}

type CommitteeEvent = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  status: string;
};

function AdminCommitteesRoute() {
  const [committees, setCommittees] = useState<Array<Committee & { leaderName?: string | null; leaderAvatarUrl?: string | null }> | null>(null);
  const [events, setEvents] = useState<CommitteeEvent[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState("");

  async function loadCommittees() {
    const { data, error } = await supabase
      .from("committees")
      .select(
        "*, leader:profiles!committees_leader_profile_id_fkey(id, first_name, last_name, avatar_url)",
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const mapped = (data ?? []).map((row: any) => {
      const mappedCommittee = committeeService.mapCommittee(row as any);
      const leader = row.leader ?? null;
      return {
        ...mappedCommittee,
        leaderName:
          leader && (leader.first_name || leader.last_name)
            ? `${leader.first_name ?? ""} ${leader.last_name ?? ""}`.trim()
            : null,
        leaderAvatarUrl: leader?.avatar_url ?? null,
      };
    });

    setCommittees(mapped);
  }

  async function openCreateModal() {
    setCreateOpen(true);

    if (events.length > 0) {
      return;
    }

    setEventsLoading(true);

    try {
      const data = await committeeService.listAvailableEvents();
      setEvents(data);
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setEventsLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await loadCommittees();

        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to load committees:", error);

        if (mounted) {
          setCommittees([]);
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredCommittees = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!committees) return [];
    if (!query) return committees;

    return committees.filter((committee) => {
      const leaderName = (committee.leaderName ?? "").toLowerCase();
      const eventTitle = events.find((item) => item.id === committee.eventId)?.title ?? "";
      return (
        committee.name.toLowerCase().includes(query) ||
        leaderName.includes(query) ||
        eventTitle.toLowerCase().includes(query)
      );
    });
  }, [committees, events, search]);

  const total = committees?.length ?? 0;

  const active =
    committees?.filter((c) => c.status === "active").length ?? 0;

  const inactive =
    committees?.filter((c) => c.status === "inactive").length ?? 0;

  const archived =
    committees?.filter((c) => c.status === "archived").length ?? 0;

  return (
    <AdminLayout title="Committees">
      <div className="mx-auto max-w-7xl">
        <VSPageHeader
          eyebrow="Organization"
          title="Committees"
          description="Create and manage committees responsible for supporting your sporting events."
          action={
            <VSButton onClick={() => void openCreateModal()}>
              <Plus className="h-4 w-4" />
              Create committee
            </VSButton>
          }
        />

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <VSCard className="rounded-[1.75rem] border-border">
            <VSCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total committees
                  </p>

                  <p className="mt-2 text-3xl font-semibold">
                    {total}
                  </p>
                </div>

                <Users className="h-6 w-6 text-primary" />
              </div>
            </VSCardContent>
          </VSCard>

          <VSCard className="rounded-[1.75rem] border-border">
            <VSCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Active
                  </p>

                  <p className="mt-2 text-3xl font-semibold">
                    {active}
                  </p>
                </div>

                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
            </VSCardContent>
          </VSCard>

          <VSCard className="rounded-[1.75rem] border-border">
            <VSCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Inactive
                  </p>

                  <p className="mt-2 text-3xl font-semibold">
                    {inactive}
                  </p>
                </div>

                <FileClock className="h-6 w-6 text-primary" />
              </div>
            </VSCardContent>
          </VSCard>

          <VSCard className="rounded-[1.75rem] border-border">
            <VSCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Archived
                  </p>

                  <p className="mt-2 text-3xl font-semibold">
                    {archived}
                  </p>
                </div>

                <Archive className="h-6 w-6 text-primary" />
              </div>
            </VSCardContent>
          </VSCard>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-8">
            <VSLoadingState message="Loading committees…" />
          </div>
        )}

        {/* Empty */}
        {!loading && committees?.length === 0 && (
          <div className="mt-8">
            <VSEmptyState
              title="No committees yet"
              description="Create your first committee and assign volunteers to it."
              action={
                <VSButton onClick={() => void openCreateModal()}>
                  <Plus className="h-4 w-4" />
                  Create committee
                </VSButton>
              }
            />
          </div>
        )}

        <div className="mt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Committee list</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {filteredCommittees.length} {filteredCommittees.length === 1 ? "committee" : "committees"}
              </p>
            </div>

            <div className="w-full max-w-sm">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by committee or leader name"
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Committee cards */}
        {!loading && filteredCommittees.length > 0 && (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredCommittees.map((committee) => {
              const event = events.find(
                (item) => item.id === committee.eventId,
              );

              return (
                <VSCard
                  key={committee.id}
                  className="rounded-[1.75rem] border-border"
                >
                  <VSCardHeader className="p-6 pb-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <VSCardTitle className="truncate">
                          {committee.name}
                        </VSCardTitle>

                        {event && (
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <CalendarDays className="h-3.5 w-3.5" />

                            <span className="truncate">
                              {event.title}
                            </span>
                          </div>
                        )}
                      </div>

                      <VSStatusBadge
                        status={formatStatus(committee.status)}
                      />
                    </div>
                  </VSCardHeader>

                  <VSCardContent className="p-6">
                    <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {committee.description ||
                        "No description provided."}
                    </p>

                    <div className="mt-5 rounded-2xl bg-muted/40 p-4">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">Leader</span>

                        {committee.leaderProfileId ? (
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                              {committee.leaderAvatarUrl ? (
                                <img
                                  src={committee.leaderAvatarUrl}
                                  alt={committee.leaderName ?? "Committee leader"}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                (committee.leaderName ?? "L").slice(0, 2).toUpperCase()
                              )}
                            </div>
                            <span className="font-medium text-foreground">
                              {committee.leaderName ?? "Assigned"}
                            </span>
                          </div>
                        ) : (
                          <span className="font-medium">Not assigned</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-5">
                      <Link
                        to="/admin/committees/$committeeId"
                        params={{
                          committeeId: committee.id,
                        }}
                        className="inline-flex"
                      >
                        <VSButton
                          variant="outline"
                          size="sm"
                          type="button"
                        >
                          View details
                        </VSButton>
                      </Link>
                    </div>
                  </VSCardContent>
                </VSCard>
              );
            })}
          </div>
        )}

        {/* Create modal */}
        <VSModal
          open={createOpen}
          onOpenChange={(open) => {
            setCreateOpen(open);

            if (!open) {
              setSelectedEventId("");
            }
          }}
        >
          <VSModalContent>
            <VSModalHeader>
              <VSModalTitle>Create Committee</VSModalTitle>
            </VSModalHeader>

            <div className="space-y-5 p-6">
              {/* Event selection */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Event
                </label>

                {eventsLoading ? (
                  <div className="rounded-xl border p-3 text-sm text-muted-foreground">
                    Loading events…
                  </div>
                ) : events.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                    No published events are available.
                  </div>
                ) : (
                  <select
                    value={selectedEventId}
                    onChange={(e) =>
                      setSelectedEventId(e.target.value)
                    }
                    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select an event</option>

                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Committee form */}
              {selectedEventId ? (
                <CommitteeForm
                  eventId={selectedEventId}
                  onSaved={async () => {
                    setCreateOpen(false);
                    setSelectedEventId("");

                    await loadCommittees();
                  }}
                />
              ) : (
                <div className="rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">
                  Select an event before creating the committee.
                </div>
              )}
            </div>

            <VSModalFooter />
          </VSModalContent>
        </VSModal>
      </div>
    </AdminLayout>
  );
}

export default AdminCommitteesRoute;