import { Link } from "@tanstack/react-router";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  MessageSquareText,
  QrCode,
  RefreshCw,
  Users,
  X,
} from "lucide-react";
import FeedbackForm from "@/components/leader/FeedbackForm";
import { useEffect, useMemo, useState } from "react";

import {
  VSAvatar,
  VSButton,
  VSCard,
  VSCardContent,
  VSCardHeader,
  VSCardTitle,
  VSEmptyState,
  VSInput,
  VSLoadingState,
  VSPageHeader,
  VSSectionHeader,
  VSStatCard,
  VSStatusBadge,
} from "@/components/design-system";
import LeaderCommitteeDetails from "@/components/leader/LeaderCommitteeDetails";
import { leaderService, type LeaderCommittee, type LeaderEvent, type LeaderMember, type LeaderShift } from "@/services/leader/leaderService";

const formatDate = (value: string | null | undefined) => {
  if (!value) return "TBD";
  return new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date(value));
};

function cn(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(" ");
}

const formatShortDate = (value: string | null | undefined) => {
  if (!value) return "TBD";

  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
};

const isToday = (value: string | null | undefined) => {
  if (!value) return false;

  const date = new Date(value);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

const getShiftProgress = (assigned: number, capacity: number) => {
  if (!capacity) return 0;
  return Math.min(100, Math.round((assigned / capacity) * 100));
};

export function LeaderDashboardPage() {
  const [profile, setProfile] = useState<{
    firstName: string;
    lastName: string;
  } | null>(null);

  const [event, setEvent] = useState<LeaderEvent | null>(null);
  const [committee, setCommittee] = useState<LeaderCommittee | null>(null);
  const [members, setMembers] = useState<LeaderMember[]>([]);
  const [shifts, setShifts] = useState<LeaderShift[]>([]);
  const [recentScans, setRecentScans] = useState<
    Array<{
      id: string;
      volunteerName: string;
      status: string;
      role: string;
    }>
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadDashboard(isRefresh = false) {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [
        leader,
        currentCommittee,
        currentEvent,
        committeeMembers,
        eventShifts,
        scans,
      ] = await Promise.all([
        leaderService.getCurrentLeaderProfile(),
        leaderService.getCurrentCommittee(),
        leaderService.getCurrentEvent(),
        leaderService.getCommitteeMembers(),
        leaderService.getEventShifts(),
        leaderService.getRecentScans(),
      ]);

      setProfile(
        leader
          ? {
              firstName: leader.firstName,
              lastName: leader.lastName,
            }
          : {
              firstName: "Leader",
              lastName: "",
            },
      );

      setCommittee(currentCommittee);
      setEvent(currentEvent);
      setMembers(committeeMembers);
      setShifts(eventShifts);
      setRecentScans(scans);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadDashboard();

    return () => undefined;
  }, []);

  if (loading) {
    return <VSLoadingState message="Loading your operational overview…" />;
  }

  const leaderName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : "Leader";

  /*
   * ---------------------------------------------------------
   * Operational calculations
   * ---------------------------------------------------------
   */

  const todayShifts = shifts.filter((shift) => isToday(shift.date));

  const activeShifts = shifts.filter(
    (shift) => shift.status === "Open" || shift.status === "Filled",
  );

  const completedShifts = shifts.filter(
    (shift) => shift.status === "Completed",
  );

  const totalCapacity = shifts.reduce(
    (total, shift) => total + shift.capacity,
    0,
  );

  const assignedVolunteers = shifts.reduce(
    (total, shift) => total + shift.assignedVolunteers.length,
    0,
  );

  const coveragePercentage = totalCapacity
    ? Math.min(100, Math.round((assignedVolunteers / totalCapacity) * 100))
    : 0;

  const pendingCount = members.filter(
    (member) => member.feedbackStatus !== "Submitted",
  ).length;

  const attendanceValues = members
    .map((member) => {
      const value = Number.parseInt(member.attendance, 10);
      return Number.isFinite(value) ? value : null;
    })
    .filter((value): value is number => value !== null);

  const teamAttendance =
    attendanceValues.length > 0
      ? Math.round(
          attendanceValues.reduce((sum, value) => sum + value, 0) /
            attendanceValues.length,
        )
      : null;

  const nextShift =
    activeShifts
      .slice()
      .sort((a, b) =>
        `${a.date} ${a.startTime}`.localeCompare(
          `${b.date} ${b.startTime}`,
        ),
      )[0] ?? null;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 pb-10 sm:space-y-8">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <VSPageHeader
          eyebrow="Leader dashboard"
          title={`Good morning, ${leaderName || "Leader"} 👋`}
          description={
            committee
              ? `Managing ${committee.name} and its operational activity.`
              : "Here’s your operational overview."
          }
        />

        <button
          type="button"
          onClick={() => void loadDashboard(true)}
          disabled={refreshing}
          className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 lg:self-auto"
        >
          <RefreshCw
            className={cn(
              "h-4 w-4",
              refreshing && "animate-spin",
            )}
          />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* =====================================================
          CURRENT EVENT HERO
      ===================================================== */}

      <VSCard className="group relative overflow-hidden rounded-[2rem] border-0 bg-ink text-white shadow-[var(--shadow-float)]">
        <VSCardContent className="grid gap-0 p-0 lg:grid-cols-[1.08fr_0.92fr]">
          {/* EVENT CONTENT */}
          <div className="relative z-10 p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Current event
              </span>

              {event?.status && (
                <VSStatusBadge status={event.status} />
              )}
            </div>

            <h2 className="mt-5 max-w-2xl text-3xl font-bold leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl">
              {event?.title ?? "No active event"}
            </h2>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/65">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                {event ? formatDate(event.startDate) : "—"}
              </span>

              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                {event?.location ?? "—"}
              </span>
            </div>

            {/* Responsibility */}
            <div className="mt-7 max-w-xl rounded-2xl border border-white/10 bg-white/[0.055] p-4 sm:p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
                Your responsibility
              </p>

              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">
                    {committee?.name ?? "No committee assigned"}
                  </p>

                  <p className="mt-1 text-xs text-white/45">
                    {members.length} volunteers · {shifts.length} shifts
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/leader/scanner"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-ink shadow-sm transition-all hover:-translate-y-0.5 hover:bg-white/90"
              >
                <QrCode className="h-4 w-4" />
                Scan Volunteer
              </Link>

              <Link
                to="/leader/volunteers"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-white/[0.08]"
              >
                Volunteers
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/leader/shifts"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-white/[0.08]"
              >
                Shifts
              </Link>
            </div>
          </div>

          {/* EVENT IMAGE */}
          <div className="relative min-h-[300px] overflow-hidden lg:min-h-[410px]">
            <img
              src={event?.coverImage ?? "/logo.png"}
              alt={event?.title ?? "Event"}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
            />

            <div className="absolute inset-0 bg-ink/10" />

            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />

            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-ink/90 lg:to-ink" />

            {/* Next shift */}
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 lg:p-8">
              <div className="max-w-md rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-md sm:p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
                  Next operational focus
                </p>

                <div className="mt-3 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <Clock3 className="h-4 w-4 text-primary" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white sm:text-lg">
                      {nextShift?.title ?? "No upcoming shift"}
                    </p>

                    {nextShift && (
                      <p className="mt-1 text-xs text-white/55 sm:text-sm">
                        {formatShortDate(nextShift.date)} ·{" "}
                        {nextShift.startTime} – {nextShift.endTime}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </VSCardContent>
      </VSCard>

      {/* =====================================================
          KPI STATS
      ===================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <VSStatCard
          label="Committee volunteers"
          value={members.length}
          icon={<Users className="h-5 w-5" />}
        />

        <VSStatCard
          label="Today's shifts"
          value={todayShifts.length}
          icon={<Clock3 className="h-5 w-5" />}
          accent
        />

        <VSStatCard
          label="Shift coverage"
          value={`${coveragePercentage}%`}
          icon={<Activity className="h-5 w-5" />}
        />

        <VSStatCard
          label="Team attendance"
          value={teamAttendance === null ? "—" : `${teamAttendance}%`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          accent
        />
      </div>

      {/* =====================================================
          COVERAGE ALERT
      ===================================================== */}

      {coveragePercentage < 100 && shifts.length > 0 && (
        <VSCard className="overflow-hidden rounded-[1.5rem] border-primary/20 bg-primary/[0.045]">
          <VSCardContent className="p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <AlertCircle className="h-5 w-5" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">
                      Staffing needs attention
                    </p>

                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                      {coveragePercentage}% covered
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {assignedVolunteers} of {totalCapacity} volunteer
                    positions are currently assigned across your shifts.
                  </p>
                </div>
              </div>

              <Link
                to="/leader/shifts"
                className="inline-flex items-center gap-2 self-start rounded-xl border border-primary/20 bg-background px-4 py-2.5 text-sm font-semibold text-primary transition-all hover:-translate-y-0.5 hover:border-primary/40 lg:self-auto"
              >
                Review coverage
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </VSCardContent>
        </VSCard>
      )}

      {/* =====================================================
          TODAY + TEAM
      ===================================================== */}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        {/* TODAY'S SHIFTS */}
        <VSCard className="rounded-[2rem] border-border">
          <VSCardContent className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <VSSectionHeader
                title="Today's shifts"
                description="The shifts currently requiring your attention."
              />

              <Link
                to="/leader/shifts"
                className="hidden shrink-0 rounded-lg px-2 py-1 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 sm:block"
              >
                View all
              </Link>
            </div>

            <div className="mt-6 space-y-3">
              {todayShifts.length === 0 ? (
                <VSEmptyState
                  title="No shifts today"
                  description="There are no committee shifts scheduled for today."
                />
              ) : (
                todayShifts.slice(0, 4).map((shift) => {
                  const assigned = shift.assignedVolunteers.length;
                  const progress = getShiftProgress(
                    assigned,
                    shift.capacity,
                  );

                  return (
                    <div
                      key={shift.id}
                      className="group rounded-2xl border border-border bg-background p-4 transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-sm"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
                              {shift.startTime} – {shift.endTime}
                            </span>

                            <VSStatusBadge status={shift.status} />
                          </div>

                          <h3 className="mt-3 truncate text-base font-bold text-foreground sm:text-lg">
                            {shift.title}
                          </h3>

                          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">
                              {shift.location}
                            </span>
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 sm:block sm:text-right">
                          <p className="text-lg font-bold text-foreground">
                            {assigned}/{shift.capacity}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            volunteers
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between text-xs">
                          <span className="font-medium text-muted-foreground">
                            Coverage
                          </span>

                          <span className="font-bold text-foreground">
                            {progress}%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {shift.assignedVolunteers.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {shift.assignedVolunteers
                            .slice(0, 5)
                            .map((name) => (
                              <span
                                key={name}
                                className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground"
                              >
                                {name}
                              </span>
                            ))}

                          {shift.assignedVolunteers.length > 5 && (
                            <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                              +{shift.assignedVolunteers.length - 5}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </VSCardContent>
        </VSCard>

        {/* COMMITTEE */}
        <VSCard className="rounded-[2rem] border-border">
          <VSCardContent className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <VSSectionHeader
                title="Your committee"
                description={
                  committee?.name ?? "Assigned volunteers"
                }
              />

              <Link
                to="/leader/volunteers"
                className="shrink-0 rounded-lg px-2 py-1 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
              >
                View all
              </Link>
            </div>

            <div className="mt-6 space-y-2.5">
              {members.length === 0 ? (
                <VSEmptyState
                  title="No volunteers assigned"
                  description="Your committee does not have any assigned volunteers yet."
                />
              ) : (
                members.slice(0, 6).map((member) => (
                  <div
                    key={member.id}
                    className="group flex items-center justify-between gap-3 rounded-2xl border border-transparent p-3 transition-all hover:border-border hover:bg-background"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <VSAvatar
                        name={`${member.firstName} ${member.lastName}`}
                        src={member.avatar ?? undefined}
                        size="sm"
                      />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-foreground">
                          {member.firstName} {member.lastName}
                        </p>

                        <p className="truncate text-xs text-muted-foreground">
                          {member.role}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-muted-foreground/80">
                          {member.assignedShift}
                        </p>
                      </div>
                    </div>

                    <VSStatusBadge status={member.status} />
                  </div>
                ))
              )}
            </div>
          </VSCardContent>
        </VSCard>
      </div>

      {/* =====================================================
          RECENT ACTIVITY
      ===================================================== */}

      <VSCard className="rounded-[2rem] border-border">
        <VSCardContent className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <VSSectionHeader
              title="Recent activity"
              description="Latest attendance activity from your committee."
            />

            <Link
              to="/leader/notifications"
              className="hidden rounded-lg px-2 py-1 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 sm:block"
            >
              View all
            </Link>
          </div>

          <div className="mt-6">
            {recentScans.length === 0 ? (
              <VSEmptyState
                title="No attendance activity yet"
                description="QR check-ins and check-outs from your committee will appear here."
              />
            ) : (
              <div className="overflow-hidden rounded-2xl border border-border">
                {recentScans.slice(0, 5).map((scan, index) => (
                  <div
                    key={scan.id}
                    className={cn(
                      "flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/20",
                      index !== 0 && "border-t border-border",
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <QrCode className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-foreground">
                          {scan.volunteerName}
                        </p>

                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {scan.role}
                        </p>
                      </div>
                    </div>

                    <VSStatusBadge
                      status={
                        scan.status === "checked_in"
                          ? "Checked in"
                          : "Checked out"
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </VSCardContent>
      </VSCard>

      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

      <div>
        <div className="mb-4">
          <VSSectionHeader
            title="Quick actions"
            description="Common actions for managing your committee."
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Link
            to="/leader/scanner"
            className="group rounded-[1.5rem] border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
              <QrCode className="h-5 w-5" />
            </div>

            <p className="mt-4 font-bold text-foreground">
              Scan volunteer
            </p>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Check in or check out a volunteer using their QR code.
            </p>

            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Open scanner
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>

          <Link
            to="/leader/volunteers"
            className="group rounded-[1.5rem] border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
              <Users className="h-5 w-5" />
            </div>

            <p className="mt-4 font-bold text-foreground">
              Manage volunteers
            </p>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Review your committee roster and volunteer assignments.
            </p>

            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
              View roster
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>

          <Link
            to="/leader/shifts"
            className="group rounded-[1.5rem] border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
              <Clock3 className="h-5 w-5" />
            </div>

            <p className="mt-4 font-bold text-foreground">
              Review shifts
            </p>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Monitor staffing and coverage for your committee shifts.
            </p>

            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
              View shifts
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
      </div>

      {/* =====================================================
          FOLLOW-UP
      ===================================================== */}

      {pendingCount > 0 && (
        <VSCard className="rounded-[2rem] border-border">
          <VSCardContent className="p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MessageSquareText className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold text-foreground">
                    Follow-up needed
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {pendingCount} volunteer
                    {pendingCount === 1 ? "" : "s"} still need follow-up.
                  </p>
                </div>
              </div>

              <Link
                to="/leader/volunteers"
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
              >
                Review
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {members
                .filter(
                  (member) => member.feedbackStatus !== "Submitted",
                )
                .slice(0, 3)
                .map((member) => (
                  <div
                    key={member.id}
                    className="rounded-2xl border border-border bg-background p-4 transition-colors hover:bg-muted/20"
                  >
                    <div className="flex items-center gap-3">
                      <VSAvatar
                        name={`${member.firstName} ${member.lastName}`}
                        src={member.avatar ?? undefined}
                        size="sm"
                      />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-foreground">
                          {member.firstName} {member.lastName}
                        </p>

                        <p className="truncate text-xs text-muted-foreground">
                          {member.role}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <VSStatusBadge status={member.feedbackStatus} />
                    </div>
                  </div>
                ))}
            </div>
          </VSCardContent>
        </VSCard>
      )}
    </div>
  );
}

export function LeaderEventPage() {
  const [events, setEvents] = useState<LeaderEvent[]>([]);
  const [committees, setCommittees] = useState<LeaderCommittee[]>([]);
  const [members, setMembers] = useState<LeaderMember[]>([]);
  const [shifts, setShifts] = useState<LeaderShift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const [
          leaderEvents,
          leaderCommittees,
          committeeMembers,
          eventShifts,
        ] = await Promise.all([
          leaderService.getLeaderEvents(),
          leaderService.getLeaderCommittees(),
          leaderService.getCommitteeMembers(),
          leaderService.getEventShifts(),
        ]);

        if (ignore) return;

        setEvents(leaderEvents);
        setCommittees(leaderCommittees);
        setMembers(committeeMembers);
        setShifts(eventShifts);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load leader events page:", error);

        if (!ignore) {
          setEvents([]);
          setCommittees([]);
          setMembers([]);
          setShifts([]);
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return <VSLoadingState message="Loading your events…" />;
  }

  if (!events.length) {
    return (
      <VSEmptyState
        title="No events assigned"
        description="You are not currently assigned to any event committee."
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <VSPageHeader
        eyebrow="Event operations"
        title="My Events"
        description="Events where you are assigned as a committee leader."
      />

      <div className="space-y-8">
        {events.map((event) => {
          const eventCommittees = committees.filter(
            (committee) => committee.eventId === event.id,
          );

          const eventCommitteeIds = new Set(
            eventCommittees.map((committee) => committee.id),
          );

          const eventMembers = members.filter((member) =>
            eventCommitteeIds.has(member.committeeId),
          );

          const eventShifts = shifts.filter((shift) =>
            eventCommitteeIds.has(shift.committeeId),
          );

          return (
            <div
              key={event.id}
              className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-[var(--shadow-float)]"
            >
              <img
                src={event.coverImage ?? "/logo.png"}
                alt={event.title}
                className="h-64 w-full object-cover sm:h-80"
              />

              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="mb-3">
                      <VSStatusBadge status={event.status} />
                    </div>

                    <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                      {event.title}
                    </h2>

                    <p className="mt-2 text-sm text-muted-foreground">
                      {event.location}
                    </p>
                  </div>

                  <Link
                    to="/leader/committee"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary"
                  >
                    View committee
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <p className="mt-6 max-w-3xl text-base leading-7 text-muted-foreground">
                  {event.description ?? "No description provided."}
                </p>

                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-border bg-background p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      Date
                    </p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {formatDate(event.startDate)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-background p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      Time
                    </p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {event.startTime ?? "TBD"} –{" "}
                      {event.endTime ?? "TBD"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-background p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      Committees
                    </p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {eventCommittees.length}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-background p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      Volunteers
                    </p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {eventMembers.length}
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-3">
                  <VSCard className="rounded-[2rem] border-border">
                    <VSCardHeader>
                      <VSCardTitle>Your committees</VSCardTitle>
                    </VSCardHeader>

                    <VSCardContent className="space-y-3">
                      {eventCommittees.map((committee) => (
                        <div
                          key={committee.id}
                          className="rounded-2xl border border-border bg-background p-4"
                        >
                          <p className="font-semibold text-foreground">
                            {committee.name}
                          </p>

                          {committee.description && (
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                              {committee.description}
                            </p>
                          )}

                          <p className="mt-3 text-xs text-muted-foreground">
                            {committee.memberCount} volunteers
                          </p>
                        </div>
                      ))}
                    </VSCardContent>
                  </VSCard>

                  <VSCard className="rounded-[2rem] border-border">
                    <VSCardHeader>
                      <VSCardTitle>Operations snapshot</VSCardTitle>
                    </VSCardHeader>

                    <VSCardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Committees
                        </span>
                        <span className="font-semibold text-foreground">
                          {eventCommittees.length}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Volunteers
                        </span>
                        <span className="font-semibold text-foreground">
                          {eventMembers.length}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Shifts
                        </span>
                        <span className="font-semibold text-foreground">
                          {eventShifts.length}
                        </span>
                      </div>
                    </VSCardContent>
                  </VSCard>

                  <VSCard className="rounded-[2rem] border-border">
                    <VSCardHeader>
                      <VSCardTitle>Event information</VSCardTitle>
                    </VSCardHeader>

                    <VSCardContent className="space-y-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Location</p>
                        <p className="mt-1 font-medium text-foreground">
                          {event.location}
                        </p>
                      </div>

                      <div>
                        <p className="text-muted-foreground">Leader</p>
                        <p className="mt-1 font-medium text-foreground">
                          {event.leaderName}
                        </p>
                      </div>

                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <div className="mt-2">
                          <VSStatusBadge status={event.status} />
                        </div>
                      </div>
                    </VSCardContent>
                  </VSCard>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function LeaderCommitteePage() {
  const [committees, setCommittees] = useState<LeaderCommittee[]>([]);
  const [members, setMembers] = useState<LeaderMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const [leaderCommittees, committeeMembers] =
          await Promise.all([
            leaderService.getLeaderCommittees(),
            leaderService.getCommitteeMembers(),
          ]);

        if (ignore) return;

        setCommittees(leaderCommittees);
        setMembers(committeeMembers);
        setLoading(false);
      } catch (error) {
        console.error(
          "Failed to load leader committees:",
          error,
        );

        if (!ignore) {
          setCommittees([]);
          setMembers([]);
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return (
      <VSLoadingState message="Loading your committees…" />
    );
  }

  if (!committees.length) {
    return (
      <VSEmptyState
        title="No committees assigned"
        description="You are not currently assigned as a committee leader."
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <VSPageHeader
        eyebrow="Your teams"
        title="My Committees"
        description="Operational visibility for the committees you lead."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {committees.map((committee) => {
          const committeeMembers = members.filter(
            (member) =>
              member.committeeId === committee.id,
          );

          return (
            <VSCard
              key={committee.id}
              className="rounded-[2rem] border-border"
            >
              <VSCardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <VSCardTitle>
                      {committee.name}
                    </VSCardTitle>

                    <p className="mt-2 text-sm text-muted-foreground">
                      {committee.description ??
                        "No committee description available."}
                    </p>
                  </div>

                  <VSStatusBadge
                    status={committee.status}
                  />
                </div>
              </VSCardHeader>

              <VSCardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-border bg-background p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      Volunteers
                    </p>

                    <p className="mt-2 text-2xl font-bold text-foreground">
                      {committeeMembers.length}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-background p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      Assigned
                    </p>

                    <p className="mt-2 text-2xl font-bold text-foreground">
                      {committee.memberCount}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">
                      Committee members
                    </h3>

                    <span className="text-xs text-muted-foreground">
                      {committeeMembers.length} members
                    </span>
                  </div>

                  {committeeMembers.length === 0 ? (
                    <div className="mt-3 rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                      No volunteers assigned to this committee yet.
                    </div>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {committeeMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between rounded-2xl border border-border bg-background p-4"
                        >
                          <div>
                            <p className="font-medium text-foreground">
                              {member.firstName}{" "}
                              {member.lastName}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {member.role}
                            </p>
                          </div>

                          <VSStatusBadge
                            status={
                              member.attendance
                            }
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </VSCardContent>
            </VSCard>
          );
        })}
      </div>
    </div>
  );
}

export function LeaderVolunteersPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<
    "All" | "Assigned" | "Completed" | "Pending"
  >("All");

  const [members, setMembers] = useState<LeaderMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] =
    useState<LeaderMember | null>(null);

  const [modal, setModal] = useState<
    "view" | "feedback" | null
  >(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const data =
          await leaderService.getCommitteeMembers();

        if (!ignore) {
          setMembers(data);
          setLoading(false);
        }
      } catch (error) {
        console.error(
          "Failed to load committee volunteers:",
          error,
        );

        if (!ignore) {
          setMembers([]);
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      ignore = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLowerCase();

    return members.filter((member) => {
      const fullName =
        `${member.firstName} ${member.lastName}`
          .toLowerCase();

      const matchesQuery =
        !normalizedQuery ||
        fullName.includes(normalizedQuery) ||
        member.role
          .toLowerCase()
          .includes(normalizedQuery) ||
        member.assignedShift
          .toLowerCase()
          .includes(normalizedQuery) ||
        member.attendance
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesFilter =
        filter === "All" ||
        (filter === "Assigned" &&
          member.status === "Assigned") ||
        (filter === "Completed" &&
          member.status === "Checked in") ||
        (filter === "Pending" &&
          member.status === "Pending");

      return matchesQuery && matchesFilter;
    });
  }, [filter, members, query]);

  if (loading) {
    return (
      <VSLoadingState
        message="Loading committee volunteers…"
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <VSPageHeader
        eyebrow="Committee roster"
        title="Volunteers"
        description="Only volunteers assigned to committees you lead are shown here."
      />

      <VSCard className="rounded-[2rem] border-border">
        <VSCardContent className="p-6 sm:p-8">
          {/* Search + filters */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <label className="relative block">
                <span className="sr-only">
                  Search volunteers
                </span>

                <VSInput
                  value={query}
                  onChange={(event) =>
                    setQuery(event.target.value)
                  }
                  placeholder="Search volunteers..."
                  className="h-12 rounded-2xl border-border bg-background pl-4"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  "All",
                  "Assigned",
                  "Completed",
                  "Pending",
                ] as const
              ).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFilter(option)}
                  className={cn(
                    "rounded-full border px-3 py-2 text-sm font-medium transition",
                    filter === option
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/50",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {filtered.length}
              </span>{" "}
              volunteers
            </p>

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-sm font-medium text-primary hover:underline"
              >
                Clear search
              </button>
            )}
          </div>

          {/* Empty state */}
          {filtered.length === 0 ? (
            <div className="mt-8">
              <VSEmptyState
                title="No volunteers found"
                description="Try a different filter or search term."
              />
            </div>
          ) : (
            /* Real volunteer records */
            <div className="mt-8 space-y-3">
              {filtered.map((member) => (
                <div
                  key={member.id}
                  className="rounded-2xl border border-border bg-background p-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* Volunteer identity */}
                    <div className="flex items-center gap-3">
                      <VSAvatar
                        name={`${member.firstName} ${member.lastName}`}
                        src={
                          member.avatar ??
                          undefined
                        }
                      />

                      <div>
                        <p className="text-base font-semibold text-foreground">
                          {member.firstName}{" "}
                          {member.lastName}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          {member.role}
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                      <VSStatusBadge
                        status={member.status}
                      />

                      <VSStatusBadge
                        status={
                          member.feedbackStatus
                        }
                      />
                    </div>
                  </div>

                  {/* Real volunteer information */}
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl bg-muted/40 p-3">
                      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Shift
                      </p>

                      <p className="mt-2 text-sm font-medium text-foreground">
                        {member.assignedShift}
                      </p>
                    </div>

                    <div className="rounded-xl bg-muted/40 p-3">
                      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Attendance
                      </p>

                      <p className="mt-2 text-sm font-medium text-foreground">
                        {member.attendance}
                      </p>
                    </div>

                    <div className="rounded-xl bg-muted/40 p-3">
                      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Feedback
                      </p>

                      <p className="mt-2 text-sm font-medium text-foreground">
                        {member.feedbackStatus}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <VSButton
                      variant="secondary"
                      className="h-9"
                      onClick={() => {
                        setSelectedMember(member);
                        setModal("view");
                      }}
                    >
                      View
                    </VSButton>

                    <VSButton
                      className="h-9"
                      onClick={() => {
                        setSelectedMember(member);
                        setModal("feedback");
                      }}
                    >
                      Add feedback
                    </VSButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </VSCardContent>
      </VSCard>
      {selectedMember && modal && (
  <div
    className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-3 backdrop-blur-sm sm:p-5"
    onMouseDown={() => {
      setSelectedMember(null);
      setModal(null);
    }}
  >
    <div className="flex min-h-full items-center justify-center">
      <div
        className="my-3 flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:my-5 sm:rounded-[2rem]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-card p-4 sm:p-5 lg:p-6">
          <div className="flex min-w-0 items-center gap-3">
            <VSAvatar
              name={`${selectedMember.firstName} ${selectedMember.lastName}`}
              src={selectedMember.avatar ?? undefined}
              size="sm"
            />

            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-foreground sm:text-xl">
                {selectedMember.firstName}{" "}
                {selectedMember.lastName}
              </h2>

              <p className="truncate text-xs text-muted-foreground sm:text-sm">
                {selectedMember.role}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedMember(null);
              setModal(null);
            }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="min-h-0 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-7">
            {modal === "view" ? (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-muted/40 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Role
                    </p>

                    <p className="mt-2 font-medium text-foreground">
                      {selectedMember.role}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-muted/40 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Status
                    </p>

                    <div className="mt-2">
                      <VSStatusBadge
                        status={selectedMember.status}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-muted/40 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Shift
                    </p>

                    <p className="mt-2 font-medium text-foreground">
                      {selectedMember.assignedShift}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-muted/40 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Attendance
                    </p>

                    <p className="mt-2 font-medium text-foreground">
                      {selectedMember.attendance}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-border p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Feedback
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Current feedback status
                      </p>
                    </div>

                    <div className="self-start sm:self-auto">
                      <VSStatusBadge
                        status={selectedMember.feedbackStatus}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Feedback intro */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Volunteer feedback
                  </p>

                  <h3 className="mt-1 text-lg font-bold text-foreground sm:text-xl">
                    {selectedMember.firstName}{" "}
                    {selectedMember.lastName}
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Evaluate the volunteer's performance.
                  </p>
                </div>

                {/* Feedback form */}
                <FeedbackForm
                  committeeId={selectedMember.committeeId}
                  eventId={selectedMember.eventId}
                  memberProfileId={selectedMember.id}
                  onSaved={() => {
                    setSelectedMember(null);
                    setModal(null);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export function LeaderShiftsPage() {
  const [activeTab, setActiveTab] = useState<"Today" | "Upcoming" | "Completed">("Today");
  const [shifts, setShifts] = useState<LeaderShift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function load() {
      const data = await leaderService.getEventShifts();
      if (!ignore) {
        setShifts(data);
        setLoading(false);
      }
    }
    void load();
    return () => {
      ignore = true;
    };
  }, []);

  const visibleShifts = activeTab === "Today" ? shifts.filter((shift) => shift.status !== "Completed") : activeTab === "Upcoming" ? shifts.filter((shift) => shift.status === "Open" || shift.status === "Filled") : shifts.filter((shift) => shift.status === "Completed");

  if (loading) return <VSLoadingState message="Loading shift coverage…" />;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <VSPageHeader eyebrow="Coverage" title="Shifts" description="Track staffing, availability, and team coverage across your event responsibility." />
      <VSCard className="rounded-[2rem] border-border">
        <VSCardContent className="p-4 sm:p-6">
          <div className="flex flex-wrap gap-2">
            {(["Today", "Upcoming", "Completed"] as const).map((tab) => (
              <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={cn("rounded-full border px-4 py-2 text-sm font-medium transition", activeTab === tab ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:border-primary/50")}>{tab}</button>
            ))}
          </div>

          <div className="mt-6 grid gap-4">
            {visibleShifts.length === 0 ? (
              <VSEmptyState title="No shifts in this view" description="There are currently no shifts scheduled for this filter." />
            ) : (
              visibleShifts.map((shift) => (
                <div key={shift.id} className="rounded-[1.6rem] border border-border bg-background p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">{shift.startTime} – {shift.endTime}</p>
                      <h3 className="mt-2 text-xl font-semibold text-foreground">{shift.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{shift.location}</p>
                    </div>
                    <VSStatusBadge status={shift.status} />
                  </div>
                  <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{shift.assignedVolunteers.length} / {shift.capacity} volunteers assigned</p>
                      <p className="mt-2 text-sm text-muted-foreground">{shift.summary}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {shift.assignedVolunteers.map((name) => <span key={name} className="rounded-full border border-border bg-muted/30 px-2.5 py-1 text-xs font-medium text-muted-foreground">{name}</span>)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </VSCardContent>
      </VSCard>
    </div>
  );
}

export function LeaderNotificationsPage() {
  const [items, setItems] = useState<{ id: string; title: string; body: string }[]>([]);
  useEffect(() => {
    void leaderService.getRecentScans().then((scans) => setItems(scans.map((scan) => ({ id: scan.id, title: `${scan.volunteerName} checked ${scan.status === "checked_in" ? "in" : "out"}`, body: `Role: ${scan.role}` }))))
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <VSPageHeader eyebrow="Communication" title="Notifications" description="Updates and reminders for your committee work." />
      <div className="space-y-4">
        {items.length === 0 ? (
          <VSCard className="rounded-[1.75rem] border-border"><VSCardContent className="p-5"><p className="text-sm text-muted-foreground">No committee notifications yet.</p></VSCardContent></VSCard>
        ) : (
          items.map((item) => (
            <VSCard key={item.id} className="rounded-[1.75rem] border-border">
              <VSCardContent className="flex items-start justify-between gap-4 p-5">
                <div className="flex items-start gap-3">
                  <span className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Bell className="h-4 w-4" /></span>
                  <div><p className="font-semibold text-foreground">{item.title}</p><p className="mt-1 text-sm text-muted-foreground">{item.body}</p></div>
                </div>
                <VSStatusBadge status="pending" />
              </VSCardContent>
            </VSCard>
          ))
        )}
      </div>
    </div>
  );
}

export function LeaderProfilePage() {
  const [profile, setProfile] = useState<{ firstName: string; lastName: string; role: string } | null>(null);
  const [event, setEvent] = useState<LeaderEvent | null>(null);
  const [committee, setCommittee] = useState<LeaderCommittee | null>(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      const [leader, currentCommittee, currentEvent] = await Promise.all([
        leaderService.getCurrentLeaderProfile(),
        leaderService.getCurrentCommittee(),
        leaderService.getCurrentEvent(),
      ]);
      if (ignore) return;
      setProfile(
        leader ? { firstName: leader.firstName, lastName: leader.lastName, role: leader.role } : { firstName: "Leader", lastName: "", role: "leader" },
      );
      setCommittee(currentCommittee);
      setEvent(currentEvent);
    }
    void load();
    return () => {
      ignore = true;
    };
  }, []);

  if (!profile) return <VSLoadingState message="Loading profile…" />;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <VSPageHeader eyebrow="Account" title="Profile" description="Leader profile and continuity details for event operations." />
      <VSCard className="rounded-[2rem] border-border">
        <VSCardContent className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <VSAvatar name={`${profile.firstName} ${profile.lastName}`} size="lg" />
            <div>
              <h2 className="text-2xl font-semibold text-foreground">{profile.firstName} {profile.lastName}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{profile.role}</p>
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-background p-4"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Event</p><p className="mt-2 text-lg font-semibold text-foreground">{event?.title ?? "No event assigned"}</p></div>
            <div className="rounded-2xl border border-border bg-background p-4"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Committee</p><p className="mt-2 text-lg font-semibold text-foreground">{committee?.name ?? "No committee assigned"}</p></div>
          </div>
        </VSCardContent>
      </VSCard>
    </div>
  );
}
