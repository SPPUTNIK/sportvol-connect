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
    slug: "marrakech-international-marathon",
    sport: "Running",
    city: "Marrakech",
    country: "Morocco",
    venue: "Marrakech City Center",

    start_date: "2026-10-18",
    end_date: "2026-10-18",
    start_time: "06:00",
    end_time: "14:00",
    application_deadline: "2026-10-10",

    total_volunteers_needed: 120,

    description:
      "International marathon requiring route support, accreditation, athlete welcome, hydration stations, and event-day assistance.",

    status: "Published",

    roles: 8,
    volunteers: 96,
    shifts: 14,

    created_at: "2026-08-01T10:00:00Z",
    updated_at: "2026-08-20T10:00:00Z",
  },

  {
    id: "event-002",
    title: "Rabat Beach Games",
    slug: "rabat-beach-games",
    sport: "Beach sports",
    city: "Rabat",
    country: "Morocco",
    venue: "Rabat Beach Sports Complex",

    start_date: "2026-11-02",
    end_date: "2026-11-02",
    start_time: "08:00",
    end_time: "18:00",
    application_deadline: "2026-10-25",

    total_volunteers_needed: 60,

    description:
      "A multi-sport beach event in Rabat requiring welcome desk, athlete support, logistics, and event operations volunteers.",

    status: "Published",

    roles: 6,
    volunteers: 48,
    shifts: 9,

    created_at: "2026-08-05T10:00:00Z",
    updated_at: "2026-08-22T10:00:00Z",
  },

  {
    id: "event-003",
    title: "Atlas Trail Challenge",
    slug: "atlas-trail-challenge",
    sport: "Trail running",
    city: "Ifrane",
    country: "Morocco",
    venue: "Ifrane National Park",

    start_date: "2026-11-22",
    end_date: "2026-11-22",
    start_time: "07:00",
    end_time: "16:00",
    application_deadline: "2026-11-10",

    total_volunteers_needed: 45,

    description:
      "A mountain trail running event requiring route support, hydration stations, athlete assistance, and safety coordination.",

    status: "Draft",

    roles: 5,
    volunteers: 32,
    shifts: 7,

    created_at: "2026-08-10T10:00:00Z",
    updated_at: "2026-08-10T10:00:00Z",
  },
] as const;

export const adminApplications = [
  {
    id: "app-001",

    volunteer_id: "VS-2026-0148",
    volunteer: "Amine El Mansouri",

    event_id: "event-001",
    event: "Marrakech International Marathon",

    role_id: "role-001",
    role: "Route support volunteer",

    applied_at: "2026-08-29T10:30:00Z",

    status: "Pending",
  },

  {
    id: "app-002",

    volunteer_id: "VS-2026-0149",
    volunteer: "Sara Benali",

    event_id: "event-002",
    event: "Rabat Beach Games",

    role_id: "role-002",
    role: "Athlete welcome desk",

    applied_at: "2026-08-28T11:15:00Z",

    status: "Accepted",
  },

  {
    id: "app-003",

    volunteer_id: "VS-2026-0150",
    volunteer: "Youssef Alaoui",

    event_id: "event-003",
    event: "Atlas Trail Challenge",

    role_id: "role-003",
    role: "Hydration station lead",

    applied_at: "2026-08-27T09:20:00Z",

    status: "Waitlisted",
  },

  {
    id: "app-004",

    volunteer_id: "VS-2026-0151",
    volunteer: "Noura Idrissi",

    event_id: "event-001",
    event: "Marrakech International Marathon",

    role_id: "role-004",
    role: "Accreditation support",

    applied_at: "2026-08-25T14:10:00Z",

    status: "Rejected",
  },
] as const;

export const adminVolunteers = [
  {
    id: "VS-2026-0148",
    name: "Amine El Mansouri",

    email: "amine.elmansouri@example.com",
    phone: "+212600000001",

    city: "Marrakech",
    country: "Morocco",

    events: 3,
    hours: 12,
    attendance: "100%",
    certificates: 1,

    status: "Active",

    joined_at: "2026-03-12",
  },

  {
    id: "VS-2026-0149",
    name: "Sara Benali",

    email: "sara.benali@example.com",
    phone: "+212600000002",

    city: "Rabat",
    country: "Morocco",

    events: 5,
    hours: 38,
    attendance: "96%",
    certificates: 3,

    status: "Active",

    joined_at: "2026-02-18",
  },

  {
    id: "VS-2026-0150",
    name: "Youssef Alaoui",

    email: "youssef.alaoui@example.com",
    phone: "+212600000003",

    city: "Ifrane",
    country: "Morocco",

    events: 2,
    hours: 16,
    attendance: "88%",
    certificates: 1,

    status: "Active",

    joined_at: "2026-04-05",
  },

  {
    id: "VS-2026-0151",
    name: "Noura Idrissi",

    email: "noura.idrissi@example.com",
    phone: "+212600000004",

    city: "Casablanca",
    country: "Morocco",

    events: 1,
    hours: 6,
    attendance: "100%",
    certificates: 0,

    status: "Pending",

    joined_at: "2026-08-15",
  },
] as const;

