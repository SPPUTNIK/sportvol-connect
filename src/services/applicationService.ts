import { demoApplications } from "@/mocks/frontendDemo";
import type { Application } from "@/lib/types";

const USE_MOCK_DATA = true;

export const applicationService = {
  async getApplications(): Promise<Application[]> {
    if (!USE_MOCK_DATA) {
      throw new Error(
        "Supabase application service is not connected yet.",
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 300));

    return demoApplications.map(
      (application) =>
        ({
          id: application.id,

          event_title: application.event,

          role_name: application.role,

          status: application.status,

          submitted_at: application.appliedAt,
        }) as Application,
    );
  },
};