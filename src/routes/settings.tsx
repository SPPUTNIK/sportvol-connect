import { createFileRoute } from "@tanstack/react-router";
import { Bell, Globe2, LockKeyhole, UserRound } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
export const Route = createFileRoute("/settings")({
  component: Settings,
  head: () => ({ meta: [{ title: "Settings | VolunSport Morocco" }] }),
});
function Settings() {
  return (
    <AppShell title="Settings">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">Your preferences</p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-foreground">Settings</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Keep your account preferences clear and in your control.
        </p>
        <div className="mt-8 space-y-4">
          {[
            [UserRound, "Account", "Manage your profile and sign-in details."],
            [Bell, "Notifications", "Choose which event and training updates you receive."],
            [Globe2, "Language", "Set your preferred language for the platform."],
            [LockKeyhole, "Privacy", "Review visibility and communication preferences."],
          ].map(([Icon, title, description]) => (
            <button
              type="button"
              key={String(title)}
              className="flex w-full items-center gap-4 rounded-[1.5rem] border border-border bg-card p-5 text-left transition hover:border-primary"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold text-foreground">{String(title)}</span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {String(description)}
                </span>
              </span>
              <span className="text-sm font-semibold text-primary">Manage</span>
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
