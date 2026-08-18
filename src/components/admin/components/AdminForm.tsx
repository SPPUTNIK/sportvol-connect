import { Image, Save, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import {
  VSButton,
  VSCard,
  VSCardContent,
  VSInput,
  VSPageHeader,
  VSTextarea,
} from "@/components/design-system";

import { createSlug } from "./adminHelpers";
import { adminEventService } from "@/services/adminEventService";

type EventFormState = {
  title: string;
  slug: string;
  imageUrl: string;
  sport: string;
  city: string;
  country: string;
  venue: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  applicationDeadline: string;
  totalVolunteersNeeded: string;
  description: string;
};

type AdminFormProps = {
  eyebrow: string;
  title: string;
  description: string;
  submitLabel: string;
  eventId?: string;
  initialData?: Partial<EventFormState>;
};

export function AdminForm({
  eyebrow,
  title,
  description,
  submitLabel,
  eventId,
  initialData,
}: AdminFormProps) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [addRolesAfter, setAddRolesAfter] = useState(false);

  const [form, setForm] = useState<EventFormState>({
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    imageUrl: initialData?.imageUrl ?? "",
    sport: initialData?.sport ?? "Running",
    city: initialData?.city ?? "",
    country: initialData?.country ?? "Morocco",
    venue: initialData?.venue ?? "",
    startDate: initialData?.startDate ?? "",
    endDate: initialData?.endDate ?? "",
    startTime: initialData?.startTime ?? "",
    endTime: initialData?.endTime ?? "",
    applicationDeadline: initialData?.applicationDeadline ?? "",
    totalVolunteersNeeded: initialData?.totalVolunteersNeeded ?? "0",
    description: initialData?.description ?? "",
  });

  const set = <K extends keyof EventFormState>(
    key: K,
    value: EventFormState[K],
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
    setSaved(false);
    setError(null);
  };

  const handleTitleChange = (value: string) => {
    setForm((previous) => ({
      ...previous,
      title: value,
      slug: createSlug(value),
    }));
    setSaved(false);
    setError(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    const payload = {
      title: form.title,
      slug: form.slug,
      sport: form.sport,
      city: form.city,
      country: form.country,
      venue: form.venue,
      cover_url: form.imageUrl || null,
      description: form.description || null,
      start_date: form.startDate,
      end_date: form.endDate,
      start_time: form.startTime || null,
      end_time: form.endTime || null,
      application_deadline: form.applicationDeadline || null,
      total_volunteers_needed: Number(form.totalVolunteersNeeded || 0),
      status: "draft" as const,
    };

    if (eventId) {
      const { error } = await adminEventService.updateEvent({ id: eventId, ...payload });
      setSubmitting(false);
      if (error) {
        setError(error);
        return;
      }
      setSaved(true);
      if (addRolesAfter) {
        navigate({ to: "/admin/events/$eventId", params: { eventId } });
      }
    } else {
      const { id, error } = await adminEventService.createEvent(payload);
      setSubmitting(false);
      if (error) {
        setError(error);
        return;
      }
      setSaved(true);
      if (addRolesAfter && id) {
        navigate({ to: "/admin/events/$eventId", params: { eventId: id } });
      }
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <VSPageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
      />

      <VSCard className="mt-8 rounded-[2rem] border-border">
        <VSCardContent className="space-y-5 p-6 sm:p-8">
          <label className="block text-sm font-medium">
            Event title
            <VSInput
              className="mt-2"
              placeholder="Name the event"
              value={form.title}
              onChange={(event) => handleTitleChange(event.target.value)}
            />
          </label>

          <label className="block text-sm font-medium">
            Slug
            <VSInput
              className="mt-2"
              placeholder="rabat-coastal-marathon"
              value={form.slug}
              onChange={(event) => set("slug", event.target.value)}
            />
          </label>

          <div>
            <label className="block text-sm font-medium">
              Event image
            </label>
            <div className="mt-2 overflow-hidden rounded-[1.5rem] border border-border bg-muted/30">
              {form.imageUrl ? (
                <div className="relative">
                  <img
                    src={form.imageUrl}
                    alt={form.title || "Event preview"}
                    className="h-64 w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
                    <p className="text-sm font-medium text-white">
                      {form.title || "Event image preview"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex h-48 flex-col items-center justify-center gap-3 text-muted-foreground">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Image className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">No event image</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Add an image URL for the event cover.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <VSInput
              className="mt-3"
              type="url"
              placeholder="https://example.com/event-image.jpg"
              value={form.imageUrl}
              onChange={(event) => set("imageUrl", event.target.value)}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Recommended: landscape image, 16:9 ratio.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Sport
              <select
                className="mt-2 h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm"
                value={form.sport}
                onChange={(event) => set("sport", event.target.value)}
              >
                <option>Football</option>
                <option>Basketball</option>
                <option>Tennis</option>
                <option>Athletics</option>
                <option>Marathon</option>
                <option>Running</option>
                <option>Cycling</option>
                <option>Swimming</option>
                <option>Motorsport</option>
                <option>Other</option>
              </select>
            </label>
            <label className="block text-sm font-medium">
              City
              <VSInput
                className="mt-2"
                placeholder="Marrakech"
                value={form.city}
                onChange={(event) => set("city", event.target.value)}
              />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Country
              <VSInput
                className="mt-2"
                value={form.country}
                onChange={(event) => set("country", event.target.value)}
              />
            </label>
            <label className="block text-sm font-medium">
              Venue
              <VSInput
                className="mt-2"
                placeholder="Mohammed V Stadium"
                value={form.venue}
                onChange={(event) => set("venue", event.target.value)}
              />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Start date
              <VSInput
                className="mt-2"
                type="date"
                value={form.startDate}
                onChange={(event) => set("startDate", event.target.value)}
              />
            </label>
            <label className="block text-sm font-medium">
              End date
              <VSInput
                className="mt-2"
                type="date"
                value={form.endDate}
                onChange={(event) => set("endDate", event.target.value)}
              />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Start time
              <VSInput
                className="mt-2"
                type="time"
                value={form.startTime}
                onChange={(event) => set("startTime", event.target.value)}
              />
            </label>
            <label className="block text-sm font-medium">
              End time
              <VSInput
                className="mt-2"
                type="time"
                value={form.endTime}
                onChange={(event) => set("endTime", event.target.value)}
              />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Application deadline
              <VSInput
                className="mt-2"
                type="date"
                value={form.applicationDeadline}
                onChange={(event) => set("applicationDeadline", event.target.value)}
              />
            </label>
            <label className="block text-sm font-medium">
              Total volunteers needed
              <VSInput
                className="mt-2"
                type="number"
                min="0"
                value={form.totalVolunteersNeeded}
                onChange={(event) => set("totalVolunteersNeeded", event.target.value)}
              />
            </label>
          </div>

          <label className="block text-sm font-medium">
            Description
            <VSTextarea
              className="mt-2"
              rows={6}
              placeholder="Describe the event and the volunteer experience"
              value={form.description}
              onChange={(event) => set("description", event.target.value)}
            />
          </label>

          {error && (
            <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <VSButton onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saved ? "Saved as draft" : submitLabel}
            </VSButton>
            <VSButton
              variant="outline"
              onClick={() => {
                setAddRolesAfter(true);
                handleSubmit();
              }}
              disabled={submitting}
            >
              Save and add roles
            </VSButton>
          </div>
        </VSCardContent>
      </VSCard>
    </div>
  );
}
