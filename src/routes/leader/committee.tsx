import { createFileRoute } from "@tanstack/react-router";

import { LeaderCommitteePage } from "@/components/leader/LeaderPages";

export const Route = createFileRoute("/leader/committee")({
  component: LeaderCommitteePage,
  head: () => ({ meta: [{ title: "My committee | SportVol Connect" }] }),
});
