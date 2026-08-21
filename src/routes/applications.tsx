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

  const [selectedRoleId, setSelectedRoleId] =
    useState("");

  const [availability, setAvailability] =
    useState("");

  const [experience, setExperience] =
    useState("");

  const [motivation, setMotivation] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [editError, setEditError] =
    useState<string | null>(null);

  /*
   * ============================================================
   * LOAD APPLICATIONS
   * ============================================================
   */

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const data =
        await applicationService.getApplications();

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

  const openEditModal = async (
    application: Application,
  ) => {
    setEditingApplication(application);

    setSelectedRoleId(
      application.role_id ?? "",
    );

    setAvailability(
      application.availability ?? "",
    );

    setExperience(
      application.experience ?? "",
    );

    setMotivation(
      application.message ?? "",
    );

    setEditError(null);

    try {
      setLoadingRoles(true);

      const eventRoles =
        await applicationService.getEventRoles(
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
      setEditError(
        "Please select a volunteer role.",
      );
      return;
    }

    try {
      setSaving(true);
      setEditError(null);

      await applicationService.updateApplication({
        applicationId:
          editingApplication.id,

        roleId: selectedRoleId,

        availability:
          availability.trim(),

        experience:
          experience.trim(),

        motivation:
          motivation.trim(),
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
      <div className="mx-auto max-w-7xl space-y-8">
        <VSPageHeader
          eyebrow="Applications"
          title="Track your volunteer applications"
          description="See the current status of each application and review your submitted role requests."
        />

        {loading && (
          <VSLoadingState message="Loading your applications…" />
        )}

        {!loading && error && (
          <VSErrorState
            title="Applications are unavailable"
            description={error}
            action={undefined}
          />
        )}

        {!loading &&
          !error &&
          applications.length === 0 && (
            <VSEmptyState
              title="No applications yet"
              description="Apply for an event to see your application status here."
            />
          )}

        {!loading &&
          !error &&
          applications.length > 0 && (
            <VSCard className="overflow-hidden rounded-[2rem] border-border">
              <VSCardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px]">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Event
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Role
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Status
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Applied
                        </th>

                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {applications.map(
                        (application) => {
                          const editable =
                            application.status ===
                              "pending" ||
                            application.status ===
                              "waitlisted";

                          return (
                            <tr
                              key={application.id}
                              className="border-b border-border last:border-0 transition hover:bg-muted/30"
                            >
                              {/* EVENT */}

                              <td className="px-6 py-5">
                                <div>
                                  <p className="font-semibold text-foreground">
                                    {
                                      application.event_title
                                    }
                                  </p>

                                  <p className="mt-1 text-xs text-muted-foreground">
                                    Application #
                                    {
                                      application.id
                                    }
                                  </p>
                                </div>
                              </td>

                              {/* ROLE */}

                              <td className="px-6 py-5">
                                <p className="text-sm text-foreground">
                                  {
                                    application.role_name
                                  }
                                </p>
                              </td>

                              {/* STATUS */}

                              <td className="px-6 py-5">
                                <StatusPill
                                  status={
                                    application.status
                                  }
                                />
                              </td>

                              {/* DATE */}

                              <td className="px-6 py-5">
                                <p className="text-sm text-muted-foreground">
                                  {
                                    application.submitted_at
                                  }
                                </p>
                              </td>

                              {/* ACTION */}

                              <td className="px-6 py-5 text-right">
                                {editable ? (
                                  <VSButton
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      openEditModal(
                                        application,
                                      )
                                    }
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
                        },
                      )}
                    </tbody>
                  </table>
                </div>
              </VSCardContent>
            </VSCard>
          )}

        {/* =====================================================
            EDIT MODAL
        ====================================================== */}

        {editingApplication && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeEditModal();
              }
            }}
          >
            <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl">
              {/* HEADER */}

              <div className="flex items-start justify-between border-b border-border p-6">
                <div>
                  <p className="eyebrow">
                    Edit application
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold text-foreground">
                    Update your application
                  </h2>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {
                      editingApplication.event_title
                    }
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={saving}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* BODY */}

              <div className="max-h-[75vh] overflow-y-auto p-6">
                <div className="space-y-5">
                  {/* ROLE */}

                  <label className="block text-sm font-medium text-foreground">
                    Volunteer role

                    <select
                      value={selectedRoleId}
                      onChange={(event) =>
                        setSelectedRoleId(
                          event.target.value,
                        )
                      }
                      disabled={
                        loadingRoles ||
                        saving
                      }
                      className="mt-2 h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
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

                          {roles.map(
                            (role) => {
                              const remaining =
                                role.positions -
                                role.filled_positions;

                              return (
                                <option
                                  key={
                                    role.id
                                  }
                                  value={
                                    role.id
                                  }
                                  disabled={
                                    remaining <=
                                      0 &&
                                    role.id !==
                                      editingApplication.role_id
                                  }
                                >
                                  {
                                    role.name
                                  }{" "}
                                  —{" "}
                                  {Math.max(
                                    remaining,
                                    0,
                                  )}{" "}
                                  spots available
                                </option>
                              );
                            },
                          )}
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
                        setAvailability(
                          event.target.value,
                        )
                      }
                      disabled={saving}
                      required
                      className="mt-2 h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:opacity-60"
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
                        setExperience(
                          event.target.value,
                        )
                      }
                      rows={5}
                      disabled={saving}
                      placeholder="What experience would you bring?"
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:opacity-60"
                    />
                  </label>

                  {/* MOTIVATION */}

                  <label className="block text-sm font-medium text-foreground">
                    Motivation

                    <textarea
                      value={motivation}
                      onChange={(event) =>
                        setMotivation(
                          event.target.value,
                        )
                      }
                      rows={4}
                      disabled={saving}
                      placeholder="What excites you about this event?"
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:opacity-60"
                    />
                  </label>

                  {/* ERROR */}

                  {editError && (
                    <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                      {editError}
                    </div>
                  )}
                </div>
              </div>

              {/* FOOTER */}

              <div className="flex flex-col-reverse gap-3 border-t border-border bg-muted/20 p-6 sm:flex-row sm:justify-end">
                <VSButton
                  type="button"
                  variant="outline"
                  onClick={closeEditModal}
                  disabled={saving}
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
        )}
      </div>
    </AppShell>
  );
}
