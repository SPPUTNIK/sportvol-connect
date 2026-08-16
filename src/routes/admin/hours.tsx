import { createFileRoute } from "@tanstack/react-router";
import { AdminHoursPage } from "@/components/admin/AdminHoursPage";

export const Route = createFileRoute("/admin/hours")({
  component: AdminHoursPage,
});