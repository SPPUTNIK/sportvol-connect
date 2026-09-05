import { createFileRoute } from "@tanstack/react-router";

import { LeaderDashboardPage } from "@/components/leader/LeaderPages";

export const Route = createFileRoute("/leader/dashboard")({
  component: LeaderDashboardPage,
  head: () => ({ meta: [{ title: "Leadership dashboard | SportVol Connect" }] }),
});
