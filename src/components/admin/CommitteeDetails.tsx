import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Edit3,
  FolderKanban,
  Mail,
  MessageSquare,
  Plus,
  Shield,
  Trash2,
  UserMinus,
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

import type { Committee, CommitteeFeedback } from "@/types/domain";

import { supabase } from "@/lib/supabase";
import committeeService from "@/services/admin/committeeService";
import { eventService } from "@/services/shared/eventService";

import MemberAddForm from "./MemberAddForm";
import CommitteeForm from "./CommitteeForm";
import { formatStatus } from "./components/adminHelpers";


type DetailedMember = {
  member: {
    id: string;
    committeeId: string;
    profileId: string;
    eventRoleId?: string | null;
    status: string;
    joinedAt: string | null;
  };
  profile: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    email?: string | null;
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
  const [availableShifts, setAvailableShifts] = useState<Array<{ id: string; title: string; date: string; start_time: string; end_time: string }>>([]);
  const [assignedShifts, setAssignedShifts] = useState<Array<{ id: string; shift_id: string; shift?: { id: string; title: string; date: string; start_time: string; end_time: string } | null }>>([]);
  const [committeeShiftAssignments, setCommitteeShiftAssignments] = useState<Array<{
    id: string;
    profile_id: string;
    shift_id: string;
    status: string;
    profiles?: {
      id: string;
      first_name: string | null;
      last_name: string | null;
      avatar_url: string | null;
    } | null;
    event_shifts?: {
      id: string;
      title: string;
      date: string;
      start_time: string;
      end_time: string;
    } | null;
  }>>([]);
  const [selectedShiftId, setSelectedShiftId] = useState("");
  const [activeShiftId, setActiveShiftId] = useState<string | null>(null);
  const [addingShift, setAddingShift] = useState(false);

  const [loading, setLoading] = useState(true);
  const [leaderProfile, setLeaderProfile] = useState<{ id: string; first_name: string | null; last_name: string | null; avatar_url: string | null } | null>(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);

  const loadDetails = useCallback(async () => {
    try {
      setLoading(true);

      const [memberRows, feedbackRows, event, shiftsResult, assignedResult] = await Promise.all([
        committeeService.listMembersDetailed(committee.id),
        committeeService.listFeedback(committee.id),
        eventService.getEventById(committee.eventId),
        supabase
          .from("event_shifts")
          .select("id, title, date, start_time, end_time, event_id")
          .eq("event_id", committee.eventId)
          .order("date", { ascending: true }),
        committeeService.listCommitteeShifts(committee.id),
      ]);

      if (committee.leaderProfileId) {
        const { data: leaderRow } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, avatar_url")
          .eq("id", committee.leaderProfileId)
          .maybeSingle();

        setLeaderProfile(leaderRow ?? null);
      } else {
        setLeaderProfile(null);
      }

      const assignedShiftRows = (Array.isArray(assignedResult)
        ? (assignedResult as unknown as Array<{ shift_id: string; id: string; shift?: { id: string; title: string; date: string; start_time: string; end_time: string } | null }>)
        : []) as Array<{ shift_id: string; id: string; shift?: { id: string; title: string; date: string; start_time: string; end_time: string } | null }>;

      const linkedShiftIds = assignedShiftRows.map((item) => item.shift_id).filter(Boolean);

      let shiftAssignments: typeof committeeShiftAssignments = [];

      if (linkedShiftIds.length > 0) {
        const { data: assignmentRows, error: assignmentError } = await supabase
          .from("shift_assignments")
          .select(
            "id, profile_id, shift_id, status, profiles!shift_assignments_profile_id_fkey(id, first_name, last_name, avatar_url), event_shifts!shift_assignments_shift_id_fkey(id, title, date, start_time, end_time)"
          )
          .in("shift_id", linkedShiftIds)
          .eq("status", "assigned")
          .order("assigned_at", { ascending: false });

        if (assignmentError) {
          throw assignmentError;
        }

        shiftAssignments = (assignmentRows ?? []) as typeof committeeShiftAssignments;
      }

      const mappedMembers: DetailedMember[] = memberRows.map((item) => ({
        member: {
          ...item.member,
          eventRoleId: item.eventRoleId ?? null,
        } as DetailedMember["member"],
        profile: item.profile,
        eventRoleId: item.eventRoleId ?? null,
      }));

      setMembers(mappedMembers);
      setFeedback(feedbackRows);
      setAssignedShifts(assignedShiftRows as typeof assignedShifts);
      setCommitteeShiftAssignments(shiftAssignments);
      setAvailableShifts((shiftsResult.data ?? []) as typeof availableShifts);

      if (!activeShiftId && shiftAssignments.length > 0) {
        setActiveShiftId(shiftAssignments[0].shift_id);
      }

      setRoles(
        (event?.event_roles ?? []).map(
          (role: { id: string; name: string }) => ({
            id: role.id,
            name: role.name,
          }),
        ),
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
  }, [committee.eventId, committee.id]);

  useEffect(() => {
    void loadDetails();
  }, [loadDetails]);

  const uniqueAssignedVolunteerIds = useMemo(() => {
    const uniqueIds = new Set<string>();

    committeeShiftAssignments.forEach((assignment) => {
      if (assignment.profile_id) {
        uniqueIds.add(assignment.profile_id);
      }
    });

    return uniqueIds;
  }, [committeeShiftAssignments]);

  const activeMembers = useMemo(
    () => members.filter((item) => item.member.status !== "removed"),
    [members],
  );

  const memberShiftMap = useMemo(() => {
    const map = new Map<string, Array<{ id: string; title: string; date: string; start_time: string; end_time: string }>>();

    committeeShiftAssignments.forEach((assignment) => {
      const profileId = assignment.profile_id;
      const shift = assignment.event_shifts;

      if (!profileId || !shift) return;

      const existing = map.get(profileId) ?? [];
      if (existing.some((current) => current.id === shift.id)) return;

      map.set(profileId, [
        ...existing,
        {
          id: shift.id,
          title: shift.title,
          date: shift.date,
          start_time: shift.start_time,
          end_time: shift.end_time,
        },
      ]);
    });

    return map;
  }, [committeeShiftAssignments]);

  const activeShift = useMemo(
    () => assignedShifts.find((item) => item.shift_id === activeShiftId)?.shift ?? null,
    [activeShiftId, assignedShifts],
  );

  const activeShiftMembers = useMemo(() => {
    const uniqueMembers = new Map<string, {
      id: string;
      first_name: string | null;
      last_name: string | null;
      avatar_url: string | null;
    }>();

    committeeShiftAssignments
      .filter((assignment) => assignment.shift_id === activeShiftId)
      .forEach((assignment) => {
        const profileId = assignment.profile_id;
        if (!profileId) return;

        uniqueMembers.set(profileId, {
          id: profileId,
          first_name: assignment.profiles?.first_name ?? null,
          last_name: assignment.profiles?.last_name ?? null,
          avatar_url: assignment.profiles?.avatar_url ?? null,
        });
      });

    return Array.from(uniqueMembers.values());
  }, [activeShiftId, committeeShiftAssignments]);

  const leader = committee.leaderProfileId;

  const refresh = async () => {
    await loadDetails();
    onUpdated?.();
  };

  const handleStatusChange = async (
    status: "active" | "inactive" | "archived",
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

  const handleAddShift = async () => {
    if (!selectedShiftId) return;

    try {
      setAddingShift(true);
      await committeeService.addCommitteeShift(committee.id, selectedShiftId);
      toast.success("Shift added to committee.");
      setSelectedShiftId("");
      await refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to add shift.";
      toast.error(message);
    } finally {
      setAddingShift(false);
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
      await committeeService.removeMember(committee.id, profileId);

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

  const getMemberName = (member: DetailedMember) => {
    const firstName = member.profile.first_name?.trim() ?? "";
    const lastName = member.profile.last_name?.trim() ?? "";

    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || "Unnamed volunteer";
  };

  const getMemberInitials = (member: DetailedMember) => {
    const firstName = member.profile.first_name?.trim() ?? "";
    const lastName = member.profile.last_name?.trim() ?? "";

    const firstInitial = firstName.charAt(0);
    const lastInitial = lastName.charAt(0);

    return (
      `${firstInitial}${lastInitial}`.toUpperCase() || "V"
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

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <FolderKanban className="h-5 w-5 text-primary" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-2xl font-semibold tracking-tight">
                {committee.name}
              </h1>

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
                    ? "inactive"
                    : "active",
                )
              }
            >
              {committee.status === "active" ? (
                <>
                  <X className="h-4 w-4" />
                  Deactivate committee
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
        </div>

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
                  Total members
                </p>

                <p className="mt-1 font-semibold">
                  {uniqueAssignedVolunteerIds.size}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Leader
                </p>

                {leaderProfile ? (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                      {leaderProfile.avatar_url ? (
                        <img
                          src={leaderProfile.avatar_url}
                          alt={`${leaderProfile.first_name ?? ""} ${leaderProfile.last_name ?? ""}`.trim() || "Committee leader"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        `${leaderProfile.first_name?.charAt(0) ?? ""}${leaderProfile.last_name?.charAt(0) ?? ""}`.trim().toUpperCase() || "L"
                      )}
                    </div>
                    <span className="font-semibold">
                      {`${leaderProfile.first_name ?? ""} ${leaderProfile.last_name ?? ""}`.trim() || "Assigned"}
                    </span>
                  </div>
                ) : (
                  <p className="mt-1 font-semibold">Not assigned</p>
                )}
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



        {/* Committee shifts */}
        <section>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <VSSectionHeader
              title="Assigned shifts"
              description="Review the event shifts linked to this committee."
            />

            

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                value={selectedShiftId}
                onChange={(event) => setSelectedShiftId(event.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-primary/20 sm:min-w-64"
              >
                <option value="">Select a shift</option>
                {availableShifts
                  .filter((shift) => !assignedShifts.some((assigned) => assigned.shift_id === shift.id))
                  .map((shift) => (
                    <option key={shift.id} value={shift.id}>
                      {shift.title} · {shift.date} · {shift.start_time} - {shift.end_time}
                    </option>
                  ))}
              </select>

              <VSButton size="sm" onClick={() => void handleAddShift()} disabled={!selectedShiftId || addingShift}>
                <Plus className="h-4 w-4" />
                {addingShift ? "Adding…" : "Add shift"}
              </VSButton>
            </div>
          </div>

          

          <div className="mt-4">
            {loading ? (
              <VSLoadingState message="Loading assigned shifts…" />
            ) : (!committee || !committee.id) ? (
              <VSEmptyState
                title="No committee selected"
                description="Select a committee to review its assigned shifts."
              />
            ) : (
              <div className="space-y-4">
                {assignedShifts.length === 0 ? (
                  <VSEmptyState
                    title="No shifts assigned"
                    description="Add a shift to define this committee’s operational coverage."
                  />
                ) : (
                  <>
                    {assignedShifts.map((item) => {
                      const isSelected = activeShiftId === item.shift_id;
                      const shiftMembers = committeeShiftAssignments.filter((assignment) => assignment.shift_id === item.shift_id);
                      const visibleMembers = shiftMembers.slice(0, 4);

                      return (
                        <VSCard
                          key={item.id}
                          className={`rounded-[1.5rem] border-border ${
                            isSelected ? "ring-1 ring-primary/40" : ""
                          }`}
                        >
                          <VSCardContent className="p-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold">{item.shift?.title ?? "Shift"}</p>
                                  {isSelected && (
                                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                                      Active
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {item.shift?.date ?? "—"} · {item.shift?.start_time ?? "--:--"} to {item.shift?.end_time ?? "--:--"}
                                </p>

                                <div className="mt-3 flex items-center gap-2">
                                  {visibleMembers.length === 0 ? (
                                    <span className="text-xs text-muted-foreground">No volunteers assigned yet</span>
                                  ) : (
                                    <>
                                      <div className="flex -space-x-2">
                                        {visibleMembers.map((assignment) => (
                                          <div
                                            key={`${assignment.id}-mini`}
                                            className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border-2 border-background bg-primary/10 text-[9px] font-semibold text-primary"
                                            title={`${assignment.profiles?.first_name ?? ""} ${assignment.profiles?.last_name ?? ""}`.trim() || "Volunteer"}
                                          >
                                            {assignment.profiles?.avatar_url ? (
                                              <img
                                                src={assignment.profiles.avatar_url}
                                                alt={`${assignment.profiles?.first_name ?? ""} ${assignment.profiles?.last_name ?? ""}`.trim() || "Volunteer"}
                                                className="h-full w-full object-cover"
                                              />
                                            ) : (
                                              `${assignment.profiles?.first_name?.charAt(0) ?? ""}${assignment.profiles?.last_name?.charAt(0) ?? ""}`.trim().toUpperCase() || "V"
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                      <span className="text-xs text-muted-foreground">
                                        {shiftMembers.length > visibleMembers.length
                                          ? `${shiftMembers.length} volunteers assigned`
                                          : `${shiftMembers.length} ${shiftMembers.length === 1 ? "volunteer" : "volunteers"}`}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">

                                <VSButton
                                  variant={isSelected ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setActiveShiftId(isSelected ? null : item.shift_id)}
                                >
                                  {isSelected ? "Hide details" : "View details"}
                                </VSButton>

                                { <VSButton
                                  variant="ghost"
                                  size="sm"
                                  onClick={async () => {
                                    const confirmed = window.confirm("Remove this shift assignment?");
                                    if (!confirmed) return;

                                    try {
                                      await committeeService.removeCommitteeShift(item.id);
                                      toast.success("Shift removed from committee.");
                                      await refresh();
                                    } catch (error) {
                                      const message =
                                        error instanceof Error
                                          ? error.message
                                          : "Failed to remove shift.";
                                      toast.error(message);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Remove
                                </VSButton> }
                              </div>
                            </div>
                          </VSCardContent>
                        </VSCard>
                      );
                    })}

                    {activeShift ? (
                      <VSCard className="rounded-[1.5rem] border-border">
                        <VSCardContent className="p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Selected shift members
                              </p>
                              <h4 className="mt-1 text-lg font-semibold">{activeShift.title}</h4>
                            </div>

                            <VSButton variant="outline" size="sm" onClick={() => setActiveShiftId(null)}>
                              Clear
                            </VSButton>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {activeShiftMembers.length === 0 ? (
                              <p className="text-sm text-muted-foreground">
                                No volunteers assigned to this shift yet.
                              </p>
                            ) : (
                              activeShiftMembers.map((profile) => (
                                <div
                                  key={`${activeShift.id}-${profile.id}`}
                                  className="flex items-center gap-2 rounded-full border border-border bg-background px-2.5 py-1.5"
                                >
                                  <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                                    {profile.avatar_url ? (
                                      <img
                                        src={profile.avatar_url}
                                        alt={`${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "Volunteer"}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      `${profile.first_name?.charAt(0) ?? ""}${profile.last_name?.charAt(0) ?? ""}`.trim().toUpperCase() || "V"
                                    )}
                                  </div>
                                  <span className="text-sm font-medium">
                                    {`${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "Volunteer"}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </VSCardContent>
                      </VSCard>
                    ) : null}
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Feedback */}
        <section>
          <VSSectionHeader
            title="Feedback"
            description={`${feedback.length} ${
              feedback.length === 1
                ? "feedback entry"
                : "feedback entries"
            }`}
          />

          <div className="mt-4">
            {loading ? (
              <VSLoadingState message="Loading feedback…" />
            ) : feedback.length === 0 ? (
              <VSEmptyState
                title="No feedback yet"
                description="Committee feedback will appear here once evaluations are submitted."
              />
            ) : (
              <div className="space-y-4">
                {feedback.map((item) => (
                  <VSCard
                    key={item.id}
                    className="rounded-[1.5rem] border-border"
                  >
                    <VSCardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                            <MessageSquare className="h-4 w-4 text-primary" />
                          </div>

                          <div>
                            <p className="text-sm font-semibold">
                              Member feedback
                            </p>

                            <p className="mt-0.5 text-xs text-muted-foreground">
                              Member ID:{" "}
                              {item.memberProfileId}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            Overall
                          </p>

                          <p className="text-lg font-semibold">
                            {item.overallRating ?? "—"}/5
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
                        <div className="mt-4 rounded-xl bg-muted/40 p-4">
                          <p className="text-xs font-medium text-muted-foreground">
                            Comment
                          </p>

                          <p className="mt-2 text-sm leading-6">
                            {item.comment}
                          </p>
                        </div>
                      )}
                    </VSCardContent>
                  </VSCard>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Edit committee modal */}
      <VSModal
        open={editing}
        onOpenChange={setEditing}
      >
        <VSModalContent>
          <VSModalHeader>
            <VSModalTitle>
              Edit committee
            </VSModalTitle>
          </VSModalHeader>

          <div className="p-6">
            <CommitteeForm
              initial={committee}
              eventId={committee.eventId}
              onSaved={async () => {
                setEditing(false);

                toast.success(
                  "Committee updated successfully.",
                );

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