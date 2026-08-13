import { createFileRoute } from "@tanstack/react-router";
import { AdminAttendancePage } from "@/components/admin/AdminPages";
export const Route = createFileRoute("/admin/attendance")({ component: AdminAttendancePage });
