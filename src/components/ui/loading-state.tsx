export function LoadingState({ message }: { message?: string }) {
  return (
    <div className="rounded-3xl border border-border bg-background p-10 text-center">
      <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      <p className="text-sm text-muted-foreground">{message ?? "Loading…"}</p>
    </div>
  );
}
