export type LeaderMemberStatus = "Assigned" | "Checked in" | "Pending" | "On standby";

export type LeaderFeedbackStatus = "Submitted" | "Pending" | "Needs follow-up";

export type LeaderShiftStatus = "Open" | "Filled" | "Completed";

export interface LeaderProfile {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface LeaderEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  status: string;
  coverImage: string;
  committeeName: string;
  leaderName: string;
  startTime: string;
  endTime: string;
}

export interface LeaderCommittee {
  id: string;
  eventId: string;
  name: string;
  description: string;
  status: string;
  leader: string;
  memberCount: number;
}

export interface LeaderMember {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string;
  role: string;
  status: LeaderMemberStatus;
  assignedShift: string;
  attendance: string;
  feedbackStatus: LeaderFeedbackStatus;
}

export interface LeaderShift {
  id: string;
  title: string;
  location: string;
  startTime: string;
  endTime: string;
  status: LeaderShiftStatus;
  assignedVolunteers: string[];
  capacity: number;
  summary: string;
}

export interface LeaderFeedback {
  id: string;
  volunteerId: string;
  volunteerName: string;
  role: string;
  rating: number;
  comment: string;
  status: string;
}

export type MockAttendanceStatus = "not_checked_in" | "checked_in" | "checked_out";

export interface LeaderScannerVolunteer {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  committeeId: string;
  eventId: string;
  accreditationQrCode: string;
  attendanceStatus: MockAttendanceStatus;
  avatar: string;
  checkInTime?: string;
  checkOutTime?: string;
}

export interface LeaderScanRecord {
  id: string;
  volunteerId: string;
  volunteerName: string;
  role: string;
  status: "checked_in" | "checked_out";
  timestamp: string;
}

export const leaderProfile: LeaderProfile = {
  id: "leader-1",
  firstName: "Ahmed",
  lastName: "Benali",
  role: "Committee Leader",
};

export const leaderEvent: LeaderEvent = {
  id: "event-101",
  title: "Rabat International Marathon 2026",
  description:
    "A citywide endurance event bringing together athletes, supporters, and community volunteers for a safe and welcoming race experience across Rabat.",
  startDate: "2026-09-20",
  endDate: "2026-09-20",
  location: "Rabat, Morocco",
  status: "Published",
  coverImage:
    "https://images.unsplash.com/photo-1541534401786-2077eed87a74?auto=format&fit=crop&w=1200&q=80",
  committeeName: "Registration & Welcome",
  leaderName: "Ahmed Benali",
  startTime: "08:00",
  endTime: "18:00",
};

export const leaderCommittee: LeaderCommittee = {
  id: "committee-301",
  eventId: leaderEvent.id,
  name: "Registration & Welcome",
  description:
    "Coordinates athlete arrivals, registration flow, information desk operations, and volunteer onboarding for race-day logistics.",
  status: "Active",
  leader: `${leaderProfile.firstName} ${leaderProfile.lastName}`,
  memberCount: 12,
};

export const leaderMembers: LeaderMember[] = [
  {
    id: "member-1",
    firstName: "Sara",
    lastName: "Alami",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    role: "Registration Volunteer",
    status: "Checked in",
    assignedShift: "Registration Desk",
    attendance: "92%",
    feedbackStatus: "Submitted",
  },
  {
    id: "member-2",
    firstName: "Yassine",
    lastName: "Mansouri",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    role: "Welcome Volunteer",
    status: "Assigned",
    assignedShift: "Welcome Area",
    attendance: "88%",
    feedbackStatus: "Pending",
  },
  {
    id: "member-3",
    firstName: "Omar",
    lastName: "Ait Taleb",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    role: "Information Volunteer",
    status: "Checked in",
    assignedShift: "Information Point",
    attendance: "95%",
    feedbackStatus: "Submitted",
  },
  {
    id: "member-4",
    firstName: "Lina",
    lastName: "Ziani",
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80",
    role: "Athlete Support",
    status: "Assigned",
    assignedShift: "Athlete Support",
    attendance: "90%",
    feedbackStatus: "Pending",
  },
  {
    id: "member-5",
    firstName: "Adam",
    lastName: "Cherkaoui",
    avatar:
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=400&q=80",
    role: "Registration Volunteer",
    status: "On standby",
    assignedShift: "Finish Line",
    attendance: "81%",
    feedbackStatus: "Needs follow-up",
  },
  {
    id: "member-6",
    firstName: "Nadia",
    lastName: "Bensaid",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    role: "Welcome Volunteer",
    status: "Assigned",
    assignedShift: "Welcome Area",
    attendance: "94%",
    feedbackStatus: "Submitted",
  },
  {
    id: "member-7",
    firstName: "Hicham",
    lastName: "Dahmani",
    avatar:
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=400&q=80",
    role: "Information Volunteer",
    status: "Pending",
    assignedShift: "Information Point",
    attendance: "76%",
    feedbackStatus: "Needs follow-up",
  },
  {
    id: "member-8",
    firstName: "Imane",
    lastName: "Khaouja",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    role: "Athlete Support",
    status: "Checked in",
    assignedShift: "Athlete Support",
    attendance: "97%",
    feedbackStatus: "Submitted",
  },
  {
    id: "member-9",
    firstName: "Karim",
    lastName: "Sassi",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    role: "Registration Volunteer",
    status: "Assigned",
    assignedShift: "Registration Desk",
    attendance: "91%",
    feedbackStatus: "Pending",
  },
  {
    id: "member-10",
    firstName: "Leila",
    lastName: "El Idrissi",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
    role: "Support Volunteer",
    status: "Assigned",
    assignedShift: "Finish Line",
    attendance: "93%",
    feedbackStatus: "Submitted",
  },
  {
    id: "member-11",
    firstName: "Bilal",
    lastName: "Ramdani",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    role: "Welcome Volunteer",
    status: "Checked in",
    assignedShift: "Welcome Area",
    attendance: "96%",
    feedbackStatus: "Submitted",
  },
  {
    id: "member-12",
    firstName: "Amina",
    lastName: "Hakimi",
    avatar:
      "https://images.unsplash.com/photo-1546961329-78bef0414d7c?auto=format&fit=crop&w=400&q=80",
    role: "Information Volunteer",
    status: "Assigned",
    assignedShift: "Information Point",
    attendance: "89%",
    feedbackStatus: "Pending",
  },
];

