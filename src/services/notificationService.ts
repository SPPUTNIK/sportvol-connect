import { supabase } from "@/lib/supabase";
import type { Notification } from "@/lib/types";

type NotificationRow = {
  id: string;
  profile_id: string;
  event_id: string | null;
  application_id: string | null;
  title: string;
  body: string;
  category: string;
  read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
};

async function getCurrentUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error("You must be signed in.");
  }

  return user.id;
}

function formatNotificationDate(date: string): string {
  return new Intl.DateTimeFormat("en-MA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(date));
}

function normalizeCategory(category: string): Notification["category"] {
  switch (category.toLowerCase()) {
    case "application":
      return "application";

    case "training":
      return "training";

    case "accreditation":
      return "accreditation";

    case "certificate":
      return "certificate";

    case "event":
      return "event";

    default:
      return "other";
  }
}

function mapNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    date: formatNotificationDate(row.created_at),
    event_id: row.event_id,
    read: row.read,
    category: normalizeCategory(row.category),
  };
}

export const notificationService = {
  /**
   * Get all notifications for the currently authenticated volunteer.
   */
  async getNotifications(): Promise<Notification[]> {
    const profileId = await getCurrentUserId();

    const { data, error } = await supabase
      .from("notifications")
      .select(`
        id,
        profile_id,
        event_id,
        application_id,
        title,
        body,
        category,
        read,
        read_at,
        created_at,
        updated_at
      `)
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Notifications] Get error:", error);
      throw error;
    }

    return ((data ?? []) as NotificationRow[]).map(mapNotification);
  },

  /**
   * Get unread notification count.
   */
  async getUnreadCount(): Promise<number> {
    const profileId = await getCurrentUserId();

    const { count, error } = await supabase
      .from("notifications")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("profile_id", profileId)
      .eq("read", false);

    if (error) {
      console.error("[Notifications] Unread count error:", error);
      throw error;
    }

    return count ?? 0;
  },

  /**
   * Mark one notification as read.
   */
  async markAsRead(id: string): Promise<void> {
    const profileId = await getCurrentUserId();

    const { error } = await supabase
      .from("notifications")
      .update({
        read: true,
        read_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("profile_id", profileId);

    if (error) {
      console.error("[Notifications] Mark as read error:", error);
      throw error;
    }

    window.dispatchEvent(new CustomEvent("notifications:updated"));
  },

  /**
   * Mark all notifications as read.
   */
  async markAllAsRead(): Promise<void> {
    const profileId = await getCurrentUserId();

    const { error } = await supabase
      .from("notifications")
      .update({
        read: true,
        read_at: new Date().toISOString(),
      })
      .eq("profile_id", profileId)
      .eq("read", false);

    if (error) {
      console.error("[Notifications] Mark all as read error:", error);
      throw error;
    }

    window.dispatchEvent(new CustomEvent("notifications:updated"));
  },
};