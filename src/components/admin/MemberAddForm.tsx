import React, { useEffect, useMemo, useState } from "react";
import {
  Check,
  Search,
  UserRound,
  X,
} from "lucide-react";

import {
  VSButton,
} from "@/components/design-system";

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

export default function MemberAddForm({
  committeeId,
  eventId,
  onSaved,
  onCancel,
}: {
  committeeId: string;
  eventId: string;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProfileResult[]>([]);
  const [selectedProfile, setSelectedProfile] =
    useState<ProfileResult | null>(null);

  const [roles, setRoles] = useState<
    Array<{ id: string; name: string }>
  >([]);

  const [selectedRole, setSelectedRole] =
    useState<string | null>(null);

  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRoles() {
      try {
        setLoadingRoles(true);
        setError(null);

        const ev = await eventService.getEventById(eventId);

        if (cancelled) return;

        const rawRoles: EventRole[] =
          ev?.event_roles ?? [];

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

  const filteredResults = useMemo(() => {
    return results;
  }, [results]);

  function getFullName(profile: ProfileResult) {
    const name = [
      profile.first_name,
      profile.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    return name || profile.email || "Unnamed user";
  }

  function getInitials(profile: ProfileResult) {
    const first =
      profile.first_name?.charAt(0) ?? "";

    const last =
      profile.last_name?.charAt(0) ?? "";

    const initials =
      `${first}${last}`.toUpperCase();

    return (
      initials ||
      profile.email?.charAt(0).toUpperCase() ||
      "U"
    );
  }

  async function doSearch() {
    const search = query.trim();

    if (!search) {
      setResults([]);
      return;
    }

    try {
      setSearching(true);
      setError(null);

      const res =
        await profileService.searchProfiles(search);

      setResults(res as ProfileResult[]);
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

  async function handleAdd() {
    if (!selectedProfile) return;

    try {
      setSaving(true);
      setError(null);

      await committeeService.addMember(
        committeeId,
        selectedProfile.id,
        selectedRole ?? undefined,
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
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Error */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Search users */}
      <div>
        <label className="mb-2 block text-sm font-medium text-muted-foreground">
          Add member
        </label>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);

              // If the admin starts another search,
              // clear the previous selection.
              if (selectedProfile) {
                setSelectedProfile(null);
                setSelectedRole(null);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void doSearch();
              }
            }}
            placeholder="Search users by name or email..."
            className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-24 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                setSelectedProfile(null);
                setSelectedRole(null);
              }}
              className="absolute right-[4.5rem] top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => void doSearch()}
            disabled={searching || !query.trim()}
            className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {searching ? "Searching…" : "Search"}
          </button>
        </div>

        {/* Results */}
        {filteredResults.length > 0 && (
          <div className="mt-2 max-h-64 overflow-y-auto rounded-2xl border border-border bg-background">
            <div className="divide-y divide-border">
              {filteredResults.map((profile) => {
                const selected =
                  selectedProfile?.id ===
                  profile.id;

                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => {
                      setSelectedProfile(
                        profile,
                      );
                      setResults([]);
                    }}
                    className={`flex w-full items-center gap-3 px-3 py-3 text-left transition ${
                      selected
                        ? "bg-primary/10"
                        : "hover:bg-muted/60"
                    }`}
                  >
                    {/* Avatar */}
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={getFullName(
                          profile,
                        )}
                        className="h-11 w-11 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {getInitials(
                          profile,
                        )}
                      </div>
                    )}

                    {/* Info */}
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

                    {selected && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* No results */}
        {!searching &&
          query.trim() &&
          results.length === 0 && (
            <div className="mt-2 rounded-2xl border border-border px-4 py-6 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <UserRound className="h-5 w-5 text-muted-foreground" />
              </div>

              <p className="text-sm font-medium">
                No users found
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Try another name or email.
              </p>
            </div>
          )}
      </div>

      {/* Selected member */}
      {selectedProfile && (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              {selectedProfile.avatar_url ? (
                <img
                  src={selectedProfile.avatar_url}
                  alt={getFullName(
                    selectedProfile,
                  )}
                  className="h-11 w-11 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {getInitials(
                    selectedProfile,
                  )}
                </div>
              )}

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {getFullName(
                    selectedProfile,
                  )}
                </p>

                {selectedProfile.email && (
                  <p className="truncate text-xs text-muted-foreground">
                    {selectedProfile.email}
                  </p>
                )}

                <p className="mt-0.5 text-xs font-medium text-primary">
                  Selected member
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedProfile(null);
                setSelectedRole(null);
              }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-background hover:text-foreground"
              aria-label="Remove selected member"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Event role */}
      <div>
        <label className="mb-2 block text-sm font-medium text-muted-foreground">
          Assign event role
        </label>

        <select
          value={selectedRole ?? ""}
          onChange={(e) =>
            setSelectedRole(
              e.target.value || null,
            )
          }
          disabled={
            loadingRoles ||
            !selectedProfile
          }
          className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">
            {loadingRoles
              ? "Loading roles..."
              : !selectedProfile
                ? "Select a member first"
                : "No event role"}
          </option>

          {roles.map((role) => (
            <option
              key={role.id}
              value={role.id}
            >
              {role.name}
            </option>
          ))}
        </select>

        {!selectedProfile && (
          <p className="mt-1 text-xs text-muted-foreground">
            Select a user first, then assign
            their event role.
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <VSButton
          variant="ghost"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </VSButton>

        <VSButton
          onClick={() => void handleAdd()}
          disabled={
            saving ||
            !selectedProfile ||
            loadingRoles
          }
        >
          {saving
            ? "Adding…"
            : "Add member"}
        </VSButton>
      </div>
    </div>
  );
}