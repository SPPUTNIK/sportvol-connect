import { applyForRole, getApplications } from "@/services/mockService";
import type { ApplicationService } from "@/services/contracts";

export const applicationService: ApplicationService = {
  getApplications,
  async applyForRole(input) {
    return applyForRole(
      input.eventId,
      input.roleId,
      input.availability,
      input.experience,
      input.motivation,
    );
  },
};
