import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import missionImg from "@/assets/mission.jpg";
import { Reveal } from "./motion";
import { useI18n } from "@/lib/i18n";

export function Mission() {
  const { t } = useI18n();
  const points = t.mission.points;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section id="mission" ref={ref} className="relative bg-background/60 py-24 lg:py-36">
      <div className="shell grid items-center gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div>
          <Reveal>
            <p className="eyebrow">{t.mission.eyebrow}</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="display-lg mt-6 text-foreground">
              {t.mission.titleLines[0]}
              <br />
              {t.mission.titleLines[1]}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-7 max-w-md text-base leading-relaxed text-muted-foreground">
              {t.mission.body}
            </p>
          </Reveal>

          <ul className="mt-9 space-y-4">
            {points.map((p, i) => (
              <Reveal as="li" key={p} delay={0.14 + i * 0.06}>
                <span className="flex items-start gap-3 text-sm text-foreground/80">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  {p}
                </span>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={0.35}>
            <a
              href="#journey"
              className="group mt-10 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-ink-foreground transition-transform duration-500 hover:-translate-y-0.5"
            >
              {t.mission.cta}
              <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="relative">
          <div className="media-zoom relative aspect-[5/4] overflow-hidden rounded-[1.75rem]">
            <motion.img
              style={{ y }}
              src={missionImg}
              alt="Volunteers celebrating together on a pitch at golden hour"
              loading="lazy"
              width={1408}
              height={1008}
              className="size-full scale-110 object-cover"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="glass-light absolute -bottom-8 -left-4 w-[16rem] rounded-2xl p-5 shadow-[var(--shadow-float)] sm:left-8"
          >
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
              {t.mission.cardLabel}
            </p>
            <p className="mt-2 font-display text-4xl font-semibold tracking-tight text-foreground">
              95,400
            </p>
            <div className="mt-4 h-10 w-full">
              <svg viewBox="0 0 200 40" className="size-full" preserveAspectRatio="none">
                <path
                  d="M0 34 L28 30 L56 32 L84 22 L112 25 L140 14 L168 16 L200 4"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="mt-1 text-xs font-medium text-primary">
              +36% <span className="text-muted-foreground">{t.mission.cardDelta}</span>
            </p>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
