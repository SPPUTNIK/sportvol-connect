import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Edit3,
  FolderKanban,
  MessageSquare,
  Plus,
  Shield,
  Trash2,
  UserMinus,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  VSButton,
  VSCard,
  VSCardContent,
  VSModal,
  VSModalContent,
  VSModalHeader,
  VSModalTitle,
  VSModalFooter,
  VSSectionHeader,
  VSLoadingState,
  VSEmptyState,
  VSStatusBadge,
} from "@/components/design-system";

import type {
  Committee,
  CommitteeFeedback,
} from "@/types/domain";

import committeeService from "@/services/committeeService";
import { eventService } from "@/services/eventService";
import MemberAddForm from "./MemberAddForm";
import CommitteeForm from "./CommitteeForm";
import { formatStatus } from "./components/adminHelpers";

type DetailedMember = {
  member: {
    id: string;
    committeeId: string;
    profileId: string;
    eventRoleId: string | null;
    status: string;
    joinedAt: string | null;
  };
  profile: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
  eventRoleId: string | null;
};

type Props = {
  committee: Committee;
  onClose: () => void;
  onUpdated?: () => void;
};

export default function CommitteeDetails({
  committee,
  onClose,
  onUpdated,
}: Props) {
  const [members, setMembers] = useState<DetailedMember[]>([]);
  const [feedback, setFeedback] = useState<CommitteeFeedback[]>([]);
  const [roles, setRoles] = useState<Array<{ id: string; name: string }>>([]);

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);

  const loadDetails = async () => {
    try {
      setLoading(true);

      const [memberRows, feedbackRows, event] = await Promise.all([
        committeeService.listMembersDetailed(committee.id),
        committeeService.listFeedback(committee.id),
        eventService.getEventById(committee.eventId),
      ]);

      setMembers(
        memberRows.map((item) => ({
          member: item.member,
          profile: item.profile,
          eventRoleId: item.eventRoleId,
        })),
      );

      setFeedback(feedbackRows);

      setRoles(
        (event?.event_roles ?? []).map((role: any) => ({
          id: role.id,
          name: role.name,
        })),
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load committee details.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDetails();
  }, [committee.id]);

  const activeMembers = useMemo(
    () => members.filter((item) => item.member.status !== "removed"),
    [members],
  );

  const leader = committee.leaderProfileId;

  const refresh = async () => {
    await loadDetails();
    onUpdated?.();
  };

  const handleStatusChange = async (
    status: "draft" | "active" | "closed",
  ) => {
    if (status === committee.status) return;

    try {
      setChangingStatus(true);

      await committeeService.updateCommittee(committee.id, {
        status,
      });

      toast.success(`Committee marked as ${status}.`);
      await refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update committee status.";

      toast.error(message);
    } finally {
      setChangingStatus(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete "${committee.name}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      await committeeService.deleteCommittee(committee.id);

      toast.success("Committee deleted successfully.");
      onClose();
      onUpdated?.();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete committee.";

      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  const handleMemberRoleChange = async (
    memberId: string,
    eventRoleId: string | null,
  ) => {
    try {
      await committeeService.updateMember(memberId, {
        eventRoleId,
      });

      toast.success("Member role updated.");
      await refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update member role.";

      toast.error(message);
    }
  };

  const handleRemoveMember = async (profileId: string) => {
    const confirmed = window.confirm(
      "Remove this volunteer from the committee?",
    );

    if (!confirmed) return;

    try {
      await committeeService.removeMember(
        committee.id,
        profileId,
      );

      toast.success("Member removed from committee.");
      await refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to remove member.";

      toast.error(message);
    }
  };

  return (
    <>
      <VSModal open onOpenChange={onClose}>
        <VSModalContent className="max-h-[90vh] overflow-y-auto">
          <VSModalHeader>
            <div className="flex items-start justify-between gap-4 pr-8">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <FolderKanban className="h-5 w-5 text-primary" />
                </div>

                <div className="min-w-0">
                  <VSModalTitle className="truncate">
                    {committee.name}
                  </VSModalTitle>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <VSStatusBadge
                      status={formatStatus(committee.status)}
                    />

                    {leader ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                        <Shield className="h-3.5 w-3.5" />
                        Leader assigned
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                        No leader
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </VSModalHeader>

          <div className="space-y-8 p-6">
            {/* Overview */}
            <VSCard className="rounded-[1.5rem] border-border">
              <VSCardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      About this committee
                    </p>

                    <p className="mt-3 text-sm leading-6 text-foreground">
                      {committee.description ||
                        "No description has been added for this committee yet."}
                    </p>
                  </div>

                  <FolderKanban className="h-5 w-5 shrink-0 text-muted-foreground" />
                </div>

                <div className="mt-5 grid gap-3 border-t border-border pt-5 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Members
                    </p>
                    <p className="mt-1 font-semibold">
                      {activeMembers.length}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Leader
                    </p>
                    <p className="mt-1 font-semibold">
                      {leader ? "Assigned" : "Not assigned"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Feedback
                    </p>
                    <p className="mt-1 font-semibold">
                      {feedback.length}
                    </p>
                  </div>
                </div>
              </VSCardContent>
            </VSCard>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <VSButton
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
              >
                <Edit3 className="h-4 w-4" />
                Edit committee
              </VSButton>

              <VSButton
                variant="outline"
                size="sm"
                disabled={changingStatus}
                onClick={() =>
                  void handleStatusChange(
                    committee.status === "active"
                      ? "closed"
                      : "active",
                  )
                }
              >
                {committee.status === "active" ? (
                  <>
                    <X className="h-4 w-4" />
                    Close committee
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Activate committee
                  </>
                )}
              </VSButton>

              <VSButton
                variant="ghost"
                size="sm"
                disabled={deleting}
                onClick={() => void handleDelete()}
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? "Deleting…" : "Delete"}
              </VSButton>
            </div>

            {/* Members */}
            <section>
              <div className="mb-4 flex items-end justify-between gap-4">
                <VSSectionHeader
                  title="Members"
                  description={`${activeMembers.length} active ${
                    activeMembers.length === 1
                      ? "member"
                      : "members"
                  }`}
                />

                <VSButton
                  size="sm"
                  onClick={() => setAdding((value) => !value)}
                >
                  {adding ? (
                    <>
                      <X className="h-4 w-4" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Add member
                    </>
                  )}
                </VSButton>
              </div>

              {adding && (
                <VSCard className="mb-4 rounded-[1.5rem] border-border">
                  <VSCardContent className="p-5">
                    <MemberAddForm
                      committeeId={committee.id}
                      eventId={committee.eventId}
                      onSaved={async () => {
                        setAdding(false);
                        await refresh();
                      }}
                      onCancel={() => setAdding(false)}
                    />
                  </VSCardContent>
                </VSCard>
              )}

              {loading ? (
                <VSLoadingState message="Loading members…" />
              ) : activeMembers.length === 0 ? (
                <VSEmptyState
                  title="No members yet"
                  description="Add volunteers to this committee."
                  action={
                    <VSButton
                      size="sm"
                      onClick={() => setAdding(true)}
                    >
                      <Plus className="h-4 w-4" />
                      Add member
                    </VSButton>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {activeMembers.map((item) => {
                    const fullName =
                      `${item.profile.first_name ?? ""} ${
                        item.profile.last_name ?? ""
                      }`.trim() || "Unnamed volunteer";

                    return (
                      <VSCard
                        key={item.member.id}
                        className="rounded-[1.5rem] border-border"
                      >
                        <VSCardContent className="p-4">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-center gap-3">
                              {item.profile.avatar_url ? (
                                <img
                                  src={item.profile.avatar_url}
                                  alt={fullName}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                  {fullName
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                              )}

                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                  {fullName}
                                </p>

                                <div className="mt-1 flex flex-wrap gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    {item.member.status}
                                  </span>

                                  {item.member.profileId ===
                                    committee.leaderProfileId && (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                                      <Shield className="h-3 w-3" />
                                      Leader
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <select
                                value={
                                  item.eventRoleId ?? ""
                                }
                                onChange={(event) =>
                                  void handleMemberRoleChange(
                                    item.member.id,
                                    event.target.value || null,
                                  )
                                }
                                className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary/20"
                              >
                                <option value="">
                                  No event role
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

                              <VSButton
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  void handleRemoveMember(
                                    item.member.profileId,
                                  )
                                }
                              >
                                <UserMinus className="h-4 w-4" />
                                Remove
                              </VSButton>
                            </div>
                          </div>
                        </VSCardContent>
                      </VSCard>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Feedback */}
            <section>
              <VSSectionHeader
                title="Feedback"
                description={`${feedback.length} ${
                  feedback.length === 1
                    ? "entry"
                    : "entries"
                } from committee evaluations`}
              />

              <div className="mt-4 space-y-3">
                {feedback.length === 0 ? (
                  <VSCard className="rounded-[1.5rem] border-border">
                    <VSCardContent className="flex items-center gap-3 p-5">
                      <MessageSquare className="h-5 w-5 text-muted-foreground" />

                      <div>
                        <p className="text-sm font-medium">
                          No feedback yet
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Committee feedback will appear here
                          once evaluations are submitted.
                        </p>
                      </div>
                    </VSCardContent>
                  </VSCard>
                ) : (
                  feedback.map((item) => (
                    <VSCard
                      key={item.id}
                      className="rounded-[1.5rem] border-border"
                    >
                      <VSCardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium">
                              Volunteer evaluation
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                              Member ID: {item.memberProfileId}
                            </p>
                          </div>

                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                            {item.overallRating}/5
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <Rating
                            label="Punctuality"
                            value={item.punctuality}
                          />
                          <Rating
                            label="Teamwork"
                            value={item.teamwork}
                          />
                          <Rating
                            label="Communication"
                            value={item.communication}
                          />
                          <Rating
                            label="Responsibility"
                            value={item.responsibility}
                          />
                        </div>

                        {item.comment && (
                          <p className="mt-4 border-t border-border pt-4 text-sm leading-6 text-muted-foreground">
                            {item.comment}
                          </p>
                        )}
                      </VSCardContent>
                    </VSCard>
                  ))
                )}
              </div>
            </section>
          </div>

          <VSModalFooter>
            <VSButton variant="outline" onClick={onClose}>
              Close
            </VSButton>
          </VSModalFooter>
        </VSModalContent>
      </VSModal>

      {/* Edit committee */}
      <VSModal
        open={editing}
        onOpenChange={setEditing}
      >
        <VSModalContent>
          <VSModalHeader>
            <VSModalTitle>Edit committee</VSModalTitle>
          </VSModalHeader>

          <div className="p-6">
            <CommitteeForm
              initial={committee}
              eventId={committee.eventId}
              onSaved={async () => {
                setEditing(false);
                toast.success("Committee updated successfully.");
                await refresh();
              }}
            />
          </div>

          <VSModalFooter />
        </VSModalContent>
      </VSModal>
    </>
  );
}

function Rating({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  return (
    <div className="rounded-xl bg-muted/50 p-3">
      <p className="text-[11px] text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold">
        {value ?? "—"}/5
      </p>
    </div>
  );
}

