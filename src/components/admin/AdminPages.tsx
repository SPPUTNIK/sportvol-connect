import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Download,
  FileBarChart,
  GraduationCap,
  Mail,
  Plus,
  Save,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import {
  VSBadge,
  VSButton,
  VSCard,
  VSCardContent,
  VSEmptyState,
  VSErrorState,
  VSInput,
  VSPageHeader,
  VSSectionHeader,
  VSStatCard,
  VSStatusBadge,
  VSTextarea,
} from "@/components/design-system";
import { useAuth } from "@/lib/auth";
import { adminService } from "@/services/adminService";

function AdminGate({
  children,
  title = "Admin workspace",
}: {
  children: ReactNode;
  title?: string;
}) {
  const { user, profile, loading } = useAuth();
  if (loading)
    return (
      <AdminLayout title={title}>
        <VSCard>
          <VSCardContent className="p-8 text-center text-sm text-muted-foreground">
            Loading admin workspace…
          </VSCardContent>
        </VSCard>
      </AdminLayout>
    );
  if (!user || profile?.role !== "admin")
    return (
      <AdminLayout title={title}>
        <VSEmptyState
          title="Admin access required"
          description="Sign in with an administrator account to manage VOLUNSPORT."
          action={
            <VSButton asChild>
              <Link to="/login">Go to login</Link>
            </VSButton>
          }
        />
      </AdminLayout>
    );
  return <>{children}</>;
}

export function AdminDashboardPage() {
  return (
    <AdminGate title="Admin dashboard">
      <AdminLayout title="Admin dashboard">
        <div className="mx-auto max-w-7xl">
          <VSPageHeader
            eyebrow="Platform control"
            title="Keep the movement moving."
            description="A clear view of volunteers, events, applications, attendance, and impact."
            action={
              <VSButton asChild variant="outline">
                <Link to="/events">
                  View public events <ArrowRight className="h-4 w-4" />
                </Link>
              </VSButton>
            }
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            <VSStatCard
              label="Total volunteers"
              value={adminService.getStats().volunteers.toLocaleString()}
              icon={<Users className="h-5 w-5" />}
            />
            <VSStatCard
              label="Upcoming events"
              value={adminService.getStats().upcomingEvents}
              icon={<CalendarDays className="h-5 w-5" />}
              accent
            />
            <VSStatCard
              label="Applications"
              value={adminService.getStats().applications}
              icon={<ClipboardList className="h-5 w-5" />}
            />
            <VSStatCard
              label="Accepted"
              value={adminService.getStats().acceptedVolunteers}
              icon={<CheckCircle2 className="h-5 w-5" />}
              accent
            />
            <VSStatCard
              label="Official hours"
              value={adminService.getStats().hours.toLocaleString()}
              icon={<BarChart3 className="h-5 w-5" />}
            />
            <VSStatCard
              label="Attendance"
              value={adminService.getStats().attendance}
              icon={<ShieldCheck className="h-5 w-5" />}
              accent
            />
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <VSCard className="rounded-[2rem] border-border">
              <VSCardContent className="p-6 sm:p-8">
                <VSSectionHeader eyebrow="Action centre" title="Keep records current" />
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    ["Events", "/admin/events", CalendarDays],
                    ["Applications", "/admin/applications", ClipboardList],
                    ["Volunteers", "/admin/volunteers", Users],
                    ["Reports", "/admin/reports", FileBarChart],
                  ].map(([label, href, Icon]) => (
                    <Link
                      key={String(label)}
                      to={String(href)}
                      className="group rounded-3xl border border-border bg-background p-5 transition hover:border-primary"
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-3 text-sm font-semibold text-foreground">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            {typeof Icon === "function" && <Icon className="h-4 w-4" />}
                          </span>
                          {String(label)}
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                      </div>
                      <p className="mt-3 text-xs leading-5 text-muted-foreground">
                        Open the {String(label).toLowerCase()} workspace.
                      </p>
                    </Link>
                  ))}
                </div>
              </VSCardContent>
            </VSCard>
            <VSCard className="rounded-[2rem] bg-ink text-white">
              <VSCardContent className="p-6 sm:p-8">
                <p className="eyebrow text-white/60">Admin principle</p>
                <h2 className="mt-3 text-3xl font-semibold">Build trust at every handoff.</h2>
                <p className="mt-4 text-sm leading-7 text-white/70">
                  Accurate event records, considered applications, reliable attendance, and
                  certificates volunteers can share with pride.
                </p>
                <Link
                  to="/admin/applications"
                  className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white"
                >
                  Review applications <ArrowRight className="h-4 w-4" />
                </Link>
              </VSCardContent>
            </VSCard>
          </div>
        </div>
      </AdminLayout>
    </AdminGate>
  );
}

