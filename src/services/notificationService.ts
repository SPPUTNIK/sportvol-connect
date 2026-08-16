// import { getNotifications } from "@/services/mockService";
// import type { NotificationService } from "@/services/contracts";

// export const notificationService: NotificationService = {
//   getNotifications,
//   async markAsRead(id) {
//     const notifications = await getNotifications();
//     const notification = notifications.find((item) => item.id === id);
//     if (notification) notification.read = true;
//   },
// };


import { demoNotifications } from "@/mocks/frontendDemo";
import type { Notification } from "@/lib/types";

const USE_MOCK_DATA = true;

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      return demoNotifications.map(
        (notification) =>
          ({
            id: notification.id,
            title: notification.title,
            category: notification.category,
            body: notification.body,
            date: notification.date,
            read: notification.read,
          }) as Notification,
      );
    }

    // Supabase implementation will be added later.
    throw new Error(
      "Supabase notification service is not connected yet.",
    );
  },
};