import { volunteerContentService } from "@/services/shared/volunteerContentService";

import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  ShieldCheck,
  Trophy,
  Users,
  BadgeCheck,
  ClipboardCheck,
  GraduationCap,
} from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import {
  VSBadge,
  VSButton,
  VSCard,
  VSCardContent,
  VSEmptyState,
  VSErrorState,
  VSLoadingState,
  VSPageHeader,
  VSSectionHeader,
  VSStatCard,
  VSStatusBadge,
} from "@/components/design-system";

import { useAuth } from "@/lib/auth";

import { getVolunteerDashboard, getVolunteerHours, getAttendance } from "@/services/shared/backendService";

import { VolunteerDashboard, VolunteerHours, AttendanceRecord } from "@/lib/types";

import { eventService, type MyEvent } from "@/services/shared/eventService";

export function DashboardPage() {
  const { profile } = useAuth();

  const [dashboard, setDashboard] = useState<VolunteerDashboard | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const firstName = profile?.first_name || "Volunteer";
  const upcomingEventsList = dashboard?.upcomingEventsList ?? [];

  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const dragStartX = useRef<number | null>(null);
  const dragCurrentX = useRef<number | null>(null);

  const currentDashboardEvent =
    upcomingEventsList[currentEventIndex] ?? null;

  const goToNextEvent = () => {
    if (upcomingEventsList.length <= 1) return;

    setCurrentEventIndex((current) =>
      current >= upcomingEventsList.length - 1 ? 0 : current + 1,
    );
  };

  const goToPreviousEvent = () => {
    if (upcomingEventsList.length <= 1) return;

    setCurrentEventIndex((current) =>
      current <= 0 ? upcomingEventsList.length - 1 : current - 1,
    );
  };

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        setDashboardLoading(true);
        setDashboardError(null);

        const data = await getVolunteerDashboard();

        if (mounted) {
          setDashboard(data);
        }
      } catch (error) {
        console.error("Failed to load volunteer dashboard:", error);

        if (mounted) {
          setDashboardError(
            error instanceof Error
              ? error.message
              : "Failed to load your dashboard.",
          );
        }
      } finally {
        if (mounted) {
          setDashboardLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (upcomingEventsList.length <= 1) return;

    const interval = window.setInterval(() => {
      setCurrentEventIndex((current) =>
        current >= upcomingEventsList.length - 1 ? 0 : current + 1,
      );
    }, 4000);

    return () => window.clearInterval(interval);
  }, [upcomingEventsList.length]);

  useEffect(() => {
    if (currentEventIndex >= upcomingEventsList.length) {
      setCurrentEventIndex(0);
    }
  }, [currentEventIndex, upcomingEventsList.length]);

  const handlePointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    dragStartX.current = event.clientX;
    dragCurrentX.current = event.clientX;
    setIsDragging(true);
  };

  const handlePointerMove = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (!isDragging) return;

    dragCurrentX.current = event.clientX;
  };

  const handlePointerUp = () => {
    if (
      dragStartX.current === null ||
      dragCurrentX.current === null
    ) {
      setIsDragging(false);
      return;
    }

    const distance = dragStartX.current - dragCurrentX.current;
    const threshold = 60;

    if (Math.abs(distance) >= threshold) {
      if (distance > 0) {
        goToNextEvent();
      } else {
        goToPreviousEvent();
      }
    }

    dragStartX.current = null;
    dragCurrentX.current = null;
    setIsDragging(false);
  };

  const handlePointerCancel = () => {
    dragStartX.current = null;
    dragCurrentX.current = null;
    setIsDragging(false);
  };

  if (dashboardLoading) {
    return (
      <AppShell title="Dashboard">
        <div className="mx-auto max-w-7xl space-y-6 px-1 sm:space-y-8">
          <VSPageHeader
            eyebrow="Your volunteer journey"
            title={`Welcome, ${firstName}.`}
            description="Everything you need to keep showing up for the moments that matter."
          />

          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-2xl border border-border bg-muted/40 sm:h-32 sm:rounded-[1.5rem]"
              />
            ))}
          </div>

          <div className="h-80 animate-pulse rounded-3xl border border-border bg-muted/40 sm:h-96 sm:rounded-[2rem]" />

          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            <div className="h-64 animate-pulse rounded-3xl border border-border bg-muted/40" />
            <div className="h-64 animate-pulse rounded-3xl border border-border bg-muted/40" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (dashboardError) {
    return (
      <AppShell title="Dashboard">
        <div className="mx-auto max-w-7xl space-y-6 px-1 sm:space-y-8">
          <VSPageHeader
            eyebrow="Your volunteer journey"
            title={`Welcome, ${firstName}.`}
            description="Everything you need to keep showing up for the moments that matter."
          />

          <VSCard className="rounded-3xl border-border sm:rounded-[2rem]">
            <VSCardContent className="p-5 sm:p-8">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
                  <span className="text-sm font-bold text-destructive">
                    !
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    Unable to load your dashboard
                  </p>

                  <p className="mt-1 break-words text-sm text-muted-foreground">
                    {dashboardError}
                  </p>

                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-4 text-sm font-semibold text-primary hover:underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </VSCardContent>
          </VSCard>
        </div>
      </AppShell>
    );
  }

  if (!dashboard) {
    return null;
  }

  const upcomingEvent = dashboard.upcomingEvent;
  const profileCompletion = dashboard.profileCompletion;

  return (
    <AppShell title="Dashboard">
      <div className="mx-auto max-w-7xl space-y-7 px-1 sm:space-y-9">
        {/* ====================================================== */}
        {/* HEADER */}
        {/* ====================================================== */}

        <VSPageHeader
          eyebrow="Your volunteer journey"
          title={`Welcome, ${firstName}.`}
          description="Everything you need to keep showing up for the moments that matter."
          action={
            <VSButton
              asChild
              className="w-full sm:w-auto"
            >
              <Link to="/volunteer/events">
                Discover events
                <ArrowRight className="h-4 w-4" />
              </Link>
            </VSButton>
          }
        />

        {/* ====================================================== */}
        {/* HERO */}
        {/* ====================================================== */}

        <section className="relative overflow-hidden rounded-[2rem] bg-ink p-7 text-white shadow-[var(--shadow-lift)] sm:p-10">
          <div className="pointer-events-none absolute inset-0 zellij-tile" />

          <div className="relative max-w-2xl">
            <VSBadge variant="dark">Your next impact</VSBadge>

            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
              {upcomingEvent
                ? "Make the next event unforgettable."
                : "Your next impact starts here."}
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-white/70">
              {upcomingEvent
                ? "You have an accepted assignment ahead. Finish your preparation, arrive ready, and keep building a track record you can be proud of."
                : "Explore upcoming sports events, build your volunteer profile, and find an opportunity where you can make an impact."}
            </p>

            <Link
              to={upcomingEvent ? "/volunteer/my-events" : "/volunteer/events"}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              {upcomingEvent ? "View my event" : "Discover events"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* ====================================================== */}
        {/* STATS */}
        {/* ====================================================== */}

        <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <VSStatCard
            label="Upcoming events"
            value={dashboard.upcomingEvents}
            description={
              dashboard.upcomingEvents === 1
                ? "One confirmed assignment"
                : "Confirmed assignments"
            }
            icon={<CalendarDays className="h-5 w-5" />}
          />

          <VSStatCard
            label="Volunteer hours"
            value={dashboard.volunteerHours}
            description="Verified volunteer hours"
            icon={<Clock3 className="h-5 w-5" />}
            accent
          />

          <VSStatCard
            label="Attendance"
            value={`${dashboard.attendanceRate}%`}
            description="Across completed events"
            icon={<CheckCircle2 className="h-5 w-5" />}
          />

          <VSStatCard
            label="Certificates"
            value={dashboard.certificates}
            description="Ready to share"
            icon={<Award className="h-5 w-5" />}
            accent
          />
        </section>

        {/* ====================================================== */}
        {/* UPCOMING EVENT */}
        {/* ====================================================== */}

        <section>
          <VSSectionHeader
            eyebrow="Upcoming events"
            title="Your next opportunities"
          />

          <VSCard className="mt-5 overflow-hidden rounded-[1.75rem] border-border shadow-[var(--shadow-float)] sm:rounded-[2rem]">
            <VSCardContent className="p-3 sm:p-5 lg:p-6">
              {upcomingEventsList.length > 0 &&
              currentDashboardEvent ? (
                <div
                  className={`relative select-none overflow-hidden rounded-[1.35rem] border border-border bg-card ${
                    isDragging
                      ? "cursor-grabbing"
                      : "cursor-grab"
                  }`}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerCancel}
                  onPointerLeave={() => {
                    if (isDragging) {
                      handlePointerUp();
                    }
                  }}
                  style={{ touchAction: "pan-y" }}
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-ink sm:aspect-[16/7]">
                    {currentDashboardEvent.cover_url ? (
                      <img
                        src={currentDashboardEvent.cover_url}
                        alt={currentDashboardEvent.title}
                        draggable={false}
                        className={`h-full w-full object-cover transition-transform duration-500 ${
                          isDragging
                            ? "scale-[1.02]"
                            : "hover:scale-105"
                        }`}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <CalendarDays className="h-10 w-10 text-white/30" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Image top controls */}
                    <div className="absolute left-4 right-4 top-4 flex items-center justify-between sm:left-5 sm:right-5 sm:top-5">
                      <span className="rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-black backdrop-blur-sm">
                        Upcoming
                      </span>

                      {upcomingEventsList.length > 1 && (
                        <span className="rounded-full bg-black/40 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md">
                          {currentEventIndex + 1} /{" "}
                          {upcomingEventsList.length}
                        </span>
                      )}
                    </div>

                    {/* Navigation */}
                    {upcomingEventsList.length > 1 && (
                      <>
                        <button
                          type="button"
                          aria-label="Previous event"
                          onClick={(event) => {
                            event.stopPropagation();
                            goToPreviousEvent();
                          }}
                          className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-black/65 sm:left-4 sm:h-10 sm:w-10"
                        >
                          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>

                        <button
                          type="button"
                          aria-label="Next event"
                          onClick={(event) => {
                            event.stopPropagation();
                            goToNextEvent();
                          }}
                          className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-black/65 sm:right-4 sm:h-10 sm:w-10"
                        >
                          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </>
                    )}

                    {/* Image title */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                      <p className="text-xs font-medium text-white/65">
                        {currentDashboardEvent.role}
                      </p>

                      <h3 className="mt-1 max-w-3xl text-2xl font-semibold leading-tight text-white sm:text-3xl">
                        {currentDashboardEvent.title}
                      </h3>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4 sm:p-6">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <EventMeta
                        icon={<CalendarDays className="h-4 w-4" />}
                        label="Date"
                        value={currentDashboardEvent.date}
                      />

                      <EventMeta
                        icon={<Users className="h-4 w-4" />}
                        label="Role"
                        value={currentDashboardEvent.role}
                      />

                      <EventMeta
                        icon={<Clock3 className="h-4 w-4" />}
                        label="Shift"
                        value={currentDashboardEvent.shift}
                      />

                      <EventMeta
                        icon={<MapPin className="h-4 w-4" />}
                        label="Location"
                        value={currentDashboardEvent.location}
                      />
                    </div>

                    <div className="mt-5 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                      {upcomingEventsList.length > 1 ? (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            {upcomingEventsList.map((event, index) => (
                              <button
                                key={event.id}
                                type="button"
                                aria-label={`Go to event ${index + 1}`}
                                onClick={() =>
                                  setCurrentEventIndex(index)
                                }
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  index === currentEventIndex
                                    ? "w-7 bg-primary"
                                    : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                                }`}
                              />
                            ))}
                          </div>

                          <span className="text-xs text-muted-foreground">
                            Swipe to explore
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Your upcoming assignment
                        </span>
                      )}

                      <VSButton
                        asChild
                        variant="outline"
                        className="w-full rounded-xl sm:w-auto"
                      >
                        <Link
                          to="/volunteer/events/$eventId"
                          params={{
                            eventId: currentDashboardEvent.id,
                          }}
                          onClick={(event) =>
                            event.stopPropagation()
                          }
                        >
                          View event details
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </VSButton>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border p-7 text-center sm:p-10">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                    <CalendarDays className="h-5 w-5 text-primary" />
                  </div>

                  <p className="mt-4 text-sm font-semibold text-foreground">
                    No upcoming events
                  </p>

                  <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
                    Find your next opportunity and start
                    volunteering.
                  </p>

                  <VSButton asChild className="mt-5">
                    <Link to="/volunteer/events">
                      Browse events
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </VSButton>
                </div>
              )}
            </VSCardContent>
          </VSCard>
        </section>

        {/* ====================================================== */}
        {/* APPLICATIONS + PROFILE */}
        {/* ====================================================== */}

        <div className="grid min-w-0 gap-5 sm:gap-6 lg:grid-cols-2">
          {/* Applications */}
          <VSCard className="min-w-0 overflow-hidden rounded-[1.5rem] border-border sm:rounded-[2rem]">
            <VSCardContent className="p-4 sm:p-6 lg:p-8">
              <VSSectionHeader
                eyebrow="Applications"
                title="Recent applications"
                action={
                  <Link
                    to="/volunteer/my-events"
                    className="shrink-0 text-xs font-semibold text-primary sm:text-sm"
                  >
                    View all
                  </Link>
                }
              />

              {dashboard.applications.length > 0 ? (
                <div className="mt-5 space-y-2.5 sm:mt-6 sm:space-y-3">
                  {dashboard.applications.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="flex min-w-0 items-center gap-3 rounded-2xl border border-border p-3 transition-colors hover:bg-muted/30 sm:gap-4 sm:p-4"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <CalendarDays className="h-4 w-4 text-primary" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {item.event_title}
                        </p>

                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {item.role_name}
                          <span className="mx-1.5">·</span>
                          {item.submitted_at}
                        </p>
                      </div>

                      <div className="shrink-0">
                        <VSStatusBadge status={item.status} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyDashboardState
                  icon={<CalendarDays className="h-5 w-5" />}
                  title="No applications yet"
                  description="Start exploring events and apply for a volunteer role."
                  action={
                    <Link
                      to="/volunteer/events"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary"
                    >
                      Discover events
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  }
                />
              )}
            </VSCardContent>
          </VSCard>

          {/* Profile */}
          <VSCard className="min-w-0 overflow-hidden rounded-[1.5rem] border-border sm:rounded-[2rem]">
            <VSCardContent className="p-4 sm:p-6 lg:p-8">
              <VSSectionHeader
                eyebrow="Profile completion"
                title="Make your profile work harder"
              />

              <div className="mt-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-3xl font-semibold tracking-tight text-foreground">
                      {profileCompletion}%
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Profile completed
                    </p>
                  </div>

                  <span className="text-xs font-semibold text-primary">
                    {profileCompletion >= 100
                      ? "Complete"
                      : "Almost there"}
                  </span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, profileCompletion),
                      )}%`,
                    }}
                  />
                </div>

                <div className="mt-5 rounded-2xl bg-muted/50 p-4">
                  <p className="text-sm font-semibold text-foreground">
                    {profileCompletion >= 100
                      ? "Your profile is complete."
                      : "Add your skills and languages."}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    A complete profile helps event teams place you
                    in the right role.
                  </p>
                </div>

                <Link
                  to="/volunteer/profile"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary"
                >
                  {profileCompletion >= 100
                    ? "View profile"
                    : "Update profile"}

                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </VSCardContent>
          </VSCard>
        </div>

        {/* ====================================================== */}
        {/* ACHIEVEMENTS */}
        {/* ====================================================== */}

        <section>
          <VSSectionHeader
            eyebrow="Milestones"
            title="Achievements"
            action={
              <Link
                to="/volunteer/achievements"
                className="text-xs font-semibold text-primary sm:text-sm"
              >
                See all
              </Link>
            }
          />

          {dashboard.achievements.length > 0 ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {dashboard.achievements.slice(0, 3).map((item) => (
                <VSCard
                  key={item.title}
                  className="rounded-[1.5rem] border-border transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-float)]"
                >
                  <VSCardContent className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          item.unlocked
                            ? "bg-primary/10"
                            : "bg-muted"
                        }`}
                      >
                        <Trophy
                          className={
                            item.unlocked
                              ? "h-5 w-5 text-primary"
                              : "h-5 w-5 text-muted-foreground"
                          }
                        />
                      </div>

                      {item.unlocked && (
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                          Unlocked
                        </span>
                      )}
                    </div>

                    <p className="mt-5 text-sm font-semibold text-foreground">
                      {item.title}
                    </p>

                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-700"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(0, item.progress),
                            )}%`,
                          }}
                        />
                      </div>

                      <span className="shrink-0 text-[11px] font-semibold text-muted-foreground">
                        {item.progress}%
                      </span>
                    </div>
                  </VSCardContent>
                </VSCard>
              ))}
            </div>
          ) : (
            <EmptyDashboardState
              icon={<Trophy className="h-5 w-5" />}
              title="Your achievements will appear here"
              description="Keep volunteering to unlock your first milestones."
            />
          )}
        </section>
      </div>
    </AppShell>
  );
}