export const adminTraining = [
  {
    id: "training-001",
    title: "Volunteer fundamentals",
    type: "Video",

    description:
      "Introduction to volunteer responsibilities, event behaviour, communication, and basic event operations.",

    duration: 25,

    assigned: 1248,
    completed: 1102,

    status: "Published",

    created_at: "2026-07-01T10:00:00Z",
    published_at: "2026-07-03T10:00:00Z",
  },

  {
    id: "training-002",
    title: "Safety and safeguarding",
    type: "PDF + quiz",

    description:
      "Essential safety, safeguarding, emergency procedures, and responsible volunteer behaviour.",

    duration: 35,

    assigned: 924,
    completed: 781,

    status: "Published",

    created_at: "2026-07-05T10:00:00Z",
    published_at: "2026-07-07T10:00:00Z",
  },

  {
    id: "training-003",
    title: "Event-day communication",
    type: "Video",

    description:
      "Learn how to communicate clearly with volunteers, staff, athletes, and event coordinators.",

    duration: 20,

    assigned: 214,
    completed: 86,

    status: "Draft",

    created_at: "2026-08-12T10:00:00Z",
    published_at: null,
  },
] as const;

export const adminAttendance = [
  {
    id: "attendance-001",

    event_id: "event-002",
    event: "Rabat Beach Games",

    volunteer_id: "VS-2026-0149",
    volunteer: "Sara Benali",

    shift_id: "shift-001",
    shift: "Welcome desk · 08:00–14:00",

    check_in: "2026-11-02T07:48:00Z",
    check_out: "2026-11-02T14:12:00Z",

    status: "Complete",
  },

  {
    id: "attendance-002",

    event_id: "event-001",
    event: "Marrakech International Marathon",

    volunteer_id: "VS-2026-0148",
    volunteer: "Amine El Mansouri",

    shift_id: "shift-002",
    shift: "Route support · 06:00–12:30",

    check_in: null,
    check_out: null,

    status: "Scheduled",
  },

  {
    id: "attendance-003",

    event_id: "event-003",
    event: "Atlas Trail Challenge",

    volunteer_id: "VS-2026-0150",
    volunteer: "Youssef Alaoui",

    shift_id: "shift-003",
    shift: "Team liaison · 08:00–14:00",

    check_in: "2026-11-22T08:04:00Z",
    check_out: "2026-11-22T14:10:00Z",

    status: "Complete",
  },
] as const;

export const adminCertificates = [
  {
    id: "SV-2026-0048",

    volunteer_id: "VS-2026-0149",
    volunteer: "Sara Benali",

    event_id: "event-002",
    event: "Rabat Beach Games",

    hours: 8,

    date: "2026-07-12",
    issued_at: "2026-07-12T15:00:00Z",

    status: "Issued",
  },

  {
    id: "SV-2026-0021",

    volunteer_id: "VS-2026-0150",
    volunteer: "Youssef Alaoui",

    event_id: "event-003",
    event: "Atlas Youth Cup",

    hours: 4,

    date: "2026-06-28",
    issued_at: "2026-06-28T15:00:00Z",

    status: "Issued",
  },

  {
    id: "SV-2026-0052",

    volunteer_id: "VS-2026-0148",
    volunteer: "Amine El Mansouri",

    event_id: "event-001",
    event: "Marrakech International Marathon",

    hours: 0,

    date: null,
    issued_at: null,

    status: "Queued",
  },
] as const;

