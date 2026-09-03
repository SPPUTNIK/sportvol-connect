// import { getAttendance } from "@/services/mockService";
// import type { AttendanceService } from "@/services/contracts";

// export const attendanceService: AttendanceService = {
//   getAttendance,
// };


import { demoAttendance } from "@/mocks/frontendDemo";
import type { AttendanceRecord } from "@/lib/types";

const USE_MOCK_DATA = true;

export const attendanceService = {
  async getAttendance(): Promise<AttendanceRecord[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      return demoAttendance.map(
        (record) =>
          ({
            id: record.id,
            event_title: record.event,
            role_name: record.role,
            date: record.date,

            status:
              record.status === "Completed"
                ? "checked-out"
                : record.status === "Upcoming"
                  ? "pending"
                  : "pending",

            check_in_time:
              record.checkIn === "—"
                ? null
                : record.checkIn,

            check_out_time:
              record.checkOut === "—"
                ? null
                : record.checkOut,
          }) as AttendanceRecord,
      );
    }

    // Supabase implementation will be connected later.
    throw new Error(
      "Supabase attendance service is not connected yet.",
    );
  },
};