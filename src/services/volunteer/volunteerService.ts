import { getAcceptedEvents, getVolunteerHours, getVolunteerStats } from "@/services/shared/mockService";
import type { VolunteerService } from "@/services/shared/contracts";

export const volunteerService: VolunteerService = {
  async getCurrentVolunteer() {
    return null;
  },
  getAcceptedEvents,
  getVolunteerHours,
  getVolunteerStats,
};