export function AdminEventsPage() {
  const [query, setQuery] = useState("");
  const rows = adminService
    .getEvents()
    .filter((event) =>
      `${event.title} ${event.city} ${event.sport}`.toLowerCase().includes(query.toLowerCase()),
    );
  return (
    <AdminGate title="Events">
      <AdminLayout title="Events">
        <div className="mx-auto max-w-7xl">
          <VSPageHeader
            eyebrow="Event management"
            title="Events"
            description="Create and manage the sporting moments that bring volunteers together."
            action={
              <VSButton asChild>
                <Link to="/admin/events/create">
                  <Plus className="h-4 w-4" />
                  Create event
                </Link>
              </VSButton>
            }
          />
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <VSInput
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search events, cities, or sports"
              />
            </div>
            <select
              className="h-11 rounded-2xl border border-border bg-card px-4 text-sm"
              defaultValue="all"
            >
              <option value="all">All statuses</option>
              <option>Published</option>
              <option>Draft</option>
            </select>
          </div>
          <div className="mt-6 grid gap-4">
            {rows.map((event) => (
              <VSCard key={event.id} className="rounded-[1.75rem] border-border">
                <VSCardContent className="p-6">
                  <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <CalendarDays className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-lg font-semibold text-foreground">{event.title}</h2>
                          <VSStatusBadge status={event.status} />
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {event.sport} · {event.city} · {event.date}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-5 text-sm lg:min-w-[360px]">
                      <Stat label="Roles" value={event.roles} />
                      <Stat label="Volunteers" value={event.volunteers} />
                      <Stat label="Shifts" value={event.shifts} />
                    </div>
                    <VSButton asChild variant="outline" size="sm">
                      <Link to="/admin/events/$eventId" params={{ eventId: event.id }}>
                        Manage <ArrowRight className="h-4 w-4" />
                      </Link>
                    </VSButton>
                  </div>
                </VSCardContent>
              </VSCard>
            ))}
          </div>
        </div>
      </AdminLayout>
    </AdminGate>
  );
}

