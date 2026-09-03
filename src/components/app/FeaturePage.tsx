// import { Link } from "@tanstack/react-router";
// import {
//   Award,
//   ArrowRight,
//   CalendarDays,
//   CheckCircle2,
//   Clock3,
//   Download,
//   ExternalLink,
//   FileCheck2,
//   MapPin,
//   QrCode,
//   ShieldCheck,
//   Trophy,
//   Users,
// } from "lucide-react";
// import { AppShell } from "@/components/app/AppShell";
// import {
//   VSAvatar,
//   VSBadge,
//   VSButton,
//   VSCard,
//   VSCardContent,
//   VSEmptyState,
//   VSNotificationItem,
//   VSPageHeader,
//   VSSectionHeader,
//   VSStatCard,
//   VSStatusBadge,
//   VSTabs,
// } from "@/components/design-system";
import { volunteerContentService } from "@/services/volunteerContentService";
// import { useAuth } from "@/lib/auth";


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

import { getVolunteerDashboard } from "@/services/backendService";

import { VolunteerDashboard } from "@/lib/types";

import {
  eventService,
  type MyEvent,
} from "@/services/eventService";


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
      current >= upcomingEventsList.length - 1
        ? 0
        : current + 1,
    );
  };

  const goToPreviousEvent = () => {
    if (upcomingEventsList.length <= 1) return;

    setCurrentEventIndex((current) =>
      current <= 0
        ? upcomingEventsList.length - 1
        : current - 1,
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
        current >= upcomingEventsList.length - 1
          ? 0
          : current + 1,
      );
    }, 4000);

    return () => {
      window.clearInterval(interval);
    };
  }, [upcomingEventsList.length]);

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

    const distance =
      dragStartX.current - dragCurrentX.current;

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
        <div className="mx-auto max-w-7xl space-y-8">
          <VSPageHeader
            eyebrow="Your volunteer journey"
            title={`Welcome, ${firstName}.`}
            description="Everything you need to keep showing up for the moments that matter."
          />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-[1.5rem] border border-border bg-muted/40"
              />
            ))}
          </div>

          <div className="h-72 animate-pulse rounded-[2rem] border border-border bg-muted/40" />

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-64 animate-pulse rounded-[2rem] border border-border bg-muted/40" />
            <div className="h-64 animate-pulse rounded-[2rem] border border-border bg-muted/40" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (dashboardError) {
    return (
      <AppShell title="Dashboard">
        <div className="mx-auto max-w-7xl space-y-8">
          <VSPageHeader
            eyebrow="Your volunteer journey"
            title={`Welcome, ${firstName}.`}
            description="Everything you need to keep showing up for the moments that matter."
          />

          <VSCard className="rounded-[2rem] border-border">
            <VSCardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
                  <span className="text-sm font-bold text-destructive">!</span>
                </div>

                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Unable to load your dashboard
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
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

  const upcomingEvent = dashboard?.upcomingEvent;
  const profileCompletion = dashboard?.profileCompletion;

  return (
    <AppShell title="Dashboard">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <VSPageHeader
          eyebrow="Your volunteer journey"
          title={`Welcome, ${firstName}.`}
          description="Everything you need to keep showing up for the moments that matter."
          action={
            <VSButton asChild>
              <Link to="/events">
                Discover events
                <ArrowRight className="h-4 w-4" />
              </Link>
            </VSButton>
          }
        />

        {/* Hero */}
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
              to={upcomingEvent ? "/my-events" : "/events"}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              {upcomingEvent ? "View my event" : "Discover events"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

        
        {/* Upcoming Event + Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <VSCard className="rounded-[2rem] border-border shadow-[var(--shadow-float)]">
            <VSCardContent className="p-6 sm:p-8">
              <VSSectionHeader
                eyebrow="Upcoming events"
                title="Your next opportunities"
              />

              {upcomingEventsList.length > 0 && currentDashboardEvent ? (
                <div className="mt-6">
                  <div
                    className={`relative select-none overflow-hidden rounded-[1.5rem] border border-border bg-card ${
                      isDragging ? "cursor-grabbing" : "cursor-grab"
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
                    style={{
                      touchAction: "pan-y",
                    }}
                  >
                    {/* Event Image */}
                    <div className="relative aspect-[16/8] overflow-hidden bg-ink sm:aspect-[16/7]">
                      {currentDashboardEvent.cover_url ? (
                        <img
                          src={currentDashboardEvent.cover_url}
                          alt={currentDashboardEvent.title}
                          draggable={false}
                          className={`h-full w-full object-cover transition-transform duration-500 ${
                            isDragging ? "scale-[1.02]" : "hover:scale-105"
                          }`}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <CalendarDays className="h-10 w-10 text-white/40" />
                        </div>
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-5">
                        <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-black">
                          Upcoming
                        </span>
                      </div>

                      {/* Previous */}
                      {upcomingEventsList.length > 1 && (
                        <button
                          type="button"
                          aria-label="Previous event"
                          onClick={(event) => {
                            event.stopPropagation();
                            goToPreviousEvent();
                          }}
                          className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition hover:bg-black/65"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                      )}

                      {/* Next */}
                      {upcomingEventsList.length > 1 && (
                        <button
                          type="button"
                          aria-label="Next event"
                          onClick={(event) => {
                            event.stopPropagation();
                            goToNextEvent();
                          }}
                          className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition hover:bg-black/65"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                            {currentDashboardEvent.title}
                          </h3>

                          <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            <div className="flex items-center gap-3">
                              <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />

                              <span className="text-sm text-muted-foreground">
                                {currentDashboardEvent.date}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <Users className="h-4 w-4 shrink-0 text-muted-foreground" />

                              <span className="text-sm text-muted-foreground">
                                {currentDashboardEvent.role}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <Clock3 className="h-4 w-4 shrink-0 text-muted-foreground" />

                              <span className="text-sm text-muted-foreground">
                                {currentDashboardEvent.shift}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />

                              <span className="line-clamp-1 text-sm text-muted-foreground">
                                {currentDashboardEvent.location}
                              </span>
                            </div>
                          </div>
                        </div>

                        <VSButton
                          asChild
                          variant="outline"
                          className="w-full shrink-0 rounded-xl sm:w-auto"
                        >
                          <Link
                            to="/events/$eventId"
                            params={{
                              eventId: currentDashboardEvent.id,
                            }}
                            onClick={(event) => {
                              event.stopPropagation();
                            }}
                          >
                            View event details
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </VSButton>
                      </div>

                      {/* Carousel indicators */}
                      {upcomingEventsList.length > 1 && (
                        <div className="mt-6 flex items-center justify-between gap-4 border-t border-border pt-5">
                          <p className="text-xs text-muted-foreground">
                            {currentEventIndex + 1} of{" "}
                            {upcomingEventsList.length}
                          </p>

                          <div className="flex items-center gap-1.5">
                            {upcomingEventsList.map((event, index) => (
                              <button
                                key={event.id}
                                type="button"
                                aria-label={`Go to event ${index + 1}`}
                                onClick={() => setCurrentEventIndex(index)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  index === currentEventIndex
                                    ? "w-7 bg-primary"
                                    : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                                }`}
                              />
                            ))}
                          </div>

                          <p className="hidden text-xs text-muted-foreground sm:block">
                            
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-border p-6 text-center">
                  <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground" />

                  <p className="mt-3 text-sm font-semibold text-foreground">
                    No upcoming events
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Find your next opportunity and start volunteering.
                  </p>

                  <VSButton asChild className="mt-4">
                    <Link to="/events">
                      Browse events
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </VSButton>
                </div>
              )}
            </VSCardContent>
          </VSCard>

          <VSCard className="rounded-[2rem] border-border shadow-[var(--shadow-float)]">
            <VSCardContent className="p-6 sm:p-8">
              <VSSectionHeader
                eyebrow="Quick actions"
                title="Keep moving"
              />

              <div className="mt-6 space-y-3">
                <QuickAction
                  href="/schedule"
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="View schedule"
                />

                <QuickAction
                  href="/training"
                  icon={<ShieldCheck className="h-4 w-4" />}
                  label="Continue training"
                />

                <QuickAction
                  href="/hours"
                  icon={<Clock3 className="h-4 w-4" />}
                  label="Review impact"
                />
              </div>
            </VSCardContent>
          </VSCard>
        </div>


        {/* Applications + Profile */}
        <div className="grid min-w-0 gap-5 sm:gap-6 lg:grid-cols-2">

          {/* Applications */}
          <VSCard className="min-w-0 overflow-hidden rounded-[1.5rem] border-border sm:rounded-[2rem]">
            <VSCardContent className="p-4 sm:p-6 lg:p-8">
              <VSSectionHeader
                eyebrow="Applications"
                title="Recent applications"
                action={
                  <Link
                    to="/applications"
                    className="shrink-0 text-xs font-semibold text-primary sm:text-sm"
                  >
                    View all
                  </Link>
                }
              />

              {dashboard.applications.length > 0 ? (
                <div className="mt-5 space-y-3 sm:mt-6">
                  {dashboard.applications.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="
                        flex
                        min-w-0
                        flex-col
                        gap-3
                        rounded-2xl
                        border
                        border-border
                        p-3.5
                        transition-colors
                        hover:bg-muted/30
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        sm:gap-4
                        sm:p-4
                      "
                    >
                      {/* Application information */}
                      <div className="min-w-0 flex-1">
                        <p
                          className="
                            overflow-hidden
                            text-sm
                            font-semibold
                            leading-5
                            text-foreground
                            [display:-webkit-box]
                            [-webkit-box-orient:vertical]
                            [-webkit-line-clamp:2]
                          "
                        >
                          {item.event_title}
                        </p>

                        <p className="mt-1.5 overflow-hidden text-xs leading-5 text-muted-foreground">
                          <span className="break-words">
                            {item.role_name}
                          </span>

                          <span className="mx-1">·</span>

                          <span>{item.submitted_at}</span>
                        </p>
                      </div>

                      {/* Status */}
                      <div className="flex shrink-0 items-center sm:self-center">
                        <VSStatusBadge status={item.status} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-border p-5 text-center sm:mt-6 sm:p-6">
                  <p className="text-sm font-semibold text-foreground">
                    No applications yet
                  </p>

                  <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
                    Start exploring events and apply for a volunteer role.
                  </p>

                  <Link
                    to="/events"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary"
                  >
                    Discover events
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </VSCardContent>
          </VSCard>


          {/* Profile completion */}
          <VSCard className="min-w-0 overflow-hidden rounded-[1.5rem] border-border sm:rounded-[2rem]">
            <VSCardContent className="p-4 sm:p-6 lg:p-8">
              <VSSectionHeader
                eyebrow="Profile completion"
                title="Make your profile work harder"
              />

              <div className="mt-5 flex min-w-0 flex-col gap-5 sm:mt-6 sm:flex-row sm:items-center sm:gap-5">

                {/* Progress circle */}
                <div className="relative mx-auto h-20 w-20 shrink-0 rounded-full bg-muted sm:mx-0">
                  <div className="absolute inset-1 rounded-full bg-card" />

                  <div
                    className="absolute inset-0 rounded-full border-4 border-primary"
                    style={{
                      clipPath: `inset(${100 - profileCompletion}% 0 0 0)`,
                    }}
                  />

                  <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-foreground">
                    {profileCompletion}%
                  </span>
                </div>

                {/* Profile text */}
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <p className="text-sm font-semibold leading-5 text-foreground">
                    {profileCompletion >= 100
                      ? "Your profile is complete."
                      : "Add your skills and languages."}
                  </p>

                  <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-muted-foreground sm:mx-0">
                    A complete profile helps event teams place you in the right role.
                  </p>

                  <Link
                    to="/profile"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary"
                  >
                    {profileCompletion >= 100
                      ? "View profile"
                      : "Update profile"}

                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </VSCardContent>
          </VSCard>

        </div>

        {/* Achievements */}
        <section>
          <VSSectionHeader
            eyebrow="Milestones"
            title="Achievements"
            action={
              <Link
                to="/achievements"
                className="text-sm font-semibold text-primary"
              >
                See all
              </Link>
            }
          />

          {dashboard.achievements.length > 0 ? (
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {dashboard.achievements.slice(0, 3).map((item) => (
                <VSCard
                  key={item.title}
                  className="rounded-[1.5rem] border-border"
                >
                  <VSCardContent className="p-5">
                    <Trophy
                      className={
                        item.unlocked
                          ? "h-6 w-6 text-primary"
                          : "h-6 w-6 text-muted-foreground"
                      }
                    />

                    <p className="mt-4 text-sm font-semibold text-foreground">
                      {item.title}
                    </p>

                    <div className="mt-4 h-1.5 rounded-full bg-muted">
                      <div
                        className={
                          item.unlocked
                            ? "h-full rounded-full bg-primary"
                            : "h-full rounded-full bg-muted-foreground/40"
                        }
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(0, item.progress),
                          )}%`,
                        }}
                      />
                    </div>

                    <p className="mt-2 text-xs text-muted-foreground">
                      {item.progress}% complete
                    </p>
                  </VSCardContent>
                </VSCard>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-[1.5rem] border border-dashed border-border p-8 text-center">
              <Trophy className="mx-auto h-8 w-8 text-muted-foreground" />

              <p className="mt-3 text-sm font-semibold text-foreground">
                Your achievements will appear here
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Keep volunteering to unlock your first milestones.
              </p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
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
      <div className="mx-auto max-w-7xl">
        <VSPageHeader
          eyebrow="Your commitments"
          title="The events you are part of"
          description="Everything you need before event day, from your role to accreditation and attendance."
        />

        {loading && (
          <div className="mt-8">
            <VSLoadingState message="Loading your events…" />
          </div>
        )}

        {!loading && error && (
          <div className="mt-8">
            <VSErrorState
              title="Unable to load your events"
              description={error}
            />
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="mt-8">
            <VSEmptyState
              title="No accepted events yet"
              description="Once an event team accepts your application, the event will appear here."
              action={
                <Link
                  to="/events"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
                >
                  Browse events
                  <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {events.map((item) => (
              <VSCard
                key={item.id}
                className="rounded-[2rem] border-border"
              >
                <VSCardContent className="p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <VSStatusBadge status="accepted" />

                      <h2 className="mt-4 text-2xl font-semibold text-foreground">
                        {item.event}
                      </h2>

                      <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {item.location}
                      </p>
                    </div>

                    <CalendarDays className="h-6 w-6 text-primary" />
                  </div>

                  <div className="mt-7 grid gap-4 sm:grid-cols-2">
                    <Info
                      label="Date"
                      value={item.date}
                    />

                    <Info
                      label="Role"
                      value={item.role}
                    />

                    <Info
                      label="Shift"
                      value={item.shift}
                    />

                    <Info
                      label="Training"
                      value={item.training}
                    />

                    <Info
                      label="Accreditation"
                      value={item.accreditation}
                    />

                    <Info
                      label="Attendance"
                      value={item.attendance}
                    />
                  </div>

                  <div className="mt-7 flex flex-wrap gap-4">
                    <Link
                      to="/accreditation"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                    >
                      View accreditation
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                    <Link
                      to="/events/$eventId"
                      params={{
                        eventId: item.eventId,
                      }}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"
                    >
                      View event
                      <ArrowRight className="h-4 w-4" />
                    </Link>
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

export function SchedulePage() {
  return (
    <AppShell title="Schedule">
      <div className="mx-auto max-w-5xl">
        <VSPageHeader
          eyebrow="Event day view"
          title="Your schedule at a glance"
          description="A mobile-first view for the moments when you need the right information quickly."
        />
        <div className="mt-8 space-y-4">
          {volunteerContentService.getSchedule().map((item) => (
            <VSCard key={item.id} className="rounded-[1.75rem] border-border">
              <VSCardContent className="p-5 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-ink text-white">
                    <span className="text-xs uppercase text-white/60">{item.month}</span>
                    <span className="text-xl font-semibold">{item.date.split(" ")[0]}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                      {item.start} — {item.end}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-foreground">{item.event}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.role} · {item.shift}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {item.location}
                    </p>
                  </div>
                  <Clock3 className="hidden h-5 w-5 text-muted-foreground sm:block" />
                </div>
                <div className="mt-5 rounded-2xl bg-muted/60 p-4 text-sm leading-6 text-muted-foreground">
                  <span className="font-semibold text-foreground">Instructions: </span>
                  {item.instructions}
                </div>
              </VSCardContent>
            </VSCard>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

export function HoursPage() {
  return (
    <AppShell title="Volunteer hours">
      <div className="mx-auto max-w-7xl">
        <VSPageHeader
          eyebrow="Your impact"
          title="Every hour counts"
          description="Track the time, consistency, and community impact behind your volunteer journey."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <VSStatCard
            label="Total hours"
            value={volunteerContentService.getHours().total}
            icon={<Clock3 className="h-5 w-5" />}
          />
          <VSStatCard
            label="Current year"
            value={volunteerContentService.getHours().currentYear}
            icon={<CalendarDays className="h-5 w-5" />}
            accent
          />
          <VSStatCard
            label="Events completed"
            value={volunteerContentService.getHours().eventsCompleted}
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <VSCard className="rounded-[2rem] border-border">
            <VSCardContent className="p-6 sm:p-8">
              <VSSectionHeader eyebrow="By sport" title="Where your time goes" />
              <div className="mt-6 space-y-5">
                {volunteerContentService.getHours().bySport.map((item) => (
                  <ProgressRow
                    key={item.label}
                    label={item.label}
                    value={item.value}
                    total={volunteerContentService.getHours().total}
                  />
                ))}
              </div>
            </VSCardContent>
          </VSCard>
          <VSCard className="rounded-[2rem] border-border">
            <VSCardContent className="p-6 sm:p-8">
              <VSSectionHeader eyebrow="By event" title="Your event history" />
              <div className="mt-6 space-y-5">
                {volunteerContentService.getHours().byEvent.map((item) => (
                  <ProgressRow
                    key={item.label}
                    label={item.label}
                    value={item.value}
                    total={volunteerContentService.getHours().total}
                  />
                ))}
              </div>
            </VSCardContent>
          </VSCard>
        </div>
      </div>
    </AppShell>
  );
}

export function AchievementsPage() {
  return (
    <AppShell title="Achievements">
      <div className="mx-auto max-w-7xl">
        <VSPageHeader
          eyebrow="Keep growing"
          title="Milestones worth celebrating"
          description="Small commitments become a track record you can carry with you."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {volunteerContentService.getAchievements().map((item) => (
            <VSCard key={item.title} className="rounded-[1.75rem] border-border">
              <VSCardContent className="p-6">
                <Trophy
                  className={
                    item.unlocked ? "h-7 w-7 text-primary" : "h-7 w-7 text-muted-foreground"
                  }
                />
                <div className="mt-5 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-foreground">{item.title}</h2>
                  <VSBadge variant={item.unlocked ? "soft" : "outline"}>
                    {item.unlocked ? "Unlocked" : "Locked"}
                  </VSBadge>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                <div className="mt-6 h-2 rounded-full bg-muted">
                  <div
                    className={
                      item.unlocked
                        ? "h-full rounded-full bg-primary"
                        : "h-full rounded-full bg-muted-foreground/40"
                    }
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs font-semibold text-muted-foreground">
                  {item.progress}% complete
                </p>
              </VSCardContent>
            </VSCard>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

export function CertificatesPage() {
  return (
    <AppShell title="Certificates">
      <div className="mx-auto max-w-7xl">
        <VSPageHeader
          eyebrow="Proof of impact"
          title="Certificates you have earned"
          description="Keep a record of the events and hours that shaped your volunteer journey."
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {volunteerContentService.getCertificates().map((certificate) => (
            <VSCard key={certificate.id} className="overflow-hidden rounded-[2rem] border-border">
              <div className="bg-ink p-7 text-white">
                <div className="flex items-center justify-between">
                  <ShieldCheck className="h-7 w-7 text-primary" />
                  <span className="font-mono text-xs text-white/60">{certificate.id}</span>
                </div>
                <p className="mt-12 text-xs uppercase tracking-[0.22em] text-white/55">
                  Certificate of contribution
                </p>
                <h2 className="mt-3 text-2xl font-semibold">{certificate.event}</h2>
              </div>
              <VSCardContent className="p-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Info label="Role" value={certificate.role} />
                  <Info label="Hours" value={`${certificate.hours} hours`} />
                  <Info label="Issued" value={certificate.date} />
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <VSButton asChild size="sm">
                    <Link
                      to="/certificates/$certificateId"
                      params={{ certificateId: certificate.id }}
                    >
                      View details
                    </Link>
                  </VSButton>
                  <VSButton variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                    Download
                  </VSButton>
                </div>
              </VSCardContent>
            </VSCard>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

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
                  <Link to="/training/$trainingId" params={{ trainingId: item.id }}>
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

export function AccreditationPage() {
  return (
    <AppShell title="Accreditation">
      <div className="mx-auto max-w-3xl">
        <VSPageHeader
          eyebrow="Event access"
          title="Your accreditation"
          description="Keep your event credentials ready for arrival and check-in."
        />
        <VSCard className="mt-8 overflow-hidden rounded-[2rem] border-border">
          <div className="bg-ink p-6 text-white sm:p-8">
            <div className="flex items-start justify-between gap-5">
              <div>
                <VSBadge variant="dark">
                  {volunteerContentService.getAccreditation().status}
                </VSBadge>
                <h2 className="mt-5 text-2xl font-semibold">
                  {volunteerContentService.getAccreditation().event}
                </h2>
                <p className="mt-2 text-sm text-white/65">
                  {volunteerContentService.getAccreditation().role} ·{" "}
                  {volunteerContentService.getAccreditation().zone}
                </p>
              </div>
              <QrCode className="h-10 w-10 text-primary" />
            </div>
          </div>
          <VSCardContent className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
            <Info label="Volunteer" value={volunteerContentService.getAccreditation().volunteer} />
            <Info
              label="Volunteer ID"
              value={volunteerContentService.getAccreditation().volunteerId}
            />
            <Info label="Event" value={volunteerContentService.getAccreditation().event} />
            <Info label="Zone" value={volunteerContentService.getAccreditation().zone} />
            <div className="flex aspect-square items-center justify-center rounded-3xl border-2 border-dashed border-border bg-muted/50 sm:col-span-2">
              <div className="text-center">
                <QrCode className="mx-auto h-20 w-20 text-ink" />
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  QR placeholder
                </p>
              </div>
            </div>
          </VSCardContent>
        </VSCard>
      </div>
    </AppShell>
  );
}

export function AttendancePage() {
  return (
    <AppShell title="Attendance">
      <div className="mx-auto max-w-6xl">
        <VSPageHeader
          eyebrow="Event day records"
          title="Your attendance"
          description="Review check-in and check-out records across your volunteer assignments."
        />
        <div className="mt-8 space-y-4">
          {volunteerContentService.getAttendance().map((item) => (
            <VSCard key={item.id} className="rounded-[1.75rem] border-border">
              <VSCardContent className="p-5 sm:p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <VSStatusBadge status={item.status} />
                    <h2 className="mt-3 text-lg font-semibold text-foreground">{item.event}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.role} · {item.date}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-5 text-sm">
                    <Info label="Check-in" value={item.checkIn} />
                    <Info label="Check-out" value={item.checkOut} />
                  </div>
                </div>
              </VSCardContent>
            </VSCard>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

export function NotificationsPage() {
  const unread = volunteerContentService.getNotifications().filter((item) => !item.read).length;
  return (
    <AppShell title="Notifications">
      <div className="mx-auto max-w-3xl">
        <VSPageHeader
          eyebrow="Stay in the loop"
          title="Notifications"
          description={`${unread} unread updates from your volunteer journey.`}
          action={
            <VSButton variant="outline" size="sm">
              Mark all read
            </VSButton>
          }
        />
        <div className="mt-8 space-y-3">
          {volunteerContentService.getNotifications().map((item) => (
            <VSNotificationItem
              key={item.id}
              title={item.title}
              description={item.body}
              timestamp={item.date}
              unread={!item.read}
              href="/notifications"
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

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
