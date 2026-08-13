import type {
  Application,
  AttendanceRecord,
  Certificate,
  Event,
  EventRole,
  Notification,
  Shift,
  Training,
  VolunteerHours,
} from "./types";

export const mockEvents: Event[] = [
  {
    id: "e1",
    slug: "rabat-coastal-marathon",
    title: "Rabat Coastal Marathon",
    sport: "Running",
    city: "Rabat",
    country: "Morocco",
    venue: "Bouregreg Promenade",
    cover_url: null,
    description:
      "A city-wide marathon along the Rabat coastline with volunteer roles in hydration, cheering, route safety and finish-line support.",
    start_date: "2026-10-12",
    end_date: "2026-10-12",
    start_time: "07:00",
    end_time: "14:00",
    application_deadline: "2026-10-06",
    status: "published",
    total_volunteers_needed: 120,
    required_languages: ["Arabic", "French", "English"],
    requirements:
      "Comfortable standing, able to follow event safety briefings, available on race day.",
    event_type: "Marathon",
    featured: true,
    event_roles: [
      {
        id: "r1",
        event_id: "e1",
        name: "Hydration Station Volunteer",
        description: "Distribute water and energy drinks at key hydration stops.",
        responsibilities:
          "Set up water tables, refill cups, keep zones tidy, support medical staff with supplies.",
        requirements: "Able to lift 10kg boxes and stand for long periods.",
        skills: ["Teamwork", "Attention to detail"],
        positions: 24,
        filled_positions: 12,
        min_age: 18,
        mandatory_training: true,
      },
      {
        id: "r2",
        event_id: "e1",
        name: "Finish Line Assistant",
        description:
          "Help runners cross safely, hand out medals and collect finish-line belongings.",
        responsibilities:
          "Manage finish line flow, support the medical team and help with participant recovery tents.",
        requirements: "Friendly, calm under pressure, experience with crowds is a plus.",
        skills: ["Communication", "Customer service"],
        positions: 18,
        filled_positions: 10,
        min_age: 18,
        mandatory_training: false,
      },
    ],
  },
  {
    id: "e2",
    slug: "atlantic-university-cup",
    title: "Atlantic University Cup",
    sport: "Football",
    city: "Casablanca",
    country: "Morocco",
    venue: "Mohammed V Stadium",
    cover_url: null,
    description:
      "A university football tournament requiring volunteers for accreditation, crowd management and hospitality for visiting teams.",
    start_date: "2026-11-08",
    end_date: "2026-11-10",
    start_time: "09:00",
    end_time: "21:00",
    application_deadline: "2026-11-01",
    status: "published",
    total_volunteers_needed: 95,
    required_languages: ["Arabic", "French"],
    requirements: "Available for at least one full day, comfortable working indoors and outdoors.",
    event_type: "Football",
    featured: false,
    event_roles: [
      {
        id: "r3",
        event_id: "e2",
        name: "Accreditation Desk Lead",
        description: "Welcome volunteers and visiting staff, issue access badges.",
        responsibilities:
          "Verify IDs, manage accreditation queues, escalate issues to the operations manager.",
        requirements: "Excellent organizational skills.",
        skills: ["Organization", "Problem solving"],
        positions: 15,
        filled_positions: 9,
        min_age: 20,
        mandatory_training: true,
      },
      {
        id: "r4",
        event_id: "e2",
        name: "Team Hospitality Assistant",
        description: "Support team arrivals, manage welcome packs and shuttle logistics.",
        responsibilities: "Coordinate transport updates, keep hospitality zones supplied.",
        requirements: "Comfortable working with visiting groups.",
        skills: ["Hospitality", "French"],
        positions: 12,
        filled_positions: 4,
        min_age: 18,
        mandatory_training: false,
      },
    ],
  },
  {
    id: "e3",
    slug: "atlas-ridge-challenge",
    title: "Atlas Ridge Challenge",
    sport: "Cycling",
    city: "Marrakech",
    country: "Morocco",
    venue: "Menara Gardens",
    cover_url: null,
    description:
      "A mountain cycling challenge that needs volunteers for route marshaling, media support, and feed station operations.",
    start_date: "2026-12-05",
    end_date: "2026-12-05",
    start_time: "06:30",
    end_time: "16:00",
    application_deadline: "2026-11-28",
    status: "published",
    total_volunteers_needed: 80,
    required_languages: ["English", "French"],
    requirements: "Comfortable moving along the course and communicating clearly with riders.",
    event_type: "Cycling",
    featured: true,
    event_roles: [
      {
        id: "r5",
        event_id: "e3",
        name: "Route Marshal",
        description: "Keep riders on course, assist with turns and ensure route safety.",
        responsibilities: "Hold signs, direct cyclists, report hazards.",
        requirements: "Strong attention to detail and comfort outdoors.",
        skills: ["Safety awareness", "Decision making"],
        positions: 20,
        filled_positions: 18,
        min_age: 18,
        mandatory_training: true,
      },
    ],
  },
  {
    id: "e4",
    slug: "northern-league-finals",
    title: "Northern League Finals",
    sport: "Basketball",
    city: "Tangier",
    country: "Morocco",
    venue: "City Sports Arena",
    cover_url: null,
    description:
      "A finals weekend for youth basketball with volunteer opportunities in scorekeeping, guest services and media support.",
    start_date: "2027-01-18",
    end_date: "2027-01-19",
    start_time: "10:00",
    end_time: "20:00",
    application_deadline: "2027-01-10",
    status: "published",
    total_volunteers_needed: 70,
    required_languages: ["Arabic", "English"],
    requirements: "Available on both event days and comfortable supporting crowd flow.",
    event_type: "Basketball",
    featured: false,
    event_roles: [
      {
        id: "r6",
        event_id: "e4",
        name: "Scorekeeper",
        description: "Record game statistics, manage scoreboards and assist referees.",
        responsibilities: "Track points, fouls and game times.",
        requirements: "Attention to detail and interest in basketball.",
        skills: ["Focus", "Teamwork"],
        positions: 10,
        filled_positions: 6,
        min_age: 18,
        mandatory_training: false,
      },
      {
        id: "r7",
        event_id: "e4",
        name: "Guest Services Volunteer",
        description: "Support spectators, answer venue questions and manage hospitality zones.",
        responsibilities: "Help guests find seating and maintain a welcoming environment.",
        requirements: "Friendly attitude and basic French or English.",
        skills: ["Hospitality", "Communication"],
        positions: 12,
        filled_positions: 7,
        min_age: 18,
        mandatory_training: false,
      },
    ],
  },
];