export function AdminEventCreatePage() {
  return (
    <AdminGate title="Create event">
      <AdminLayout title="Create event">
        <AdminForm
          title="Create an event"
          eyebrow="Event management"
          description="Prepare the core event information before adding roles and shifts."
          submitLabel="Create event"
        />
      </AdminLayout>
    </AdminGate>
  );
}
export function AdminEventDetailPage({ eventId }: { eventId: string }) {
  const event =
    adminService.getEvents().find((item) => item.id === eventId) ?? adminService.getEvents()[0];
  return (
    <AdminGate title="Event details">
      <AdminLayout title="Event details">
        <div className="mx-auto max-w-6xl">
          <VSPageHeader
            eyebrow="Event management"
            title={event.title}
            description={`${event.sport} · ${event.city} · ${event.date}`}
            action={
              <VSButton variant="outline">
                <Settings className="h-4 w-4" />
                Edit event
              </VSButton>
            }
          />
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <VSCard className="rounded-[2rem] border-border">
              <VSCardContent className="p-6 sm:p-8">
                <VSSectionHeader
                  eyebrow="Roles and shifts"
                  title="Volunteer operations"
                  action={
                    <VSButton size="sm">
                      <Plus className="h-4 w-4" />
                      Add role
                    </VSButton>
                  }
                />
                <div className="mt-6 space-y-3">
                  {["Route support volunteer", "Accreditation support", "Athlete welcome desk"].map(
                    (role, index) => (
                      <div
                        key={role}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-border p-4"
                      >
                        <div>
                          <p className="text-sm font-semibold text-foreground">{role}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {index + 2} shifts · {12 + index * 8} positions
                          </p>
                        </div>
                        <VSButton variant="ghost" size="sm">
                          Edit
                        </VSButton>
                      </div>
                    ),
                  )}
                </div>
              </VSCardContent>
            </VSCard>
            <VSCard className="rounded-[2rem] border-border">
              <VSCardContent className="p-6 sm:p-8">
                <VSSectionHeader eyebrow="Event status" title="At a glance" />
                <div className="mt-6 space-y-4">
                  <Info label="Status" value={event.status} />
                  <Info label="Volunteers" value={`${event.volunteers} assigned`} />
                  <Info label="Shifts" value={`${event.shifts} planned`} />
                  <Info label="Registration" value="Open" />
                </div>
              </VSCardContent>
            </VSCard>
          </div>
        </div>
      </AdminLayout>
    </AdminGate>
  );
}

export function AdminApplicationsPage() {
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(
    adminService.getApplications().map((item) => ({ ...item, status: item.status as string })),
  );
  const rows = items.filter(
    (item) =>
      (!query ||
        `${item.volunteer} ${item.event} ${item.role}`
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (status === "all" || item.status.toLowerCase() === status),
  );
  const update = (id: string, next: string) =>
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, status: next } : item)),
    );
  return (
    <AdminGate title="Applications">
      <AdminLayout title="Applications">
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
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search applicants, events, or roles"
              />
            </div>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-11 rounded-2xl border border-border bg-card px-4 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="waitlisted">Waitlisted</option>
            </select>
          </div>
          <div className="mt-6 overflow-hidden rounded-[2rem] border border-border bg-card">
            <div className="divide-y divide-border">
              {rows.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between lg:p-6"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.volunteer}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.event} · {item.role}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Applied {item.date}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <VSStatusBadge status={item.status} />
                    <VSButton variant="outline" size="sm">
                      Assign role
                    </VSButton>
                    <VSButton size="sm" onClick={() => update(item.id, "Accepted")}>
                      Accept
                    </VSButton>
                    <VSButton variant="ghost" size="sm" onClick={() => update(item.id, "Rejected")}>
                      Reject
                    </VSButton>
                    <VSButton
                      variant="ghost"
                      size="sm"
                      onClick={() => update(item.id, "Waitlisted")}
                    >
                      Waitlist
                    </VSButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminGate>
  );
}

