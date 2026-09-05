import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Trophy } from "lucide-react";

import { AppShell } from "@/components/app/AppShell";

import {
  VSBadge,
  VSCard,
  VSCardContent,
  VSErrorState,
  VSLoadingState,
  VSEmptyState,
  VSPageHeader,
} from "@/components/design-system";

import { achievementsService } from "@/services/volunteer/achievementsService";
import type { DashboardAchievement } from "@/lib/types";

export const Route = createFileRoute("/volunteer/achievements")({
  component: AchievementsPage,

  head: () => ({
    meta: [
      {
        title: "Achievements | VolunSport Morocco",
      },
      {
        name: "description",
        content: "Track your VolunSport volunteer achievements and milestones.",
      },
    ],
  }),
});

function AchievementsPage() {
  const [achievements, setAchievements] = useState<DashboardAchievement[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadAchievements() {
      try {
        setLoading(true);
        setError(null);

        const data = await achievementsService.getAchievements();

        if (mounted) {
          setAchievements(data);
        }
      } catch (err: unknown) {
        if (!mounted) return;

        setError(err instanceof Error ? err.message : "Unable to load achievements.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadAchievements();

    return () => {
      mounted = false;
    };
  }, []);

  const unlockedCount = achievements.filter((item) => item.unlocked).length;

  return (
    <AppShell title="Achievements">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <VSPageHeader
          eyebrow="Keep growing"
          title="Milestones worth celebrating"
          description="Small commitments become a track record you can carry with you."
          action={
            !loading && achievements.length > 0 ? (
              <VSBadge variant="soft">
                <Trophy className="mr-1.5 h-3.5 w-3.5" />
                {unlockedCount} unlocked
              </VSBadge>
            ) : undefined
          }
        />

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading && <VSLoadingState message="Loading achievements" />}

        {/* =====================================================
            ERROR
        ===================================================== */}

        {!loading && error && (
          <VSErrorState title="Unable to load achievements" description={error} />
        )}

        {/* =====================================================
            EMPTY
        ===================================================== */}

        {!loading && !error && achievements.length === 0 && (
          <VSEmptyState
            icon={<Trophy />}
            title="No achievements yet"
            description="Your volunteer achievements will appear here as you make progress."
          />
        )}

        {/* =====================================================
            ACHIEVEMENTS
        ===================================================== */}

        {!loading && !error && achievements.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {achievements.map((item) => (
              <AchievementCard key={item.code} achievement={item} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

/* ===============================================================
   ACHIEVEMENT CARD
================================================================ */

function AchievementCard({ achievement }: { achievement: DashboardAchievement }) {
  return (
    <VSCard
      className={`rounded-[1.75rem] border-border ${
        achievement.unlocked ? "border-primary/20" : ""
      }`}
    >
      <VSCardContent className="p-6">
        {/* ICON */}

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            achievement.unlocked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          }`}
        >
          <Trophy className="h-6 w-6" />
        </div>

        {/* TITLE + STATUS */}

        <div className="mt-5 flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">{achievement.title}</h2>

          <VSBadge variant={achievement.unlocked ? "soft" : "outline"}>
            {achievement.unlocked ? "Unlocked" : "Locked"}
          </VSBadge>
        </div>

        {/* DESCRIPTION */}

        <p className="mt-2 text-sm leading-6 text-muted-foreground">{achievement.description}</p>

        {/* PROGRESS */}

        <div className="mt-6 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${
              achievement.unlocked ? "bg-primary" : "bg-muted-foreground/40"
            }`}
            style={{
              width: `${achievement.progress}%`,
            }}
          />
        </div>

        {/* PERCENTAGE */}

        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground">
            {achievement.progress}% complete
          </p>

          {achievement.unlocked && <p className="text-xs font-semibold text-primary">Completed</p>}
        </div>
      </VSCardContent>
    </VSCard>
  );
}
