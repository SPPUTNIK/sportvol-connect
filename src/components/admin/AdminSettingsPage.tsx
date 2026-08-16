import { Save } from "lucide-react";

import { AdminGate } from "./components/AdminGate";

import {
  VSButton,
  VSCard,
  VSCardContent,
  VSPageHeader,
} from "@/components/design-system";

const settings = [
  "Email notifications for new applications",
  "Weekly operations summary",
  "Require review before publishing events",
  "Show attendance reminders",
];

export function AdminSettingsPage() {
  return (
    <AdminGate title="Admin settings">
      <div className="mx-auto max-w-3xl">
        <VSPageHeader
          eyebrow="Account"
          title="Settings"
          description="Configure preferences for the admin workspace."
        />

        <div className="mt-8 space-y-4">
          {settings.map((setting, index) => (
            <VSCard
              key={setting}
              className="rounded-[1.5rem] border-border"
            >
              <VSCardContent className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {setting}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Frontend preference placeholder
                  </p>
                </div>

                <input
                  type="checkbox"
                  defaultChecked={index < 3}
                  className="h-5 w-5 accent-primary"
                />
              </VSCardContent>
            </VSCard>
          ))}
        </div>

        <VSButton className="mt-6">
          <Save className="h-4 w-4" />
          Save settings
        </VSButton>
      </div>
    </AdminGate>
  );
}