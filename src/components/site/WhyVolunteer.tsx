import {
  Award,
  Compass,
  HeartHandshake,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "./motion";

const benefits = [
  {
    icon: Compass,
    title: "Leadership",
    body: "Run zones, brief crews and take real decisions under real pressure.",
  },
  {
    icon: Users,
    title: "Network",
    body: "Stand shoulder to shoulder with federations, clubs and athletes.",
  },
  {
    icon: Sparkles,
    title: "Experience",
    body: "Operations know-how you cannot get from a classroom.",
  },
  {
    icon: Award,
    title: "Certificates",
    body: "Every verified hour becomes a credential you can actually use.",
  },
  {
    icon: HeartHandshake,
    title: "Community",
    body: "A crew that reunites season after season, city after city.",
  },
  {
    icon: TrendingUp,
    title: "Career",
    body: "Direct pipeline into event management and sports-tech roles.",
  },
];

export function WhyVolunteer() {
  return (
    <section className="relative bg-sand py-24 lg:py-32">
      <div className="shell">
        <div className="max-w-3xl">
          <Reveal>
            <p className="eyebrow">Why volunteer</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="display-lg mt-6 text-foreground">
              More than volunteering.
              <br />
              <span className="text-muted-foreground">A life experience.</span>
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
