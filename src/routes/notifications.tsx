import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { I18nProvider } from "@/lib/i18n";
import { notificationService } from "@/services/notificationService";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Notification } from "@/lib/types";

export const Route = createFileRoute("/notifications")({
  component: Notifications,
  head: () => ({
    meta: [{ title: "Notifications | VolunSport Morocco" }],
  }),
});

function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    notificationService
      .getNotifications()
      .then((data) => setNotifications(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <I18nProvider>
      <div className="shell min-h-screen py-24">
        <div className="mb-8 space-y-3">
          <p className="eyebrow">Notifications</p>
          <h1 className="display-md text-ink-foreground">Recent platform updates</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            View your unread notifications, event updates and training reminders.
          </p>
        </div>

        {loading ? (
          <LoadingState message="Loading notifications…" />
        ) : error ? (
          <EmptyState title="Error" description={error} />
        ) : notifications.length === 0 ? (
          <EmptyState
            title="No notifications"
            description="You'll see new updates here whenever there is an event or message."
          />
        ) : (
          <div className="grid gap-6">
            {notifications.map((notification) => (
              <Card key={notification.id} className="rounded-[2rem] border border-hairline-invert">
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle>{notification.title}</CardTitle>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${notification.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}
                    >
                      {notification.read ? "Read" : "Unread"}
                    </span>
                  </div>
                  <CardDescription>{notification.category}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <p className="text-sm text-muted-foreground">{notification.body}</p>
                  <p className="text-xs text-muted-foreground">{notification.date}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </I18nProvider>
  );
}
