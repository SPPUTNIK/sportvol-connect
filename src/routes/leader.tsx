import { createFileRoute, Outlet } from "@tanstack/react-router";

import { LeaderLayout } from "@/components/layouts/LeaderLayout";
import { enforceProtectedRoute } from "../lib/auth-guards";

export const Route = createFileRoute("/leader")({
  beforeLoad: async ({ location }) => {
    await enforceProtectedRoute(location.pathname, "leader");
  },
  component: LeaderRoute,
});

function LeaderRoute() {
  return (
    <LeaderLayout>
      <Outlet />
    </LeaderLayout>
  );
}
