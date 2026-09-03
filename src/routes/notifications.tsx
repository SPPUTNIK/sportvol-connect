import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, CheckCircle2, Info, Megaphone } from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import { notificationService } from "@/services/notificationService";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import type { Notification } from "@/lib/types";

export const Route = createFileRoute("/notifications")({
  component: Notifications,
  head: () => ({
    meta: [{ title: "Notifications | VolunSport Morocco" }],
  }),
});

function getCategoryIcon(category: string) {
  switch (category.toLowerCase()) {
    case "applications":
      return <CheckCircle2 className="h-5 w-5" />;

    case "events":
      return <Megaphone className="h-5 w-5" />;

    case "training":
      return <Info className="h-5 w-5" />;

    default:
      return <Bell className="h-5 w-5" />;
  }
}

function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    notificationService
      .getNotifications()
      .then((data) => setNotifications(data))
      .catch((err: unknown) => {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load notifications.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  return (
    <AppShell title="Notifications">
      <div className="mx-auto max-w-5xl space-y-8">

        {/* Header */}
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Notifications</p>

            <h1 className="display-md mt-3 text-ink-foreground">
              Stay up to date.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              View your latest application updates, event announcements,
              training reminders and platform messages.
            </p>
          </div>

          {unreadCount > 0 && (
            <div className="flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <span className="h-2 w-2 rounded-full bg-primary" />
              {unreadCount} unread
            </div>
          )}
        </header>

        {/* Content */}
        {loading ? (
          <LoadingState message="Loading notifications…" />
        ) : error ? (
          <EmptyState
            title="Notifications unavailable"
            description={error}
          />
        ) : notifications.length === 0 ? (
          <EmptyState
            title="No notifications"
            description="You'll see new updates here whenever there is an event, application or platform message."
          />
        ) : (
          <div className="space-y-4">

            {notifications.map((notification) => (
              <article
                key={notification.id}
                className={`group rounded-[2rem] border bg-card p-5 shadow-[var(--shadow-lift)] transition hover:-translate-y-0.5 sm:p-6 ${
                  notification.read
                    ? "border-border"
                    : "border-primary/30 bg-primary/[0.02]"
                }`}
              >
                <div className="flex gap-4">

                  {/* Icon */}
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                      notification.read
                        ? "bg-muted text-muted-foreground"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {getCategoryIcon(notification.category)}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base font-semibold text-foreground sm:text-lg">
                            {notification.title}
                          </h2>

                          {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>

                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {notification.category}
                        </p>
                      </div>

                      <span className="shrink-0 text-xs text-muted-foreground">
                        {notification.date}
                      </span>
                    </div>

                    <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
                      {notification.body}
                    </p>

                    {!notification.read && (
                      <div className="mt-4 text-xs font-semibold text-primary">
                        New notification
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}