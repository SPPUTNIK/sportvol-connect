import { useEffect, useState } from "react";
import { toast } from "sonner";

import FeedbackForm from "./FeedbackForm";
import {
  VSAvatar,
  VSButton,
  VSCard,
  VSCardContent,
  VSEmptyState,
  VSLoadingState,
  VSModal,
  VSModalContent,
  VSModalFooter,
  VSModalHeader,
  VSModalTitle,
  VSSectionHeader,
  VSStatusBadge,
} from "@/components/design-system";
import { type LeaderMember } from "@/services/leader/leaderService";

function formatMemberName(member: LeaderMember) {
  return `${member.firstName} ${member.lastName}`;
}

export default function LeaderCommitteeDetails({
  committee,
  members,
  onClose,
}: {
  committee?: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    leader: string;
    memberCount: number;
    eventId: string;
  } | null;
  members?: LeaderMember[];
  onClose?: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [feedbackMember, setFeedbackMember] = useState<LeaderMember | null>(null);

  useEffect(() => {
    setLoading(false);
  }, [members]);

  const itemList = members ?? [];

  const handleFeedbackSave = () => {
    toast.success("Feedback saved for this volunteer");
    setFeedbackMember(null);
    onClose?.();
  };

  const activeCommittee = committee ?? { id: "", name: "Committee", description: "No committee assigned", status: "active", leader: "Leader", memberCount: 0, eventId: "" };

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-[var(--shadow-float)]">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">My Committee</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{activeCommittee.name}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{activeCommittee.description ?? "No committee description."}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <VSStatusBadge status={activeCommittee.status} />
              <div className="rounded-full border border-border bg-background px-3 py-2 text-sm text-muted-foreground">{itemList.length} Members</div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background p-4"><p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Leader</p><p className="mt-3 text-base font-semibold text-foreground">{activeCommittee.leader}</p></div>
            <div className="rounded-2xl border border-border bg-background p-4"><p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Status</p><p className="mt-3 text-base font-semibold text-foreground">{activeCommittee.status}</p></div>
            <div className="rounded-2xl border border-border bg-background p-4"><p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Members</p><p className="mt-3 text-base font-semibold text-foreground">{itemList.length}</p></div>
          </div>
        </div>
      </div>

      <VSSectionHeader title="Committee members" description="Each volunteer below is part of your operational committee for this event." />

      {loading ? (
        <VSLoadingState message="Loading committee roster…" />
      ) : itemList.length === 0 ? (
        <VSEmptyState title="No members assigned" description="This committee does not have active volunteers yet." />
      ) : (
        <div className="grid gap-4">
          {itemList.map((member) => (
            <VSCard key={member.id} className="rounded-[1.75rem] border-border">
              <VSCardContent className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex items-center gap-4">
                    <VSAvatar name={formatMemberName(member)} src={member.avatar ?? undefined} size="default" />
                    <div>
                      <p className="text-lg font-semibold text-foreground">{formatMemberName(member)}</p>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <VSStatusBadge status={member.status} />
                    <VSStatusBadge status={member.feedbackStatus} />
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-border bg-background p-4"><p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Assignment</p><p className="mt-2 text-sm font-medium text-foreground">{member.assignedShift}</p></div>
                  <div className="rounded-2xl border border-border bg-background p-4"><p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Attendance</p><p className="mt-2 text-sm font-medium text-foreground">{member.attendance}</p></div>
                  <div className="rounded-2xl border border-border bg-background p-4"><p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Feedback</p><p className="mt-2 text-sm font-medium text-foreground">{member.feedbackStatus}</p></div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <VSButton variant="secondary" className="h-9">View</VSButton>
                  <VSButton className="h-9" onClick={() => setFeedbackMember(member)}>Add feedback</VSButton>
                </div>
              </VSCardContent>
            </VSCard>
          ))}
        </div>
      )}

      {feedbackMember && (
        <VSModal open onOpenChange={() => setFeedbackMember(null)}>
          <VSModalContent className="max-w-2xl">
            <VSModalHeader><VSModalTitle>Feedback for {formatMemberName(feedbackMember)}</VSModalTitle></VSModalHeader>
            <div className="p-4"><FeedbackForm onSaved={handleFeedbackSave} /></div>
            <VSModalFooter><VSButton variant="secondary" onClick={() => setFeedbackMember(null)}>Cancel</VSButton></VSModalFooter>
          </VSModalContent>
        </VSModal>
      )}
    </div>
  );
}
