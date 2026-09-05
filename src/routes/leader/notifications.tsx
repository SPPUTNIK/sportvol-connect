import { createFileRoute } from "@tanstack/react-router";

import { LeaderNotificationsPage } from "@/components/leader/LeaderPages";

export const Route = createFileRoute("/leader/notifications")({
  component: LeaderNotificationsPage,
  head: () => ({ meta: [{ title: "Leader notifications | SportVol Connect" }] }),
});
