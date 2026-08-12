import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-900 border border-yellow-200",
  accepted: "bg-emerald-500/10 text-emerald-900 border border-emerald-200",
  rejected: "bg-destructive/10 text-destructive hover:text-destructive-foreground border border-destructive/20",
  waitlisted: "bg-slate-500/10 text-slate-900 border border-slate-200",
  withdrawn: "bg-muted text-muted-foreground border border-border",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-[0.75rem] font-semibold", statusStyles[status] ?? "bg-muted text-muted-foreground border border-border")}> 
      {status.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
    </span>
  );
}