export function AdminVolunteersPage() {
  const [query, setQuery] = useState("");
  const rows = adminService
    .getVolunteers()
    .filter((item) =>
      `${item.name} ${item.city} ${item.id}`.toLowerCase().includes(query.toLowerCase()),
    );
  return (
    <AdminGate title="Volunteers">
      <AdminLayout title="Volunteers">
        <div className="mx-auto max-w-7xl">
          <VSPageHeader
            eyebrow="Volunteer directory"
            title="Volunteers"
            description="Understand the people powering every event and the impact they are building."
          />
          <div className="mt-8 max-w-xl">
            <VSInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, city, or volunteer ID"
            />
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {rows.map((item) => (
              <VSCard key={item.id} className="rounded-[1.75rem] border-border">
                <VSCardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">
                        {item.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-foreground">{item.name}</h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.id} · {item.city}
                        </p>
                      </div>
                    </div>
                    <VSStatusBadge status={item.status} />
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    <Stat label="Events" value={item.events} />
                    <Stat label="Hours" value={item.hours} />
                    <Stat label="Attendance" value={item.attendance} />
                  </div>
                  <VSButton asChild variant="outline" size="sm" className="mt-6">
                    <Link to="/admin/volunteers/$volunteerId" params={{ volunteerId: item.id }}>
                      View profile <ArrowRight className="h-4 w-4" />
                    </Link>
                  </VSButton>
                </VSCardContent>
              </VSCard>
            ))}
          </div>
        </div>
      </AdminLayout>
    </AdminGate>
  );
}

export function AdminVolunteerDetailPage({ volunteerId }: { volunteerId: string }) {
  const volunteer =
    adminService.getVolunteers().find((item) => item.id === volunteerId) ??
    adminService.getVolunteers()[0];
  return (
    <AdminGate title="Volunteer profile">
      <AdminLayout title="Volunteer profile">
        <div className="mx-auto max-w-6xl">
          <VSButton asChild variant="ghost" className="mb-5">
            <Link to="/admin/volunteers">
              <ArrowLeft className="h-4 w-4" />
              Back to volunteers
            </Link>
          </VSButton>
          <VSPageHeader
            eyebrow="Volunteer record"
            title={volunteer.name}
            description={`${volunteer.id} · ${volunteer.city}`}
            action={
              <VSButton variant="outline">
                <Mail className="h-4 w-4" />
                Contact
              </VSButton>
            }
          />
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <VSStatCard
              label="Events supported"
              value={volunteer.events}
              icon={<CalendarDays className="h-5 w-5" />}
            />
            <VSStatCard
              label="Official hours"
              value={volunteer.hours}
              icon={<BarChart3 className="h-5 w-5" />}
              accent
            />
            <VSStatCard
              label="Certificates"
              value={volunteer.certificates}
              icon={<ShieldCheck className="h-5 w-5" />}
            />
          </div>
          <VSCard className="mt-6 rounded-[2rem] border-border">
            <VSCardContent className="p-6 sm:p-8">
              <VSSectionHeader eyebrow="Volunteer history" title="Event participation" />
              <div className="mt-5 space-y-3">
                {adminService
                  .getEvents()
                  .slice(0, volunteer.events)
                  .map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-border p-4"
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground">{event.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {event.date} · {event.sport}
                        </p>
                      </div>
                      <VSStatusBadge status="Completed" />
                    </div>
                  ))}
              </div>
            </VSCardContent>
          </VSCard>
        </div>
      </AdminLayout>
    </AdminGate>
  );
}

export function AdminTrainingPage() {
  return (
    <AdminGate title="Training">
      <AdminLayout title="Training">
        <div className="mx-auto max-w-7xl">
          <VSPageHeader
            eyebrow="Operations"
            title="Training"
            description="Create, publish, and monitor the preparation that keeps events safe."
            action={
              <VSButton>
                <Plus className="h-4 w-4" />
                Create training
              </VSButton>
            }
          />
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {adminService.getTraining().map((item) => (
              <VSCard key={item.id} className="rounded-[1.75rem] border-border">
                <VSCardContent className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <VSBadge variant={item.status === "Published" ? "soft" : "outline"}>
                      {item.status}
                    </VSBadge>
                    <span className="text-xs text-muted-foreground">{item.type}</span>
                  </div>
                  <h2 className="mt-5 text-lg font-semibold text-foreground">{item.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.completed} of {item.assigned} volunteers complete
                  </p>
                  <div className="mt-5 h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.round((item.completed / item.assigned) * 100)}%` }}
                    />
                  </div>
                  <div className="mt-5 flex gap-2">
                    <VSButton variant="outline" size="sm">
                      Edit
                    </VSButton>
                    <VSButton variant="ghost" size="sm">
                      View progress
                    </VSButton>
                  </div>
                </VSCardContent>
              </VSCard>
            ))}
          </div>
        </div>
      </AdminLayout>
    </AdminGate>
  );
}