export const mockApplications: Application[] = [
  {
    id: "a1",
    event_id: "e1",
    event_title: "Rabat Coastal Marathon",
    role_name: "Hydration Station Volunteer",
    submitted_at: "2026-09-22",
    status: "pending",
    message: "Ready to support the water stations and keep runners hydrated.",
  },
  {
    id: "a2",
    event_id: "e2",
    event_title: "Atlantic University Cup",
    role_name: "Accreditation Desk Lead",
    submitted_at: "2026-10-15",
    status: "accepted",
    message: "I have experience welcoming teams and managing registration desks.",
  },
  {
    id: "a3",
    event_id: "e3",
    event_title: "Atlas Ridge Challenge",
    role_name: "Route Marshal",
    submitted_at: "2026-11-11",
    status: "waitlisted",
    message: "Happy to support the route and help with rider safety.",
  },
];

export const mockShifts: Shift[] = [
  {
    id: "s1",
    event_id: "e2",
    event_title: "Atlantic University Cup",
    role_name: "Accreditation Desk Lead",
    date: "2026-11-08",
    start_time: "08:00",
    end_time: "15:00",
    location: "Mohammed V Stadium - Gate B",
    instructions: "Arrive early for kit distribution and set up the volunteer desk.",
  },
  {
    id: "s2",
    event_id: "e1",
    event_title: "Rabat Coastal Marathon",
    role_name: "Finish Line Assistant",
    date: "2026-10-12",
    start_time: "11:00",
    end_time: "14:00",
    location: "Bouregreg Promenade - Finish Village",
    instructions: "Keep the finish area clear and hand medals to participants.",
  },
];

