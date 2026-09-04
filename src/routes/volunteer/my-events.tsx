import { createFileRoute } from "@tanstack/react-router";
import { MyEventsPage } from "@/components/app/FeaturePage";
export const Route = createFileRoute("/volunteer/my-events")({
  component: MyEventsPage,
  head: () => ({ meta: [{ title: "My Events | VolunSport Morocco" }] }),
});
