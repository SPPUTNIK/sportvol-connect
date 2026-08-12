import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Play } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Link } from "@tanstack/react-router";


export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { t, dir } = useI18n();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1.18]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const stats = t.hero.stats;


  return (
    <section ref={ref} id="top" className="relative min-h-svh overflow-hidden bg-ink">
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <img
          src={heroImg}
          alt="Volunteers handing water to marathon runners at sunset in Morocco"
          width={1920}
          height={1088}
          className="size-full object-cover"
        />
      </motion.div>
      <div
        className="absolute inset-0"
        style={{ backgroundImage: "var(--gradient-veil)" }}
        aria-hidden
      />
      
      <div className="absolute inset-0 zellij-tile opacity-[7%] mix-blend-screen" aria-hidden />
      <div className="absolute inset-0 hairline-grid opacity-25" aria-hidden />


      <motion.div
        style={{ opacity: fade }}
        className="relative z-10 flex min-h-svh flex-col justify-end pb-14 pt-32"
      >
        <div className="shell">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 flex lg:hidden"
          >
            <LanguageSwitcher />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="eyebrow"
          >
            <span className="size-1.5 rounded-full bg-primary" />
            {t.hero.eyebrow}
          </motion.p>

          <h1 className="display-xl mt-6 max-w-5xl text-ink-foreground">
            {t.hero.titleLines.map((line, i) => (
              <span key={line} className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{
                    delay: 0.45 + i * 0.1,
                    duration: 1.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
            <span className="block overflow-hidden">
              <motion.span
                className="block text-gradient-accent"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ delay: 0.65, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              >
                {t.hero.titleAccent}
              </motion.span>
            </span>
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"
          >
            <p className="max-w-md text-base leading-relaxed text-ink-foreground/70">
              {t.hero.lead}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-transform duration-500 hover:-translate-y-0.5"
              >
                {t.hero.ctaPrimary}
                <ArrowRight
                  className={`size-4 transition-transform duration-500 group-hover:translate-x-1 ${
                    dir === "rtl" ? "rotate-180 group-hover:-translate-x-1" : ""
                  }`}
                />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 flex flex-col gap-6 border-t border-hairline-invert pt-8 lg:flex-row lg:items-center lg:justify-between"
          >
            <dl className="grid w-full grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4 lg:max-w-3xl">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="font-display text-3xl font-semibold text-ink-foreground sm:text-4xl">
                    {s.value}
                  </dt>
                  <dd className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink-foreground/50">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>

            <a href="#mission" className="group flex shrink-0 items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-full border border-hairline-invert text-ink-foreground transition-colors duration-500 group-hover:bg-primary group-hover:text-primary-foreground">
                <Play className={`size-4 fill-current ${dir === "rtl" ? "rotate-180" : ""}`} />
              </span>
              <span className="text-start">
                <span className="block text-sm font-semibold text-ink-foreground">
                  {t.hero.watchTitle}
                </span>
                <span className="block text-xs text-ink-foreground/50">
                  {t.hero.watchSub}
                </span>
              </span>
            </a>

          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
