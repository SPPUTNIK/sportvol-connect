export const demoDashboard = {
  upcomingEvents: 1,
  volunteerHours: 12,
  attendance: "100%",
  certificates: 1,
  profileCompletion: 72,
  recentApplications: 3,
};

export const demoUpcomingEvent = {
  title: "Marrakech International Marathon",
  sport: "Running",
  date: "18 Oct 2026",
  location: "Marrakech, Morocco",
  role: "Route support volunteer",
  shift: "06:00 — 12:30",
  status: "Accepted",
  training: "Complete",
  accreditation: "Issued",
};



export const demoMyEvents = [
  {
    id: "event-001",
    event: "Marrakech International Marathon",
    date: "18 Oct 2026",
    location: "Menara Gardens, Marrakech",
    role: "Route support volunteer",
    shift: "06:00 — 12:30",
    training: "Complete",
    accreditation: "Issued",
    attendance: "Not started",
  },
  {
    id: "event-002",
    event: "Rabat Beach Games",
    date: "02 Nov 2026",
    location: "Rabat Corniche",
    role: "Athlete welcome desk",
    shift: "08:00 — 14:00",
    training: "In progress",
    accreditation: "Pending",
    attendance: "Not started",
  },
] as const;

export const demoSchedule = [
  {
    id: "shift-001",
    date: "18 Oct",
    month: "Oct",
    event: "Marrakech International Marathon",
    role: "Route support",
    shift: "Morning shift",
    start: "06:00",
    end: "12:30",
    location: "Menara Gardens",
    instructions: "Collect your accreditation pass at Gate 2 and check in with the route captain.",
  },
  {
    id: "shift-002",
    date: "18 Oct",
    month: "Oct",
    event: "Marrakech International Marathon",
    role: "Volunteer debrief",
    shift: "Debrief",
    start: "17:00",
    end: "18:00",
    location: "Volunteer Hub",
    instructions: "Bring your event-day feedback and return any borrowed equipment.",
  },
  {
    id: "shift-003",
    date: "02 Nov",
    month: "Nov",
    event: "Rabat Beach Games",
    role: "Athlete welcome desk",
    shift: "Morning shift",
    start: "08:00",
    end: "14:00",
    location: "Rabat Corniche",
    instructions: "Meet the welcome team fifteen minutes before the first arrival window.",
  },
] as const;

export const demoTraining = [
  {
    id: "training-001",
    title: "Volunteer fundamentals",
    duration: "12 min",
    required: true,
    complete: true,
    description:
      "Learn the mindset, standards, and communication habits that make a great VOLUNSPORT volunteer.",
    resources: [
      { type: "video", title: "Welcome to VolunSport", url: "#" },
      { type: "pdf", title: "Volunteer field guide", url: "#" },
    ],
  },
  {
    id: "training-002",
    title: "Safety and safeguarding",
    duration: "18 min",
    required: true,
    complete: true,
    description:
      "Understand safe event operations, escalation routes, and how to create welcoming spaces for everyone.",
    resources: [
      { type: "video", title: "Safety briefing", url: "#" },
      { type: "link", title: "Safeguarding checklist", url: "#" },
    ],
  },
  {
    id: "training-003",
    title: "Event-day communication",
    duration: "15 min",
    required: false,
    complete: false,
    description:
      "Practice clear radio etiquette, handoffs, and calm communication when the event gets busy.",
    resources: [
      { type: "video", title: "Communication scenarios", url: "#" },
      { type: "text", title: "Radio phrases", url: "#" },
    ],
  },
] as const;

export const demoAccreditation = {
  volunteer: "Amine El Mansouri",
  volunteerId: "VS-2026-0148",
  event: "Marrakech International Marathon",
  role: "Route support volunteer",
  zone: "North route · Zone B",
  status: "Issued",
} as const;


