import { Link } from "@tanstack/react-router";
import { ArrowRight, Bell, CalendarDays, CheckCircle2, Clock3, MapPin, MessageSquareText, Users } from "lucide-react";
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

export function LeaderDashboardPage() {
  const [profile, setProfile] = useState<{ firstName: string; lastName: string } | null>(null);
  const [event, setEvent] = useState<LeaderEvent | null>(null);
  const [committee, setCommittee] = useState<LeaderCommittee | null>(null);
  const [members, setMembers] = useState<LeaderMember[]>([]);
  const [shifts, setShifts] = useState<LeaderShift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function load() {
      const [leader, currentCommittee, currentEvent, committeeMembers, eventShifts] = await Promise.all([
        leaderService.getCurrentLeaderProfile(),
        leaderService.getCurrentCommittee(),
        leaderService.getCurrentEvent(),
        leaderService.getCommitteeMembers(),
        leaderService.getEventShifts(),
      ]);

      if (ignore) return;

      setProfile(
        leader
          ? { firstName: leader.firstName, lastName: leader.lastName }
          : { firstName: "Leader", lastName: "" },
      );
      setCommittee(currentCommittee);
      setEvent(currentEvent);
      setMembers(committeeMembers);
      setShifts(eventShifts);
      setLoading(false);
    }

    void load();
    return () => {
      ignore = true;
    };
  }, []);

  if (loading) return <VSLoadingState message="Loading your operational overview…" />;

  const teamAttendance = members.length ? 92 : 0;
  const pendingCount = members.filter((member) => member.feedbackStatus !== "Submitted").length;
  const leaderName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : "Leader";

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <VSPageHeader
        eyebrow="Operations"
        title={`Good morning, ${leaderName || "Leader"} 👋`}
        description="Here’s what’s happening with your team today."
      />

      <VSCard className="overflow-hidden rounded-[2rem] border-border bg-ink text-white shadow-[var(--shadow-float)]">
        <VSCardContent className="grid gap-6 p-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-6 sm:p-8">
            <p className="eyebrow text-white/65">Current event</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {event?.title ?? "No active event"}
            </h2>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/80">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {event ? formatDate(event.startDate) : "—"}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {event?.location ?? "—"}
              </span>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/leader/event" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-ink">
                View event <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/leader/committee" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-sm font-medium text-white">
                View committee
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/leader/scanner" className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-medium text-primary-foreground">
                Scan Volunteer QR
              </Link>
            </div>
          </div>

          <div className="relative min-h-[220px] overflow-hidden">
            <img
              src={event?.coverImage ?? "/logo.png"}
              alt={event?.title ?? "Event"}
              className="h-full w-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-background/0 via-ink/35 to-ink/80" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">Committee</p>
              <p className="mt-2 text-2xl font-semibold text-white">{committee?.name ?? "No committee"}</p>
            </div>
          </div>
        </VSCardContent>
      </VSCard>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <VSStatCard label="Volunteers" value={members.length} icon={<Users className="h-5 w-5" />} />
        <VSStatCard label="Today’s shifts" value={shifts.length} icon={<Clock3 className="h-5 w-5" />} accent />
        <VSStatCard label="Pending feedback" value={pendingCount} icon={<MessageSquareText className="h-5 w-5" />} />
        <VSStatCard label="Team attendance" value={`${teamAttendance}%`} icon={<CheckCircle2 className="h-5 w-5" />} accent />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <VSCard className="rounded-[2rem] border-border">
          <VSCardContent className="p-6 sm:p-8">
            <VSSectionHeader title="Today’s shifts" description="Operational focus for the next few hours." />
            <div className="mt-6 space-y-4">
              {shifts.length === 0 ? (
                <VSEmptyState title="No active shifts" description="There are no shifts scheduled for your committee yet." />
              ) : (
                shifts.slice(0, 3).map((shift) => (
                  <div key={shift.id} className="rounded-2xl border border-border bg-background p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          {shift.startTime} – {shift.endTime}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-foreground">{shift.title}</h3>
                      </div>
                      <VSStatusBadge status={shift.status} />
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{shift.location}</p>
                    <p className="mt-3 text-sm font-medium text-foreground">
                      {shift.assignedVolunteers.length} volunteers
                    </p>
                  </div>
                ))
              )}
            </div>
          </VSCardContent>
        </VSCard>

        <VSCard className="rounded-[2rem] border-border">
          <VSCardContent className="p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <VSSectionHeader title="Team overview" />
              <Link to="/leader/volunteers" className="text-sm font-medium text-primary">
                View all volunteers
              </Link>
            </div>

            <div className="mt-6 space-y-3">
              {members.slice(0, 5).map((member) => (
                <div key={member.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background p-3">
                  <div className="flex items-center gap-3">
                    <VSAvatar name={`${member.firstName} ${member.lastName}`} src={member.avatar ?? undefined} size="sm" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{member.firstName} {member.lastName}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <VSStatusBadge status={member.status} />
                </div>
              ))}
            </div>
          </VSCardContent>
        </VSCard>
      </div>

      <VSCard className="rounded-[2rem] border-border">
        <VSCardContent className="p-6 sm:p-8">
          <VSSectionHeader title="Pending feedback" description="Volunteers who still need a follow-up check-in." />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {members.filter((member) => member.feedbackStatus !== "Submitted").length === 0 ? (
              <VSEmptyState title="No pending feedback" description="Your committee is fully up to date." />
            ) : (
              members.filter((member) => member.feedbackStatus !== "Submitted").slice(0, 3).map((member) => (
                <div key={member.id} className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex items-center gap-3">
                    <VSAvatar name={`${member.firstName} ${member.lastName}`} src={member.avatar ?? undefined} />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{member.firstName} {member.lastName}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <VSStatusBadge status={member.feedbackStatus} />
                    <button type="button" className="text-sm font-medium text-primary">Add feedback</button>
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

export function LeaderEventPage() {
  const [event, setEvent] = useState<LeaderEvent | null>(null);
  const [committee, setCommittee] = useState<LeaderCommittee | null>(null);
  const [members, setMembers] = useState<LeaderMember[]>([]);
  const [shifts, setShifts] = useState<LeaderShift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function load() {
      const [currentCommittee, currentEvent, committeeMembers, eventShifts] = await Promise.all([
        leaderService.getCurrentCommittee(),
        leaderService.getCurrentEvent(),
        leaderService.getCommitteeMembers(),
        leaderService.getEventShifts(),
      ]);
      if (ignore) return;
      setCommittee(currentCommittee);
      setEvent(currentEvent);
      setMembers(committeeMembers);
      setShifts(eventShifts);
      setLoading(false);
    }
    void load();
    return () => {
      ignore = true;
    };
  }, []);

  if (loading) return <VSLoadingState message="Loading event overview…" />;
  if (!event || !committee) return <VSEmptyState title="No event assigned" description="You are not currently assigned as a committee leader." />;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <VSPageHeader eyebrow="Event operations" title={event.title} description="Your day-to-day responsibilities for this event." />
      <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-[var(--shadow-float)]">
        <img src={event.coverImage ?? "/logo.png"} alt={event.title} className="h-64 w-full object-cover sm:h-80" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Event status</p>
              <div className="mt-2"><VSStatusBadge status={event.status} /></div>
            </div>
            <Link to="/leader/committee" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              View committee <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <p className="mt-6 max-w-3xl text-base leading-7 text-muted-foreground">{event.description ?? "No description provided."}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-border bg-background p-4"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Date</p><p className="mt-2 text-lg font-semibold text-foreground">{formatDate(event.startDate)}</p></div>
            <div className="rounded-2xl border border-border bg-background p-4"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Time</p><p className="mt-2 text-lg font-semibold text-foreground">{event.startTime ?? "TBD"} – {event.endTime ?? "TBD"}</p></div>
            <div className="rounded-2xl border border-border bg-background p-4"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Location</p><p className="mt-2 text-lg font-semibold text-foreground">{event.location}</p></div>
            <div className="rounded-2xl border border-border bg-background p-4"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Committee</p><p className="mt-2 text-lg font-semibold text-foreground">{event.committeeName}</p></div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <VSCard className="rounded-[2rem] border-border">
          <VSCardHeader><VSCardTitle>Your responsibility</VSCardTitle></VSCardHeader>
          <VSCardContent><p className="text-lg font-semibold text-foreground">{committee.name}</p><p className="mt-3 text-sm leading-6 text-muted-foreground">{committee.description ?? "No committee description available."}</p></VSCardContent>
        </VSCard>
        <VSCard className="rounded-[2rem] border-border">
          <VSCardHeader><VSCardTitle>Operations snapshot</VSCardTitle></VSCardHeader>
          <VSCardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Volunteers</span><span className="font-semibold text-foreground">{members.length}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Shifts</span><span className="font-semibold text-foreground">{shifts.length}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Leader</span><span className="font-semibold text-foreground">{event.leaderName}</span></div>
          </VSCardContent>
        </VSCard>
        <VSCard className="rounded-[2rem] border-border">
          <VSCardHeader><VSCardTitle>Focus areas</VSCardTitle></VSCardHeader>
          <VSCardContent className="space-y-3 text-sm text-muted-foreground">
            <p>• Check-in support before the event starts</p>
            <p>• Welcome flow and signage updates</p>
            <p>• On-site volunteer guidance and feedback</p>
          </VSCardContent>
        </VSCard>
      </div>
    </div>
  );
}

export function LeaderCommitteePage() {
  const [committee, setCommittee] = useState<LeaderCommittee | null>(null);
  const [members, setMembers] = useState<LeaderMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function load() {
      const [currentCommittee, committeeMembers] = await Promise.all([
        leaderService.getCurrentCommittee(),
        leaderService.getCommitteeMembers(),
      ]);
      if (ignore) return;
      setCommittee(currentCommittee);
      setMembers(committeeMembers);
      setLoading(false);
    }
    void load();
    return () => {
      ignore = true;
    };
  }, []);

  if (loading) return <VSLoadingState message="Loading committee details…" />;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <VSPageHeader eyebrow="Your team" title="My Committee" description="Operational visibility for the volunteers in your event responsibility." />
      <LeaderCommitteeDetails committee={committee ?? undefined} members={members} onClose={() => undefined} />
    </div>
  );
}

