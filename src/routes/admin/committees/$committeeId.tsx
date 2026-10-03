import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { VSButton } from "@/components/design-system";
import CommitteeDetails from "@/components/admin/CommitteeDetails";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import committeeService from "@/services/admin/committeeService";

export const Route = createFileRoute(
  "/admin/committees/$committeeId",
)({
  loader: async ({ params }) => {
    const committee = await committeeService.getCommitteeById(
      params.committeeId,
    );

    return committee;
  },

  component: CommitteeDetailsRoute,
});

function CommitteeDetailsRoute() {
  const committee = Route.useLoaderData();

  if (!committee) {
    return (
      <AdminLayout title="Committee">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <h2 className="text-lg font-semibold">
              Committee not found
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              This committee may have been deleted or is no
              longer available.
            </p>

            <Link
              to="/admin/committees"
              className="mt-5 inline-flex"
            >
              <VSButton variant="outline">
                <ArrowLeft className="h-4 w-4" />
                Back to committees
              </VSButton>
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={committee.name}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/admin/committees"
            className="inline-flex"
          >
            <VSButton variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back to committees
            </VSButton>
          </Link>
        </div>

        <CommitteeDetails
          committee={committee}
          onClose={() => {
            window.history.back();
          }}
        />
      </div>
    </AdminLayout>
  );
}