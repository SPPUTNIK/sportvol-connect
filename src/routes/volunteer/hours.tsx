import { createFileRoute } from "@tanstack/react-router";
import { HoursPage } from "@/components/app/FeaturePage";
export const Route = createFileRoute("/volunteer/hours")({
  component: HoursPage,
  head: () => ({ meta: [{ title: "Volunteer Hours | VolunSport Morocco" }] }),
});
