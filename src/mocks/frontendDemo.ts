export const demoUpcomingEvent = {
  title: "Marrakech International Marathon",
  sport: "Running",
  date: "18 Oct 2026",
  location: "Marrakech, Morocco",
  role: "Route support volunteer",
  shift: "06:00 — 12:30",
  status: "Accepted",
};

export const demoApplications = [
  {
    event: "Marrakech International Marathon",
    role: "Route support volunteer",
    date: "18 Oct 2026",
    status: "accepted",
  },
  {
    event: "Rabat Beach Games",
    role: "Athlete welcome desk",
    date: "02 Nov 2026",
    status: "pending",
  },
  {
    event: "Atlas Trail Challenge",
    role: "Hydration station lead",
    date: "22 Nov 2026",
    status: "waitlisted",
  },
] as const;

export const demoSchedule = [
  {
    date: "18 Oct",
    event: "Marrakech International Marathon",
    role: "Route support",
    time: "06:00 — 12:30",
    location: "Menara Gardens",
    note: "Collect your accreditation pass at Gate 2.",
  },
  {
    date: "19 Oct",
    event: "Marrakech International Marathon",
    role: "Volunteer debrief",
    time: "17:00 — 18:00",
    location: "Volunteer Hub",
    note: "Bring your event-day feedback.",
  },
] as const;

export const demoTraining = [
  { title: "Volunteer fundamentals", duration: "12 min", required: true, complete: true },
  { title: "Safety and safeguarding", duration: "18 min", required: true, complete: true },
  { title: "Event-day communication", duration: "15 min", required: false, complete: false },
] as const;

export const demoAchievements = [
  {
    title: "First Event",
    description: "Complete your first volunteer assignment.",
    progress: 100,
    unlocked: true,
  },
  {
    title: "10 Volunteer Hours",
    description: "Reach ten verified hours.",
    progress: 72,
    unlocked: false,
  },
  {
    title: "Community Champion",
    description: "Support five sporting events.",
    progress: 40,
    unlocked: false,
  },
] as const;

export const demoCertificates = [
  {
    id: "SV-2026-0048",
    event: "Rabat Beach Games",
    role: "Athlete welcome desk",
    hours: 8,
    date: "12 Jul 2026",
  },
] as const;