export const mockTraining: Training[] = [
  {
    id: "t1",
    title: "Event Safety Briefing",
    description:
      "A short module covering crowd control, emergency procedures and volunteer conduct.",
    completed: true,
    resources: [
      { type: "video", title: "Safety essentials", url: "https://example.com/safety-video" },
      { type: "pdf", title: "Volunteer handbook", url: "https://example.com/handbook.pdf" },
    ],
  },
  {
    id: "t2",
    title: "Hydration Station Protocol",
    description: "Guidelines for serving athletes and managing hydration zones.",
    completed: false,
    resources: [
      { type: "pdf", title: "Hydration checklist", url: "https://example.com/hydration.pdf" },
    ],
  },
  {
    id: "t3",
    title: "Guest Services Essentials",
    description: "How to support spectators, provide directions and elevate the fan experience.",
    completed: false,
    resources: [
      { type: "video", title: "Service mindset", url: "https://example.com/service-video" },
    ],
  },
];

export const mockAttendance: AttendanceRecord[] = [
  {
    id: "att1",
    event_title: "Atlantic University Cup",
    role_name: "Accreditation Desk Lead",
    date: "2026-11-08",
    status: "checked-in",
    check_in_time: "08:10",
    check_out_time: "15:05",
  },
];

export const mockCertificates: Certificate[] = [
  {
    id: "c1",
    event_title: "Rabat Coastal Marathon",
    role_name: "Hydration Station Volunteer",
    hours: 6,
    date: "2026-10-12",
    certificate_id: "SV-2026-001",
  },
  {
    id: "c2",
    event_title: "Atlantic University Cup",
    role_name: "Accreditation Desk Lead",
    hours: 7,
    date: "2026-11-08",
    certificate_id: "SV-2026-002",
  },
];

export const mockNotifications: Notification[] = [
  {
    id: "n1",
    title: "Your application is under review",
    body: "The event organizer is reviewing your application for Rabat Coastal Marathon.",
    date: "2026-09-23",
    event_id: "e1",
    read: false,
    category: "application",
  },
  {
    id: "n2",
    title: "Training module available",
    body: "Hydration Station Protocol is ready for you ahead of the Atlas Ridge Challenge.",
    date: "2026-11-02",
    event_id: "e3",
    read: true,
    category: "training",
  },
];

export const mockHours: VolunteerHours = {
  total: 63,
  current_year: 42,
  by_sport: [
    { label: "Running", value: 22 },
    { label: "Football", value: 15 },
    { label: "Cycling", value: 5 },
    { label: "Basketball", value: 0 },
  ],
  by_event: [
    { label: "Rabat Coastal Marathon", value: 14 },
    { label: "Atlantic University Cup", value: 18 },
    { label: "Atlas Ridge Challenge", value: 10 },
    { label: "Northern League Finals", value: 0 },
  ],
};

export const mockVolunteerStats = {
  active_volunteers: 12400,
  upcoming_events: 18,
  accepted_volunteers: 312,
  hours_logged: 148000,
};

export const eventCoverDefaults: Record<string, string> = {
  Running:
    "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?auto=format&fit=crop&w=1200&q=80",
  Football:
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80",
  Cycling:
    "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?auto=format&fit=crop&w=1200&q=80",
  Basketball:
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80",
};

export const mockEventSlugs = mockEvents.reduce<Record<string, Event>>(
  (acc, event) => {
    acc[event.slug] = event;
    return acc;
  },
  {} as Record<string, Event>,
);
