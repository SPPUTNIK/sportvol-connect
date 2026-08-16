import { createFileRoute } from "@tanstack/react-router";
import { AdminEventsPage } from "@/components/admin/events/AdminEventsPage";
export const Route = createFileRoute("/admin/events")({ component: AdminEventsPage });

