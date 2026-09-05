import { createFileRoute } from "@tanstack/react-router";

import { LeaderProfilePage } from "@/components/leader/LeaderPages";

export const Route = createFileRoute("/leader/profile")({
  component: LeaderProfilePage,
  head: () => ({ meta: [{ title: "Leader profile | SportVol Connect" }] }),
});
