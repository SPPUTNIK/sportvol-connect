import { createFileRoute } from "@tanstack/react-router";
import { AdminVolunteerDetailPage } from "@/components/admin/AdminVolunteerDetailPage";

export const Route = createFileRoute(
  "/admin/volunteers/$volunteerId",
)({
  component: AdminVolunteerDetailRoute,
});

function AdminVolunteerDetailRoute() {
  const { volunteerId } = Route.useParams();

  return (
    <AdminVolunteerDetailPage
      volunteerId={volunteerId}
    />
  );
}