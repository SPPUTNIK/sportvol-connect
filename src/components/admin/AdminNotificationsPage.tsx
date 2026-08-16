import { useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  Clock3,
  Send,
  Trash2,
} from "lucide-react";

import { AdminLayout } from "@/components/layouts/AdminLayout";

import {
  VSButton,
  VSCard,
  VSCardContent,
  VSEmptyState,
  VSInput,
  VSPageHeader,
  VSStatusBadge,
} from "@/components/design-system";

import { adminService } from "@/services/adminService";

function formatDate(date: string | null) {
  if (!date) return "Not sent";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, "_");
}

export function AdminNotificationsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  /*
   * Data comes from adminService.
   *
   * The page does not know whether the service currently uses
   * adminDemo data or Supabase.
   */
  const notifications = adminService.getNotifications();

  const [readNotifications, setReadNotifications] = useState<
    string[]
  >([]);

  const [deletedNotifications, setDeletedNotifications] =
    useState<string[]>([]);

  const visibleNotifications = useMemo(() => {
    return notifications
      .filter(
        (notification) =>
          !deletedNotifications.includes(notification.id),
      )
      .map((notification) => ({
        ...notification,
        read: readNotifications.includes(notification.id),
      }));
  }, [
    notifications,
    readNotifications,
    deletedNotifications,
  ]);

  const filteredNotifications = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();

    return visibleNotifications.filter((notification) => {
      const matchesQuery =
        !normalizedQuery ||
        `${notification.title} ${notification.message} ${notification.audience} ${notification.event}`
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesCategory =
        category === "all" ||
        normalize(notification.category) ===
          normalize(category);

      return matchesQuery && matchesCategory;
    });
  }, [
    visibleNotifications,
    query,
    category,
  ]);

  const unreadCount = visibleNotifications.filter(
    (notification) => !notification.read,
  ).length;

  const sentCount = visibleNotifications.filter(
    (notification) => notification.status === "sent",
  ).length;

  function markAsRead(id: string) {
    setReadNotifications((current) =>
      current.includes(id) ? current : [...current, id],
    );
  }

  function markAllAsRead() {
    setReadNotifications(
      visibleNotifications.map(
        (notification) => notification.id,
      ),
    );
  }

  function deleteNotification(id: string) {
    setDeletedNotifications((current) =>
      current.includes(id) ? current : [...current, id],
    );
  }

  return (
    <AdminLayout
      title="Notifications"
      eyebrow="Communication"
    >
      <div className="mx-auto max-w-7xl">
        <VSPageHeader
          eyebrow="Communication"
          title="Notifications"
          description="Create, review, and manage announcements sent to volunteers and event teams."
          action={
            unreadCount > 0 ? (
              <VSButton
                variant="outline"
                onClick={markAllAsRead}
              >
                <CheckCheck className="h-4 w-4" />
                Mark all as read
              </VSButton>
            ) : undefined
          }
        />

        {/* Summary */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <VSCard className="rounded-[1.75rem]">
            <VSCardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Bell className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Total
                  </p>

                  <p className="mt-1 text-2xl font-semibold">
                    {visibleNotifications.length}
                  </p>
                </div>
              </div>
            </VSCardContent>
          </VSCard>

          <VSCard className="rounded-[1.75rem]">
            <VSCardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <Clock3 className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Unread
                  </p>

                  <p className="mt-1 text-2xl font-semibold">
                    {unreadCount}
                  </p>
                </div>
              </div>
            </VSCardContent>
          </VSCard>

          <VSCard className="rounded-[1.75rem]">
            <VSCardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Send className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Sent
                  </p>

                  <p className="mt-1 text-2xl font-semibold">
                    {sentCount}
                  </p>
                </div>
              </div>
            </VSCardContent>
          </VSCard>
        </div>

        {/* Filters */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <VSInput
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search notifications..."
            />
          </div>

          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
            className="h-11 rounded-2xl border border-border bg-card px-4 text-sm"
          >
            <option value="all">All categories</option>
            <option value="Event">Event</option>
            <option value="Training">Training</option>
            <option value="General">General</option>
          </select>
        </div>

        {/* Notifications */}
        <div className="mt-6 grid gap-4">
          {filteredNotifications.length === 0 ? (
            <VSEmptyState
              title="No notifications found"
              description="Try another search or category filter."
            />
          ) : (
            filteredNotifications.map((notification) => (
              <VSCard
                key={notification.id}
                className={`rounded-[1.75rem] border-border transition ${
                  !notification.read
                    ? "border-primary/30 bg-primary/[0.025]"
                    : ""
                }`}
              >
                <VSCardContent className="p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    {/* Main content */}
                    <div className="flex min-w-0 flex-1 gap-4">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                          notification.read
                            ? "bg-muted text-muted-foreground"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        <Bell className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-lg font-semibold text-foreground">
                            {notification.title}
                          </h2>

                          {!notification.read && (
                            <span className="rounded-full bg-primary px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-primary-foreground">
                              New
                            </span>
                          )}

                          <VSStatusBadge
                            status={notification.status}
                          />
                        </div>

                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {notification.message}
                        </p>

                        {/* Metadata */}
                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                          <span>
                            <strong className="font-medium text-foreground">
                              Audience:
                            </strong>{" "}
                            {notification.audience}
                          </span>

                          <span>
                            <strong className="font-medium text-foreground">
                              Category:
                            </strong>{" "}
                            {notification.category}
                          </span>

                          <span>
                            <strong className="font-medium text-foreground">
                              Event:
                            </strong>{" "}
                            {notification.event}
                          </span>

                          <span>
                            <strong className="font-medium text-foreground">
                              Sent:
                            </strong>{" "}
                            {formatDate(
                              notification.sentAt,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-2 lg:pt-1">
                      {!notification.read && (
                        <VSButton
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            markAsRead(notification.id)
                          }
                        >
                          <CheckCheck className="h-4 w-4" />
                          Mark read
                        </VSButton>
                      )}

                      <VSButton
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          deleteNotification(
                            notification.id,
                          )
                        }
                        aria-label={`Delete ${notification.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </VSButton>
                    </div>
                  </div>
                </VSCardContent>
              </VSCard>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}