import { getAttendance } from "@/services/mockService";
import type { AttendanceService } from "@/services/contracts";

export const attendanceService: AttendanceService = {
  getAttendance,
};
