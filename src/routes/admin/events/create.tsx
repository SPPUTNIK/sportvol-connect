import { createFileRoute } from "@tanstack/react-router";
import { AdminEventCreatePage } from "@/components/admin/AdminPages";
export const Route = createFileRoute("/admin/events/create")({ component: AdminEventCreatePage });
