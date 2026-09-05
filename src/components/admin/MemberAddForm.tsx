import React, { useEffect, useState } from "react";
import { VSInput, VSButton, VSSelect } from "@/components/design-system";
import { profileService } from "@/services/shared/profileService";
import { eventService } from "@/services/shared/eventService";
import type { EventRole } from "@/lib/types";
import committeeService from "@/services/admin/committeeService";

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
  const [results, setResults] = useState<
    Array<{
      id: string;
      first_name: string | null;
      last_name: string | null;
      avatar_url: string | null;
    }>
  >([]);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [roles, setRoles] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const ev = await eventService.getEventById(eventId);
      const rawRoles: EventRole[] = ev?.event_roles ?? [];
      setRoles(rawRoles.map((r) => ({ id: r.id, name: r.name })));
    })();
  }, [eventId]);

  async function doSearch() {
    if (!query.trim()) return setResults([]);
    const res = await profileService.searchProfiles(query.trim());
    setResults(res);
  }

  async function handleAdd() {
    if (!selectedProfile) return;
    setSaving(true);
    try {
      await committeeService.addMember(committeeId, selectedProfile, selectedRole ?? undefined);
      onSaved?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-muted-foreground">Search volunteer</label>
        <div className="flex gap-2">
          <VSInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name or email"
          />
          <VSButton onClick={doSearch}>Search</VSButton>
        </div>
        <div className="mt-2 space-y-2">
          {results.map((r) => (
            <div
              key={r.id}
              className={`p-2 rounded border ${selectedProfile === r.id ? "border-primary" : "border-transparent"}`}
              onClick={() => setSelectedProfile(r.id)}
            >
              <div className="text-sm font-medium">
                {r.first_name ?? ""} {r.last_name ?? ""}{" "}
                <span className="text-xs text-muted-foreground">{r.id}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-muted-foreground">Assign role</label>
        <select
          value={selectedRole ?? ""}
          onChange={(e) => setSelectedRole(e.target.value || null)}
          className="border rounded px-2 py-1"
        >
          <option value="">(no role)</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-2">
        <VSButton variant="ghost" onClick={onCancel}>
          Cancel
        </VSButton>
        <VSButton onClick={handleAdd} disabled={saving || !selectedProfile}>
          {saving ? "Adding…" : "Add member"}
        </VSButton>
      </div>
    </div>
  );
}
