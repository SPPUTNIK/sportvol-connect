import { createFileRoute } from "@tanstack/react-router";
import { AdminShiftAssignmentsPage } from "@/components/admin/AdminShiftAssignmentsPage";

export const Route = createFileRoute("/admin/shift-assignments")({
  component: AdminShiftAssignmentsPage,
});