export const adminNotifications = [
  {
    id: "announcement-001",

    title: "Marrakech route briefing updated",

    audience_type: "accepted_volunteers",
    audience: "Accepted volunteers",

    category: "Event",

    event_id: "event-001",
    event: "Marrakech International Marathon",

    message:
      "The Marrakech route briefing has been updated. Please review the latest instructions before event day.",

    sent_at: "2026-08-30T09:42:00Z",

    status: "Sent",
  },

  {
    id: "announcement-002",

    title: "New safeguarding training available",

    audience_type: "all_volunteers",
    audience: "All volunteers",

    category: "Training",

    event_id: null,
    event: "—",

    message:
      "A new safeguarding training module is now available. Please complete it before your next event.",

    sent_at: "2026-08-29T10:00:00Z",

    status: "Sent",
  },

  {
    id: "announcement-003",

    title: "Volunteer hub opening hours",

    audience_type: "event_team",
    audience: "Rabat Beach Games",

    category: "General",

    event_id: "event-002",
    event: "Rabat Beach Games",

    message:
      "The volunteer hub will be open from 07:00 to 19:00 during the event weekend.",

    sent_at: null,

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
  {
    label: "Running",
    value: 45,
    color: "bg-primary",
  },

  {
    label: "Football",
    value: 28,
    color: "bg-ink",
  },

  {
    label: "Beach sports",
    value: 18,
    color: "bg-accent",
  },

  {
    label: "Other",
    value: 12,
    color: "bg-gold",
  },
] as const;

export const adminAccreditations = [
  {
    id: "acc-001",
    volunteer_id: "VS-2026-0148",
    volunteer: "Amine El Mansouri",

    event_id: "event-001",
    event: "Marrakech International Marathon",

    role_id: "role-001",
    role: "Route support volunteer",

    status: "Approved",
    badge: "MAR-2026-001",
  },

  {
    id: "acc-002",
    volunteer_id: "VS-2026-0149",
    volunteer: "Sara Benali",

    event_id: "event-002",
    event: "Rabat Beach Games",

    role_id: "role-002",
    role: "Athlete welcome desk",

    status: "Pending",
    badge: "RBG-2026-014",
  },

  {
    id: "acc-003",
    volunteer_id: "VS-2026-0150",
    volunteer: "Youssef Alaoui",

    event_id: "event-003",
    event: "Atlas Trail Challenge",

    role_id: "role-003",
    role: "Hydration station lead",

    status: "Rejected",
    badge: "ATC-2026-021",
  },
] as const;

export const adminProfile = {
  firstName: "Platform",
  lastName: "Administrator",
  email: "admin@volunsport.ma",
} as const;

export const adminRoles = [
  {
    id: "role-001",
    name: "Route support volunteer",
    event_id: "event-001",
    event: "Marrakech International Marathon",
    description:
      "Support runners along the route and help event staff maintain a safe and organised course.",
    volunteers: 18,
    required: 25,
    status: "Open",
  },

  {
    id: "role-002",
    name: "Athlete welcome desk",
    event_id: "event-002",
    event: "Rabat Beach Games",
    description:
      "Welcome athletes, provide event information, and support registration and check-in.",
    volunteers: 12,
    required: 12,
    status: "Full",
  },

  {
    id: "role-003",
    name: "Hydration station lead",
    event_id: "event-003",
    event: "Atlas Trail Challenge",
    description:
      "Coordinate hydration station operations and assist athletes during the trail event.",
    volunteers: 6,
    required: 10,
    status: "Open",
  },

  {
    id: "role-004",
    name: "Accreditation support",
    event_id: "event-001",
    event: "Marrakech International Marathon",
    description:
      "Support accreditation checks, badge distribution, and volunteer access control.",
    volunteers: 8,
    required: 10,
    status: "Open",
  },
] as const;

export const adminShifts = [
  {
    id: "shift-001",

    eventId: "event-001",
    event: "Marrakech International Marathon",

    roleId: "role-001",
    role: "Route support volunteer",

    date: "2026-10-18",

    startTime: "06:00",
    endTime: "12:30",

    location: "Marrakech City Center",

    volunteers: 18,
    capacity: 25,
  },

  {
    id: "shift-002",

    eventId: "event-002",
    event: "Rabat Beach Games",

    roleId: "role-002",
    role: "Athlete welcome desk",

    date: "2026-11-02",

    startTime: "08:00",
    endTime: "14:00",

    location: "Rabat Beach Sports Complex",

    volunteers: 12,
    capacity: 12,
  },

  {
    id: "shift-003",

    eventId: "event-003",
    event: "Atlas Trail Challenge",

    roleId: "role-003",
    role: "Hydration station lead",

    date: "2026-11-22",

    startTime: "08:00",
    endTime: "14:00",

    location: "Ifrane National Park",

    volunteers: 6,
    capacity: 10,
  },
] as const;