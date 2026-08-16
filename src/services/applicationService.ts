// import { applyForRole, getApplications } from "@/services/mockService";
// import type { ApplicationService } from "@/services/contracts";

// export const applicationService: ApplicationService = {
//   getApplications,
//   async applyForRole(input) {
//     return applyForRole(
//       input.eventId,
//       input.roleId,
//       input.availability,
//       input.experience,
//       input.motivation,
//     );
//   },
// };


import { demoApplications } from "@/mocks/frontendDemo";
import type { Application } from "@/lib/types";

const USE_MOCK_DATA = true;

export const applicationService = {
  async getApplications(): Promise<Application[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      return demoApplications.map(
        (application) =>
          ({
            id: application.id,
            event_title: application.event_title,
            role_name: application.role_name,
            status: application.status,
          }) as Application,
      );
    }

    // Supabase implementation will go here later.
    throw new Error("Supabase application service is not connected yet.");
  },
};