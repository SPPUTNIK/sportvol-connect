import { createFileRoute } from '@tanstack/react-router'

import {
  CalendarDays,
  ChevronRight,
  Clock3,
  CheckCircle2,
  MapPin,
  Users,
  X,
} from "lucide-react";

import { leaderService } from "@/services/leader/leaderService";

import type {
  LeaderShift,
  LeaderShiftDetails,
} from "@/services/leader/leaderService";

import { cn } from "@/lib/utils";

import {
  VSCard,
  VSCardContent,
  VSPageHeader,
  VSEmptyState,
  VSLoadingState,
  VSStatusBadge,
} from "@/components/design-system";


import { useEffect, useMemo, useState } from "react";


export const Route = createFileRoute("/leader/shifts")({
  component: LeaderShiftsPage,
  head: () => ({ meta: [{ title: "Shifts | SportVol Connect" }] }),
});

export function LeaderShiftsPage() {
  const [activeTab, setActiveTab] = useState<
    "Today" | "Upcoming" | "Completed"
  >("Today");

  const [shifts, setShifts] = useState<LeaderShift[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedShift, setSelectedShift] =
    useState<LeaderShift | null>(null);

  const [shiftDetails, setShiftDetails] =
    useState<LeaderShiftDetails | null>(null);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [detailsError, setDetailsError] =
    useState<string | null>(null);

  const todayKey = useMemo(() => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, []);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const data = await leaderService.getEventShifts();

        if (!ignore) {
          setShifts(data);
        }
      } catch (error) {
        console.error("Failed to load shifts:", error);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedShift) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedShift(null);
        setShiftDetails(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedShift]);

  const normalizeDate = (value: string) => {
    return value?.slice(0, 10);
  };

  const isToday = (shift: LeaderShift) => {
    return normalizeDate(shift.date) === todayKey;
  };

  const isUpcoming = (shift: LeaderShift) => {
    return (
      shift.status !== "Completed" &&
      normalizeDate(shift.date) > todayKey
    );
  };

  const isCompleted = (shift: LeaderShift) => {
    return shift.status === "Completed";
  };

  const visibleShifts = useMemo(() => {
    if (activeTab === "Today") {
      return shifts.filter(
        (shift) =>
          isToday(shift) &&
          shift.status !== "Completed"
      );
    }

    if (activeTab === "Upcoming") {
      return shifts.filter(isUpcoming);
    }

    return shifts.filter(isCompleted);
  }, [activeTab, shifts, todayKey]);

  const counts = useMemo(
    () => ({
      Today: shifts.filter(
        (shift) =>
          isToday(shift) &&
          shift.status !== "Completed"
      ).length,

      Upcoming: shifts.filter(isUpcoming).length,

      Completed: shifts.filter(isCompleted).length,
    }),
    [shifts, todayKey]
  );

  const formatDate = (date: string) => {
    const parsed = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return new Intl.DateTimeFormat("en", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(parsed);
  };

  const formatDateTime = (value: string | null) => {
    if (!value) {
      return null;
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat("en", {
      hour: "numeric",
      minute: "2-digit",
    }).format(parsed);
  };

  const getMemberInitials = (
    firstName: string,
    lastName: string
  ) => {
    return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`
      .toUpperCase()
      .slice(0, 2);
  };

  const handleOpenShift = async (shift: LeaderShift) => {
    setSelectedShift(shift);
    setShiftDetails(null);
    setDetailsError(null);
    setDetailsLoading(true);

    try {
      const details =
        await leaderService.getShiftDetails(shift.id);

      setShiftDetails(details);

      if (!details) {
        setDetailsError(
          "This shift could not be found or is no longer available."
        );
      }
    } catch (error) {
      console.error(
        "Failed to load shift details:",
        error
      );

      setDetailsError(
        "We couldn't load this shift's details. Please try again."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedShift(null);
    setShiftDetails(null);
    setDetailsError(null);
  };

  if (loading) {
    return (
      <VSLoadingState message="Loading shift coverage…" />
    );
  }

  return (
    <>
      <div className="mx-auto max-w-6xl space-y-8">
        <VSPageHeader
          eyebrow="Coverage"
          title="Shifts"
          description="Track staffing, availability, and team coverage across your event responsibility."
        />

        <VSCard className="overflow-hidden rounded-[2rem] border-border">
          <VSCardContent className="p-4 sm:p-6">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
              {(
                ["Today", "Upcoming", "Completed"] as const
              ).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
                    activeTab === tab
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-background text-foreground hover:border-primary/50"
                  )}
                >
                  <span>{tab}</span>

                  <span
                    className={cn(
                      "min-w-5 rounded-full px-1.5 text-xs",
                      activeTab === tab
                        ? "bg-primary-foreground/15"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {counts[tab]}
                  </span>
                </button>
              ))}
            </div>

            {/* Shift list */}
            <div className="mt-6 grid gap-4">
              {visibleShifts.length === 0 ? (
                <VSEmptyState
                  title={`No ${activeTab.toLowerCase()} shifts`}
                  description={
                    activeTab === "Today"
                      ? "There are no active shifts scheduled for today."
                      : activeTab === "Upcoming"
                        ? "There are currently no upcoming shifts."
                        : "There are no completed shifts yet."
                  }
                />
              ) : (
                visibleShifts.map((shift) => {
                  const percentage =
                    shift.capacity > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (shift.assignedVolunteers.length /
                              shift.capacity) *
                              100
                          )
                        )
                      : 0;

                  return (
                    <button
                      key={shift.id}
                      type="button"
                      onClick={() =>
                        void handleOpenShift(shift)
                      }
                      className="group w-full rounded-[1.6rem] border border-border bg-background p-5 text-left transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <div className="flex flex-col gap-5">
                        {/* Header */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              <span className="inline-flex items-center gap-1.5">
                                <CalendarDays className="h-3.5 w-3.5" />
                                {formatDate(shift.date)}
                              </span>

                              <span className="text-border">
                                •
                              </span>

                              <span className="inline-flex items-center gap-1.5">
                                <Clock3 className="h-3.5 w-3.5" />
                                {shift.startTime} –{" "}
                                {shift.endTime}
                              </span>
                            </div>

                            <h3 className="mt-2 text-xl font-semibold text-foreground">
                              {shift.title}
                            </h3>

                            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 shrink-0" />
                              {shift.location}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <VSStatusBadge
                              status={shift.status}
                            />

                            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition group-hover:border-primary/50 group-hover:text-primary">
                              <ChevronRight className="h-4 w-4" />
                            </span>
                          </div>
                        </div>

                        {/* Coverage */}
                        <div className="rounded-2xl border border-border bg-muted/20 p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary" />

                                <p className="text-sm font-semibold text-foreground">
                                  {shift.assignedVolunteers.length}{" "}
                                  / {shift.capacity} volunteers
                                </p>
                              </div>

                              <p className="mt-1 text-xs text-muted-foreground">
                                Assigned to this shift
                              </p>
                            </div>

                            <span className="text-sm font-semibold text-foreground">
                              {percentage}%
                            </span>
                          </div>

                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Bottom */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {shift.summary}
                          </p>

                          {shift.assignedVolunteers.length >
                            0 && (
                            <div className="flex shrink-0 flex-wrap gap-1.5">
                              {shift.assignedVolunteers
                                .slice(0, 3)
                                .map((name) => (
                                  <span
                                    key={name}
                                    className="rounded-full border border-border bg-muted/30 px-2.5 py-1 text-xs font-medium text-muted-foreground"
                                  >
                                    {name}
                                  </span>
                                ))}

                              {shift.assignedVolunteers.length >
                                3 && (
                                <span className="rounded-full border border-border bg-muted/30 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                  +
                                  {shift.assignedVolunteers
                                    .length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </VSCardContent>
        </VSCard>
      </div>

      {/* Shift details modal */}
      {selectedShift && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="shift-details-title"
        >
          <button
            type="button"
            aria-label="Close shift details"
            className="absolute inset-0 cursor-default"
            onClick={closeDetails}
          />

          <div className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[2rem] border border-border bg-background shadow-2xl sm:rounded-[2rem]">
            {/* Modal header */}
            <div className="border-b border-border p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    <span>
                      {formatDate(selectedShift.date)}
                    </span>

                    <span>•</span>

                    <span>
                      {selectedShift.startTime} –{" "}
                      {selectedShift.endTime}
                    </span>
                  </div>

                  <h2
                    id="shift-details-title"
                    className="mt-2 text-2xl font-semibold text-foreground"
                  >
                    {selectedShift.title}
                  </h2>

                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {selectedShift.location}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeDetails}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted/30 text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal content */}
            <div className="overflow-y-auto p-5 sm:p-6">
              {detailsLoading ? (
                <div className="flex min-h-60 items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />

                    <p className="mt-4 text-sm text-muted-foreground">
                      Loading shift details…
                    </p>
                  </div>
                </div>
              ) : detailsError ? (
                <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-sm text-destructive">
                  {detailsError}
                </div>
              ) : shiftDetails ? (
                <div className="space-y-6">
                  {/* Overview */}
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-border bg-muted/20 p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock3 className="h-4 w-4" />
                        <span className="text-xs font-medium">
                          Time
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {shiftDetails.startTime} –{" "}
                        {shiftDetails.endTime}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-muted/20 p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span className="text-xs font-medium">
                          Coverage
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {shiftDetails.members.length} /{" "}
                        {shiftDetails.capacity}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-muted/20 p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-xs font-medium">
                          Status
                        </span>
                      </div>

                      <div className="mt-2">
                        <VSStatusBadge
                          status={shiftDetails.status}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="rounded-2xl border border-border p-5">
                    <h3 className="text-sm font-semibold text-foreground">
                      Shift information
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {shiftDetails.summary ||
                        "No additional instructions have been added for this shift."}
                    </p>
                  </div>

                  {/* Members */}
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          Shift members
                        </h3>

                        <p className="text-sm text-muted-foreground">
                          Volunteers assigned to this shift
                        </p>
                      </div>

                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                        {shiftDetails.members.length} members
                      </span>
                    </div>

                    {shiftDetails.members.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                        <Users className="mx-auto h-8 w-8 text-muted-foreground" />

                        <p className="mt-3 text-sm font-medium text-foreground">
                          No members assigned
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          This shift currently has no assigned volunteers.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {shiftDetails.members.map(
                          (member) => (
                            <div
                              key={member.id}
                              className="flex items-center gap-3 rounded-2xl border border-border p-3 sm:p-4"
                            >
                              {/* Avatar */}
                              {member.avatar ? (
                                <img
                                  src={member.avatar}
                                  alt={`${member.firstName} ${member.lastName}`}
                                  className="h-11 w-11 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                  {getMemberInitials(
                                    member.firstName,
                                    member.lastName
                                  )}
                                </div>
                              )}

                              {/* Name */}
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-foreground">
                                  {member.firstName}{" "}
                                  {member.lastName}
                                </p>

                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  {member.role}
                                </p>
                              </div>

                              {/* Attendance */}
                              <div className="text-right">
                                <span
                                  className={cn(
                                    "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                                    member.attendanceStatus ===
                                      "Checked in" &&
                                      "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
                                    member.attendanceStatus ===
                                      "Checked out" &&
                                      "border-primary/20 bg-primary/10 text-primary",
                                    member.attendanceStatus ===
                                      "Absent" &&
                                      "border-destructive/20 bg-destructive/10 text-destructive",
                                    member.attendanceStatus ===
                                      "Assigned" &&
                                      "border-border bg-muted text-muted-foreground"
                                  )}
                                >
                                  {member.attendanceStatus}
                                </span>

                                {member.checkInTime && (
                                  <p className="mt-1 text-[11px] text-muted-foreground">
                                    In{" "}
                                    {formatDateTime(
                                      member.checkInTime
                                    )}
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}