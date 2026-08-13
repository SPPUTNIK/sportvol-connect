import { getNotifications } from "@/services/mockService";
import type { NotificationService } from "@/services/contracts";

export const notificationService: NotificationService = {
  getNotifications,
  async markAsRead(id) {
    const notifications = await getNotifications();
    const notification = notifications.find((item) => item.id === id);
    if (notification) notification.read = true;
  },
};
