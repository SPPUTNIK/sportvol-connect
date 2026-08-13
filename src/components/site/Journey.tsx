import { ArrowRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "./motion";
import { useI18n } from "@/lib/i18n";
import { Link } from "@tanstack/react-router";

export function Journey() {
  const { t } = useI18n();
  const steps = t.journey.steps.map((s2, i) => ({ ...s2, n: `0${i + 1}` }));
  return (
    <section id="journey" className="bg-background/70 py-24 lg:py-32">
      <div className="shell grid gap-16 lg:grid-cols-[0.7fr_1.3fr]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Reveal>
            <p className="eyebrow">{t.journey.eyebrow}</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="display-md mt-6 text-foreground">
              {t.journey.titleLines[0]}
              <br />
              {t.journey.titleLines[1]}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t.journey.body}
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <Link
              to="/register"
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-ink-foreground transition-transform duration-500 hover:-translate-y-0.5"
            >
              {t.journey.cta}
              <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        <Stagger className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 xl:grid-cols-3">
          {steps.map((s) => (
            <StaggerItem
              key={s.n}
              className="group bg-background p-8 transition-colors duration-500 hover:bg-sand"
            >
              <span className="font-mono text-xs tracking-[0.2em] text-primary">{s.n}</span>
              <h3 className="mt-6 font-display text-lg font-semibold tracking-tight text-foreground">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
