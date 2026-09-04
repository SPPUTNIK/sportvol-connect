import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { VSPageHeader, VSCard, VSCardContent, VSButton, VSLoadingState, VSEmptyState, VSModal, VSModalContent, VSModalHeader, VSModalTitle, VSModalFooter } from "@/components/design-system";
import committeeService from "@/services/committeeService";
import type { Committee } from "@/types/domain";
import LeaderCommitteeDetails from "@/components/leader/LeaderCommitteeDetails";

export const Route = createFileRoute("/my/committees")({
  component: MyLedCommitteesRoute,
});

function MyLedCommitteesRoute() {
  const [committees, setCommittees] = useState<Committee[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Committee | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await committeeService.listLedCommittees();
        if (mounted) setCommittees(data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <VSPageHeader title="My Committees" description="Committees you lead" />

      {loading && <VSLoadingState message="Loading committees…" />}

      {!loading && committees && committees.length === 0 && <VSEmptyState title="No committees" description="You don't lead any committees." />}

      <div className="grid gap-4 md:grid-cols-2">
        {committees?.map((c) => (
          <VSCard key={c.id} className="p-4">
            <VSCardContent>
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-lg font-medium">{c.name}</div>
                  <div className="text-sm text-muted-foreground">{c.description}</div>
                </div>
                <div className="flex gap-2">
                  <VSButton onClick={() => setSelected(c)}>Open</VSButton>
                </div>
              </div>
            </VSCardContent>
          </VSCard>
        ))}
      </div>

      {selected && (
        <LeaderCommitteeDetails committee={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

export default MyLedCommitteesRoute;
