import { createFileRoute } from "@tanstack/react-router";
import { AdminReportsPage } from "@/components/admin/AdminPages";
export const Route = createFileRoute("/admin/reports")({ component: AdminReportsPage });
