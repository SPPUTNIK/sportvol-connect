import { createFileRoute } from "@tanstack/react-router";
import { AdminRolesPage } from "@/components/admin/AdminRolesPage";

export const Route = createFileRoute("/admin/roles")({
  component: AdminRolesPage,
});