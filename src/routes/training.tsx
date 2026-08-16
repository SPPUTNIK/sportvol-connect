import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  PlayCircle,
  ShieldCheck,
} from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import {
  VSBadge,
  VSCard,
  VSCardContent,
  VSPageHeader,
} from "@/components/design-system";

import { trainingService } from "@/services/trainingService";
import type { Training } from "@/lib/types";

export const Route = createFileRoute("/training")({
  component: TrainingPage,
  head: () => ({
    meta: [
      {
        title: "Training | VolunSport Morocco",
      },
      {
        name: "description",
        content:
          "Complete your VolunSport volunteer training and prepare for your next assignment.",
      },
    ],
  }),
});

function TrainingPage() {
  const [modules, setModules] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trainingService
      .getTraining()
      .then(setModules)
      .catch((err: unknown) =>
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load training.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const completed = modules.filter(
    (module) => module.completed,
  ).length;

  const progress = useMemo(() => {
    if (!modules.length) return 0;

    return Math.round(
      (completed / modules.length) * 100,
    );
  }, [completed, modules.length]);

  return (
    <AppShell title="Training">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <VSPageHeader
          eyebrow="Volunteer development"
          title="Complete your volunteer training"
          description="Build the knowledge and confidence you need before your next event assignment."
          action={
            !loading && modules.length > 0 ? (
              <VSBadge variant="soft">
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                {completed}/{modules.length} completed
              </VSBadge>
            ) : undefined
          }
        />

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading && (
          <VSCard className="rounded-[2rem] border-border">
            <VSCardContent className="flex min-h-[320px] items-center justify-center p-8">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <BookOpen className="h-6 w-6" />
                </div>

                <p className="mt-5 text-sm font-semibold text-foreground">
                  Loading training…
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                  Preparing your volunteer learning modules.
                </p>
              </div>
            </VSCardContent>
          </VSCard>
        )}

        {/* =====================================================
            ERROR
        ===================================================== */}

        {!loading && error && (
          <VSCard className="mx-auto max-w-2xl rounded-[2rem] border-border">
            <VSCardContent className="p-8 text-center sm:p-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-600">
                <ShieldCheck className="h-7 w-7" />
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Something went wrong
              </p>

              <h2 className="mt-3 text-2xl font-semibold text-foreground">
                Unable to load training
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                {error}
              </p>
            </VSCardContent>
          </VSCard>
        )}

        {/* =====================================================
            EMPTY
        ===================================================== */}

        {!loading && !error && modules.length === 0 && (
          <VSCard className="mx-auto max-w-2xl rounded-[2rem] border-border">
            <VSCardContent className="p-8 text-center sm:p-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <BookOpen className="h-7 w-7" />
              </div>

              <h2 className="mt-6 text-2xl font-semibold text-foreground">
                No training available
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                Check back when new volunteer training modules
                are assigned.
              </p>
            </VSCardContent>
          </VSCard>
        )}

        {/* =====================================================
            TRAINING CONTENT
        ===================================================== */}

        {!loading && !error && modules.length > 0 && (
          <div className="grid gap-8 xl:grid-cols-[1fr_340px]">

            {/* =================================================
                MODULES
            ================================================= */}

            <div className="space-y-5">
              {modules.map((module, index) => (
                <VSCard
                  key={module.id}
                  className="overflow-hidden rounded-[2rem] border-border"
                >
                  <VSCardContent className="p-6 sm:p-8">

                    {/* TOP */}
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                      <div className="flex gap-4">

                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                            module.completed
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {module.completed ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <BookOpen className="h-5 w-5" />
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                              Module {String(index + 1).padStart(2, "0")}
                            </span>

                            {module.completed && (
                              <VSBadge variant="soft">
                                Completed
                              </VSBadge>
                            )}
                          </div>

                          <h2 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">
                            {module.title}
                          </h2>

                          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                            {module.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                        <Clock3 className="h-3.5 w-3.5" />
                        Training module
                      </div>
                    </div>

                    {/* RESOURCES */}

                    <div className="mt-7">
                      <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Learning resources
                      </p>

                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {module.resources.map((resource) => {
                          const isVideo =
                            resource.type === "video";

                          return (
                            <a
                              key={`${module.id}-${resource.url}`}
                              href={resource.url}
                              target="_blank"
                              rel="noreferrer"
                              className="group flex items-center gap-4 rounded-2xl border border-border bg-background p-4 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm"
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground transition group-hover:bg-primary/10 group-hover:text-primary">
                                {isVideo ? (
                                  <PlayCircle className="h-4 w-4" />
                                ) : (
                                  <FileText className="h-4 w-4" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-foreground">
                                  {resource.title}
                                </p>

                                <p className="mt-1 text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
                                  {resource.type}
                                </p>
                              </div>

                              <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </VSCardContent>
                </VSCard>
              ))}
            </div>

            {/* =================================================
                PROGRESS SIDEBAR
            ================================================= */}

            <aside className="space-y-5">

              <VSCard className="sticky top-6 rounded-[2rem] border-border">
                <VSCardContent className="p-7">

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Training progress
                      </p>

                      <h2 className="mt-3 text-3xl font-semibold text-foreground">
                        {progress}%
                      </h2>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <BookOpen className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-6 h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>

                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    {completed} of {modules.length} training
                    modules completed.
                  </p>

                  {completed === modules.length ? (
                    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.05] p-4">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

                      <p className="text-xs leading-5 text-muted-foreground">
                        You&apos;ve completed all available
                        training modules and are ready for your
                        next assignment.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/10 bg-primary/[0.04] p-4">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                      <p className="text-xs leading-5 text-muted-foreground">
                        Complete your required training before
                        attending your next volunteer assignment.
                      </p>
                    </div>
                  )}
                </VSCardContent>
              </VSCard>

              {/* QUICK SUMMARY */}

              <VSCard className="rounded-[2rem] border-border">
                <VSCardContent className="p-7">
                  <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Learning overview
                  </p>

                  <div className="mt-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total modules
                      </span>

                      <span className="text-sm font-semibold text-foreground">
                        {modules.length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Completed
                      </span>

                      <span className="text-sm font-semibold text-emerald-600">
                        {completed}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Remaining
                      </span>

                      <span className="text-sm font-semibold text-foreground">
                        {modules.length - completed}
                      </span>
                    </div>
                  </div>
                </VSCardContent>
              </VSCard>

            </aside>
          </div>
        )}
      </div>
    </AppShell>
  );
}