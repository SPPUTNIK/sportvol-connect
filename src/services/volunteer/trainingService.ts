import { supabase } from "@/lib/supabase";
import type { Training } from "@/lib/types";

export type TrainingQuestion = {
  id: string;
  trainingId: string;
  questionNumber: number;
  question: string;
  options: string[];
  correctOptions: string[];
  points: number;
};

export type TrainingResult = {
  score: number;
  totalQuestions: number;
  passed: boolean;
  answers: Record<string, string[]>;
  submittedAt: string;
};

type TrainingModuleRow = {
  id: string;
  title: string;
  description: string | null;
  required: boolean;
  resources: unknown;
  training_mode: "online" | "in_person" | "hybrid";
  zoom_url: string | null;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
};

type TrainingProgressRow = {
  id: string;
  training_id: string;
  completed: boolean;
  completed_at: string | null;
  score: number;
  total_questions: number;
  passed: boolean;
  answers: Record<string, string[]>;
  submitted_at: string | null;
};

function parseResources(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (resource): resource is {
      type: "video" | "pdf" | "text" | "link";
      title: string;
      url: string;
    } =>
      typeof resource === "object" &&
      resource !== null &&
      "title" in resource &&
      "url" in resource &&
      typeof resource.title === "string" &&
      typeof resource.url === "string",
  );
}

function parseJsonArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

export const trainingService = {
  async getTraining(): Promise<Training[]> {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user) {
      throw new Error("You must be logged in to view training.");
    }

    const { data: modules, error: modulesError } = await supabase
      .from("training_modules")
      .select(`
        id,
        title,
        description,
        required,
        resources,
        training_mode,
        zoom_url,
        status,
        published_at,
        created_at
      `)
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (modulesError) {
      throw modulesError;
    }

    const { data: progressRows, error: progressError } = await supabase
      .from("training_progress")
      .select(`
        id,
        training_id,
        completed,
        completed_at,
        score,
        total_questions,
        passed,
        answers,
        submitted_at
      `)
      .eq("profile_id", user.id);

    if (progressError) {
      throw progressError;
    }

    const progressByTrainingId = new Map(
      ((progressRows ?? []) as TrainingProgressRow[]).map((row) => [
        row.training_id,
        row,
      ]),
    );

    return ((modules ?? []) as TrainingModuleRow[]).map((module) => {
      const progress = progressByTrainingId.get(module.id);

      return {
        id: module.id,
        title: module.title,
        description: module.description ?? "",
        type: module.training_mode,
        duration: 0,
        assigned: 1,
        completed: progress?.completed ?? false,
        resources: parseResources(module.resources),
        status: module.status,
        createdAt: module.created_at,
        publishedAt: module.published_at,
        required: module.required,
        zoomUrl: module.zoom_url,
      } as Training;
    });
  },

  async getTrainingById(id: string): Promise<Training | null> {
    const trainings = await this.getTraining();

    return trainings.find((training) => training.id === id) ?? null;
  },

  async getTrainingQuestions(
    trainingId: string,
  ): Promise<TrainingQuestion[]> {
    const { data, error } = await supabase
      .from("training_questions")
      .select(`
        id,
        training_id,
        question_number,
        question,
        options,
        correct_options,
        points
      `)
      .eq("training_id", trainingId)
      .order("question_number", { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      trainingId: row.training_id,
      questionNumber: row.question_number,
      question: row.question,
      options: parseJsonArray(row.options),
      correctOptions: parseJsonArray(row.correct_options),
      points: row.points,
    }));
  },

  async getTrainingResult(
    trainingId: string,
  ): Promise<TrainingResult | null> {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user) {
      throw new Error("You must be logged in to view training results.");
    }

    const { data, error } = await supabase
      .from("training_progress")
      .select(`
        score,
        total_questions,
        passed,
        answers,
        submitted_at
      `)
      .eq("profile_id", user.id)
      .eq("training_id", trainingId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      score: data.score,
      totalQuestions: data.total_questions,
      passed: data.passed,
      answers:
        data.answers && typeof data.answers === "object"
          ? (data.answers as Record<string, string[]>)
          : {},
      submittedAt:
        data.submitted_at ?? new Date().toISOString(),
    };
  },

  async submitTraining(
    trainingId: string,
    answers: Record<string, string[]>,
  ): Promise<TrainingResult> {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user) {
      throw new Error("You must be logged in to submit training.");
    }

    // Make sure the training is published.
    const { data: training, error: trainingError } = await supabase
      .from("training_modules")
      .select("id, status")
      .eq("id", trainingId)
      .eq("status", "published")
      .maybeSingle();

    if (trainingError) {
      throw trainingError;
    }

    if (!training) {
      throw new Error("This training is not currently available.");
    }

    const questions = await this.getTrainingQuestions(trainingId);

    if (questions.length !== 20) {
      throw new Error(
        `This training is not ready yet. It must contain exactly 20 questions.`,
      );
    }

    let score = 0;

    for (const question of questions) {
      const selected = answers[question.id] ?? [];

      const expected = [...question.correctOptions].sort();
      const actual = [...selected].sort();

      const isCorrect =
        expected.length === actual.length &&
        expected.every((value, index) => value === actual[index]);

      if (isCorrect) {
        score += question.points;
      }
    }

    const totalQuestions = questions.length;

    /*
     * Passing rule:
     * 70% or more.
     */
    const passed = score / totalQuestions >= 0.7;

    const submittedAt = new Date().toISOString();

    const { error: upsertError } = await supabase
      .from("training_progress")
      .upsert(
        {
          profile_id: user.id,
          training_id: trainingId,
          completed: passed,
          completed_at: passed ? submittedAt : null,
          score,
          total_questions: totalQuestions,
          passed,
          answers,
          submitted_at: submittedAt,
          updated_at: submittedAt,
        },
        {
          onConflict: "profile_id,training_id",
        },
      );

    if (upsertError) {
      throw upsertError;
    }

    return {
      score,
      totalQuestions,
      passed,
      answers,
      submittedAt,
    };
  },
};