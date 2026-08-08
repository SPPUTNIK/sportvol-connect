import { ArrowRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "./motion";

const steps = [
  { n: "01", title: "Register", body: "Create your free profile in under two minutes." },
  { n: "02", title: "Profile", body: "Tell us your skills, languages and city." },
  { n: "03", title: "Training", body: "Short online modules per event discipline." },
  { n: "04", title: "Apply", body: "Pick events that match your availability." },
  { n: "05", title: "Volunteer", body: "Show up, get briefed, run your zone." },
  { n: "06", title: "Certify", body: "Verified hours and a signed certificate." },
];

export function Journey() {
  return (
    <section id="journey" className="bg-background/60 py-24 lg:py-32">
      <div className="shell grid gap-16 lg:grid-cols-[0.7fr_1.3fr]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Reveal>
            <p className="eyebrow">Volunteer journey</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="display-md mt-6 text-foreground">
              Your journey
              <br />
              starts here.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Six steps between curiosity and standing on the start line with a crew
              that counts on you.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <a
              href="#cta"
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-ink-foreground transition-transform duration-500 hover:-translate-y-0.5"
            >
              Join the community
              <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
            </a>
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
