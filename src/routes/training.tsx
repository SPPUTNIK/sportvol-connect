import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { I18nProvider } from "@/lib/i18n";
import { trainingService } from "@/services/trainingService";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Training } from "@/lib/types";

export const Route = createFileRoute("/training")({
  component: TrainingPage,
  head: () => ({
    meta: [{ title: "Training | VolunSport Morocco" }],
  }),
});

function TrainingPage() {
  const [modules, setModules] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trainingService
      .getTraining()
      .then((data) => setModules(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const completed = modules.filter((module) => module.completed).length;

  return (
    <I18nProvider>
      <div className="shell min-h-screen py-24">
        <div className="mb-8 space-y-3">
          <p className="eyebrow">Training</p>
          <h1 className="display-md text-ink-foreground">Complete your volunteer training</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Track module progress, open resources and finish what&apos;s needed before your next
            event.
          </p>
        </div>

        {loading ? (
          <LoadingState message="Loading training modules…" />
        ) : error ? (
          <EmptyState title="Error" description={error} />
        ) : modules.length === 0 ? (
          <EmptyState
            title="No training available"
            description="Check back when new training modules are assigned."
          />
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              {modules.map((module) => (
                <Card key={module.id} className="rounded-[2rem] border border-hairline-invert">
                  <CardHeader>
                    <CardTitle>{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm text-muted-foreground">
                        Resources: {module.resources.length}
                      </p>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${module.completed ? "bg-emerald-500/10 text-emerald-900" : "bg-muted text-muted-foreground"}`}
                      >
                        {module.completed ? "Completed" : "Pending"}
                      </span>
                    </div>
                    <div className="grid gap-3">
                      {module.resources.map((resource) => (
                        <a
                          key={resource.url}
                          href={resource.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground transition hover:border-primary"
                        >
                          <p className="font-semibold">{resource.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground uppercase tracking-[0.2em]">
                            {resource.type}
                          </p>
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="rounded-[2rem] border border-hairline-invert bg-card p-8 shadow-[var(--shadow-lift)]">
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Progress</p>
              <h2 className="mt-4 text-3xl font-semibold text-foreground">
                {completed} / {modules.length}
              </h2>
              <div className="mt-6 h-4 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(completed / Math.max(modules.length, 1)) * 100}%` }}
                />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Complete all training modules before your next assignment.
              </p>
            </div>
          </div>
        )}
      </div>
    </I18nProvider>
  );
}
