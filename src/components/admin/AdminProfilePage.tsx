import { Save } from "lucide-react";

import { AdminGate } from "./components/AdminGate";

import {
  VSButton,
  VSCard,
  VSCardContent,
  VSInput,
  VSPageHeader,
} from "@/components/design-system";

import { adminService } from "@/services/adminService";

export function AdminProfilePage() {
  const profile = adminService.getAdminProfile();

  const firstName = profile.firstName;
  const lastName = profile.lastName;
  const email = profile.email;

  return (
    <AdminGate title="Admin profile">
      <div className="mx-auto max-w-3xl">
        <VSPageHeader
          eyebrow="Account"
          title="Admin profile"
          description="Manage the profile details shown in the control workspace."
        />

        <VSCard className="mt-8 rounded-[2rem] border-border">
          <VSCardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink text-xl font-semibold text-white">
                {firstName.charAt(0)}
                {lastName.charAt(0)}
              </div>

              <div>
                <p className="text-lg font-semibold">
                  {firstName} {lastName}
                </p>

                <p className="text-sm text-muted-foreground">
                  Admin access · VolunSport Morocco
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-medium">
                First name

                <VSInput
                  className="mt-2"
                  defaultValue={firstName}
                />
              </label>

              <label className="text-sm font-medium">
                Last name

                <VSInput
                  className="mt-2"
                  defaultValue={lastName}
                />
              </label>

              <label className="text-sm font-medium sm:col-span-2">
                Email

                <VSInput
                  className="mt-2"
                  defaultValue={email}
                />
              </label>
            </div>

            <VSButton className="mt-6">
              <Save className="h-4 w-4" />
              Save profile
            </VSButton>
          </VSCardContent>
        </VSCard>
      </div>
    </AdminGate>
  );
}