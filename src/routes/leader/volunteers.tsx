import { createFileRoute } from "@tanstack/react-router";

import { LeaderVolunteersPage } from "@/components/leader/LeaderPages";

export const Route = createFileRoute("/leader/volunteers")({
  component: LeaderVolunteersPage,
  head: () => ({ meta: [{ title: "Volunteers | SportVol Connect" }] }),
});
