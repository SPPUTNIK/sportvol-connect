import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Edit3,
  Link2,
  Plus,
  Video,
  X,
} from "lucide-react";

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

import type {
  AdminEventSummary,
  AdminTrainingResultSummary,
  AdminTrainingSummary,
} from "@/types/domain";

import { Link } from "@tanstack/react-router";

type TrainingMode = "online" | "in_person" | "hybrid";

interface TrainingForm {
  title: string;
  description: string;
  eventId: string;
  roleId: string;
  trainingMode: TrainingMode;
  zoomUrl: string;
  required: boolean;
}

const initialForm: TrainingForm = {
  title: "",
  description: "",
  eventId: "",
  roleId: "",
  trainingMode: "in_person",
  zoomUrl: "",
  required: true,
};

export function AdminTrainingPage() {
  const [training, setTraining] = useState<AdminTrainingSummary[]>([]);
  const [trainingResults, setTrainingResults] = useState<AdminTrainingResultSummary[]>([]);
  const [events, setEvents] = useState<AdminEventSummary[]>([]);

  const [roles, setRoles] = useState<
    Awaited<ReturnType<typeof adminService.getRoles>>
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTraining, setEditingTraining] =
    useState<AdminTrainingSummary | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [form, setForm] = useState<TrainingForm>(initialForm);

  /**
   * ---------------------------------------------------------
   * LOAD
   * ---------------------------------------------------------
   */

  async function loadTraining() {
    setLoading(true);
    setError(null);

    try {
      const [trainingData, eventData, roleData, resultData] =
        await Promise.all([
          adminService.getTraining(),
          adminService.getEvents(),
          adminService.getRoles(),
          adminService.getTrainingResults(),
        ]);

      setTraining(trainingData);
      setTrainingResults(resultData);
      setEvents(eventData);
      setRoles(roleData);
    } catch (err) {
      console.error("Failed to load training:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load training",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTraining();
  }, []);

  /**
   * ---------------------------------------------------------
   * SELECTED EVENT
   * ---------------------------------------------------------
   */

  const selectedEvent = useMemo(
    () =>
      events.find(
        (event) => event.id === form.eventId,
      ) ?? null,
    [events, form.eventId],
  );

  /**
   * ---------------------------------------------------------
   * SELECTED EVENT ROLES
   * ---------------------------------------------------------
   */

  const selectedEventRoles = useMemo(
    () =>
      roles.filter(
        (role) => role.eventId === form.eventId,
      ),
    [roles, form.eventId],
  );

  const resultsByTrainingId = useMemo(() => {
    const map = new Map<string, AdminTrainingResultSummary[]>();

    trainingResults.forEach((result) => {
      const current = map.get(result.trainingId) ?? [];
      current.push(result);
      map.set(result.trainingId, current);
    });

    return map;
  }, [trainingResults]);

  /**
   * ---------------------------------------------------------
   * CREATE / EDIT MODAL
   * ---------------------------------------------------------
   */

  function openCreateModal() {
    setEditingTraining(null);
    setForm({ ...initialForm });
    setSaveError(null);
    setModalOpen(true);
  }

  function openEditModal(item: AdminTrainingSummary) {
    setEditingTraining(item);

    setForm({
      title: item.title,
      description: item.description ?? "",
      eventId: item.eventId ?? "",
      roleId: item.roleId ?? "",
      trainingMode: item.trainingMode,
      zoomUrl: item.zoomUrl ?? "",
      required: item.required,
    });

    setSaveError(null);
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingTraining(null);
    setForm({ ...initialForm });
    setSaveError(null);
  }

  /**
   * ---------------------------------------------------------
   * SAVE TRAINING
   * ---------------------------------------------------------
   */

  async function handleSaveTraining(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSaveError(null);

    if (!form.title.trim()) {
      setSaveError("Training title is required.");
      return;
    }

    if (!form.eventId) {
      setSaveError("Please select an event.");
      return;
    }

    if (
      (form.trainingMode === "online" ||
        form.trainingMode === "hybrid") &&
      !form.zoomUrl.trim()
    ) {
      setSaveError(
        "Please add the Zoom link for online or hybrid training.",
      );
      return;
    }

    setSaving(true);

    try {
      if (editingTraining) {
        await adminService.updateTraining({
          id: editingTraining.id,
          title: form.title,
          description: form.description,
          eventId: form.eventId || null,
          roleId: form.roleId || null,
          trainingMode: form.trainingMode,
          zoomUrl:
            form.trainingMode === "online" ||
            form.trainingMode === "hybrid"
              ? form.zoomUrl
              : null,
          required: form.required,
        });
      } else {
        await adminService.createTraining({
          title: form.title,
          description: form.description,
          eventId: form.eventId || null,
          roleId: form.roleId || null,
          trainingMode: form.trainingMode,
          zoomUrl:
            form.trainingMode === "online" ||
            form.trainingMode === "hybrid"
              ? form.zoomUrl
              : null,
          required: form.required,
        });
      }

      setModalOpen(false);
      setEditingTraining(null);
      setForm({ ...initialForm });

      await loadTraining();
    } catch (err) {
      console.error("Failed to save training:", err);

      setSaveError(
        err instanceof Error
          ? err.message
          : "Failed to save training.",
      );
    } finally {
      setSaving(false);
    }
  }

  /**
   * ---------------------------------------------------------
   * PUBLISH / HIDE TRAINING
   * ---------------------------------------------------------
   */

  async function handleToggleStatus(
    item: AdminTrainingSummary,
  ) {
    const currentStatus = normalizeStatus(item.status);

    const nextStatus =
      currentStatus === "published"
        ? "draft"
        : "published";

    try {
      setError(null);

      await adminService.updateTrainingStatus(
        item.id,
        nextStatus,
      );

      await loadTraining();
    } catch (err) {
      console.error(
        "Failed to update training status:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update training status.",
      );
    }
  }

  /**
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <AdminGate title="Training">
      <div className="mx-auto max-w-7xl">
        <VSPageHeader
          eyebrow="Operations"
          title="Training"
          description="Create, publish, and monitor the preparation that keeps events safe."
          action={
            <VSButton onClick={openCreateModal}>
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
                <VSButton onClick={openCreateModal}>
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
                    ? Math.round(
                        (item.completed /
                          item.assigned) *
                          100,
                      )
                    : 0;

                const isPublished =
                  normalizeStatus(item.status) ===
                  "published";

                return (
                  <VSCard
                    key={item.id}
                    className="rounded-[1.75rem] border-border"
                  >
                    <VSCardContent className="p-6">
                      {/* Status */}
                      <div className="flex items-center justify-between gap-3">
                        <VSBadge
                          variant={
                            isPublished
                              ? "soft"
                              : "outline"
                          }
                        >
                          {formatStatus(item.status)}
                        </VSBadge>

                        <span className="text-xs text-muted-foreground">
                          {item.required
                            ? "Required"
                            : "Optional"}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="mt-5 text-lg font-semibold text-foreground">
                        {item.title}
                      </h2>

                      {/* Description */}
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {item.description ||
                          "No description provided."}
                      </p>

                      {/* Event / Role */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.event && (
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-xs text-foreground">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {item.event}
                          </span>
                        )}

                        {item.role && (
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-xs text-foreground">
                            <BookOpen className="h-3.5 w-3.5" />
                            {item.role}
                          </span>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-border p-3">
                          <p className="text-xs text-muted-foreground">
                            Questions
                          </p>

                          <p className="mt-1 text-lg font-semibold">
                            {item.questionsCount}/20
                          </p>
                        </div>

                        <div className="rounded-xl border border-border p-3">
                          <p className="text-xs text-muted-foreground">
                            Completed
                          </p>

                          <p className="mt-1 text-lg font-semibold">
                            {item.completed}/
                            {item.assigned}
                          </p>
                        </div>
                      </div>

                      {/* Progress */}
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

                      <div className="mt-5 rounded-xl border border-border bg-muted/20 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                            Results
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {(resultsByTrainingId.get(item.id) ?? []).length} scores
                          </span>
                        </div>

                        {(resultsByTrainingId.get(item.id) ?? []).length === 0 ? (
                          <p className="mt-3 text-sm text-muted-foreground">
                            No volunteer result submitted yet.
                          </p>
                        ) : (
                          <div className="mt-3 space-y-2">
                            {(resultsByTrainingId.get(item.id) ?? [])
                              .slice(0, 3)
                              .map((result) => (
                                <div
                                  key={result.id}
                                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-2.5 py-2"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                                      {result.avatarUrl ? (
                                        <img
                                          src={result.avatarUrl}
                                          alt={result.volunteer}
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        result.volunteer
                                          .split(" ")
                                          .map((part) => part[0])
                                          .join("")
                                          .slice(0, 2)
                                          .toUpperCase() || "V"
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-medium">
                                        {result.volunteer}
                                      </p>
                                      <p className="text-[11px] text-muted-foreground">
                                        {result.submittedAt
                                          ? new Date(result.submittedAt).toLocaleDateString()
                                          : "No submission"}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="text-sm font-semibold">
                                    {result.score}/{result.totalQuestions}
                                  </span>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-5 flex flex-wrap gap-2">
                        {/* Publish / Hide */}
                        <VSButton
                          variant={
                            isPublished
                              ? "ghost"
                              : "default"
                          }
                          size="sm"
                          onClick={() =>
                            void handleToggleStatus(
                              item,
                            )
                          }
                        >
                          {isPublished ? (
                            <>
                              <X className="h-4 w-4" />
                              Hide from volunteers
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4" />
                              Publish
                            </>
                          )}
                        </VSButton>

                        {/* Edit */}
                        <VSButton
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openEditModal(item)
                          }
                        >
                          <Edit3 className="h-4 w-4" />
                          Edit training
                        </VSButton>

                        {/* Questions */}
                        <VSButton
                          asChild
                          variant="outline"
                          size="sm"
                        >
                          <Link
                            to="/admin/training/$trainingId/questions"
                            params={{
                              trainingId: item.id,
                            }}
                          >
                            <BookOpen className="h-4 w-4" />
                            Questions
                          </Link>
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

      {/* =====================================================
          CREATE / EDIT TRAINING MODAL
          ===================================================== */}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[1.75rem] border border-border bg-background shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-5 sm:px-6">
              <div>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>

                <h2 className="text-xl font-semibold text-foreground">
                  {editingTraining
                    ? "Edit training"
                    : "Create training"}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {editingTraining
                    ? "Update the training details, event, role, and format."
                    : "Set up the training module before adding its 20-question test."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSaveTraining}
              className="overflow-y-auto"
            >
              <div className="space-y-6 p-5 sm:p-6">
                {/* Error */}
                {saveError && (
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {saveError}
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Training title
                  </label>

                  <input
                    type="text"
                    value={form.title}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    placeholder="e.g. Volunteer Safety & Event Procedures"
                    className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-muted"
                    disabled={saving}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Description
                  </label>

                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description:
                          event.target.value,
                      }))
                    }
                    placeholder="Explain what volunteers will learn in this training..."
                    rows={4}
                    className="w-full resize-none rounded-xl border border-border bg-background px-3.5 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-muted"
                    disabled={saving}
                  />
                </div>

                {/* Event + Role */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Event */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Event
                    </label>

                    <div className="relative">
                      <select
                        value={form.eventId}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            eventId:
                              event.target.value,
                            roleId: "",
                          }))
                        }
                        disabled={saving}
                        className="h-11 w-full appearance-none rounded-xl border border-border bg-background px-3.5 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-muted"
                      >
                        <option value="">
                          Select event
                        </option>

                        {events.map((event) => (
                          <option
                            key={event.id}
                            value={event.id}
                          >
                            {event.title}
                          </option>
                        ))}
                      </select>

                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Role
                      <span className="ml-1 text-xs text-muted-foreground">
                        optional
                      </span>
                    </label>

                    <div className="relative">
                      <select
                        value={form.roleId}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            roleId:
                              event.target.value,
                          }))
                        }
                        disabled={
                          saving ||
                          !selectedEvent ||
                          selectedEventRoles.length === 0
                        }
                        className="h-11 w-full appearance-none rounded-xl border border-border bg-background px-3.5 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-muted"
                      >
                        <option value="">
                          {!selectedEvent
                            ? "Select event first"
                            : selectedEventRoles.length ===
                                0
                              ? "No roles available"
                              : "All roles"}
                        </option>

                        {selectedEventRoles.map(
                          (role) => (
                            <option
                              key={role.id}
                              value={role.id}
                            >
                              {role.name}
                            </option>
                          ),
                        )}
                      </select>

                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>

                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Leave empty to make this training
                      apply to all roles in the selected event.
                    </p>
                  </div>
                </div>

                {/* Training mode */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Training format
                  </label>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      {
                        value: "in_person" as const,
                        label: "In person",
                        description:
                          "At the event or venue",
                      },
                      {
                        value: "online" as const,
                        label: "Online",
                        description: "Via Zoom",
                      },
                      {
                        value: "hybrid" as const,
                        label: "Hybrid",
                        description:
                          "Online + in person",
                      },
                    ].map((option) => {
                      const active =
                        form.trainingMode ===
                        option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          disabled={saving}
                          onClick={() =>
                            setForm(
                              (current) => ({
                                ...current,
                                trainingMode:
                                  option.value,
                              }),
                            )
                          }
                          className={[
                            "rounded-xl border p-3 text-left transition",
                            active
                              ? "border-primary bg-primary/5 ring-2 ring-primary/10"
                              : "border-border hover:bg-muted/50",
                          ].join(" ")}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {option.label}
                              </p>

                              <p className="mt-1 text-xs text-muted-foreground">
                                {option.description}
                              </p>
                            </div>

                            {active && (
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <Check className="h-3 w-3" />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Zoom */}
                {(form.trainingMode === "online" ||
                  form.trainingMode === "hybrid") && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Zoom meeting link
                    </label>

                    <div className="relative">
                      <Video className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                      <input
                        type="url"
                        value={form.zoomUrl}
                        onChange={(event) =>
                          setForm(
                            (current) => ({
                              ...current,
                              zoomUrl:
                                event.target.value,
                            }),
                          )
                        }
                        placeholder="https://zoom.us/j/..."
                        className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3.5 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-muted"
                        disabled={saving}
                      />
                    </div>

                    <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Link2 className="h-3 w-3" />
                      Volunteers will see this link in
                      the training.
                    </p>
                  </div>
                )}

                {/* Required */}
                <div className="rounded-xl border border-border p-4">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={form.required}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          required:
                            event.target.checked,
                        }))
                      }
                      disabled={saving}
                      className="mt-0.5 h-4 w-4 rounded border-border text-primary accent-primary"
                    />

                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Required training
                      </p>

                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Volunteers assigned to this
                        training will need to complete it.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col-reverse gap-2 border-t border-border bg-muted/20 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <VSButton
                  type="button"
                  variant="ghost"
                  onClick={closeModal}
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
                  ) : editingTraining ? (
                    <>
                      <Check className="h-4 w-4" />
                      Save changes
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create training
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