import React, { useState } from "react";
import { VSButton, VSInput, VSTextarea } from "@/components/design-system";
import committeeService from "@/services/committeeService";
import { toast } from "sonner";

export default function FeedbackForm({ committeeId, eventId, memberProfileId, leaderProfileId, onSaved }: { committeeId: string; eventId: string; memberProfileId: string; leaderProfileId: string; onSaved?: () => void }) {
  const [punctuality, setPunctuality] = useState(5);
  const [teamwork, setTeamwork] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [responsibility, setResponsibility] = useState(5);
  const [overall, setOverall] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function getErrorMessage(err: unknown) {
    if (err instanceof Error) return err.message;
    return String(err);
  }

  async function handleSubmit() {
    // basic validation
    if (overall < 1 || overall > 5) return toast.error("Overall rating required");
    setSubmitting(true);
    try {
      await committeeService.addFeedback(committeeId, eventId, memberProfileId, leaderProfileId, { punctuality, teamwork, communication, responsibility, overall_rating: overall }, comment || undefined);
      toast.success("Feedback submitted");
      onSaved?.();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  }

  function RatingSelect({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
      <select value={value} onChange={(e) => onChange(Number(e.target.value))} className="border rounded px-2 py-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm">Punctuality</label>
          <RatingSelect value={punctuality} onChange={setPunctuality} />
        </div>
        <div>
          <label className="block text-sm">Teamwork</label>
          <RatingSelect value={teamwork} onChange={setTeamwork} />
        </div>
        <div>
          <label className="block text-sm">Communication</label>
          <RatingSelect value={communication} onChange={setCommunication} />
        </div>
        <div>
          <label className="block text-sm">Responsibility</label>
          <RatingSelect value={responsibility} onChange={setResponsibility} />
        </div>
      </div>

      <div>
        <label className="block text-sm">Overall rating</label>
        <RatingSelect value={overall} onChange={setOverall} />
      </div>

      <div>
        <label className="block text-sm">Comment</label>
        <VSTextarea value={comment} onChange={(e) => setComment(e.target.value)} />
      </div>

      <div className="flex justify-end">
        <VSButton onClick={handleSubmit} disabled={submitting}>{submitting ? "Submitting…" : "Submit feedback"}</VSButton>
      </div>
    </div>
  );
}
