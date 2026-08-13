import { createFileRoute } from "@tanstack/react-router";
import { AdminEventsPage } from "@/components/admin/AdminPages";
export const Route = createFileRoute("/admin/events")({ component: AdminEventsPage });
