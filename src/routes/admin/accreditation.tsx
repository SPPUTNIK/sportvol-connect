import { createFileRoute } from "@tanstack/react-router";
import { AdminAccreditationPage } from "@/components/admin/AdminAccreditationPage";

export const Route = createFileRoute("/admin/accreditation")({
  component: AdminAccreditationPage,
});