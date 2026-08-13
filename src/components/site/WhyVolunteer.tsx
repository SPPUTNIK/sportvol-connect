import { Award, Compass, HeartHandshake, Sparkles, TrendingUp, Users } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "./motion";
import { useI18n } from "@/lib/i18n";

const icons = [Compass, Users, Sparkles, Award, HeartHandshake, TrendingUp];

export function WhyVolunteer() {
  const { t } = useI18n();
  const benefits = t.why.items.map((b, i) => ({ ...b, icon: icons[i] }));
  return (
    <section className="relative bg-sand/70 py-24 lg:py-32">
      <div className="shell">
        <div className="max-w-3xl">
          <Reveal>
            <p className="eyebrow">{t.why.eyebrow}</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="display-lg mt-6 text-foreground">
              {t.why.titleLine}
              <br />
              <span className="text-muted-foreground">{t.why.titleSub}</span>
            </h2>
          </Reveal>
        </div>

        <Stagger className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => (
            <StaggerItem
              key={b.title}
              className="group relative bg-background p-8 transition-colors duration-500 hover:bg-card lg:p-10"
            >
              <span className="absolute right-8 top-8 font-mono text-[0.65rem] text-muted-foreground/50">
                0{i + 1}
              </span>
              <span className="flex size-12 items-center justify-center rounded-xl bg-primary/12 text-primary transition-transform duration-500 group-hover:-translate-y-1">
                <b.icon className="size-5" strokeWidth={1.9} />
              </span>
              <h3 className="mt-7 font-display text-xl font-semibold tracking-tight text-foreground">
                {b.title}
              </h3>
              <p className="mt-3 max-w-[22rem] text-sm leading-relaxed text-muted-foreground">
                {b.body}
              </p>
              <span className="mt-8 block h-px w-0 bg-primary transition-all duration-700 group-hover:w-16" />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
