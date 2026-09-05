import { createFileRoute } from "@tanstack/react-router";

import { LeaderShiftsPage } from "@/components/leader/LeaderPages";

export const Route = createFileRoute("/leader/shifts")({
  component: LeaderShiftsPage,
  head: () => ({ meta: [{ title: "Shifts | SportVol Connect" }] }),
});
