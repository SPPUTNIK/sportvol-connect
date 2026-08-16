import { createFileRoute } from "@tanstack/react-router";
import { AdminApplicationsPage } from "@/components/admin/AdminApplicationsPage";
export const Route = createFileRoute("/admin/applications")({ component: AdminApplicationsPage });