export function AdminAttendancePage() {
  return (
    <AdminGate title="Attendance">
      <AdminLayout title="Attendance">
        <div className="mx-auto max-w-7xl">
          <VSPageHeader
            eyebrow="Operations"
            title="Attendance"
            description="Verify check-ins and check-outs for every event shift."
          />
          <div className="mt-8 overflow-hidden rounded-[2rem] border border-border bg-card">
            <div className="divide-y divide-border">
              {adminService.getAttendance().map((item) => (
                <div
                  key={item.id}
                  className="grid gap-4 p-5 md:grid-cols-[1.2fr_1fr_1fr_0.6fr_0.6fr_auto] md:items-center md:p-6"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.volunteer}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.event}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.shift}</p>
                  <Info label="Check-in" value={item.checkIn} />
                  <Info label="Check-out" value={item.checkOut} />
                  <VSStatusBadge status={item.status} />
                  <VSButton variant="outline" size="sm">
                    Edit
                  </VSButton>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminGate>
  );
}

export function AdminCertificatesPage() {
  return (
    <AdminGate title="Certificates">
      <AdminLayout title="Certificates">
        <div className="mx-auto max-w-7xl">
          <VSPageHeader
            eyebrow="Impact"
            title="Certificates"
            description="Preview, generate, and issue proof of volunteer contribution."
            action={
              <VSButton>
                <Plus className="h-4 w-4" />
                Generate certificate
              </VSButton>
            }
          />
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {adminService.getCertificates().map((item) => (
              <VSCard key={item.id} className="rounded-[1.75rem] border-border">
                <VSCardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                    <VSStatusBadge status={item.status} />
                  </div>
                  <p className="mt-5 font-mono text-xs text-muted-foreground">{item.id}</p>
                  <h2 className="mt-2 text-lg font-semibold text-foreground">{item.volunteer}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{item.event}</p>
                  <div className="mt-5 flex justify-between text-sm">
                    <span>{item.hours} hours</span>
                    <span>{item.date}</span>
                  </div>
                  <div className="mt-6 flex gap-2">
                    <VSButton variant="outline" size="sm">
                      Preview
                    </VSButton>
                    <VSButton variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                      Download
                    </VSButton>
                  </div>
                </VSCardContent>
              </VSCard>
            ))}
          </div>
        </div>
      </AdminLayout>
    </AdminGate>
  );
}

