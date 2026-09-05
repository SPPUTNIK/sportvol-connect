import React, { useState } from "react";
import { VSInput, VSTextarea, VSButton } from "@/components/design-system";
import committeeService from "@/services/admin/committeeService";
import type { Committee } from "@/types/domain";

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
  const [description, setDescription] = useState(initial?.description ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      if (initial?.id) {
        await committeeService.updateCommittee(initial.id, { name, description });
      } else {
        if (!eventId && !initial?.eventId) throw new Error("eventId is required");
        await committeeService.createCommittee({
          name,
          description,
          eventId: eventId ?? initial?.eventId ?? "",
        });
      }
      onSaved?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-muted-foreground">Name</label>
        <VSInput value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-muted-foreground">Description</label>
        <VSTextarea value={description ?? ""} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="flex justify-end">
        <VSButton onClick={handleSave} disabled={saving || name.trim() === ""}>
          {saving ? "Saving…" : "Save"}
        </VSButton>
      </div>
    </div>
  );
}
