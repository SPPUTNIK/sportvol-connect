import { useMemo, useState } from "react";
import {
  Edit3,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";

import { AdminLayout } from "@/components/layouts/AdminLayout";
import {
  VSButton,
  VSCard,
  VSCardContent,
  VSInput,
  VSPageHeader,
} from "@/components/design-system";

import { adminService } from "@/services/adminService";

export function AdminRolesPage() {
  const [query, setQuery] = useState("");

  const roles = adminService.getRoles();

  const filteredRoles = useMemo(() => {
    const normalized = query.toLowerCase().trim();

    if (!normalized) {
      return roles;
    }

    return roles.filter((role) =>
      `${role.name} ${role.event} ${role.description}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [roles, query]);

  return (
    <AdminLayout title="Roles" eyebrow="Event management">
      <div className="mx-auto max-w-7xl">
        <VSPageHeader
          eyebrow="Event management"
          title="Volunteer roles"
          description="Define the roles volunteers can take during sporting events."
          action={
            <VSButton>
              <Plus className="h-4 w-4" />
              Create role
            </VSButton>
          }
        />

        <div className="mt-8">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <VSInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search roles or events"
              className="pl-11"
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {filteredRoles.map((role) => (
            <VSCard
              key={role.id}
              className="rounded-[1.75rem] border-border"
            >
              <VSCardContent className="p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <ShieldCheck className="h-5 w-5" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-semibold">
                          {role.name}
                        </h2>

                        <span
                          className={
                            role.status === "Full"
                              ? "rounded-full bg-muted px-3 py-1 text-xs font-medium"
                              : "rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                          }
                        >
                          {role.status}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-primary">
                        {role.event}
                      </p>

                      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                        {role.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        Volunteers
                      </p>

                      <div className="mt-1 flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />

                        <span className="font-semibold">
                          {role.volunteers}/{role.required}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <VSButton variant="outline" size="sm">
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </VSButton>

                      <VSButton
                        variant="outline"
                        size="sm"
                        aria-label={`Delete ${role.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </VSButton>
                    </div>
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