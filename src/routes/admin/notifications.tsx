import { createFileRoute } from "@tanstack/react-router";
import { AdminNotificationsPage } from "@/components/admin/AdminPages";
export const Route = createFileRoute("/admin/notifications")({ component: AdminNotificationsPage });