export function LeaderVolunteersPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | "Assigned" | "Completed" | "Pending">("All");
  const [members, setMembers] = useState<LeaderMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function load() {
      const data = await leaderService.getCommitteeMembers();
      if (!ignore) {
        setMembers(data);
        setLoading(false);
      }
    }
    void load();
    return () => {
      ignore = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const normalizedQuery = query.toLowerCase();
    return members.filter((member) => {
      const matchesQuery = `${member.firstName} ${member.lastName}`.toLowerCase().includes(normalizedQuery) || member.role.toLowerCase().includes(normalizedQuery) || member.assignedShift.toLowerCase().includes(normalizedQuery);
      const matchesFilter = filter === "All" || (filter === "Assigned" && member.status !== "Pending") || (filter === "Completed" && member.feedbackStatus === "Submitted") || (filter === "Pending" && member.feedbackStatus !== "Submitted");
      return matchesQuery && matchesFilter;
    });
  }, [filter, members, query]);

  if (loading) return <VSLoadingState message="Loading committee volunteers…" />;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <VSPageHeader eyebrow="Committee roster" title="Volunteers" description="Only the volunteers assigned to your committee are shown here." />
      <VSCard className="rounded-[2rem] border-border">
        <VSCardContent className="p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <label className="relative block">
                <span className="sr-only">Search volunteers</span>
                <VSInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search volunteers..." className="h-12 rounded-2xl border-border bg-background pl-4" />
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["All", "Assigned", "Completed", "Pending"] as const).map((option) => (
                <button key={option} type="button" onClick={() => setFilter(option)} className={cn("rounded-full border px-3 py-2 text-sm font-medium transition", filter === option ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:border-primary/50")}>{option}</button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="mt-8"><VSEmptyState title="No volunteers found" description="Try a different filter or search term for this committee." /></div>
          ) : (
            <div className="mt-8 space-y-3">
              {filtered.map((member) => (
                <div key={member.id} className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      <VSAvatar name={`${member.firstName} ${member.lastName}`} src={member.avatar ?? undefined} />
                      <div>
                        <p className="text-base font-semibold text-foreground">{member.firstName} {member.lastName}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                      <VSStatusBadge status={member.status} />
                      <VSStatusBadge status={member.feedbackStatus} />
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl bg-muted/40 p-3"><p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Shift</p><p className="mt-2 text-sm font-medium text-foreground">{member.assignedShift}</p></div>
                    <div className="rounded-xl bg-muted/40 p-3"><p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Attendance</p><p className="mt-2 text-sm font-medium text-foreground">{member.attendance}</p></div>
                    <div className="rounded-xl bg-muted/40 p-3"><p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Feedback</p><p className="mt-2 text-sm font-medium text-foreground">{member.feedbackStatus}</p></div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2"><VSButton variant="secondary" className="h-9">View</VSButton><VSButton className="h-9">Add feedback</VSButton></div>
                </div>
              ))}
            </div>
          )}
        </VSCardContent>
      </VSCard>
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
