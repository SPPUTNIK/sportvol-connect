import {
  adminAnalytics,
  adminApplications,
  adminAttendance,
  adminCertificates,
  adminEvents,
  adminNotifications,
  adminReports,
  adminStats,
  adminTraining,
  adminVolunteers,
} from "@/mocks/adminDemo";
import type { AdminService } from "@/services/contracts";

export const adminService: AdminService = {
  async getAdmin() {
    return {
      id: "admin-demo",
      email: "admin@volunsport.ma",
      firstName: "VolunSport",
      lastName: "Admin",
      avatarUrl: null,
      role: "ADMIN",
    };
  },
  getStats: () => adminStats,
  getEvents: () => [...adminEvents],
  getApplications: () => [...adminApplications],
  getVolunteers: () => [...adminVolunteers],
  getTraining: () => [...adminTraining],
  getAttendance: () => [...adminAttendance],
  getCertificates: () => [...adminCertificates],
  getNotifications: () => [...adminNotifications],
  getReports: () => [...adminReports],
  getAnalytics: () => [...adminAnalytics],
};
