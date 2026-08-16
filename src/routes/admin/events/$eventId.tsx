import { createFileRoute } from "@tanstack/react-router";
import { AdminEventDetailPage } from "@/components/admin/events/AdminEventDetailPage";
export const Route = createFileRoute("/admin/events/$eventId")({
  component: AdminEventDetailRoute,
});
function AdminEventDetailRoute() {
  const { eventId } = Route.useParams();
  return <AdminEventDetailPage eventId={eventId} />;
}
