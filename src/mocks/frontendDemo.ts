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

export const demoEvents = [
  {
    id: "event-001",
    slug: "marrakech-international-marathon",
    title: "Marrakech International Marathon",
    sport: "Running",
    city: "Marrakech",
    venue: "Menara Gardens",
    start_date: "2026-10-18T06:00:00",
    end_date: "2026-10-18T12:30:00",
    cover_url: "/events/marrakech-marathon.jpg",
    total_volunteers_needed: 120,
    event_roles: [
      {
        id: "role-001",
        name: "Route support volunteer",
        filled_positions: 72,
      },
      {
        id: "role-002",
        name: "Hydration station",
        filled_positions: 25,
      },
    ],
  },

  {
    id: "event-002",
    slug: "rabat-beach-games",
    title: "Rabat Beach Games",
    sport: "Beach Games",
    city: "Rabat",
    venue: "Rabat Corniche",
    start_date: "2026-11-02T08:00:00",
    end_date: "2026-11-02T14:00:00",
    cover_url: "/events/rabat-beach-games.jpg",
    total_volunteers_needed: 80,
    event_roles: [
      {
        id: "role-003",
        name: "Athlete welcome desk",
        filled_positions: 42,
      },
      {
        id: "role-004",
        name: "Registration support",
        filled_positions: 18,
      },
    ],
  },

  {
    id: "event-003",
    slug: "atlas-trail-challenge",
    title: "Atlas Trail Challenge",
    sport: "Trail Running",
    city: "Ifrane",
    venue: "Atlas Trail Base",
    start_date: "2026-11-22T07:00:00",
    end_date: "2026-11-22T15:00:00",
    cover_url: "/events/atlas-trail.jpg",
    total_volunteers_needed: 60,
    event_roles: [
      {
        id: "role-005",
        name: "Hydration station lead",
        filled_positions: 22,
      },
      {
        id: "role-006",
        name: "Route support",
        filled_positions: 14,
      },
    ],
  },

  {
    id: "event-004",
    slug: "casablanca-youth-cup",
    title: "Casablanca Youth Cup",
    sport: "Football",
    city: "Casablanca",
    venue: "Mohammed V Sports Complex",
    start_date: "2026-12-05T09:00:00",
    end_date: "2026-12-05T17:00:00",
    cover_url: "/events/casablanca-youth-cup.jpg",
    total_volunteers_needed: 100,
    event_roles: [
      {
        id: "role-007",
        name: "Team liaison",
        filled_positions: 31,
      },
      {
        id: "role-008",
        name: "Event support",
        filled_positions: 21,
      },
    ],
  },

  {
    id: "event-005",
    slug: "rabat-10k",
    title: "Rabat 10K City Run",
    sport: "Running",
    city: "Rabat",
    venue: "Agdal",
    start_date: "2026-12-19T06:30:00",
    end_date: "2026-12-19T12:00:00",
    cover_url: "/events/rabat-10k.jpg",
    total_volunteers_needed: 90,
    event_roles: [
      {
        id: "role-009",
        name: "Route marshal",
        filled_positions: 20,
      },
      {
        id: "role-010",
        name: "Registration support",
        filled_positions: 15,
      },
    ],
  },

  {
    id: "event-006",
    slug: "fes-sports-festival",
    title: "Fes Sports Festival",
    sport: "Multi-sport",
    city: "Fes",
    venue: "Sports City Fes",
    start_date: "2027-01-10T08:00:00",
    end_date: "2027-01-10T16:00:00",
    cover_url: "/events/fes-sports-festival.jpg",
    total_volunteers_needed: 150,
    event_roles: [
      {
        id: "role-011",
        name: "Event operations",
        filled_positions: 35,
      },
      {
        id: "role-012",
        name: "Athlete support",
        filled_positions: 27,
      },
    ],
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
    title: "Application approved",
    category: "Applications",
    body: "Your application for Marrakech International Marathon has been approved.",
    date: "12 Aug 2026",
    read: false,
  },
  {
    id: "notification-002",
    title: "Training reminder",
    category: "Training",
    body: "Your volunteer training is still in progress. Complete the remaining modules before your next assignment.",
    date: "10 Aug 2026",
    read: false,
  },
  {
    id: "notification-003",
    title: "New event available",
    category: "Events",
    body: "Rabat Beach Games is now accepting volunteer applications.",
    date: "08 Aug 2026",
    read: true,
  },
  {
    id: "notification-004",
    title: "Schedule updated",
    category: "Schedule",
    body: "Your volunteer shift schedule has been updated. Check your schedule for the latest information.",
    date: "05 Aug 2026",
    read: true,
  },
  {
    id: "notification-005",
    title: "Welcome to VolunSport",
    category: "Platform",
    body: "Welcome to VolunSport Morocco. Complete your profile to discover volunteer opportunities that match your skills.",
    date: "01 Aug 2026",
    read: true,
  },
] as const;

export const demoVolunteerProfile = {
  volunteerId: "VS-2026-0148",
  history: [
    { event: "Rabat Beach Games", role: "Athlete welcome desk", date: "12 Jul 2026", hours: 8 },
    { event: "Atlas Youth Cup", role: "Team liaison", date: "28 Jun 2026", hours: 4 },
  ],
};
