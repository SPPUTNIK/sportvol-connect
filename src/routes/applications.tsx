import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Pencil,
  X,
} from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import { applicationService } from "@/services/applicationService";

import {
  VSButton,
  VSCard,
  VSCardContent,
  VSPageHeader,
  VSEmptyState,
  VSLoadingState,
  VSErrorState,
} from "@/components/design-system";

import { StatusPill } from "@/components/ui/status-pill";

import type {
  Application,
  EventRole,
} from "@/lib/types";

export const Route = createFileRoute("/applications")({
  component: MyApplications,

  head: () => ({
    meta: [
      {
        title: "My Applications | VolunSport Morocco",
      },
    ],
  }),
});

function formatApplicationDate(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function MyApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /*
   * ============================================================
   * EDIT MODAL
   * ============================================================
   */

  const [editingApplication, setEditingApplication] =
    useState<Application | null>(null);

  const [roles, setRoles] = useState<EventRole[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [availability, setAvailability] = useState("");
  const [experience, setExperience] = useState("");
  const [motivation, setMotivation] = useState("");

  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  /*
   * ============================================================
   * LOAD APPLICATIONS
   * ============================================================
   */

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await applicationService.getApplications();

      setApplications(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your applications.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  /*
   * ============================================================
   * OPEN EDIT MODAL
   * ============================================================
   */

  const openEditModal = async (application: Application) => {
    setEditingApplication(application);

    setSelectedRoleId(application.role_id ?? "");
    setAvailability(application.availability ?? "");
    setExperience(application.experience ?? "");
    setMotivation(application.message ?? "");

    setEditError(null);

    try {
      setLoadingRoles(true);

      const eventRoles = await applicationService.getEventRoles(
        application.event_id,
      );

      setRoles(eventRoles);
    } catch (err: unknown) {
      setEditError(
        err instanceof Error
          ? err.message
          : "Unable to load event roles.",
      );
    } finally {
      setLoadingRoles(false);
    }
  };

  /*
   * ============================================================
   * CLOSE MODAL
   * ============================================================
   */

  const closeEditModal = () => {
    if (saving) return;

    setEditingApplication(null);
    setRoles([]);
    setSelectedRoleId("");
    setAvailability("");
    setExperience("");
    setMotivation("");
    setEditError(null);
  };

  /*
   * ============================================================
   * SAVE CHANGES
   * ============================================================
   */

  const handleSaveChanges = async () => {
    if (!editingApplication) return;

    if (!selectedRoleId) {
      setEditError("Please select a volunteer role.");
      return;
    }

    try {
      setSaving(true);
      setEditError(null);

      await applicationService.updateApplication({
        applicationId: editingApplication.id,
        roleId: selectedRoleId,
        availability: availability.trim(),
        experience: experience.trim(),
        motivation: motivation.trim(),
      });

      await loadApplications();

      closeEditModal();
    } catch (err: unknown) {
      setEditError(
        err instanceof Error
          ? err.message
          : "Unable to save your changes.",
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <AppShell title="My Applications">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-1 sm:space-y-8 sm:px-0">
        {/* =====================================================
            PAGE HEADER
        ====================================================== */}

        <VSPageHeader
          eyebrow="Applications"
          title="Track your volunteer applications"
          description="See the current status of each application and review your submitted role requests."
        />

        {/* =====================================================
            LOADING
        ====================================================== */}

        {loading && (
          <VSLoadingState message="Loading your applications…" />
        )}

        {/* =====================================================
            ERROR
        ====================================================== */}

        {!loading && error && (
          <VSErrorState
            title="Applications are unavailable"
            description={error}
            action={undefined}
          />
        )}

        {/* =====================================================
            EMPTY
        ====================================================== */}

        {!loading &&
          !error &&
          applications.length === 0 && (
            <VSEmptyState
              title="No applications yet"
              description="Apply for an event to see your application status here."
            />
          )}

        {/* =====================================================
            APPLICATIONS
        ====================================================== */}

        {!loading &&
          !error &&
          applications.length > 0 && (
            <>
              {/* -------------------------------------------------
                  DESKTOP TABLE
              -------------------------------------------------- */}

              <VSCard className="hidden overflow-hidden rounded-[2rem] border-border md:block">
                <VSCardContent className="p-0">
                  <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead>
                        <tr className="border-b border-border bg-muted/40">
                          <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground lg:px-6">
                            Event
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground lg:px-6">
                            Role
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground lg:px-6">
                            Status
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground lg:px-6">
                            Applied
                          </th>

                          <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground lg:px-6">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {applications.map((application) => {
                          const editable =
                            application.status === "pending" ||
                            application.status === "waitlisted";

                          return (
                            <tr
                              key={application.id}
                              className="border-b border-border last:border-0 transition hover:bg-muted/30"
                            >
                              {/* EVENT */}

                              <td className="px-5 py-5 lg:px-6">
                                <div className="min-w-0">
                                  <p className="max-w-[260px] truncate font-semibold text-foreground">
                                    {application.event_title}
                                  </p>

                                </div>
                              </td>

                              {/* ROLE */}

                              <td className="px-5 py-5 lg:px-6">
                                <p className="max-w-[180px] truncate text-sm text-foreground">
                                  {application.role_name}
                                </p>
                              </td>

                              {/* STATUS */}

                              <td className="px-5 py-5 lg:px-6">
                                <StatusPill
                                  status={application.status}
                                />
                              </td>

                              {/* DATE */}

                              <td className="px-5 py-5 lg:px-6">
                                <p className="whitespace-nowrap text-sm text-muted-foreground">
                                  {formatApplicationDate(application.submitted_at)}
                                </p>
                              </td>

                              {/* ACTION */}

                              <td className="px-5 py-5 text-right lg:px-6">
                                {editable ? (
                                  <VSButton
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      openEditModal(application)
                                    }
                                    className="rounded-xl"
                                  >
                                    <Pencil className="h-4 w-4" />
                                    Edit
                                  </VSButton>
                                ) : (
                                  <span className="text-xs text-muted-foreground">
                                    No changes
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </VSCardContent>
              </VSCard>

              {/* -------------------------------------------------
                  MOBILE CARDS
              -------------------------------------------------- */}

              <div className="space-y-4 md:hidden">
                {applications.map((application) => {
                  const editable =
                    application.status === "pending" ||
                    application.status === "waitlisted";

                  return (
                    <VSCard
                      key={application.id}
                      className="overflow-hidden rounded-[1.5rem] border-border"
                    >
                      <VSCardContent className="p-5">
                        {/* EVENT HEADER */}

                        <div className="flex min-w-0 items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                              Event
                            </p>

                            <h3 className="mt-1 break-words text-base font-semibold leading-6 text-foreground">
                              {application.event_title}
                            </h3>

                          </div>

                          <div className="shrink-0">
                            <StatusPill
                              status={application.status}
                            />
                          </div>
                        </div>

                        {/* DETAILS */}

                        <div className="mt-5 grid grid-cols-1 gap-3 rounded-2xl bg-muted/30 p-4">
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                              Role
                            </p>

                            <p className="mt-1 break-words text-sm font-medium text-foreground">
                              {application.role_name}
                            </p>
                          </div>

                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                              Applied
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                              {formatApplicationDate(application.submitted_at)}
                            </p>
                          </div>
                        </div>

                        {/* ACTION */}

                        <div className="mt-4">
                          {editable ? (
                            <VSButton
                              type="button"
                              variant="outline"
                              onClick={() =>
                                openEditModal(application)
                              }
                              className="w-full rounded-xl"
                            >
                              <Pencil className="h-4 w-4" />
                              Edit application
                            </VSButton>
                          ) : (
                            <div className="flex items-center justify-center rounded-xl bg-muted/40 px-4 py-3 text-xs font-medium text-muted-foreground">
                              No changes available
                            </div>
                          )}
                        </div>
                      </VSCardContent>
                    </VSCard>
                  );
                })}
              </div>
            </>
          )}

        {/* =====================================================
            EDIT MODAL
        ====================================================== */}

        {editingApplication && (
          <div
            className="fixed inset-0 z-50 flex min-h-[100dvh] items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeEditModal();
              }
            }}
          >
            <div className="flex max-h-[95dvh] w-full flex-col overflow-hidden rounded-t-[1.75rem] border border-border bg-card shadow-2xl sm:max-h-[90vh] sm:max-w-2xl sm:rounded-[2rem]">
              {/* -------------------------------------------------
                  MODAL HEADER
              -------------------------------------------------- */}

              <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border p-5 sm:p-6">
                <div className="min-w-0 flex-1">
                  <p className="eyebrow">
                    Edit application
                  </p>

                  <h2 className="mt-2 text-xl font-semibold leading-tight text-foreground sm:text-2xl">
                    Update your application
                  </h2>

                  <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">
                    {editingApplication.event_title}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={saving}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* -------------------------------------------------
                  MODAL BODY
              -------------------------------------------------- */}

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6">
                <div className="space-y-5">
                  {/* ROLE */}

                  <label className="block text-sm font-medium text-foreground">
                    Volunteer role

                    <select
                      value={selectedRoleId}
                      onChange={(event) =>
                        setSelectedRoleId(event.target.value)
                      }
                      disabled={loadingRoles || saving}
                      className="mt-2 h-12 w-full min-w-0 rounded-2xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
                    >
                      {loadingRoles ? (
                        <option value="">
                          Loading roles…
                        </option>
                      ) : (
                        <>
                          <option value="">
                            Select a role
                          </option>

                          {roles.map((role) => {
                            const remaining =
                              role.positions -
                              role.filled_positions;

                            return (
                              <option
                                key={role.id}
                                value={role.id}
                                disabled={
                                  remaining <= 0 &&
                                  role.id !==
                                    editingApplication.role_id
                                }
                              >
                                {role.name} —{" "}
                                {Math.max(remaining, 0)} spots
                                available
                              </option>
                            );
                          })}
                        </>
                      )}
                    </select>
                  </label>

                  {/* AVAILABILITY */}

                  <label className="block text-sm font-medium text-foreground">
                    Availability

                    <select
                      value={availability}
                      onChange={(event) =>
                        setAvailability(event.target.value)
                      }
                      disabled={saving}
                      required
                      className="mt-2 h-12 w-full min-w-0 rounded-2xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-60 sm:px-4"
                    >
                      <option value="">
                        Select your availability
                      </option>

                      <option value="Fully available">
                        Fully available
                      </option>

                      <option value="Mornings only">
                        Mornings only
                      </option>

                      <option value="Afternoons only">
                        Afternoons only
                      </option>

                      <option value="Evenings only">
                        Evenings only
                      </option>

                      <option value="Flexible">
                        Flexible
                      </option>
                    </select>
                  </label>

                  {/* EXPERIENCE */}

                  <label className="block text-sm font-medium text-foreground">
                    Experience

                    <textarea
                      value={experience}
                      onChange={(event) =>
                        setExperience(event.target.value)
                      }
                      rows={5}
                      disabled={saving}
                      placeholder="What experience would you bring?"
                      className="mt-2 min-h-[120px] w-full resize-y rounded-2xl border border-border bg-background px-3 py-3 text-sm leading-6 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-60 sm:px-4"
                    />
                  </label>

                  {/* MOTIVATION */}

                  <label className="block text-sm font-medium text-foreground">
                    Motivation

                    <textarea
                      value={motivation}
                      onChange={(event) =>
                        setMotivation(event.target.value)
                      }
                      rows={4}
                      disabled={saving}
                      placeholder="What excites you about this event?"
                      className="mt-2 min-h-[110px] w-full resize-y rounded-2xl border border-border bg-background px-3 py-3 text-sm leading-6 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-60 sm:px-4"
                    />
                  </label>

                  {/* ERROR */}

                  {editError && (
                    <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm leading-6 text-destructive">
                      {editError}
                    </div>
                  )}
                </div>
              </div>

              {/* -------------------------------------------------
                  MODAL FOOTER
              -------------------------------------------------- */}

              <div className="shrink-0 border-t border-border bg-muted/20 p-4 sm:p-6">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <VSButton
                    type="button"
                    variant="outline"
                    onClick={closeEditModal}
                    disabled={saving}
                    className="w-full rounded-xl sm:w-auto"
                  >
                    Cancel
                  </VSButton>

                  <VSButton
                    type="button"
                    onClick={handleSaveChanges}
                    disabled={
                      saving ||
                      loadingRoles ||
                      !selectedRoleId ||
                      !availability
                    }
                    className="w-full rounded-xl sm:w-auto"
                  >
                    {saving ? (
                      "Saving…"
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </VSButton>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

