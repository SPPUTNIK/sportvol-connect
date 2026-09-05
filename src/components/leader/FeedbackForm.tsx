import { useState } from "react";
import { toast } from "sonner";

import { VSButton, VSTextarea } from "@/components/design-system";

export default function FeedbackForm({
  onSaved,
}: {
  committeeId?: string;
  eventId?: string;
  memberProfileId?: string;
  leaderProfileId?: string;
  onSaved?: () => void;
}) {
  const [punctuality, setPunctuality] = useState(5);
  const [teamwork, setTeamwork] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [responsibility, setResponsibility] = useState(5);
  const [overall, setOverall] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (overall < 1 || overall > 5) {
      toast.error("Overall rating is required");
      return;
    }

    setSubmitting(true);

    window.setTimeout(() => {
      toast.success("Mock feedback submitted successfully");
      setSubmitting(false);
      onSaved?.();
    }, 600);
  }

  function RatingSelect({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground"
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Punctuality</label>
          <RatingSelect value={punctuality} onChange={setPunctuality} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Teamwork</label>
          <RatingSelect value={teamwork} onChange={setTeamwork} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Communication</label>
          <RatingSelect value={communication} onChange={setCommunication} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Responsibility</label>
          <RatingSelect value={responsibility} onChange={setResponsibility} />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Overall rating</label>
        <RatingSelect value={overall} onChange={setOverall} />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Comment</label>
        <VSTextarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Share a short update..."
          className="min-h-28"
        />
      </div>

      <div className="flex justify-end pt-2">
        <VSButton onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Submitting…" : "Submit feedback"}
        </VSButton>
      </div>
    </div>
  );
}
