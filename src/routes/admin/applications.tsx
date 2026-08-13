import { createFileRoute } from "@tanstack/react-router";
import { AdminApplicationsPage } from "@/components/admin/AdminPages";
export const Route = createFileRoute("/admin/applications")({ component: AdminApplicationsPage });