export const demoApplications = [
  {
    id: "2026-0148",
    event: "Marrakech International Marathon",
    event_title: "Marrakech International Marathon",
    role: "Route support volunteer",
    role_name: "Route support volunteer",
    date: "18 Oct 2026",
    appliedAt: "22 Aug 2026",
    status: "accepted",
  },
  {
    id: "app-002",
    event: "Rabat Beach Games",
    event_title: "Rabat Beach Games",
    role: "Athlete welcome desk",
    role_name: "Athlete welcome desk",
    date: "02 Nov 2026",
    appliedAt: "26 Aug 2026",
    status: "pending",
  },
  {
    id: "app-003",
    event: "Atlas Trail Challenge",
    event_title: "Atlas Trail Challenge",
    role: "Hydration station lead",
    role_name: "Hydration station lead",
    date: "22 Nov 2026",
    appliedAt: "28 Aug 2026",
    status: "waitlisted",
  },
  {
    id: "app-004",
    event: "Casablanca Youth Cup",
    event_title: "Casablanca Youth Cup",
    role: "Team liaison",
    role_name: "Team liaison",
    date: "05 Dec 2026",
    appliedAt: "12 Aug 2026",
    status: "rejected",
  },
  {
    id: "app-005",
    event: "Rabat Beach Games",
    event_title: "Rabat Beach Games",
    role: "Registration support",
    role_name: "Registration support",
    date: "02 Nov 2026",
    appliedAt: "18 Aug 2026",
    status: "withdrawn",
  },
] as const;

export const demoAttendance = [
  {
    id: "attendance-001",
    event: "Rabat Beach Games",
    date: "12 Jul 2026",
    role: "Athlete welcome desk",
    status: "Completed",
    checkIn: "07:42",
    checkOut: "15:51",
  },
  {
    id: "attendance-002",
    event: "Atlas Youth Cup",
    date: "28 Jun 2026",
    role: "Team liaison",
    status: "Completed",
    checkIn: "08:03",
    checkOut: "14:10",
  },
  {
    id: "attendance-003",
    event: "Marrakech International Marathon",
    date: "18 Oct 2026",
    role: "Route support volunteer",
    status: "Upcoming",
    checkIn: "—",
    checkOut: "—",
  },
] as const;

export const demoHours = {
  total: 12,
  currentYear: 12,
  eventsCompleted: 2,
  bySport: [
    { label: "Running", value: 8 },
    { label: "Beach games", value: 4 },
    { label: "Football", value: 0 },
  ],
  byEvent: [
    { label: "Rabat Beach Games", value: 8 },
    { label: "Atlas Youth Cup", value: 4 },
    { label: "Marrakech Marathon", value: 0 },
  ],
};

export const demoCertificates = [
  {
    id: "SV-2026-0048",
    event: "Rabat Beach Games",
    role: "Athlete welcome desk",
    hours: 8,
    date: "12 Jul 2026",
    issuedTo: "Amine El Mansouri",
    description: "For reliable support across athlete welcome and event-day operations.",
  },
  {
    id: "SV-2026-0021",
    event: "Atlas Youth Cup",
    role: "Team liaison",
    hours: 4,
    date: "28 Jun 2026",
    issuedTo: "Amine El Mansouri",
    description: "For helping young athletes and teams feel supported throughout the cup.",
  },
] as const;

export const demoAchievements = [
  {
    title: "First Event",
    description: "Complete your first volunteer assignment.",
    progress: 100,
    unlocked: true,
    icon: "spark",
  },
  {
    title: "10 Volunteer Hours",
    description: "Reach ten verified hours.",
    progress: 100,
    unlocked: true,
    icon: "clock",
  },
  {
    title: "Community Champion",
    description: "Support five sporting events.",
    progress: 40,
    unlocked: false,
    icon: "trophy",
  },
  {
    title: "Early Arrival",
    description: "Check in before every shift for three events.",
    progress: 66,
    unlocked: false,
    icon: "star",
  },
] as const;

export const demoNotifications = [
  {
    id: "notification-001",
    title: "Your application was accepted",
    description:
      "Your Route support volunteer application for Marrakech International Marathon is confirmed.",
    timestamp: "2 hours ago",
    category: "application",
    unread: true,
  },
  {
    id: "notification-002",
    title: "New training available",
    description: "Event-day communication is ready before your next assignment.",
    timestamp: "Yesterday",
    category: "training",
    unread: true,
  },
  {
    id: "notification-003",
    title: "Certificate issued",
    description: "Your Rabat Beach Games certificate is ready to preview.",
    timestamp: "12 Jul 2026",
    category: "certificate",
    unread: false,
  },
] as const;

export const demoVolunteerProfile = {
  volunteerId: "VS-2026-0148",
  history: [
    { event: "Rabat Beach Games", role: "Athlete welcome desk", date: "12 Jul 2026", hours: 8 },
    { event: "Atlas Youth Cup", role: "Team liaison", date: "28 Jun 2026", hours: 4 },
  ],
};
