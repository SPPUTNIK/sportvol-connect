import { supabase } from "@/integrations/supabase/client";
import type { DashboardAchievement } from "@/lib/types";

type AchievementDefinitionRow = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  icon: string | null;
  category: string;
  requirement_type: string;
  requirement_value: number;
  points: number;
  active: boolean;
};

type ProfileAchievementRow = {
  id: string;
  profile_id: string;
  achievement_id: string;
  progress: number;
  unlocked: boolean;
  unlocked_at: string | null;
};

async function getCurrentUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("[Achievements] Auth error:", error);
    throw error;
  }

  if (!user) {
    throw new Error("You must be signed in.");
  }


  return user.id;
}

export const achievementsService = {
  async getAchievements(): Promise<DashboardAchievement[]> {
    const profileId = await getCurrentUserId();


    /*
     * 1. Get all active achievement definitions.
     */
    const { data: definitions, error: definitionsError } = await supabase
      .from("achievement_definitions")
      .select(`
        id,
        code,
        title,
        description,
        icon,
        category,
        requirement_type,
        requirement_value,
        points,
        active
      `)
      .eq("active", true)
      .order("created_at", { ascending: true });


    if (definitionsError) {
      throw definitionsError;
    }

    /*
     * 2. Get this volunteer's achievement progress.
     */
    const {
      data: profileAchievements,
      error: progressError,
    } = await supabase
      .from("profile_achievements")
      .select(`
        id,
        profile_id,
        achievement_id,
        progress,
        unlocked,
        unlocked_at
      `)
      .eq("profile_id", profileId);


    if (progressError) {
      throw progressError;
    }

    /*
     * 3. Map profile achievements by achievement_id.
     */
    const progressMap = new Map<string, ProfileAchievementRow>();

    for (const item of (profileAchievements ?? []) as ProfileAchievementRow[]) {
      progressMap.set(item.achievement_id, item);
    }

    /*
     * 4. Merge definitions with volunteer progress.
     */
    const achievements = (
      (definitions ?? []) as AchievementDefinitionRow[]
    ).map((definition) => {
      const profileAchievement = progressMap.get(definition.id);

      const rawProgress = profileAchievement?.progress ?? 0;

      let progress = rawProgress;

      /*
       * Database progress is treated as an absolute value.
       *
       * Example:
       * requirement_value = 10
       * progress = 5
       * => 50%
       */
      if (definition.requirement_value > 0) {
        progress = Math.round(
          (rawProgress / definition.requirement_value) * 100,
        );
      }

      progress = Math.max(0, Math.min(100, progress));

      const unlocked =
        profileAchievement?.unlocked ??
        progress >= 100;

      return {
        code: definition.code,
        title: definition.title,
        description:
          definition.description ??
          "Keep volunteering to unlock this achievement.",
        icon: definition.icon,
        progress,
        unlocked,
      };
    });


    return achievements;
  },
};