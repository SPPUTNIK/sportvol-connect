import { createFileRoute } from "@tanstack/react-router";
import { I18nProvider } from "@/lib/i18n";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [{ title: "About | VolunSport Morocco" }],
  }),
});

function About() {
  return (
    <I18nProvider>
      <div className="shell min-h-screen py-24">
        <div className="space-y-10 rounded-[2rem] border border-hairline-invert bg-card p-10 shadow-[var(--shadow-lift)]">
          <div>
            <p className="eyebrow">About</p>
            <h1 className="display-md text-ink-foreground">Connecting volunteers with sports event operations across Morocco.</h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              VolunSport is built to help volunteers find meaningful support roles at sporting events, track hours and earn certificates.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <article className="rounded-3xl bg-background p-6 text-sm text-muted-foreground">
              <h2 className="font-semibold text-foreground">Our mission</h2>
              <p className="mt-3">Empower volunteer communities to make every event safe, welcoming and memorable.</p>
            </article>
            <article className="rounded-3xl bg-background p-6 text-sm text-muted-foreground">
              <h2 className="font-semibold text-foreground">What we do</h2>
              <p className="mt-3">From accreditation to crowd support, we map volunteer strengths to event needs with clear roles and schedules.</p>
            </article>
            <article className="rounded-3xl bg-background p-6 text-sm text-muted-foreground">
              <h2 className="font-semibold text-foreground">Who we serve</h2>
              <p className="mt-3">Athletes, federations, clubs and cities that need reliable volunteer teams for modern sports events.</p>
            </article>
          </div>
        </div>
      </div>
    </I18nProvider>
  );
}
