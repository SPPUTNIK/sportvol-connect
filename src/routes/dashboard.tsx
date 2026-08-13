import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/components/app/FeaturePage";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "Dashboard | VolunSport Morocco" }] }),
});
