import React, { useEffect, useState } from "react";
import { VSModal, VSModalContent, VSModalHeader, VSModalTitle, VSModalFooter, VSCard, VSCardContent, VSSectionHeader, VSButton, VSLoadingState, VSEmptyState } from "@/components/design-system";
import type { Committee, CommitteeMember } from "@/types/domain";
import committeeService from "@/services/committeeService";
import FeedbackForm from "./FeedbackForm";

export default function LeaderCommitteeDetails({ committee, onClose }: { committee: Committee; onClose: () => void }) {
  const [members, setMembers] = useState<Array<{ member: CommitteeMember; profile: { id: string; first_name: string | null; last_name: string | null; avatar_url: string | null }; eventRoleId: string | null }> | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackMember, setFeedbackMember] = useState<{ profileId: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const m = await committeeService.listMembersDetailed(committee.id);
        if (mounted) setMembers(m.map((x) => ({ member: x.member, profile: x.profile, eventRoleId: x.eventRoleId })));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [committee.id]);

  return (
    <VSModal open onOpenChange={onClose}>
      <VSModalContent>
        <VSModalHeader>
          <VSModalTitle>{committee.name}</VSModalTitle>
        </VSModalHeader>
        <div className="p-4 space-y-6">
          <div>
            <p className="text-sm text-muted-foreground">{committee.description}</p>
          </div>

          <VSSectionHeader title="Members" description={`${members?.length ?? 0} members`} />

          {loading && <VSLoadingState message="Loading members…" />}
          {!loading && members && members.length === 0 && <VSEmptyState title="No members" description="No members assigned." />}

          <div className="grid gap-3">
            {members?.map((m) => (
              <VSCard key={m.member.id} className="p-3">
                <VSCardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{m.profile.first_name ?? ""} {m.profile.last_name ?? ""}</div>
                      <div className="text-xs text-muted-foreground">Role: {m.eventRoleId ?? "(none)"}</div>
                    </div>
                    <div className="flex gap-2">
                      <VSButton onClick={() => setFeedbackMember({ profileId: m.profile.id })}>Add feedback</VSButton>
                    </div>
                  </div>
                </VSCardContent>
              </VSCard>
            ))}
          </div>
        </div>
        <VSModalFooter>
          <VSButton onClick={onClose}>Close</VSButton>
        </VSModalFooter>
      </VSModalContent>

      {feedbackMember && (
        <VSModal open onOpenChange={() => setFeedbackMember(null)}>
          <VSModalContent>
            <VSModalHeader>
              <VSModalTitle>Feedback for member</VSModalTitle>
            </VSModalHeader>
            <div className="p-4">
              <FeedbackForm committeeId={committee.id} eventId={committee.eventId} memberProfileId={feedbackMember.profileId} leaderProfileId={committee.leaderProfileId ?? ""} onSaved={async () => { setFeedbackMember(null); }} />
            </div>
            <VSModalFooter />
          </VSModalContent>
        </VSModal>
      )}
    </VSModal>
  );
}
