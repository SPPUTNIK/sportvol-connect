import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { Reveal } from "./motion";
import { useI18n } from "@/lib/i18n";

export function Stories() {
  const { t } = useI18n();
  const stories = t.stories.items;
  const [i, setI] = useState(0);
  const go = (d: number) => setI((v) => (v + d + stories.length) % stories.length);
  const s = stories[i];

  return (
    <section id="stories" className="bg-sand/60 py-24 lg:py-32">
      <div className="shell grid gap-14 lg:grid-cols-[0.6fr_1.4fr] lg:gap-20">
        <div>
          <Reveal>
            <p className="eyebrow">{t.stories.eyebrow}</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="display-md mt-6 text-foreground">
              {t.stories.titleLines[0]}
              <br />
              {t.stories.titleLines[1]}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10 flex items-center gap-3">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label={t.stories.prev}
                className="flex size-11 items-center justify-center rounded-full border border-border bg-background text-foreground transition-transform duration-500 hover:-translate-y-0.5"
              >
                <ArrowLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label={t.stories.next}
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
                    <span className="block text-sm font-semibold text-foreground">{s.name}</span>
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
