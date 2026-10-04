import { createFileRoute, Outlet } from "@tanstack/react-router";

import { enforceProtectedRoute } from "../lib/auth-guards";

export const Route = createFileRoute("/volunteer")({
  beforeLoad: async ({ location }) => {
    await enforceProtectedRoute(location.pathname, "volunteer");
  },
  component: VolunteerRoute,
});

function VolunteerRoute() {
  return <Outlet />;
}
