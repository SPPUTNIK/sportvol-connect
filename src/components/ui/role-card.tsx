import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { EventRole } from "@/lib/types";
import { cn } from "@/lib/utils";

export function RoleCard({ role }: { role: EventRole }) {
  const remaining = role.positions - role.filled_positions;
  return (
    <Card className="border border-border">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <CardTitle>{role.name}</CardTitle>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]",
              remaining > 0
                ? "bg-emerald-500/10 text-emerald-900"
                : "bg-muted text-muted-foreground",
            )}
          >
            {remaining > 0 ? `${remaining} spots left` : "Full"}
          </span>
        </div>
        <CardDescription>{role.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="grid gap-2 text-sm text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">Responsibilities:</span>{" "}
            {role.responsibilities}
          </p>
          <p>
            <span className="font-semibold text-foreground">Requirements:</span> {role.requirements}
          </p>
          <p>
            <span className="font-semibold text-foreground">Skills:</span> {role.skills.join(", ")}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          Apply for this role
          <ArrowRight className="size-4" />
        </button>
      </CardContent>
    </Card>
  );
}
