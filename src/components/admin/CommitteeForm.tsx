import React, { useEffect, useMemo, useState } from "react";
import {
  VSInput,
  VSTextarea,
  VSButton,
} from "@/components/design-system";
import {
  Search,
  Check,
  UserRound,
  X,
} from "lucide-react";
import committeeService from "@/services/admin/committeeService";
import type { Committee } from "@/types/domain";

type LeaderProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: string | null;
  status: string | null;
};

export default function CommitteeForm({
  onSaved,
  initial,
  eventId,
}: {
  onSaved?: () => void;
  initial?: Partial<Committee>;
  eventId?: string;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(
    initial?.description ?? "",
  );

  const [leaderProfileId, setLeaderProfileId] = useState(
    initial?.leaderProfileId ?? "",
  );

  const [leaders, setLeaders] = useState<LeaderProfile[]>([]);
  const [leaderSearch, setLeaderSearch] = useState("");

  const [loadingLeaders, setLoadingLeaders] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLeaders() {
      try {
        setLoadingLeaders(true);
        setError(null);

        const data = await committeeService.listAvailableLeaders();

        if (!cancelled) {
          setLeaders(data);
        }
      } catch (err) {
        console.error("Failed to load users:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load users.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingLeaders(false);
        }
      }
    }

    void loadLeaders();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedLeader = useMemo(() => {
    return leaders.find(
      (profile) => profile.id === leaderProfileId,
    );
  }, [leaders, leaderProfileId]);

  const filteredLeaders = useMemo(() => {
    const query = leaderSearch.trim().toLowerCase();

    if (!query) {
      return leaders;
    }

    return leaders.filter((profile) => {
      const name = [
        profile.first_name,
        profile.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const email = profile.email?.toLowerCase() ?? "";

      return (
        name.includes(query) ||
        email.includes(query)
      );
    });
  }, [leaders, leaderSearch]);

  function getProfileName(profile: LeaderProfile) {
    const fullName = [
      profile.first_name,
      profile.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    return fullName || profile.email || "Unnamed user";
  }

  function getInitials(profile: LeaderProfile) {
    const first = profile.first_name?.charAt(0) ?? "";
    const last = profile.last_name?.charAt(0) ?? "";

    const initials = `${first}${last}`.toUpperCase();

    if (initials) return initials;

    return profile.email?.charAt(0).toUpperCase() ?? "U";
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      if (!name.trim()) {
        throw new Error("Committee name is required.");
      }

      const currentEventId =
        eventId ?? initial?.eventId;

      if (initial?.id) {
        await committeeService.updateCommittee(
          initial.id,
          {
            name: name.trim(),
            description,
            leaderProfileId:
              leaderProfileId || null,
          },
        );
      } else {
        if (!currentEventId) {
          throw new Error("eventId is required");
        }

        await committeeService.createCommittee({
          name: name.trim(),
          description,
          eventId: currentEventId,
          leaderProfileId:
            leaderProfileId || null,
        });
      }

      onSaved?.();
    } catch (err) {
      console.error(
        "Failed to save committee:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save committee.",
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

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground">
          Name
        </label>

        <VSInput
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          placeholder="Committee name"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground">
          Description
        </label>

        <VSTextarea
          value={description ?? ""}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          placeholder="Committee description"
        />
      </div>

      {/* Leader */}
      <div>
        <label className="mb-2 block text-sm font-medium text-muted-foreground">
          Committee Leader
        </label>

        {/* Selected leader */}
        {selectedLeader && (
          <div className="mb-3 flex items-center justify-between rounded-2xl border border-primary/30 bg-primary/5 p-3">
            <div className="flex min-w-0 items-center gap-3">
              {selectedLeader.avatar_url ? (
                <img
                  src={selectedLeader.avatar_url}
                  alt={getProfileName(
                    selectedLeader,
                  )}
                  className="h-11 w-11 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {getInitials(
                    selectedLeader,
                  )}
                </div>
              )}

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {getProfileName(
                    selectedLeader,
                  )}
                </p>

                {selectedLeader.email && (
                  <p className="truncate text-xs text-muted-foreground">
                    {selectedLeader.email}
                  </p>
                )}

                <p className="mt-0.5 text-xs font-medium text-primary">
                  Committee Leader
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setLeaderProfileId("")
              }
              className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-background hover:text-foreground"
              aria-label="Remove selected leader"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            type="text"
            value={leaderSearch}
            onChange={(e) =>
              setLeaderSearch(e.target.value)
            }
            placeholder="Search users by name or email..."
            className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />

          {leaderSearch && (
            <button
              type="button"
              onClick={() =>
                setLeaderSearch("")
              }
              className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Users list */}
        <div className="mt-2 max-h-72 overflow-y-auto rounded-2xl border border-border bg-background">
          {loadingLeaders ? (
            <div className="flex items-center justify-center px-4 py-10 text-sm text-muted-foreground">
              Loading users...
            </div>
          ) : filteredLeaders.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <UserRound className="h-5 w-5 text-muted-foreground" />
              </div>

              <p className="text-sm font-medium">
                No users found
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Try another name or email.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredLeaders.map(
                (profile) => {
                  const selected =
                    profile.id ===
                    leaderProfileId;

                  return (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() =>
                        setLeaderProfileId(
                          profile.id,
                        )
                      }
                      className={`flex w-full items-center gap-3 px-3 py-3 text-left transition ${
                        selected
                          ? "bg-primary/10"
                          : "hover:bg-muted/60"
                      }`}
                    >
                      {/* Avatar */}
                      {profile.avatar_url ? (
                        <img
                          src={
                            profile.avatar_url
                          }
                          alt={getProfileName(
                            profile,
                          )}
                          className="h-11 w-11 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                          {getInitials(
                            profile,
                          )}
                        </div>
                      )}

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {getProfileName(
                            profile,
                          )}
                        </p>

                        {profile.email && (
                          <p className="truncate text-xs text-muted-foreground">
                            {profile.email}
                          </p>
                        )}
                      </div>

                      {/* Selected */}
                      {selected && (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </button>
                  );
                },
              )}
            </div>
          )}
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          Search and select the user who will
          lead this committee.
        </p>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <VSButton
          onClick={handleSave}
          disabled={
            saving ||
            loadingLeaders ||
            name.trim() === ""
          }
        >
          {saving ? "Saving…" : "Save"}
        </VSButton>
      </div>
    </div>
  );
}