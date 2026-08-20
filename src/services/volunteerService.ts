import { getAcceptedEvents, getVolunteerHours, getVolunteerStats } from "@/services/mockService";
import type { VolunteerService } from "@/services/contracts";


export const volunteerService: VolunteerService = {
  async getCurrentVolunteer() {
    return null;
  },
  getAcceptedEvents,
  getVolunteerHours,
  getVolunteerStats,
};

