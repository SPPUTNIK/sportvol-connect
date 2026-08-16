import { Plus } from "lucide-react";

import { AdminGate } from "./components/AdminGate";
import {
  formatStatus,
  normalizeStatus,
} from "./components/adminHelpers";

import {
  VSBadge,
  VSButton,
  VSCard,
  VSCardContent,
  VSPageHeader,
} from "@/components/design-system";

import { adminService } from "@/services/adminService";

export function AdminTrainingPage() {
  const training = adminService.getTraining();

  return (
    <AdminGate title="Training">
      <div className="mx-auto max-w-7xl">
        <VSPageHeader
          eyebrow="Operations"
          title="Training"
          description="Create, publish, and monitor the preparation that keeps events safe."
          action={
            <VSButton>
              <Plus className="h-4 w-4" />
              Create training
            </VSButton>
          }
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {training.map((item) => {
            const completion =
              item.assigned > 0
                ? Math.round(
                    (item.completed / item.assigned) *
                      100,
                  )
                : 0;

            return (
              <VSCard
                key={item.id}
                className="rounded-[1.75rem] border-border"
              >
                <VSCardContent className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <VSBadge
                      variant={
                        normalizeStatus(item.status) ===
                        "published"
                          ? "soft"
                          : "outline"
                      }
                    >
                      {formatStatus(item.status)}
                    </VSBadge>

                    <span className="text-xs text-muted-foreground">
                      {item.type}
                    </span>
                  </div>

                  <h2 className="mt-5 text-lg font-semibold text-foreground">
                    {item.title}
                  </h2>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.completed} of {item.assigned}{" "}
                    volunteers complete
                  </p>

                  <div className="mt-5 h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: `${completion}%`,
                      }}
                    />
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground">
                    {completion}% completion
                  </p>

                  <div className="mt-5 flex gap-2">
                    <VSButton
                      variant="outline"
                      size="sm"
                    >
                      Edit
                    </VSButton>

                    <VSButton
                      variant="ghost"
                      size="sm"
                    >
                      View progress
                    </VSButton>
                  </div>
                </VSCardContent>
              </VSCard>
            );
          })}
        </div>
      </div>
    </AdminGate>
  );
}