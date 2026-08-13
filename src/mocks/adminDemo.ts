export const adminStats = {
  volunteers: 1248,
  upcomingEvents: 18,
  applications: 326,
  acceptedVolunteers: 214,
  hours: 4892,
  attendance: "94.6%",
};

export const adminEvents = [
  {
    id: "event-001",
    title: "Marrakech International Marathon",
    sport: "Running",
    city: "Marrakech",
    date: "18 Oct 2026",
    status: "Published",
    roles: 8,
    volunteers: 96,
    shifts: 14,
  },
  {
    id: "event-002",
    title: "Rabat Beach Games",
    sport: "Beach sports",
    city: "Rabat",
    date: "02 Nov 2026",
    status: "Published",
    roles: 6,
    volunteers: 48,
    shifts: 9,
  },
  {
    id: "event-003",
    title: "Atlas Trail Challenge",
    sport: "Trail running",
    city: "Ifrane",
    date: "22 Nov 2026",
    status: "Draft",
    roles: 5,
    volunteers: 32,
    shifts: 7,
  },
] as const;

export const adminApplications = [
  {
    id: "app-001",
    volunteer: "Amine El Mansouri",
    event: "Marrakech International Marathon",
    role: "Route support volunteer",
    date: "29 Aug 2026",
    status: "Pending",
  },
  {
    id: "app-002",
    volunteer: "Sara Benali",
    event: "Rabat Beach Games",
    role: "Athlete welcome desk",
    date: "28 Aug 2026",
    status: "Accepted",
  },
  {
    id: "app-003",
    volunteer: "Youssef Alaoui",
    event: "Atlas Trail Challenge",
    role: "Hydration station lead",
    date: "27 Aug 2026",
    status: "Waitlisted",
  },
  {
    id: "app-004",
    volunteer: "Noura Idrissi",
    event: "Marrakech International Marathon",
    role: "Accreditation support",
    date: "25 Aug 2026",
    status: "Rejected",
  },
] as const;

export const adminVolunteers = [
  {
    id: "VS-2026-0148",
    name: "Amine El Mansouri",
    city: "Marrakech",
    events: 3,
    hours: 12,
    attendance: "100%",
    certificates: 1,
    status: "Active",
  },
  {
    id: "VS-2026-0149",
    name: "Sara Benali",
    city: "Rabat",
    events: 5,
    hours: 38,
    attendance: "96%",
    certificates: 3,
    status: "Active",
  },
  {
    id: "VS-2026-0150",
    name: "Youssef Alaoui",
    city: "Ifrane",
    events: 2,
    hours: 16,
    attendance: "88%",
    certificates: 1,
    status: "Active",
  },
  {
    id: "VS-2026-0151",
    name: "Noura Idrissi",
    city: "Casablanca",
    events: 1,
    hours: 6,
    attendance: "100%",
    certificates: 0,
    status: "Pending",
  },
] as const;

export const adminTraining = [
  {
    id: "training-001",
    title: "Volunteer fundamentals",
    type: "Video",
    assigned: 1248,
    completed: 1102,
    status: "Published",
  },
  {
    id: "training-002",
    title: "Safety and safeguarding",
    type: "PDF + quiz",
    assigned: 924,
    completed: 781,
    status: "Published",
  },
  {
    id: "training-003",
    title: "Event-day communication",
    type: "Video",
    assigned: 214,
    completed: 86,
    status: "Draft",
  },
] as const;

export const adminAttendance = [
  {
    id: "attendance-001",
    event: "Rabat Beach Games",
    volunteer: "Sara Benali",
    shift: "Welcome desk · 08:00–14:00",
    checkIn: "07:48",
    checkOut: "14:12",
    status: "Complete",
  },
  {
    id: "attendance-002",
    event: "Marrakech International Marathon",
    volunteer: "Amine El Mansouri",
    shift: "Route support · 06:00–12:30",
    checkIn: "—",
    checkOut: "—",
    status: "Scheduled",
  },
  {
    id: "attendance-003",
    event: "Atlas Youth Cup",
    volunteer: "Youssef Alaoui",
    shift: "Team liaison · 08:00–14:00",
    checkIn: "08:04",
    checkOut: "14:10",
    status: "Complete",
  },
] as const;

export const adminCertificates = [
  {
    id: "SV-2026-0048",
    volunteer: "Sara Benali",
    event: "Rabat Beach Games",
    hours: 8,
    date: "12 Jul 2026",
    status: "Issued",
  },
  {
    id: "SV-2026-0021",
    volunteer: "Youssef Alaoui",
    event: "Atlas Youth Cup",
    hours: 4,
    date: "28 Jun 2026",
    status: "Issued",
  },
  {
    id: "SV-2026-0052",
    volunteer: "Amine El Mansouri",
    event: "Marrakech Marathon",
    hours: 0,
    date: "Pending event",
    status: "Queued",
  },
] as const;

export const adminNotifications = [
  {
    id: "announcement-001",
    title: "Marrakech route briefing updated",
    audience: "Accepted volunteers",
    category: "Event",
    event: "Marrakech International Marathon",
    sent: "Today · 09:42",
    status: "Sent",
  },
  {
    id: "announcement-002",
    title: "New safeguarding training available",
    audience: "All volunteers",
    category: "Training",
    event: "—",
    sent: "Yesterday",
    status: "Sent",
  },
  {
    id: "announcement-003",
    title: "Volunteer hub opening hours",
    audience: "Rabat Beach Games",
    category: "General",
    event: "Rabat Beach Games",
    sent: "Draft",
    status: "Draft",
  },
] as const;

export const adminReports = [
  {
    label: "Applications",
    value: "326",
    change: "+18%",
    description: "Compared with the previous event cycle",
  },
  {
    label: "Attendance",
    value: "94.6%",
    change: "+4.2%",
    description: "Verified check-ins across completed shifts",
  },
  {
    label: "Hours",
    value: "4,892",
    change: "+26%",
    description: "Official volunteer hours recorded",
  },
  {
    label: "Training",
    value: "88%",
    change: "+7%",
    description: "Required training completion rate",
  },
] as const;

export const adminAnalytics = [
  { label: "Running", value: 42, color: "bg-primary" },
  { label: "Football", value: 28, color: "bg-ink" },
  { label: "Beach sports", value: 18, color: "bg-accent" },
  { label: "Other", value: 12, color: "bg-gold" },
] as const;