export const leaderShifts: LeaderShift[] = [
  {
    id: "shift-1",
    title: "Registration Desk",
    location: "Main Entrance",
    startTime: "09:00",
    endTime: "12:00",
    status: "Filled",
    assignedVolunteers: ["Sara", "Karim", "Lina"],
    capacity: 5,
    summary: "Check-in and bib collection for participating runners.",
  },
  {
    id: "shift-2",
    title: "Welcome Area",
    location: "Festival Plaza",
    startTime: "12:00",
    endTime: "15:00",
    status: "Filled",
    assignedVolunteers: ["Yassine", "Nadia", "Bilal"],
    capacity: 4,
    summary: "Guide athletes and spectators to staging and support zones.",
  },
  {
    id: "shift-3",
    title: "Information Point",
    location: "Expo Avenue",
    startTime: "15:00",
    endTime: "18:00",
    status: "Open",
    assignedVolunteers: ["Omar", "Amina"],
    capacity: 4,
    summary: "Deliver course information and respond to participant questions.",
  },
  {
    id: "shift-4",
    title: "Athlete Support",
    location: "Recovery Zone",
    startTime: "08:30",
    endTime: "11:30",
    status: "Completed",
    assignedVolunteers: ["Lina", "Imane"],
    capacity: 3,
    summary: "Support hydration, first aid visibility, and athlete flow.",
  },
  {
    id: "shift-5",
    title: "Finish Line",
    location: "Finish Arch",
    startTime: "09:30",
    endTime: "14:00",
    status: "Open",
    assignedVolunteers: ["Adam", "Leila"],
    capacity: 5,
    summary: "Assist finishing runners and coordinate medal handoff.",
  },
];

export const leaderFeedback: LeaderFeedback[] = [
  {
    id: "feedback-1",
    volunteerId: "member-2",
    volunteerName: "Yassine Mansouri",
    role: "Welcome Volunteer",
    rating: 4.8,
    comment: "Strong communication and a calm presence during the morning check-in queue.",
    status: "Pending",
  },
  {
    id: "feedback-2",
    volunteerId: "member-4",
    volunteerName: "Lina Ziani",
    role: "Athlete Support",
    rating: 4.6,
    comment: "Very responsive and helpful with athletes needing hydration and directions.",
    status: "Pending",
  },
  {
    id: "feedback-3",
    volunteerId: "member-7",
    volunteerName: "Hicham Dahmani",
    role: "Information Volunteer",
    rating: 3.9,
    comment: "Needs slightly more initiative when the information desk is busy.",
    status: "Needs follow-up",
  },
];

export const todayShifts = leaderShifts.slice(0, 3);

export const pendingFeedback = leaderFeedback.filter((feedback) => feedback.status !== "Submitted");

export const leaderScannerVolunteers: LeaderScannerVolunteer[] = [
  {
    id: "vol-1",
    firstName: "Sara",
    lastName: "El Amrani",
    role: "Registration Volunteer",
    committeeId: "committee-301",
    eventId: "event-101",
    accreditationQrCode: "SPORTVOL-VOL-001",
    attendanceStatus: "not_checked_in",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "vol-2",
    firstName: "Yassine",
    lastName: "Amine",
    role: "Welcome Volunteer",
    committeeId: "committee-301",
    eventId: "event-101",
    accreditationQrCode: "SPORTVOL-VOL-002",
    attendanceStatus: "checked_in",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    checkInTime: "08:47",
  },
  {
    id: "vol-3",
    firstName: "Omar",
    lastName: "Alaoui",
    role: "Information Volunteer",
    committeeId: "committee-301",
    eventId: "event-101",
    accreditationQrCode: "SPORTVOL-VOL-003",
    attendanceStatus: "checked_in",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    checkInTime: "08:52",
  },
  {
    id: "vol-4",
    firstName: "Nadia",
    lastName: "Bensaid",
    role: "Welcome Volunteer",
    committeeId: "committee-301",
    eventId: "event-101",
    accreditationQrCode: "SPORTVOL-VOL-004",
    attendanceStatus: "checked_out",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    checkInTime: "08:31",
    checkOutTime: "16:32",
  },
  {
    id: "vol-5",
    firstName: "Zineb",
    lastName: "El Messaoudi",
    role: "Media Volunteer",
    committeeId: "committee-999",
    eventId: "event-201",
    accreditationQrCode: "SPORTVOL-VOL-005",
    attendanceStatus: "not_checked_in",
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80",
  },
];

export const leaderScannerRecentScans: LeaderScanRecord[] = [
  {
    id: "scan-1",
    volunteerId: "vol-1",
    volunteerName: "Sara El Amrani",
    role: "Registration Volunteer",
    status: "checked_in",
    timestamp: "08:47",
  },
  {
    id: "scan-2",
    volunteerId: "vol-4",
    volunteerName: "Nadia Bensaid",
    role: "Welcome Volunteer",
    status: "checked_out",
    timestamp: "16:32",
  },
  {
    id: "scan-3",
    volunteerId: "vol-3",
    volunteerName: "Omar Alaoui",
    role: "Information Volunteer",
    status: "checked_in",
    timestamp: "08:52",
  },
];
