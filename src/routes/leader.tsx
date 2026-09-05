import { createFileRoute, Outlet } from "@tanstack/react-router";

import { LeaderLayout } from "@/components/layouts/LeaderLayout";

export const Route = createFileRoute("/leader")({
  component: LeaderRoute,
});

function LeaderRoute() {
  return (
    <LeaderLayout>
      <Outlet />
    </LeaderLayout>
  );
}
