import { createFileRoute } from "@tanstack/react-router";
import { AdminReportsPage } from "@/components/admin/AdminReportsPage";
export const Route = createFileRoute("/admin/reports")({ component: AdminReportsPage });
