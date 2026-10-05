const emptyDashboard = {
  upcomingEvents: 0,
  volunteerHours: 0,
  attendance: "0%",
  certificates: 0,
  profileCompletion: 0,
  recentApplications: 0,
};

const emptyProfile = {
  id: null,
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  city: "",
  country: "",
  role: "volunteer",
};

export const volunteerContentService = {
  getDashboard: () => emptyDashboard,
  getUpcomingEvent: () => null,
  getApplications: () => [],
  getMyEvents: () => [],
  getSchedule: () => [],
  getTraining: () => [],
  getAccreditation: () => null,
  getAttendance: () => [],
  getHours: () => ({ total: 0, thisYear: 0, recent: [] }),
  getCertificates: () => [],
  getAchievements: () => [],
  getNotifications: () => [],
  getProfile: () => emptyProfile,
};
