import { useState } from "react";
import {
  Save,
} from "lucide-react";

import {
  VSButton,
  VSCard,
  VSCardContent,
  VSInput,
  VSPageHeader,
  VSTextarea,
} from "@/components/design-system";

import {
  createSlug,
} from "./adminHelpers";

type EventFormState = {
  title: string;
  slug: string;
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
};

export function AdminForm({
  eyebrow,
  title,
  description,
  submitLabel,
}: AdminFormProps) {
  const [saved, setSaved] = useState(false);

  const [form, setForm] =
    useState<EventFormState>({
      title: "",
      slug: "",
      sport: "Running",
      city: "",
      country: "Morocco",
      venue: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      applicationDeadline: "",
      totalVolunteersNeeded: "0",
      description: "",
    });

  const set = <K extends keyof EventFormState>(
    key: K,
    value: EventFormState[K],
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleTitleChange = (value: string) => {
    setForm((previous) => ({
      ...previous,
      title: value,
      slug: createSlug(value),
    }));
  };

  const handleSubmit = () => {
    console.log("Event form submitted:", {
      ...form,
      totalVolunteersNeeded: Number(
        form.totalVolunteersNeeded || 0,
      ),
    });

    setSaved(true);
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
              onChange={(event) =>
                handleTitleChange(event.target.value)
              }
            />
          </label>

          <label className="block text-sm font-medium">
            Slug

            <VSInput
              className="mt-2"
              placeholder="rabat-coastal-marathon"
              value={form.slug}
              onChange={(event) =>
                set("slug", event.target.value)
              }
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Sport

              <select
                className="mt-2 h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm"
                value={form.sport}
                onChange={(event) =>
                  set("sport", event.target.value)
                }
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
                onChange={(event) =>
                  set("city", event.target.value)
                }
              />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Country

              <VSInput
                className="mt-2"
                value={form.country}
                onChange={(event) =>
                  set("country", event.target.value)
                }
              />
            </label>

            <label className="block text-sm font-medium">
              Venue

              <VSInput
                className="mt-2"
                placeholder="Mohammed V Stadium"
                value={form.venue}
                onChange={(event) =>
                  set("venue", event.target.value)
                }
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
                onChange={(event) =>
                  set(
                    "startDate",
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="block text-sm font-medium">
              End date

              <VSInput
                className="mt-2"
                type="date"
                value={form.endDate}
                onChange={(event) =>
                  set(
                    "endDate",
                    event.target.value,
                  )
                }
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
                onChange={(event) =>
                  set(
                    "startTime",
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="block text-sm font-medium">
              End time

              <VSInput
                className="mt-2"
                type="time"
                value={form.endTime}
                onChange={(event) =>
                  set(
                    "endTime",
                    event.target.value,
                  )
                }
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
                onChange={(event) =>
                  set(
                    "applicationDeadline",
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="block text-sm font-medium">
              Total volunteers needed

              <VSInput
                className="mt-2"
                type="number"
                min="0"
                value={form.totalVolunteersNeeded}
                onChange={(event) =>
                  set(
                    "totalVolunteersNeeded",
                    event.target.value,
                  )
                }
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
              onChange={(event) =>
                set(
                  "description",
                  event.target.value,
                )
              }
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <VSButton onClick={handleSubmit}>
              <Save className="h-4 w-4" />

              {saved
                ? "Saved as draft"
                : submitLabel}
            </VSButton>

            <VSButton variant="outline">
              Save and add roles
            </VSButton>
          </div>
        </VSCardContent>
      </VSCard>
    </div>
  );
}