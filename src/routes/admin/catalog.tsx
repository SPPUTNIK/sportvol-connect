import { createFileRoute } from "@tanstack/react-router";
import { AdminCatalogPage } from "@/components/admin/AdminCatalogPage";

export const Route = createFileRoute("/admin/catalog")({
  component: AdminCatalogPage,
});
