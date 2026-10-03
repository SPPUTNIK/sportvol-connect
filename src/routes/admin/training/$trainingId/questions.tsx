import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  Clock3,
  Edit3,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

import {
  Link,
  createFileRoute,
} from "@tanstack/react-router";

import { AdminGate } from "@/components/admin/components/AdminGate";

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


export const Route = createFileRoute(
  "/admin/training/$trainingId/questions",
)({
  component: AdminTrainingQuestionsPage,
});

interface TrainingQuestion {
  id: string;
  trainingId: string;
  questionNumber: number;
  question: string;
  options: string[];
  correctOptions: string[];
  points: number;
  createdAt: string;
  updatedAt: string;
}

interface QuestionForm {
  questionNumber: number;
  question: string;
  options: string[];
  correctOptions: string[];
  points: number;
}

const createEmptyForm = (
  questionNumber: number,
): QuestionForm => ({
  questionNumber,
  question: "",
  options: ["", "", "", ""],
  correctOptions: [],
  points: 1,
});



export function AdminTrainingQuestionsPage() {
  const { trainingId } = Route.useParams();
  const [training, setTraining] = useState<any>(null);
  const [questions, setQuestions] = useState<
    TrainingQuestion[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] =
    useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [form, setForm] = useState<QuestionForm>(
    createEmptyForm(1),
  );

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [formError, setFormError] =
    useState<string | null>(null);

  /**
   * ---------------------------------------------------------
   * LOAD
   * ---------------------------------------------------------
   */

  async function loadQuestions() {
    if (!trainingId) {
      setError("Training ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [
        questionData,
        trainingData,
      ] = await Promise.all([
        adminService.getTrainingQuestions(
          trainingId,
        ),
        adminService.getTraining(),
      ]);

      setQuestions(questionData);

      const currentTraining =
        trainingData.find(
          (item) => item.id === trainingId,
        ) ?? null;

      setTraining(currentTraining);
    } catch (err) {
      console.error(
        "Failed to load training questions:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load training questions.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadQuestions();
  }, [trainingId]);

  /**
   * ---------------------------------------------------------
   * QUESTION STATUS
   * ---------------------------------------------------------
   */

  const questionNumbers = useMemo(
    () =>
      new Set(
        questions.map(
          (question) =>
            question.questionNumber,
        ),
      ),
    [questions],
  );

  const nextQuestionNumber = useMemo(() => {
    for (let number = 1; number <= 20; number++) {
      if (!questionNumbers.has(number)) {
        return number;
      }
    }

    return null;
  }, [questionNumbers]);

  const progressPercent = Math.round(
    (questions.length / 20) * 100,
  );

  const isComplete = questions.length === 20;

  /**
   * ---------------------------------------------------------
   * FORM
   * ---------------------------------------------------------
   */

  function openCreateQuestion() {
    if (nextQuestionNumber === null) {
      return;
    }

    setEditingId(null);
    setFormError(null);

    setForm(
      createEmptyForm(nextQuestionNumber),
    );

    setFormOpen(true);
  }

  function openEditQuestion(
    question: TrainingQuestion,
  ) {
    setEditingId(question.id);
    setFormError(null);

    setForm({
      questionNumber:
        question.questionNumber,
      question: question.question,
      options: [...question.options],
      correctOptions: [
        ...question.correctOptions,
      ],
      points: question.points,
    });

    setFormOpen(true);
  }

  function closeForm() {
    if (saving) return;

    setFormOpen(false);
    setEditingId(null);
    setFormError(null);
  }

  /**
   * ---------------------------------------------------------
   * OPTIONS
   * ---------------------------------------------------------
   */

  function updateOption(
    index: number,
    value: string,
  ) {
    setForm((current) => {
      const options = [...current.options];

      const oldValue = options[index];

      options[index] = value;

      const correctOptions =
        current.correctOptions.map(
          (correctOption) =>
            correctOption === oldValue
              ? value
              : correctOption,
        );

      return {
        ...current,
        options,
        correctOptions,
      };
    });
  }

  function addOption() {
    setForm((current) => ({
      ...current,
      options: [
        ...current.options,
        "",
      ],
    }));
  }

  function removeOption(index: number) {
    setForm((current) => {
      if (current.options.length <= 2) {
        return current;
      }

      const removedOption =
        current.options[index];

      return {
        ...current,
        options: current.options.filter(
          (_, optionIndex) =>
            optionIndex !== index,
        ),
        correctOptions:
          current.correctOptions.filter(
            (option) =>
              option !== removedOption,
          ),
      };
    });
  }

  function toggleCorrectOption(
    option: string,
  ) {
    if (!option.trim()) return;

    setForm((current) => {
      const exists =
        current.correctOptions.includes(
          option,
        );

      return {
        ...current,
        correctOptions: exists
          ? current.correctOptions.filter(
              (item) => item !== option,
            )
          : [
              ...current.correctOptions,
              option,
            ],
      };
    });
  }

  /**
   * ---------------------------------------------------------
   * SAVE
   * ---------------------------------------------------------
   */

  async function handleSaveQuestion(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setFormError(null);

    const cleanOptions = form.options
      .map((option) => option.trim())
      .filter(Boolean);

    const uniqueOptions = [
      ...new Set(cleanOptions),
    ];

    if (!form.question.trim()) {
      setFormError(
        "Please enter the question.",
      );
      return;
    }

    if (uniqueOptions.length < 2) {
      setFormError(
        "Please add at least 2 options.",
      );
      return;
    }

    if (
      form.correctOptions.length === 0
    ) {
      setFormError(
        "Please select at least one correct answer.",
      );
      return;
    }

    const validCorrectOptions =
      form.correctOptions.filter(
        (option) =>
          uniqueOptions.includes(option),
      );

    if (validCorrectOptions.length === 0) {
      setFormError(
        "Please select a valid correct answer.",
      );
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        await adminService.updateTrainingQuestion(
          {
            id: editingId,
            questionNumber:
              form.questionNumber,
            question: form.question,
            options: uniqueOptions,
            correctOptions:
              validCorrectOptions,
            points: form.points,
          },
        );
      } else {
        await adminService.createTrainingQuestion(
          {
            trainingId,
            questionNumber:
              form.questionNumber,
            question: form.question,
            options: uniqueOptions,
            correctOptions:
              validCorrectOptions,
            points: form.points,
          },
        );
      }

      closeForm();

      await loadQuestions();
      } catch (err: any) {
        console.error("FAILED TO SAVE QUESTION:", err);

        console.error("Supabase error details:", {
          message: err?.message,
          details: err?.details,
          hint: err?.hint,
          code: err?.code,
        });

        setFormError(
          [
            err?.message,
            err?.details,
            err?.hint,
            err?.code ? `Code: ${err.code}` : null,
          ]
            .filter(Boolean)
            .join(" — ") || "Failed to save question.",
        );
      } finally {
      setSaving(false);
    }
  }

  /**
   * ---------------------------------------------------------
   * DELETE
   * ---------------------------------------------------------
   */

  async function handleDeleteQuestion(
    question: TrainingQuestion,
  ) {
    const confirmed = window.confirm(
      `Delete question ${question.questionNumber}? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setDeletingId(question.id);

    try {
      await adminService.deleteTrainingQuestion(
        question.id,
      );

      await loadQuestions();
    } catch (err) {
      console.error(
        "Failed to delete question:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete question.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  /**
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  if (!trainingId) {
    return (
      <AdminGate title="Training Questions">
        <VSErrorState description="Training ID is missing." />
      </AdminGate>
    );
  }

  return (
    <AdminGate title="Training Questions">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/admin/training"
            className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to training
          </Link>

          <VSPageHeader
            eyebrow="Training setup"
            title={
              training?.title ??
              "Training questions"
            }
            description="Create exactly 20 questions and define the correct answers for the volunteer test."
            action={
              <VSButton
                onClick={openCreateQuestion}
                disabled={
                  nextQuestionNumber === null
                }
              >
                <Plus className="h-4 w-4" />
                Add question
              </VSButton>
            }
          />
        </div>

        {loading ? (
          <VSLoadingState />
        ) : error ? (
          <VSErrorState description={error} />
        ) : (
          <>
            {/* Progress */}
            <VSCard className="mb-6 border-border">
              <VSCardContent className="p-5 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-foreground">
                        Question progress
                      </h2>

                      {isComplete ? (
                        <VSBadge variant="soft">
                          <Check className="mr-1 h-3.5 w-3.5" />
                          Complete
                        </VSBadge>
                      ) : (
                        <VSBadge variant="outline">
                          Draft
                        </VSBadge>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {questions.length} of 20
                      questions created
                    </p>
                  </div>

                  <div className="w-full sm:w-72">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Progress
                      </span>

                      <span className="font-medium text-foreground">
                        {progressPercent}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width: `${progressPercent}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {!isComplete && (
                  <div className="mt-5 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
                    Add {20 - questions.length} more{" "}
                    {20 - questions.length === 1
                      ? "question"
                      : "questions"}{" "}
                    before this training test is
                    complete.
                  </div>
                )}
              </VSCardContent>
            </VSCard>

            {/* Questions */}
            {questions.length === 0 ? (
              <VSEmptyState
                title="No questions yet"
                description="Start building the 20-question test for this training."
                action={
                  <VSButton
                    onClick={
                      openCreateQuestion
                    }
                  >
                    <Plus className="h-4 w-4" />
                    Add first question
                  </VSButton>
                }
              />
            ) : (
              <div className="space-y-3">
                {questions.map((question) => (
                  <VSCard
                    key={question.id}
                    className="border-border"
                  >
                    <VSCardContent className="p-5">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                              {
                                question.questionNumber
                              }
                            </span>

                            <VSBadge variant="outline">
                              {question.points}{" "}
                              {question.points ===
                              1
                                ? "point"
                                : "points"}
                            </VSBadge>

                            <span className="text-xs text-muted-foreground">
                              {
                                question.options
                                  .length
                              }{" "}
                              options
                            </span>
                          </div>

                          <h3 className="text-base font-semibold leading-6 text-foreground">
                            {question.question}
                          </h3>

                          <div className="mt-4 grid gap-2 sm:grid-cols-2">
                            {question.options.map(
                              (
                                option,
                                index,
                              ) => {
                                const correct =
                                  question.correctOptions.includes(
                                    option,
                                  );

                                return (
                                  <div
                                    key={`${question.id}-${index}`}
                                    className={[
                                      "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm",
                                      correct
                                        ? "border-primary/30 bg-primary/5"
                                        : "border-border bg-background",
                                    ].join(
                                      " ",
                                    )}
                                  >
                                    <div
                                      className={[
                                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                                        correct
                                          ? "border-primary bg-primary text-primary-foreground"
                                          : "border-border",
                                      ].join(
                                        " ",
                                      )}
                                    >
                                      {correct && (
                                        <Check className="h-3.5 w-3.5" />
                                      )}
                                    </div>

                                    <span className="min-w-0 flex-1">
                                      {option}
                                    </span>

                                    {correct && (
                                      <span className="text-xs font-medium text-primary">
                                        Correct
                                      </span>
                                    )}
                                  </div>
                                );
                              },
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 gap-2 lg:pt-1">
                          <VSButton
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              openEditQuestion(
                                question,
                              )
                            }
                            disabled={
                              deletingId ===
                              question.id
                            }
                          >
                            <Edit3 className="h-4 w-4" />
                            Edit
                          </VSButton>

                          <VSButton
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeleteQuestion(
                                question,
                              )
                            }
                            disabled={
                              deletingId ===
                              question.id
                            }
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            {deletingId ===
                            question.id ? (
                              <Clock3 className="h-4 w-4 animate-pulse" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            Delete
                          </VSButton>
                        </div>
                      </div>
                    </VSCardContent>
                  </VSCard>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* =====================================================
          QUESTION MODAL
          ===================================================== */}

      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeForm();
            }
          }}
        >
          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[1.5rem] border border-border bg-background shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-5 sm:px-6">
              <div>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>

                <h2 className="text-xl font-semibold text-foreground">
                  {editingId
                    ? "Edit question"
                    : `Question ${form.questionNumber}`}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Add the question and select one or
                  more correct answers.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSaveQuestion}
              className="overflow-y-auto"
            >
              <div className="space-y-6 p-5 sm:p-6">
                {formError && (
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {formError}
                  </div>
                )}

                {/* Number + points */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Question number
                    </label>

                    <div className="relative">
                      <select
                        value={
                          form.questionNumber
                        }
                        onChange={(event) =>
                          setForm(
                            (current) => ({
                              ...current,
                              questionNumber:
                                Number(
                                  event.target
                                    .value,
                                ),
                            }),
                          )
                        }
                        disabled={
                          saving || !!editingId
                        }
                        className="h-11 w-full appearance-none rounded-xl border border-border bg-background px-3.5 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-muted"
                      >
                        {Array.from(
                          { length: 20 },
                          (_, index) =>
                            index + 1,
                        ).map((number) => {
                          const used =
                            questionNumbers.has(
                              number,
                            ) &&
                            number !==
                              form.questionNumber;

                          return (
                            <option
                              key={number}
                              value={number}
                              disabled={used}
                            >
                              Question {number}
                              {used
                                ? " — already used"
                                : ""}
                            </option>
                          );
                        })}
                      </select>

                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Points
                    </label>

                    <input
                      type="number"
                      min={1}
                      value={form.points}
                      onChange={(event) =>
                        setForm(
                          (current) => ({
                            ...current,
                            points: Math.max(
                              1,
                              Number(
                                event.target
                                  .value,
                              ) || 1,
                            ),
                          }),
                        )
                      }
                      disabled={saving}
                      className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>

                {/* Question */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Question
                  </label>

                  <textarea
                    value={form.question}
                    onChange={(event) =>
                      setForm(
                        (current) => ({
                          ...current,
                          question:
                            event.target.value,
                        }),
                      )
                    }
                    placeholder="Write the question..."
                    rows={4}
                    disabled={saving}
                    className="w-full resize-none rounded-xl border border-border bg-background px-3.5 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>

                {/* Options */}
                <div>
                  <div className="mb-3 flex items-end justify-between gap-3">
                    <div>
                      <label className="block text-sm font-medium text-foreground">
                        Answer options
                      </label>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Select all answers that are
                        correct.
                      </p>
                    </div>

                    <VSButton
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addOption}
                      disabled={saving}
                    >
                      <Plus className="h-4 w-4" />
                      Add option
                    </VSButton>
                  </div>

                  <div className="space-y-2">
                    {form.options.map(
                      (option, index) => {
                        const isCorrect =
                          !!option.trim() &&
                          form.correctOptions.includes(
                            option.trim(),
                          );

                        return (
                          <div
                            key={index}
                            className={[
                              "flex items-center gap-2 rounded-xl border p-2 transition",
                              isCorrect
                                ? "border-primary/30 bg-primary/5"
                                : "border-border",
                            ].join(
                              " ",
                            )}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                toggleCorrectOption(
                                  option.trim(),
                                )
                              }
                              disabled={
                                saving ||
                                !option.trim()
                              }
                              className={[
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition",
                                isCorrect
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border text-transparent hover:bg-muted",
                              ].join(
                                " ",
                              )}
                              aria-label={
                                isCorrect
                                  ? "Unmark correct answer"
                                  : "Mark correct answer"
                              }
                            >
                              <Check className="h-4 w-4" />
                            </button>

                            <input
                              type="text"
                              value={option}
                              onChange={(
                                event,
                              ) =>
                                updateOption(
                                  index,
                                  event.target
                                    .value,
                                )
                              }
                              placeholder={`Option ${index + 1}`}
                              disabled={saving}
                              className="h-10 min-w-0 flex-1 border-0 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                removeOption(
                                  index,
                                )
                              }
                              disabled={
                                saving ||
                                form.options
                                  .length <= 2
                              }
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-30"
                              aria-label="Remove option"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      },
                    )}
                  </div>

                  <div className="mt-3 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                    <strong className="text-foreground">
                      Tip:
                    </strong>{" "}
                    A question can have multiple correct
                    answers. Click the check button beside
                    each correct option.
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col-reverse gap-2 border-t border-border bg-muted/20 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <VSButton
                  type="button"
                  variant="ghost"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </VSButton>

                <VSButton
                  type="submit"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Clock3 className="h-4 w-4 animate-pulse" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {editingId
                        ? "Save changes"
                        : "Add question"}
                    </>
                  )}
                </VSButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminGate>
  );
}