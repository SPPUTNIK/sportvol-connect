import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({
    meta: [{ title: "Dashboard | VolunSport Morocco" }],
  }),
});

function Dashboard() {
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login";
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="shell min-h-screen py-24">
        <div className="mx-auto max-w-md rounded-[2rem] border border-hairline-invert bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <I18nProvider>
      <div className="shell min-h-screen py-24">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-hairline-invert bg-card p-10 shadow-[var(--shadow-lift)]">
          <h1 className="text-3xl font-semibold text-foreground">Welcome back{profile?.first_name ? `, ${profile.first_name}` : ""}.</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This is a secure volunteer dashboard. Your upcoming events, applications and hours will appear here.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-hairline-invert bg-background p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Events</p>
              <p className="mt-4 text-4xl font-semibold text-foreground">0</p>
              <p className="mt-2 text-sm text-muted-foreground">Upcoming events assigned to you</p>
            </div>
            <div className="rounded-3xl border border-hairline-invert bg-background p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Hours</p>
              <p className="mt-4 text-4xl font-semibold text-foreground">{profile?.volunteer_hours ?? 0}</p>
              <p className="mt-2 text-sm text-muted-foreground">Verified volunteer hours</p>
            </div>
            <div className="rounded-3xl border border-hairline-invert bg-background p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Attendance</p>
              <p className="mt-4 text-4xl font-semibold text-foreground">{Math.round(profile?.attendance_rate ?? 0)}%</p>
              <p className="mt-2 text-sm text-muted-foreground">Attendance rate</p>
            </div>
          </div>
        </div>
      </div>
    </I18nProvider>
  );
}
