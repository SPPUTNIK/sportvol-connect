import React, { useEffect, useMemo, useState } from "react";
import {
  Check,
  GripVertical,
  Loader2,
  Search,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";

import { VSButton } from "@/components/design-system";

import { profileService } from "@/services/shared/profileService";
import { eventService } from "@/services/shared/eventService";
import type { EventRole } from "@/lib/types";
import committeeService from "@/services/admin/committeeService";

type ProfileResult = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email?: string | null;
  avatar_url: string | null;
};

type CommitteeMemberItem = {
  memberId: string;
  profile: ProfileResult;
  eventRoleId: string | null;
};

type Props = {
  committeeId: string;
  eventId: string;
  existingMembers?: CommitteeMemberItem[];
  maxMembers?: number;
  onSaved?: () => void;
  onCancel?: () => void;
};

export default function MemberAddForm({
  committeeId,
  eventId,
  existingMembers = [],
  maxMembers = 20,
  onSaved,
  onCancel,
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProfileResult[]>([]);
  const [members, setMembers] =
    useState<CommitteeMemberItem[]>(existingMembers);

  const [roles, setRoles] = useState<
    Array<{ id: string; name: string }>
  >([]);

  const [searching, setSearching] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [draggedProfile, setDraggedProfile] =
    useState<ProfileResult | null>(null);

  useEffect(() => {
    setMembers(existingMembers);
  }, [existingMembers]);

  useEffect(() => {
    let cancelled = false;

    async function loadRoles() {
      try {
        setLoadingRoles(true);
        setError(null);

        const event = await eventService.getEventById(eventId);

        if (cancelled) return;

        const rawRoles: EventRole[] = event?.event_roles ?? [];

        setRoles(
          rawRoles.map((role) => ({
            id: role.id,
            name: role.name,
          })),
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load event roles.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingRoles(false);
        }
      }
    }

    void loadRoles();

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const memberIds = useMemo(
    () => new Set(members.map((member) => member.profile.id)),
    [members],
  );

  const availableResults = useMemo(
    () =>
      results.filter(
        (profile) => !memberIds.has(profile.id),
      ),
    [results, memberIds],
  );

  const getFullName = (profile: ProfileResult) => {
    const name = [
      profile.first_name,
      profile.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    return name || profile.email || "Unnamed user";
  };

  const getInitials = (profile: ProfileResult) => {
    const first = profile.first_name?.charAt(0) ?? "";
    const last = profile.last_name?.charAt(0) ?? "";

    const initials =
      `${first}${last}`.toUpperCase();

    return (
      initials ||
      profile.email?.charAt(0).toUpperCase() ||
      "U"
    );
  };

  const getRoleName = (eventRoleId: string | null) => {
    if (!eventRoleId) {
      return "No role assigned";
    }

    return (
      roles.find((role) => role.id === eventRoleId)?.name ??
      "Role not found"
    );
  };

  async function doSearch() {
    const search = query.trim();

    if (!search) {
      setResults([]);
      return;
    }

    try {
      setSearching(true);
      setError(null);

      const response =
        await profileService.searchProfiles(search);

      setResults(response as ProfileResult[]);
    } catch (err) {
      console.error(
        "Failed to search profiles:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to search users.",
      );

      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  async function addProfile(
    profile: ProfileResult,
  ) {
    if (memberIds.has(profile.id)) {
      return;
    }

    if (members.length >= maxMembers) {
      setError(
        `This committee can have a maximum of ${maxMembers} members.`,
      );
      return;
    }

    try {
      setSavingId(profile.id);
      setError(null);

      const created =
        await committeeService.addMember(
          committeeId,
          profile.id,
        );

      setMembers((current) => [
        ...current,
        {
          memberId: created.id,
          profile,
          eventRoleId: created.eventRoleId ?? null,
        },
      ]);

      setResults((current) =>
        current.filter(
          (item) => item.id !== profile.id,
        ),
      );

      onSaved?.();
    } catch (err) {
      console.error(
        "Failed to add committee member:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to add member.",
      );
    } finally {
      setSavingId(null);
      setDraggedProfile(null);
    }
  }

  async function handleRoleChange(
    profileId: string,
    eventRoleId: string | null,
  ) {
    const member = members.find(
      (item) => item.profile.id === profileId,
    );

    if (!member) return;

    try {
      setSavingId(profileId);
      setError(null);

      await committeeService.updateMember(
        member.memberId,
        {
          eventRoleId,
        },
      );

      setMembers((current) =>
        current.map((item) =>
          item.profile.id === profileId
            ? {
                ...item,
                eventRoleId,
              }
            : item,
        ),
      );

      onSaved?.();
    } catch (err) {
      console.error(
        "Failed to update committee member role:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update member role.",
      );
    } finally {
      setSavingId(null);
    }
  }

  async function removeProfile(
    profileId: string,
  ) {
    try {
      setRemovingId(profileId);
      setError(null);

      await committeeService.removeMember(
        committeeId,
        profileId,
      );

      const removed = members.find(
        (item) => item.profile.id === profileId,
      );

      setMembers((current) =>
        current.filter(
          (item) => item.profile.id !== profileId,
        ),
      );

      if (removed && query.trim()) {
        setResults((current) => [
          removed.profile,
          ...current.filter(
            (item) => item.id !== removed.profile.id,
          ),
        ]);
      }

      onSaved?.();
    } catch (err) {
      console.error(
        "Failed to remove committee member:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to remove member.",
      );
    } finally {
      setRemovingId(null);
    }
  }

  function handleDragStart(
    event: React.DragEvent,
    profile: ProfileResult,
  ) {
    setDraggedProfile(profile);

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      "text/plain",
      profile.id,
    );
  }

  function handleDragEnd() {
    setDraggedProfile(null);
  }

  function handleDrop(
    event: React.DragEvent,
  ) {
    event.preventDefault();

    const profileId =
      event.dataTransfer.getData("text/plain");

    const profile =
      results.find(
        (item) => item.id === profileId,
      ) ??
      (draggedProfile?.id === profileId
        ? draggedProfile
        : null);

    if (!profile) {
      setDraggedProfile(null);
      return;
    }

    void addProfile(profile);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />

            <h3 className="text-base font-semibold">
              Add committee members
            </h3>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Drag volunteers into the committee or click
            a volunteer to add them.
          </p>
        </div>

        <div className="inline-flex w-fit items-center rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs font-semibold">
          <span className="text-foreground">
            {members.length}
          </span>

          <span className="mx-1 text-muted-foreground">
            /
          </span>

          <span className="text-muted-foreground">
            {maxMembers} members
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError(null)}
            className="shrink-0 opacity-70 transition hover:opacity-100"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Find volunteers
        </label>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            type="text"
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void doSearch();
              }
            }}
            placeholder="Search by name or email..."
            className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-24 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
              }}
              className="absolute right-[4.5rem] top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => void doSearch()}
            disabled={
              searching ||
              !query.trim()
            }
            className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {searching ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Searching
              </span>
            ) : (
              "Search"
            )}
          </button>
        </div>
      </div>

      {/* Drag & drop area */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Available */}
        <div className="rounded-2xl border border-border bg-muted/20">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold">
                Available volunteers
              </p>

              <p className="text-xs text-muted-foreground">
                Drag or click to add
              </p>
            </div>

            {availableResults.length > 0 && (
              <span className="rounded-full bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {availableResults.length}
              </span>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto p-3">
            {searching ? (
              <div className="flex min-h-40 items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching volunteers…
                </div>
              </div>
            ) : availableResults.length > 0 ? (
              <div className="space-y-2">
                {availableResults.map((profile) => {
                  const isSaving =
                    savingId === profile.id;

                  return (
                    <div
                      key={profile.id}
                      draggable={!isSaving}
                      onDragStart={(event) =>
                        handleDragStart(
                          event,
                          profile,
                        )
                      }
                      onDragEnd={handleDragEnd}
                      onClick={() => {
                        if (!isSaving) {
                          void addProfile(
                            profile,
                          );
                        }
                      }}
                      className={`group flex cursor-grab items-center gap-3 rounded-xl border border-border bg-background p-3 transition hover:border-primary/40 hover:bg-primary/5 active:cursor-grabbing ${
                        draggedProfile?.id ===
                        profile.id
                          ? "opacity-50"
                          : ""
                      }`}
                    >
                      <div className="hidden shrink-0 text-muted-foreground sm:block">
                        <GripVertical className="h-4 w-4" />
                      </div>

                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={getFullName(
                            profile,
                          )}
                          className="h-10 w-10 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {getInitials(
                            profile,
                          )}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {getFullName(
                            profile,
                          )}
                        </p>

                        {profile.email && (
                          <p className="truncate text-xs text-muted-foreground">
                            {profile.email}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0">
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <UserPlus className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex min-h-40 flex-col items-center justify-center px-4 text-center">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <UserRound className="h-5 w-5 text-muted-foreground" />
                </div>

                <p className="text-sm font-medium">
                  {query.trim()
                    ? "No available volunteers"
                    : "Search for volunteers"}
                </p>

                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                  {query.trim()
                    ? "All matching volunteers may already be in this committee."
                    : "Search by name or email to find volunteers."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Committee members */}
        <div
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect =
              "move";
          }}
          onDrop={handleDrop}
          className={`rounded-2xl border bg-background transition ${
            draggedProfile
              ? "border-primary bg-primary/5 ring-2 ring-primary/10"
              : "border-border"
          }`}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold">
                Committee members
              </p>

              <p className="text-xs text-muted-foreground">
                Drop volunteers here
              </p>
            </div>

            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              {members.length}
            </span>
          </div>

          <div className="max-h-[420px] overflow-y-auto p-3">
            {members.length > 0 ? (
              <div className="space-y-2">
                {members.map((item) => {
                  const isRemoving =
                    removingId ===
                    item.profile.id;

                  return (
                    <div
                      key={item.profile.id}
                      className="rounded-xl border border-border bg-muted/20 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="shrink-0 text-muted-foreground">
                          <GripVertical className="h-4 w-4" />
                        </div>

                        {item.profile
                          .avatar_url ? (
                          <img
                            src={
                              item.profile
                                .avatar_url
                            }
                            alt={getFullName(
                              item.profile,
                            )}
                            className="h-10 w-10 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {getInitials(
                              item.profile,
                            )}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {getFullName(
                              item.profile,
                            )}
                          </p>

                          {item.profile
                            .email && (
                            <p className="truncate text-xs text-muted-foreground">
                              {
                                item.profile
                                  .email
                              }
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            void removeProfile(
                              item.profile
                                .id,
                            )
                          }
                          disabled={isRemoving}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                          aria-label={`Remove ${getFullName(
                            item.profile,
                          )}`}
                        >
                          {isRemoving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      <div className="mt-3">
                        <select
                          value={
                            item.eventRoleId ??
                            ""
                          }
                          onChange={(event) =>
                            void handleRoleChange(
                              item.profile
                                .id,
                              event.target
                                .value ||
                                null,
                            )
                          }
                          disabled={
                            loadingRoles
                          }
                          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <option value="">
                            {loadingRoles
                              ? "Loading roles…"
                              : "No event role"}
                          </option>

                          {roles.map(
                            (role) => (
                              <option
                                key={
                                  role.id
                                }
                                value={
                                  role.id
                                }
                              >
                                {role.name}
                              </option>
                            ),
                          )}
                        </select>

                        {!item.eventRoleId && (
                          <p className="mt-1.5 text-[11px] text-muted-foreground">
                            No role assigned
                          </p>
                        )}

                        {item.eventRoleId && (
                          <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-primary">
                            <Check className="h-3 w-3" />
                            {getRoleName(
                              item.eventRoleId,
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className={`flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed px-4 text-center transition ${
                  draggedProfile
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>

                <p className="text-sm font-medium">
                  {draggedProfile
                    ? "Drop volunteer here"
                    : "No committee members yet"}
                </p>

                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                  Drag a volunteer from the left
                  panel and drop them here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Members are added immediately. You can
          continue adding more volunteers.
        </p>

        <VSButton
          variant="ghost"
          onClick={onCancel}
        >
          Done
        </VSButton>
      </div>
    </div>
  );
}
