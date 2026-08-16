import { demoVolunteerProfile } from "@/mocks/frontendDemo";

import type { VolunteerProfile } from "@/lib/types";

const USE_MOCK_DATA = true;

export const profileService = {
  async getProfile(): Promise<VolunteerProfile> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) =>
        setTimeout(resolve, 500),
      );

      return {
        id: "profile-001",

        volunteer_id:
          demoVolunteerProfile.volunteerId,

        first_name: "Amine",
        last_name: "El Mansouri",

        email: "amine.elmansouri@example.com",

        phone: "+212 6 12 34 56 78",

        city: "Rabat",
        country: "Morocco",

        bio:
          "Passionate about sports, teamwork and supporting well-organized sporting events.",

        date_of_birth: "2002-05-14",

        experience:
          "Volunteer experience in sporting events and community activities.",

        interests: [
          "Running",
          "Football",
          "Beach games",
        ],

        skills: [
          "Teamwork",
          "Communication",
          "Event support",
        ],

        languages: [
          "Arabic",
          "French",
          "English",
        ],

        volunteer_hours: 12,

        attendance_rate: 100,
      };
    }

    throw new Error(
      "Supabase profile service is not connected yet.",
    );
  },

  async updateProfile(
    updates: Partial<VolunteerProfile>,
  ): Promise<VolunteerProfile> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) =>
        setTimeout(resolve, 400),
      );

      /*
       * Mock update:
       * merge the submitted values into the current
       * demo profile.
       */

      return {
        id: "profile-001",

        volunteer_id:
          demoVolunteerProfile.volunteerId,

        first_name:
          updates.first_name ?? "Amine",

        last_name:
          updates.last_name ?? "El Mansouri",

        email:
          updates.email ??
          "amine.elmansouri@example.com",

        phone:
          updates.phone ??
          "+212 6 12 34 56 78",

        city:
          updates.city ?? "Rabat",

        country:
          updates.country ?? "Morocco",

        bio:
          updates.bio ??
          "Passionate about sports, teamwork and supporting well-organized sporting events.",

        date_of_birth:
          updates.date_of_birth ?? "2002-05-14",

        experience:
          updates.experience ??
          "Volunteer experience in sporting events and community activities.",

        interests:
          updates.interests ?? [
            "Running",
            "Football",
            "Beach games",
          ],

        skills:
          updates.skills ?? [
            "Teamwork",
            "Communication",
            "Event support",
          ],

        languages:
          updates.languages ?? [
            "Arabic",
            "French",
            "English",
          ],

        volunteer_hours: 12,

        attendance_rate: 100,
      };
    }

    throw new Error(
      "Supabase profile service is not connected yet.",
    );
  },
};