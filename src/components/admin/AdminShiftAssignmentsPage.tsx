import { useEffect, useMemo, useState } from "react";
import { Eye, LoaderCircle, Pencil, Plus, Search, Trash2 } from "lucide-react";

import { AdminLayout } from "@/components/layouts/AdminLayout";
import {
  VSButton,
  VSCard,
  VSCardContent,
  VSEmptyState,
  VSInput,
  VSLoadingState,
  VSErrorState,
  VSPageHeader,
} from "@/components/design-system";
import { supabase } from "@/lib/supabase";

type ProfileRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  avatar_url?: string | null;
};

type ShiftOption = {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  event_id: string;
};

type AssignmentRow = {
  id: string;
  shift_id: string;
  profile_id: string;
  status: string;
  assigned_at: string | null;
  updated_at: string | null;
  profiles?: ProfileRow | null;
  event_shifts?: ShiftOption | null;
};

const defaultSearch = "";

export function AdminShiftAssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [shifts, setShifts] = useState<ShiftOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(defaultSearch);
  const [dateFilter, setDateFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [showShiftList, setShowShiftList] = useState(true);
  const [draggedVolunteerId, setDraggedVolunteerId] = useState<string | null>(null);
  const [addingVolunteerId, setAddingVolunteerId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [assignmentsRes, profilesRes, shiftsRes] = await Promise.all([
        supabase
          .from("shift_assignments")
          .select(
            "*, profiles!shift_assignments_profile_id_fkey(id, first_name, last_name, email, avatar_url), event_shifts!shift_assignments_shift_id_fkey(id, title, date, start_time, end_time, event_id)"
          )
          .order("assigned_at", { ascending: false }),
        supabase
          .from("profiles")
          .select("id, first_name, last_name, email, avatar_url")
          .order("first_name", { ascending: true }),
        supabase
          .from("event_shifts")
          .select("id, title, date, start_time, end_time, event_id")
          .order("date", { ascending: true }),
      ]);

      if (assignmentsRes.error) throw assignmentsRes.error;
      if (profilesRes.error) throw profilesRes.error;
      if (shiftsRes.error) throw shiftsRes.error;

      setAssignments((assignmentsRes.data ?? []) as AssignmentRow[]);
      setProfiles((profilesRes.data ?? []) as ProfileRow[]);
      setShifts((shiftsRes.data ?? []) as ShiftOption[]);
    } catch (err) {
      console.error("Failed to load shift assignments:", err);
      setError(err instanceof Error ? err.message : "Failed to load shift assignments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const assignedByShift = useMemo(() => {
    const map = new Map<string, AssignmentRow[]>();

    assignments.forEach((assignment) => {
      if (!map.has(assignment.shift_id)) {
        map.set(assignment.shift_id, []);
      }
      map.get(assignment.shift_id)?.push(assignment);
    });

    return map;
  }, [assignments]);

  const profileInitials = (profile: ProfileRow | null | undefined) => {
    const initials = `${profile?.first_name?.charAt(0) ?? ""}${profile?.last_name?.charAt(0) ?? ""}`.trim();
    return initials || "V";
  };

  const profileDisplayName = (profile: ProfileRow | null | undefined) => {
    const lastName = profile?.last_name?.trim();
    if (lastName) return lastName;
    if (profile?.first_name?.trim()) return profile.first_name.trim();
    return "Volunteer";
  };

  const selectedShift = useMemo(
    () => shifts.find((shift) => shift.id === selectedShiftId) ?? null,
    [selectedShiftId, shifts],
  );

  const handleViewShiftDetails = (shiftId: string) => {
    setSelectedShiftId(shiftId);
    setShowShiftList(false);
  };

  const handleBackToShifts = () => {
    setSelectedShiftId(null);
    setShowShiftList(true);
  };

  const selectedShiftAssignments = useMemo(
    () => (selectedShift ? assignedByShift.get(selectedShift.id) ?? [] : []),
    [assignedByShift, selectedShift],
  );

  const selectedAssignedProfileIds = useMemo(
    () => new Set(selectedShiftAssignments.map((assignment) => assignment.profile_id)),
    [selectedShiftAssignments],
  );

  const availableVolunteers = useMemo(() => {
    if (!selectedShift) return [];

    const query = search.trim().toLowerCase();

    return profiles.filter((profile) => {
      if (selectedAssignedProfileIds.has(profile.id)) return false;

      const fullName = `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim().toLowerCase();
      const email = (profile.email ?? "").toLowerCase();
      const matchesQuery = !query || fullName.includes(query) || email.includes(query);

      return matchesQuery;
    });
  }, [profiles, search, selectedAssignedProfileIds, selectedShift]);

  const assignedVolunteers = useMemo(
    () => profiles.filter((profile) => selectedAssignedProfileIds.has(profile.id)),
    [profiles, selectedAssignedProfileIds],
  );

  const filteredShifts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return [...shifts]
      .filter((shift) => {
        const matchesSearch =
          !normalizedSearch ||
          shift.title.toLowerCase().includes(normalizedSearch) ||
          `${shift.start_time} - ${shift.end_time}`.includes(normalizedSearch);
        const matchesDate = !dateFilter || shift.date === dateFilter;
        const matchesTime =
          timeFilter === "all" ||
          (timeFilter === "day" && shift.start_time < "18:00") ||
          (timeFilter === "evening" && shift.start_time >= "18:00");

        return matchesSearch && matchesDate && matchesTime;
      })
      .sort((a, b) => {
        const left = new Date(`${a.date}T${a.start_time}`).getTime();
        const right = new Date(`${b.date}T${b.start_time}`).getTime();
        return sortOrder === "newest" ? right - left : left - right;
      });
  }, [dateFilter, search, shifts, sortOrder, timeFilter]);

  const handleAssignVolunteer = async (profileId: string, shiftId: string) => {
    if (!profileId || !shiftId) return;

    const existingAssignment = assignments.find(
      (assignment) => assignment.profile_id === profileId && assignment.shift_id === shiftId,
    );

    if (existingAssignment) {
      setDraggedVolunteerId(null);
      return;
    }

    try {
      setAddingVolunteerId(profileId);
      const { error } = await supabase.from("shift_assignments").insert({
        profile_id: profileId,
        shift_id: shiftId,
        status: "assigned",
      });

      if (error) throw error;

      setDraggedVolunteerId(null);
      await loadData();
    } catch (err) {
      console.error("Failed to assign volunteer to shift:", err);
      setError(err instanceof Error ? err.message : "Failed to assign volunteer to shift.");
    } finally {
      setAddingVolunteerId(null);
    }
  };

  const handleRemoveVolunteer = async (profileId: string, shiftId: string) => {
    const assignment = assignments.find(
      (item) => item.profile_id === profileId && item.shift_id === shiftId,
    );

    if (!assignment) return;

    const confirmed = window.confirm("Remove this volunteer from the shift?");
    if (!confirmed) return;

    try {
      const { error } = await supabase.from("shift_assignments").delete().eq("id", assignment.id);
      if (error) throw error;
      await loadData();
    } catch (err) {
      console.error("Failed to remove volunteer from shift:", err);
      setError(err instanceof Error ? err.message : "Failed to remove volunteer from shift.");
    }
  };

  const stats = useMemo(
    () => ({
      total: assignments.length,
      assigned: assignments.filter((item) => item.status === "assigned").length,
      removed: assignments.filter((item) => item.status === "removed").length,
      completed: assignments.filter((item) => item.status === "completed").length,
    }),
    [assignments],
  );

  return (
    <AdminLayout title="Shift assignments" eyebrow="Operations">
      <div className="mx-auto max-w-7xl">
        <VSPageHeader
          eyebrow="Operations"
          title="Shift assignments"
          description="Each shift lists the volunteers assigned to it, with direct details and in-page assignment controls."
        />

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <VSCard className="rounded-[1.5rem] border-border">
            <VSCardContent className="p-5">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="mt-2 text-3xl font-semibold">{stats.total}</p>
            </VSCardContent>
          </VSCard>
          <VSCard className="rounded-[1.5rem] border-border">
            <VSCardContent className="p-5">
              <p className="text-sm text-muted-foreground">Assigned</p>
              <p className="mt-2 text-3xl font-semibold">{stats.assigned}</p>
            </VSCardContent>
          </VSCard>
          <VSCard className="rounded-[1.5rem] border-border">
            <VSCardContent className="p-5">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="mt-2 text-3xl font-semibold">{stats.completed}</p>
            </VSCardContent>
          </VSCard>
          <VSCard className="rounded-[1.5rem] border-border">
            <VSCardContent className="p-5">
              <p className="text-sm text-muted-foreground">Removed</p>
              <p className="mt-2 text-3xl font-semibold">{stats.removed}</p>
            </VSCardContent>
          </VSCard>
        </div>

        {loading ? (
          <div className="mt-8">
            <VSLoadingState />
          </div>
        ) : error ? (
          <div className="mt-8">
            <VSErrorState description={error} />
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="flex flex-col gap-3 rounded-[1.5rem] border border-border bg-card p-4 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-sm">
                <VSInput
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search shift or time"
                  className="pr-10"
                />
              </div>

              <div className="flex flex-wrap gap-2 md:items-center">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(event) => setDateFilter(event.target.value)}
                  className="rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary/20"
                />

                <select
                  value={timeFilter}
                  onChange={(event) => setTimeFilter(event.target.value)}
                  className="rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All times</option>
                  <option value="day">Day</option>
                  <option value="evening">Evening</option>
                </select>

                <select
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value as "newest" | "oldest")}
                  className="rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary/20"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>
            </div>

            {!showShiftList && selectedShift ? (
              <div className="space-y-4">
                <VSButton variant="outline" size="sm" onClick={handleBackToShifts}>
                  Back to shifts
                </VSButton>

                <VSCard className="rounded-[1.5rem] border-border">
                  <VSCardContent className="p-5">
                    <div className="flex flex-col gap-6">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                          Shift details
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold">{selectedShift.title}</h3>
                        <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span>{selectedShift.date}</span>
                          <span>•</span>
                          <span>
                            {selectedShift.start_time} - {selectedShift.end_time}
                          </span>
                        </div>
                      </div>

                      <div className="grid gap-6 lg:grid-cols-2">
                        <div className="space-y-4 rounded-[1.5rem] border border-border bg-muted/10 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <h4 className="text-lg font-semibold">Assigned Volunteers</h4>
                            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                              {assignedVolunteers.length}
                            </span>
                          </div>

                          {assignedVolunteers.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
                              No volunteers assigned to this shift yet.
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {assignedVolunteers.map((profile) => (
                                <div
                                  key={profile.id}
                                  className="flex items-center gap-2 rounded-full border border-border bg-background px-2.5 py-1.5"
                                >
                                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                                    {profile.avatar_url ? (
                                      <img
                                        src={profile.avatar_url}
                                        alt={profileDisplayName(profile)}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      profileInitials(profile)
                                    )}
                                  </div>
                                  <span className="text-sm font-medium">{profileDisplayName(profile)}</span>
                                  <button
                                    type="button"
                                    className="ml-1 text-muted-foreground transition hover:text-destructive"
                                    onClick={() => void handleRemoveVolunteer(profile.id, selectedShift.id)}
                                    aria-label={`Remove ${profileDisplayName(profile)}`}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="space-y-4 rounded-[1.5rem] border border-border bg-muted/10 p-4">
                          <div>
                            <h4 className="text-lg font-semibold">Add Volunteers</h4>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Search and drop volunteers into this shift.
                            </p>
                          </div>

                          <div className="flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2.5">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <VSInput
                              value={search}
                              onChange={(event) => setSearch(event.target.value)}
                              placeholder="Search volunteers"
                              className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                            />
                          </div>

                          <div
                            className="grid max-h-72 gap-2 overflow-y-auto rounded-xl border border-dashed border-border bg-background p-2"
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) => {
                              event.preventDefault();
                              const volunteerId = event.dataTransfer.getData("text/plain") || draggedVolunteerId;
                              if (volunteerId && selectedShift) {
                                void handleAssignVolunteer(volunteerId, selectedShift.id);
                              }
                              setDraggedVolunteerId(null);
                            }}
                          >
                            {availableVolunteers.length === 0 ? (
                              <p className="p-2 text-sm text-muted-foreground">
                                No more volunteers available for this event.
                              </p>
                            ) : (
                              availableVolunteers.map((profile) => (
                                <div
                                  key={profile.id}
                                  draggable
                                  onDragStart={(event) => {
                                    event.dataTransfer.effectAllowed = "copy";
                                    event.dataTransfer.setData("text/plain", profile.id);
                                    setDraggedVolunteerId(profile.id);
                                  }}
                                  onDragEnd={() => setDraggedVolunteerId(null)}
                                  onClick={() => {
                                    if (selectedShift) {
                                      void handleAssignVolunteer(profile.id, selectedShift.id);
                                    }
                                  }}
                                  className="flex cursor-grab items-center justify-between gap-3 rounded-xl border border-border bg-background p-2.5 transition hover:border-primary hover:bg-primary/5 active:cursor-grabbing"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                                      {profile.avatar_url ? (
                                        <img
                                          src={profile.avatar_url}
                                          alt={profileDisplayName(profile)}
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        profileInitials(profile)
                                      )}
                                    </div>
                                    <span className="text-sm font-medium">{profileDisplayName(profile)}</span>
                                  </div>

                                  {addingVolunteerId === profile.id ? (
                                    <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
                                  ) : (
                                    <Plus className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </VSCardContent>
                </VSCard>
              </div>
            ) : filteredShifts.length === 0 ? (
              <VSEmptyState
                title="No shifts match your filters"
                description="Try another search, date, or time range."
              />
            ) : (
              <div className="space-y-4">
                {filteredShifts.map((shift) => {
                  const shiftAssignments = assignedByShift.get(shift.id) ?? [];
                  const visibleAssigned = shiftAssignments.slice(0, 6);
                  const hasMore = shiftAssignments.length > visibleAssigned.length;

                  return (
                    <VSCard key={shift.id} className="rounded-[1.5rem] border-border">
                      <VSCardContent className="p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                              Shift
                            </p>
                            <h3 className="mt-1 text-xl font-semibold">{shift.title}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {shift.date} · {shift.start_time} - {shift.end_time}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <VSButton
                              variant={selectedShiftId === shift.id ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleViewShiftDetails(shift.id)}
                            >
                              <Eye className="h-4 w-4" />
                              View details
                            </VSButton>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          {visibleAssigned.length === 0 ? (
                            <span className="rounded-full border border-dashed border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                              No volunteers assigned
                            </span>
                          ) : (
                            visibleAssigned.map((assignment) => {
                              const volunteer = profiles.find((profile) => profile.id === assignment.profile_id);

                              return (
                                <div
                                  key={assignment.id}
                                  className="flex items-center gap-2 rounded-full border border-border bg-background px-2 py-1.5"
                                >
                                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                                    {volunteer?.avatar_url ? (
                                      <img
                                        src={volunteer.avatar_url}
                                        alt={profileDisplayName(volunteer)}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      profileInitials(volunteer)
                                    )}
                                  </div>
                                  <span className="text-sm font-medium">{profileDisplayName(volunteer)}</span>
                                </div>
                              );
                            })
                          )}

                          {hasMore ? (
                            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                              +{shiftAssignments.length - visibleAssigned.length} more
                            </span>
                          ) : null}
                        </div>
                      </VSCardContent>
                    </VSCard>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
