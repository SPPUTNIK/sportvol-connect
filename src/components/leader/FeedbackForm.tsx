import { useState } from "react";
import { toast } from "sonner";

import { VSButton, VSTextarea } from "@/components/design-system";
import { leaderService } from "@/services/leader/leaderService";

export default function FeedbackForm({
  committeeId,
  eventId,
  memberProfileId,
  onSaved,
}: {
  committeeId?: string;
  eventId?: string;
  memberProfileId?: string;
  onSaved?: () => void;
}) {
  const [punctuality, setPunctuality] = useState(0);
  const [teamwork, setTeamwork] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [responsibility, setResponsibility] = useState(0);
  const [overall, setOverall] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (overall < 1) {
      toast.error(
        "Please select an overall rating",
      );
      return;
    }

    if (
      !committeeId ||
      !eventId ||
      !memberProfileId
    ) {
      toast.error(
        "Missing feedback information",
      );
      return;
    }

    setSubmitting(true);

    try {
      await leaderService.submitCommitteeFeedback({
        committeeId,
        eventId,
        memberProfileId,

        punctuality,
        teamwork,
        communication,
        responsibility,

        overallRating:
          overall,

        comment,
      });

      toast.success(
        "Feedback submitted successfully",
      );

      onSaved?.();
    } catch (error) {
      console.error(
        "Feedback submission failed:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit feedback",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function RatingProgress({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
  }) {
    const percentage = (value / 5) * 100;

    return (
      <div className="w-full min-w-0 space-y-2.5">
        <div className="flex items-center justify-between gap-3">
          <label className="min-w-0 truncate text-sm font-semibold text-foreground">
            {label}
          </label>

          <span
            className={`shrink-0 text-sm font-bold ${
              value === 0
                ? "text-muted-foreground"
                : "text-primary"
            }`}
          >
            {value}/5
          </span>
        </div>

        <div className="relative h-3 w-full touch-none">
          <div className="absolute inset-0 rounded-full bg-muted" />

          <div
            className="absolute left-0 top-0 h-3 rounded-full bg-primary transition-[width] duration-200"
            style={{ width: `${percentage}%` }}
          />

          <input
            type="range"
            min="0"
            max="5"
            step="1"
            value={value}
            onChange={(event) =>
              onChange(Number(event.target.value))
            }
            className="absolute inset-0 h-3 w-full cursor-pointer opacity-0"
            aria-label={`${label} rating`}
          />

          <div
            className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-primary bg-background shadow-sm transition-[left] duration-200"
            style={{
              left: `calc(${percentage}% - 10px)`,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 sm:space-y-6">
      {/* Performance */}
      <div className="w-full rounded-2xl border border-border bg-background p-4 sm:p-5 lg:p-6">
        <div className="mb-5 sm:mb-6">
          <h3 className="text-base font-semibold text-foreground sm:text-lg">
            Performance evaluation
          </h3>

          <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
            Rate the volunteer from 1 to 5.
          </p>
        </div>

        <div className="flex w-full flex-col gap-6 sm:gap-7">
          <RatingProgress
            label="Punctuality"
            value={punctuality}
            onChange={setPunctuality}
          />

          <RatingProgress
            label="Teamwork"
            value={teamwork}
            onChange={setTeamwork}
          />

          <RatingProgress
            label="Communication"
            value={communication}
            onChange={setCommunication}
          />

          <RatingProgress
            label="Responsibility"
            value={responsibility}
            onChange={setResponsibility}
          />
        </div>
      </div>

      {/* Overall */}
      <div className="w-full rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5 lg:p-6">
        <div className="mb-5 sm:mb-6">
          <h3 className="text-base font-semibold text-foreground sm:text-lg">
            Overall rating
          </h3>

          <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
            Give an overall performance rating.
          </p>
        </div>

        <RatingProgress
          label="Overall performance"
          value={overall}
          onChange={setOverall}
        />
      </div>

      {/* Comments */}
      <div className="w-full rounded-2xl border border-border bg-background p-4 sm:p-5 lg:p-6">
        <div className="mb-3">
          <label className="text-sm font-semibold text-foreground sm:text-base">
            Comments
          </label>

          <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
            Add any notes or feedback about the volunteer.
          </p>
        </div>

        <VSTextarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Write your feedback here..."
          className="min-h-28 w-full resize-none rounded-xl sm:min-h-32 sm:rounded-2xl"
        />

        <p className="mt-2 text-[11px] text-muted-foreground sm:text-xs">
          Optional
        </p>
      </div>

      {/* Submit */}
      <div className="flex w-full flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-end sm:pt-5">
        <VSButton
          onClick={handleSubmit}
          disabled={submitting || overall === 0}
          className="w-full sm:w-auto sm:min-w-36"
        >
          {submitting ? "Submitting…" : "Submit feedback"}
        </VSButton>
      </div>
    </div>
  );
}