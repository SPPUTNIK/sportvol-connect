// import { getShifts } from "@/services/mockService";
// import type { Shift } from "@/lib/types";

// export interface ScheduleService {
//   getShifts(): Promise<Shift[]>;
// }

// export const scheduleService: ScheduleService = {
//   getShifts,
// };


import { demoSchedule } from "@/mocks/frontendDemo";
import type { Shift } from "@/lib/types";

const USE_MOCK_DATA = true;

export const scheduleService = {
  async getShifts(): Promise<Shift[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      return demoSchedule.map(
        (shift) =>
          ({
            id: shift.id,
            event_title: shift.event,
            role_name: shift.role,
            date: `${shift.date} ${shift.month} 2026`,
            start_time: shift.start,
            end_time: shift.end,
            location: shift.location,
            instructions: shift.instructions,
          }) as Shift,
      );
    }

    // Supabase implementation will be added later.
    throw new Error(
      "Supabase schedule service is not connected yet.",
    );
  },
};