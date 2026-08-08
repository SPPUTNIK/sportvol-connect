import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { Reveal } from "./motion";

const stories = [
  {
    quote:
      "I signed up for one weekend at the coastal marathon and ended up leading a hydration zone of nineteen people. It rewired how I see my own city.",
    name: "Yassine El Amrani",
    role: "Volunteer since 2022 · Rabat",
  },
  {
    quote:
      "The briefing packs are better than at events I've been paid to work. Everyone knows their zone before the sun comes up.",
    name: "Salma Bennani",
    role: "Zone lead · Casablanca",
  },
  {
    quote:
      "My certified hours went straight onto my CV. Three months later I was hired by a race organizer in Marrakech.",
    name: "Omar Tazi",
    role: "Volunteer since 2023 · Marrakech",
  },
];

export function Stories() {
  const [i, setI] = useState(0);
  const go = (d: number) => setI((v) => (v + d + stories.length) % stories.length);
  const s = stories[i];

  return (
    <section id="stories" className="bg-sand/70 py-24 lg:py-32">
      <div className="shell grid gap-14 lg:grid-cols-[0.6fr_1.4fr] lg:gap-20">
        <div>
          <Reveal>
            <p className="eyebrow">Volunteer stories</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="display-md mt-6 text-foreground">
              What the crew
              <br />
              actually says.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10 flex items-center gap-3">
              <button
                onClick={() => go(-1)}
                aria-label="Previous story"
                className="flex size-11 items-center justify-center rounded-full border border-border bg-background text-foreground transition-transform duration-500 hover:-translate-y-0.5"
              >
                <ArrowLeft className="size-4" />
              </button>
              <button
                onClick={() => go(1)}
                aria-label="Next story"
                className="flex size-11 items-center justify-center rounded-full bg-ink text-ink-foreground transition-transform duration-500 hover:-translate-y-0.5"
              >
                <ArrowRight className="size-4" />
              </button>
              <span className="ml-3 font-mono text-xs text-muted-foreground">
                0{i + 1} / 0{stories.length}
              </span>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.08}>
          <div className="relative min-h-[19rem] rounded-[1.75rem] bg-background p-9 shadow-[var(--shadow-float)] lg:p-14">
            <Quote className="size-9 text-primary/25" strokeWidth={1.6} />
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={i}
                initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="mt-7"
              >
                <p className="font-display text-2xl font-medium leading-snug tracking-tight text-foreground lg:text-[2rem]">
                  {s.quote}
                </p>
                <footer className="mt-9 flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-full bg-ink font-display text-sm font-semibold text-ink-foreground">
                    {s.name
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">
                      {s.name}
                    </span>
                    <span className="block text-xs text-muted-foreground">{s.role}</span>
                  </span>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