/* ============================================================ */
/* SMALL UI HELPERS */
/* ============================================================ */

function EventMeta({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-xl bg-muted/50 p-3 sm:rounded-2xl sm:p-3.5">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>

      <p className="mt-2 truncate text-xs font-semibold text-foreground sm:text-sm">
        {value}
      </p>
    </div>
  );
}

function EmptyDashboardState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-border p-6 text-center sm:mt-6 sm:p-8">
      {icon && (
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          {icon}
        </div>
      )}

      <p className="mt-4 text-sm font-semibold text-foreground">
        {title}
      </p>

      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
        {description}
      </p>

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function MyEventsPage() {
  const [events, setEvents] = useState<MyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    eventService
      .getMyEvents()
      .then(setEvents)
      .catch((err: unknown) => {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your events.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <AppShell title="My events">
      <div className="mx-auto w-full max-w-7xl min-w-0">
        <VSPageHeader
          eyebrow="Your commitments"
          title="The events you are part of"
          description="Everything you need before event day, from your role to accreditation and attendance."
        />

        {/* Loading */}
        {loading && (
          <div className="mt-6 sm:mt-8">
            <VSLoadingState message="Loading your events…" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-6 sm:mt-8">
            <VSErrorState
              title="Unable to load your events"
              description={error}
            />
          </div>
        )}

        {/* Empty */}
        {!loading && !error && events.length === 0 && (
          <div className="mt-6 sm:mt-8">
            <VSEmptyState
              title="No accepted events yet"
              description="Once an event team accepts your application, the event will appear here."
              action={
                <Link
                  to="/volunteer/events"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md sm:w-auto"
                >
                  Browse events
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              }
            />
          </div>
        )}

        {/* Events */}
        {!loading && !error && events.length > 0 && (
          <div className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">
            {/* Summary */}
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <CalendarDays className="h-5 w-5 text-primary" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    Your accepted events
                  </p>

                  <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                    Stay on top of your upcoming commitments.
                  </p>
                </div>
              </div>

              <div className="w-fit rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                {events.length} {events.length === 1 ? "event" : "events"}
              </div>
            </div>

            {/* Event cards */}
            <div className="grid min-w-0 gap-4 lg:grid-cols-2 lg:gap-5">
              {events.map((item) => (
                <VSCard
                  key={item.id}
                  className="group min-w-0 overflow-hidden rounded-[1.5rem] border-border bg-card transition duration-300 sm:rounded-[2rem] hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
                >
                  <VSCardContent className="p-0">
                    {/* Card header */}
                    <div className="border-b border-border p-4 sm:p-6 lg:p-7">
                      <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <VSStatusBadge status={item.status} />

                          <h2 className="mt-3 break-words text-lg font-semibold leading-snug tracking-tight text-foreground sm:mt-4 sm:text-2xl">
                            {item.event}
                          </h2>

                          {/* Location + date */}
                          <div className="mt-3 space-y-2 text-sm text-muted-foreground sm:flex sm:flex-wrap sm:gap-x-4 sm:gap-y-2 sm:space-y-0">
                            <span className="flex min-w-0 items-start gap-2">
                              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                              <span className="break-words">
                                {item.location}
                              </span>
                            </span>

                            <span className="flex min-w-0 items-start gap-2">
                              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                              <span className="break-words">
                                {item.date}
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* Event icon */}
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 sm:h-11 sm:w-11 sm:rounded-2xl">
                          <CalendarDays className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                        </div>
                      </div>
                    </div>

                    {/* Event information */}
                    <div className="p-4 sm:p-6 lg:p-7">
                      <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
                        <EventInfo
                          icon={<Users className="h-4 w-4" />}
                          label="Role"
                          value={item.role}
                        />

                        <EventInfo
                          icon={<Clock3 className="h-4 w-4" />}
                          label="Shift"
                          value={item.shift}
                        />

                        <EventInfo
                          icon={<GraduationCap className="h-4 w-4" />}
                          label="Training"
                          value={item.training}
                        />

                        <EventInfo
                          icon={<BadgeCheck className="h-4 w-4" />}
                          label="Accreditation"
                          value={item.accreditation}
                        />

                        <EventInfo
                          icon={<ClipboardCheck className="h-4 w-4" />}
                          label="Attendance"
                          value={item.attendance}
                          className="sm:col-span-2"
                        />
                      </div>

                      {/* Actions */}
                      <div className="mt-5 flex flex-col gap-2.5 border-t border-border pt-5 sm:mt-6 sm:flex-row sm:gap-3 sm:pt-6">
                        <Link
                          to="/volunteer/events/$eventId"
                          params={{
                            eventId: item.eventId,
                          }}
                          className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md sm:flex-1"
                        >
                          View event

                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>

                        <Link
                          to="/volunteer/accreditation"
                          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary sm:flex-1"
                        >
                          Accreditation

                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </VSCardContent>
                </VSCard>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function EventInfo({
  icon,
  label,
  value,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`min-w-0 rounded-xl border border-border bg-background/60 p-3.5 transition hover:border-primary/30 hover:bg-primary/5 sm:rounded-2xl sm:p-4 ${className}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-9 sm:w-9 sm:rounded-xl">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground sm:text-[11px] sm:tracking-wider">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-semibold leading-5 text-foreground">
            {value || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}




// export function CertificatesPage() {
//   return (
//     <AppShell title="Certificates">
//       <div className="mx-auto max-w-7xl">
//         <VSPageHeader
//           eyebrow="Proof of impact"
//           title="Certificates you have earned"
//           description="Keep a record of the events and hours that shaped your volunteer journey."
//         />
//         <div className="mt-8 grid gap-5 lg:grid-cols-2">
//           {volunteerContentService.getCertificates().map((certificate) => (
//             <VSCard key={certificate.id} className="overflow-hidden rounded-[2rem] border-border">
//               <div className="bg-ink p-7 text-white">
//                 <div className="flex items-center justify-between">
//                   <ShieldCheck className="h-7 w-7 text-primary" />
//                   <span className="font-mono text-xs text-white/60">{certificate.id}</span>
//                 </div>
//                 <p className="mt-12 text-xs uppercase tracking-[0.22em] text-white/55">
//                   Certificate of contribution
//                 </p>
//                 <h2 className="mt-3 text-2xl font-semibold">{certificate.event}</h2>
//               </div>
//               <VSCardContent className="p-6">
//                 <div className="grid gap-4 sm:grid-cols-3">
//                   <Info label="Role" value={certificate.role} />
//                   <Info label="Hours" value={`${certificate.hours} hours`} />
//                   <Info label="Issued" value={certificate.date} />
//                 </div>
//                 <div className="mt-6 flex flex-wrap gap-3">
//                   <VSButton asChild size="sm">
//                     <Link
//                       to="/certificates/$certificateId"
//                       params={{ certificateId: certificate.id }}
//                     >
//                       View details
//                     </Link>
//                   </VSButton>
//                   <VSButton variant="outline" size="sm">
//                     <Download className="h-4 w-4" />
//                     Download
//                   </VSButton>
//                 </div>
//               </VSCardContent>
//             </VSCard>
//           ))}
//         </div>
//       </div>
//     </AppShell>
//   );
// }

export function TrainingPage() {
  const completed = volunteerContentService.getTraining().filter((item) => item.complete).length;
  return (
    <AppShell title="Training">
      <div className="mx-auto max-w-7xl">
        <VSPageHeader
          eyebrow="Preparation"
          title="Train with confidence"
          description="Build the knowledge and habits that make event days safer, calmer, and more human."
        />
        <VSCard className="mt-8 rounded-[2rem] border-border">
          <VSCardContent className="p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow">Your progress</p>
                <p className="mt-2 text-3xl font-semibold text-foreground">
                  {completed} of {volunteerContentService.getTraining().length} modules complete
                </p>
              </div>
              <VSBadge variant="soft">
                {Math.round((completed / volunteerContentService.getTraining().length) * 100)}%
              </VSBadge>
            </div>
            <div className="mt-5 h-2 rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{
                  width: `${(completed / volunteerContentService.getTraining().length) * 100}%`,
                }}
              />
            </div>
          </VSCardContent>
        </VSCard>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {volunteerContentService.getTraining().map((item) => (
            <VSCard key={item.id} className="rounded-[1.75rem] border-border">
              <VSCardContent className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <VSBadge variant={item.complete ? "soft" : "outline"}>
                    {item.complete ? "Complete" : "To do"}
                  </VSBadge>
                  <span className="text-xs text-muted-foreground">{item.duration}</span>
                </div>
                <h2 className="mt-5 text-lg font-semibold text-foreground">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                <VSButton
                  asChild
                  variant={item.complete ? "outline" : "default"}
                  size="sm"
                  className="mt-6"
                >
                  <Link to="/volunteer/training/$trainingId" params={{ trainingId: item.id }}>
                    {item.complete ? "Review module" : "Start module"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </VSButton>
              </VSCardContent>
            </VSCard>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

export function TrainingDetailPage({ trainingId }: { trainingId: string }) {
  const item =
    volunteerContentService.getTraining().find((training) => training.id === trainingId) ??
    volunteerContentService.getTraining()[0];
  return (
    <AppShell title="Training detail">
      <div className="mx-auto max-w-4xl">
        <VSPageHeader
          eyebrow="Preparation module"
          title={item.title}
          description={item.description}
          action={
            <VSBadge variant={item.complete ? "soft" : "outline"}>
              {item.complete ? "Complete" : "In progress"}
            </VSBadge>
          }
        />
        <VSCard className="mt-8 rounded-[2rem] border-border">
          <VSCardContent className="p-6 sm:p-8">
            <div className="flex aspect-video items-center justify-center rounded-3xl bg-ink text-white">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary">
                  <ExternalLink className="h-6 w-6" />
                </div>
                <p className="mt-4 text-sm font-semibold">Video lesson placeholder</p>
                <p className="mt-1 text-xs text-white/60">
                  {item.duration} · ready for your next session
                </p>
              </div>
            </div>
            <div className="mt-8">
              <VSSectionHeader eyebrow="Resources" title="Keep exploring" />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {item.resources.map((resource) => (
                  <a
                    key={resource.title}
                    href={resource.url}
                    className="flex items-center justify-between rounded-2xl border border-border p-4 transition hover:border-primary/40"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-foreground">
                        {resource.title}
                      </span>
                      <span className="mt-1 block text-xs uppercase tracking-wider text-muted-foreground">
                        {resource.type}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </a>
                ))}
              </div>
            </div>
            <VSButton className="mt-8">
              {item.complete ? "Mark as reviewed" : "Mark module complete"}
              <CheckCircle2 className="h-4 w-4" />
            </VSButton>
          </VSCardContent>
        </VSCard>
      </div>
    </AppShell>
  );
}

// export function AccreditationPage() {
//   return (
//     <AppShell title="Accreditation">
//       <div className="mx-auto max-w-3xl">
//         <VSPageHeader
//           eyebrow="Event access"
//           title="Your accreditation"
//           description="Keep your event credentials ready for arrival and check-in."
//         />
//         <VSCard className="mt-8 overflow-hidden rounded-[2rem] border-border">
//           <div className="bg-ink p-6 text-white sm:p-8">
//             <div className="flex items-start justify-between gap-5">
//               <div>
//                 <VSBadge variant="dark">
//                   {volunteerContentService.getAccreditation().status}
//                 </VSBadge>
//                 <h2 className="mt-5 text-2xl font-semibold">
//                   {volunteerContentService.getAccreditation().event}
//                 </h2>
//                 <p className="mt-2 text-sm text-white/65">
//                   {volunteerContentService.getAccreditation().role} ·{" "}
//                   {volunteerContentService.getAccreditation().zone}
//                 </p>
//               </div>
//               <QrCode className="h-10 w-10 text-primary" />
//             </div>
//           </div>
//           <VSCardContent className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
//             <Info label="Volunteer" value={volunteerContentService.getAccreditation().volunteer} />
//             <Info
//               label="Volunteer ID"
//               value={volunteerContentService.getAccreditation().volunteerId}
//             />
//             <Info label="Event" value={volunteerContentService.getAccreditation().event} />
//             <Info label="Zone" value={volunteerContentService.getAccreditation().zone} />
//             <div className="flex aspect-square items-center justify-center rounded-3xl border-2 border-dashed border-border bg-muted/50 sm:col-span-2">
//               <div className="text-center">
//                 <QrCode className="mx-auto h-20 w-20 text-ink" />
//                 <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
//                   QR placeholder
//                 </p>
//               </div>
//             </div>
//           </VSCardContent>
//         </VSCard>
//       </div>
//     </AppShell>
//   );
// }

export function AttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadAttendance() {
      try {
        setLoading(true);
        setError(null);

        const data = await getAttendance();

        if (mounted) {
          setAttendance(data);
        }
      } catch (err: unknown) {
        console.error("Failed to load attendance:", err);

        if (mounted) {
          setError(err instanceof Error ? err.message : "Unable to load your attendance records.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadAttendance();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AppShell title="Attendance">
      <div className="mx-auto max-w-6xl">
        <VSPageHeader
          eyebrow="Event day records"
          title="Your attendance"
          description="Review your check-in and check-out records across your volunteer assignments."
        />

        {/* Loading */}
        {loading && (
          <div className="mt-8 space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-[1.75rem] border border-border bg-muted/40"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-8">
            <VSErrorState title="Unable to load your attendance" description={error} />
          </div>
        )}

        {/* Empty */}
        {!loading && !error && attendance.length === 0 && (
          <div className="mt-8">
            <VSEmptyState
              title="No attendance records yet"
              description="Your check-in and check-out records will appear here when you attend your volunteer assignments."
            />
          </div>
        )}

        {/* Attendance records */}
        {!loading && !error && attendance.length > 0 && (
          <div className="mt-8 space-y-4">
            {attendance.map((item) => (
              <VSCard key={item.id} className="rounded-[1.75rem] border-border">
                <VSCardContent className="p-5 sm:p-6">
                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                    {/* Event information */}
                    <div className="min-w-0">
                      <VSStatusBadge status={item.status} />

                      <h2 className="mt-3 text-lg font-semibold text-foreground">
                        {item.event_title || "Volunteer event"}
                      </h2>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.role_name || "Volunteer role"} · {item.date}
                      </p>
                    </div>

                    {/* Attendance times */}
                    <div className="grid grid-cols-2 gap-6 sm:gap-8">
                      <Info
                        label="Check-in"
                        value={item.check_in_time ?? "Not recorded"}
                        icon={<Clock3 className="h-3.5 w-3.5" />}
                      />

                      <Info
                        label="Check-out"
                        value={item.check_out_time ?? "Not recorded"}
                        icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                      />
                    </div>
                  </div>
                </VSCardContent>
              </VSCard>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

// export function NotificationsPage() {
//   const unread = volunteerContentService.getNotifications().filter((item) => !item.read).length;
//   return (
//     <AppShell title="Notifications">
//       <div className="mx-auto max-w-3xl">
//         <VSPageHeader
//           eyebrow="Stay in the loop"
//           title="Notifications"
//           description={`${unread} unread updates from your volunteer journey.`}
//           action={
//             <VSButton variant="outline" size="sm">
//               Mark all read
//             </VSButton>
//           }
//         />
//         <div className="mt-8 space-y-3">
//           {volunteerContentService.getNotifications().map((item) => (
//             <VSNotificationItem
//               key={item.id}
//               title={item.title}
//               description={item.body}
//               timestamp={item.date}
//               unread={!item.read}
//               href="/notifications"
//             />
//           ))}
//         </div>
//       </div>
//     </AppShell>
//   );
// }

function QuickAction({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      to={href}
      className="flex items-center justify-between rounded-2xl border border-border p-4 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:bg-muted/60"
    >
      <span className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </span>
        {label}
      </span>
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
function Info({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
function ProgressRow({ label, value, total }: { label: string; value: number; total: number }) {
  const progress = total ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between gap-4 text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">{value}h</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