export function AdminNotificationsPage() {
  const [saved, setSaved] = useState(false);
  return (
    <AdminGate title="Notifications">
      <AdminLayout title="Notifications">
        <div className="mx-auto max-w-7xl">
          <VSPageHeader
            eyebrow="Communication"
            title="Notifications"
            description="Create clear announcements for the people who keep events moving."
          />
          <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <VSCard className="rounded-[2rem] border-border">
              <VSCardContent className="p-6 sm:p-8">
                <VSSectionHeader eyebrow="Create announcement" title="Send an update" />
                <div className="mt-6 space-y-4">
                  <label className="block text-sm font-medium">
                    Title
                    <VSInput className="mt-2" placeholder="Announcement title" />
                  </label>
                  <label className="block text-sm font-medium">
                    Target audience
                    <select className="mt-2 h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm">
                      <option>All volunteers</option>
                      <option>Accepted volunteers</option>
                      <option>Event team</option>
                    </select>
                  </label>
                  <label className="block text-sm font-medium">
                    Category
                    <select className="mt-2 h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm">
                      <option>General</option>
                      <option>Event</option>
                      <option>Training</option>
                      <option>Certificate</option>
                    </select>
                  </label>
                  <label className="block text-sm font-medium">
                    Related event
                    <select className="mt-2 h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm">
                      <option>None</option>
                      {adminService.getEvents().map((event) => (
                        <option key={event.id}>{event.title}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm font-medium">
                    Message
                    <VSTextarea
                      className="mt-2"
                      rows={5}
                      placeholder="Write a clear, useful update"
                    />
                  </label>
                  <VSButton onClick={() => setSaved(true)}>
                    <Save className="h-4 w-4" />
                    {saved ? "Saved as draft" : "Save announcement"}
                  </VSButton>
                </div>
              </VSCardContent>
            </VSCard>
            <VSCard className="rounded-[2rem] border-border">
              <VSCardContent className="p-6 sm:p-8">
                <VSSectionHeader eyebrow="Sent and draft" title="Announcement history" />
                <div className="mt-6 space-y-3">
                  {adminService.getNotifications().map((item) => (
                    <div key={item.id} className="rounded-2xl border border-border p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-foreground">{item.title}</p>
                        <VSStatusBadge status={item.status} />
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {item.audience} · {item.category} · {item.event}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">{item.sent}</p>
                    </div>
                  ))}
                </div>
              </VSCardContent>
            </VSCard>
          </div>
        </div>
      </AdminLayout>
    </AdminGate>
  );
}

export function AdminReportsPage() {
  return (
    <AdminGate title="Reports">
      <AdminLayout title="Reports">
        <div className="mx-auto max-w-7xl">
          <VSPageHeader
            eyebrow="Reporting"
            title="Reports"
            description="A clear operational snapshot for planning and review."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {adminService.getReports().map((item) => (
              <VSCard key={item.label} className="rounded-[1.75rem] border-border">
                <VSCardContent className="p-6">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-foreground">{item.value}</p>
                  <p className="mt-2 text-sm font-semibold text-primary">{item.change}</p>
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">{item.description}</p>
                </VSCardContent>
              </VSCard>
            ))}
          </div>
          <VSCard className="mt-6 rounded-[2rem] border-border">
            <VSCardContent className="p-6 sm:p-8">
              <VSSectionHeader eyebrow="Exports" title="Download operational reports" />
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {adminService.getReports().map((item) => (
                  <VSButton key={item.label} variant="outline">
                    <Download className="h-4 w-4" />
                    {item.label}
                  </VSButton>
                ))}
              </div>
            </VSCardContent>
          </VSCard>
        </div>
      </AdminLayout>
    </AdminGate>
  );
}

export function AdminAnalyticsPage() {
  const max = Math.max(...adminService.getAnalytics().map((item) => item.value));
  return (
    <AdminGate title="Analytics">
      <AdminLayout title="Analytics">
        <div className="mx-auto max-w-7xl">
          <VSPageHeader
            eyebrow="Reporting"
            title="Analytics"
            description="Understand the mix of volunteers, events, sports, roles, attendance, and hours."
          />
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
            <VSCard className="rounded-[2rem] border-border">
              <VSCardContent className="p-6 sm:p-8">
                <VSSectionHeader eyebrow="Sports" title="Volunteer interest by sport" />
                <div className="mt-8 space-y-5">
                  {adminService.getAnalytics().map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-foreground">{item.label}</span>
                        <span className="text-muted-foreground">{item.value}%</span>
                      </div>
                      <div className="mt-2 h-3 rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${item.color}`}
                          style={{ width: `${(item.value / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </VSCardContent>
            </VSCard>
            <VSCard className="rounded-[2rem] border-border">
              <VSCardContent className="p-6 sm:p-8">
                <VSSectionHeader eyebrow="Operational health" title="What to watch" />
                <div className="mt-6 space-y-4">
                  <Info label="Attendance" value="94.6% verified" />
                  <Info label="Training completion" value="88% of assigned volunteers" />
                  <Info label="Hours this cycle" value="4,892 official hours" />
                  <Info label="Role coverage" value="92% of positions filled" />
                </div>
              </VSCardContent>
            </VSCard>
          </div>
        </div>
      </AdminLayout>
    </AdminGate>
  );
}

export function AdminProfilePage() {
  return (
    <AdminGate title="Admin profile">
      <AdminLayout title="Admin profile">
        <div className="mx-auto max-w-3xl">
          <VSPageHeader
            eyebrow="Account"
            title="Admin profile"
            description="Manage the profile details shown in the control workspace."
          />
          <VSCard className="mt-8 rounded-[2rem] border-border">
            <VSCardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink text-xl font-semibold text-white">
                  A
                </div>
                <div>
                  <p className="text-lg font-semibold">Platform administrator</p>
                  <p className="text-sm text-muted-foreground">Admin access · VolunSport Morocco</p>
                </div>
              </div>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-medium">
                  First name
                  <VSInput className="mt-2" defaultValue="Platform" />
                </label>
                <label className="text-sm font-medium">
                  Last name
                  <VSInput className="mt-2" defaultValue="Administrator" />
                </label>
                <label className="text-sm font-medium sm:col-span-2">
                  Email
                  <VSInput className="mt-2" defaultValue="admin@volunsport.ma" />
                </label>
              </div>
              <VSButton className="mt-6">
                <Save className="h-4 w-4" />
                Save profile
              </VSButton>
            </VSCardContent>
          </VSCard>
        </div>
      </AdminLayout>
    </AdminGate>
  );
}

export function AdminSettingsPage() {
  return (
    <AdminGate title="Admin settings">
      <AdminLayout title="Admin settings">
        <div className="mx-auto max-w-3xl">
          <VSPageHeader
            eyebrow="Account"
            title="Settings"
            description="Configure preferences for the admin workspace."
          />
          <div className="mt-8 space-y-4">
            {[
              "Email notifications for new applications",
              "Weekly operations summary",
              "Require review before publishing events",
              "Show attendance reminders",
            ].map((setting, index) => (
              <VSCard key={setting} className="rounded-[1.5rem] border-border">
                <VSCardContent className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{setting}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Frontend preference placeholder
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={index < 3}
                    className="h-5 w-5 accent-primary"
                  />
                </VSCardContent>
              </VSCard>
            ))}
          </div>
          <VSButton className="mt-6">
            <Save className="h-4 w-4" />
            Save settings
          </VSButton>
        </div>
      </AdminLayout>
    </AdminGate>
  );
}

function AdminForm({
  eyebrow,
  title,
  description,
  submitLabel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  submitLabel: string;
}) {
  const [saved, setSaved] = useState(false);
  return (
    <div className="mx-auto max-w-3xl">
      <VSPageHeader eyebrow={eyebrow} title={title} description={description} />
      <VSCard className="mt-8 rounded-[2rem] border-border">
        <VSCardContent className="space-y-5 p-6 sm:p-8">
          <label className="block text-sm font-medium">
            Event title
            <VSInput className="mt-2" placeholder="Name the event" />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Sport
              <select className="mt-2 h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm">
                <option>Running</option>
                <option>Football</option>
                <option>Beach sports</option>
              </select>
            </label>
            <label className="block text-sm font-medium">
              City
              <VSInput className="mt-2" placeholder="Marrakech" />
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Start date
              <VSInput className="mt-2" type="date" />
            </label>
            <label className="block text-sm font-medium">
              Application deadline
              <VSInput className="mt-2" type="date" />
            </label>
          </div>
          <label className="block text-sm font-medium">
            Description
            <VSTextarea
              className="mt-2"
              rows={6}
              placeholder="Describe the event and the volunteer experience"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <VSButton onClick={() => setSaved(true)}>
              <Save className="h-4 w-4" />
              {saved ? "Saved as draft" : submitLabel}
            </VSButton>
            <VSButton variant="outline">Save and add roles</VSButton>
          </div>
        </VSCardContent>
      </VSCard>
    </div>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
