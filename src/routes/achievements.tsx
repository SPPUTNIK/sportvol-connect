import { createFileRoute } from "@tanstack/react-router";
import { AchievementsPage } from "@/components/app/FeaturePage";
export const Route = createFileRoute("/achievements")({
  component: AchievementsPage,
  head: () => ({ meta: [{ title: "Achievements | VolunSport Morocco" }] }),
});
