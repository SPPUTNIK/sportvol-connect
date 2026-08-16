import { createFileRoute } from "@tanstack/react-router";
import { AdminShiftsPage } from "@/components/admin/AdminShiftsPage";

export const Route = createFileRoute("/admin/shifts")({
  component: AdminShiftsPage,
});