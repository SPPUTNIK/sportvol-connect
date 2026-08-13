import { getShifts } from "@/services/mockService";
import type { Shift } from "@/lib/types";

export interface ScheduleService {
  getShifts(): Promise<Shift[]>;
}

export const scheduleService: ScheduleService = {
  getShifts,
};
