export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-background p-10 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">{title}</p>
      <p className="mt-4 text-sm leading-relaxed text-foreground">{description}</p>
    </div>
  );
}
