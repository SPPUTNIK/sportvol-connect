import { createFileRoute } from "@tanstack/react-router";
import { AdminNotificationsPage } from "@/components/admin/AdminNotificationsPage";
export const Route = createFileRoute("/admin/notifications")({ component: AdminNotificationsPage });
