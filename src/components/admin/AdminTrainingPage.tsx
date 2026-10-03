import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { AdminGate } from "./components/AdminGate";
import { formatStatus, normalizeStatus } from "./components/adminHelpers";

import {
  VSBadge,
  VSButton,
  VSCard,
  VSCardContent,
  VSEmptyState,
  VSErrorState,
  VSLoadingState,
  VSPageHeader,
} from "@/components/design-system";

import { adminService } from "@/services/admin/adminService";
import type { AdminTrainingSummary } from "@/types/domain";

export function AdminTrainingPage() {
  const [training, setTraining] = useState<AdminTrainingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadTraining() {
      setLoading(true);
      setError(null);

      try {
        const data = await adminService.getTraining();

        if (mounted) {
          setTraining(data);
        }
      } catch (err) {
        console.error("Failed to load training:", err);

        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load training",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadTraining();

    return () => {
      mounted = false;
    };
  }, []);

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

        <div className="mt-8">
          {loading ? (
            <VSLoadingState />
          ) : error ? (
            <VSErrorState description={error} />
          ) : training.length === 0 ? (
            <VSEmptyState
              title="No training modules found"
              description="Create your first training module to start preparing volunteers."
              action={
                <VSButton>
                  <Plus className="h-4 w-4" />
                  Create training
                </VSButton>
              }
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              {training.map((item) => {
                const completion =
                  item.assigned > 0
                    ? Math.round((item.completed / item.assigned) * 100)
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
                            normalizeStatus(item.status) === "published"
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
                        {item.completed} of {item.assigned} volunteers complete
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
                        <VSButton variant="outline" size="sm">
                          Edit
                        </VSButton>

                        <VSButton variant="ghost" size="sm">
                          View progress
                        </VSButton>
                      </div>
                    </VSCardContent>
                  </VSCard>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminGate>
  );
}