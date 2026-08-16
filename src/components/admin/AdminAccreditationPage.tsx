import {
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Plus,
  Search,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

import { AdminLayout } from "@/components/layouts/AdminLayout";
import {
  VSButton,
  VSCard,
  VSCardContent,
  VSInput,
  VSPageHeader,
} from "@/components/design-system";

import { adminService } from "@/services/adminService";

function StatusIcon({
  status,
}: {
  status: string;
}) {
  if (status === "Approved") {
    return <CheckCircle2 className="h-4 w-4" />;
  }

  if (status === "Rejected") {
    return <XCircle className="h-4 w-4" />;
  }

  return <Clock3 className="h-4 w-4" />;
}

export function AdminAccreditationPage() {
  const [query, setQuery] = useState("");

  const accreditations = adminService.getAccreditations();

  const rows = useMemo(() => {
    const normalized = query.toLowerCase().trim();

    if (!normalized) {
      return accreditations;
    }

    return accreditations.filter((item) =>
      [
        item.volunteer,
        item.event,
        item.role,
        item.badge,
        item.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [accreditations, query]);

  return (
    <AdminLayout title="Accreditation" eyebrow="Operations">
      <div className="mx-auto max-w-7xl">
        <VSPageHeader
          eyebrow="Operations"
          title="Volunteer accreditation"
          description="Review volunteer accreditation requests and event access badges."
          action={
            <VSButton>
              <Plus className="h-4 w-4" />
              New accreditation
            </VSButton>
          }
        />

        <div className="mt-8 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <VSInput
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search volunteers, events, or badge IDs"
              className="pl-11"
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {rows.map((item) => (
            <VSCard
              key={item.id}
              className="rounded-[1.75rem] border-border"
            >
              <VSCardContent className="p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <BadgeCheck className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="font-semibold">
                        {item.volunteer}
                      </h2>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.event} · {item.role}
                      </p>

                      <p className="mt-2 text-xs text-muted-foreground">
                        Badge ID:{" "}
                        <span className="font-medium text-foreground">
                          {item.badge}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium">
                      <StatusIcon status={item.status} />
                      {item.status}
                    </span>

                    <VSButton
                      variant="outline"
                      size="sm"
                    >
                      Review
                    </VSButton>
                  </div>
                </div>
              </VSCardContent>
            </VSCard>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}