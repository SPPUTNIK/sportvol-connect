import { createFileRoute } from "@tanstack/react-router";
import { TrainingDetailPage } from "@/components/app/FeaturePage";

export const Route = createFileRoute("/training/$trainingId")({
  component: TrainingDetailRoute,
  head: ({ params }) => ({
    meta: [{ title: `Training · ${params.trainingId} | VolunSport Morocco` }],
  }),
});

function TrainingDetailRoute() {
  const { trainingId } = Route.useParams();
  return <TrainingDetailPage trainingId={trainingId} />;
}
