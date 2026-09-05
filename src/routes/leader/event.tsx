import { createFileRoute } from "@tanstack/react-router";

import { LeaderEventPage } from "@/components/leader/LeaderPages";

export const Route = createFileRoute("/leader/event")({
  component: LeaderEventPage,
  head: () => ({ meta: [{ title: "My event | SportVol Connect" }] }),
});
