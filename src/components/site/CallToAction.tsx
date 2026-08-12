import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import ctaImg from "@/assets/cta.jpg";
import { Reveal } from "./motion";
import { useI18n } from "@/lib/i18n";
import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/volunsport-logo.png";

export function CallToAction() {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section id="cta" ref={ref} className="relative overflow-hidden bg-ink">
      <motion.img
        style={{ y }}
        src={ctaImg}
        alt="Stadium track at dusk"
        loading="lazy"
        width={1920}
        height={900}
        className="absolute inset-0 size-full scale-125 object-cover opacity-45"
      />
      <div
        className="absolute inset-0"
        style={{ backgroundImage: "var(--gradient-veil)" }}
        aria-hidden
      />
      <div className="shell relative py-28 lg:py-40">
        <Reveal>
          <p className="eyebrow">{t.cta.eyebrow}</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="display-lg mt-6 max-w-3xl text-ink-foreground">
            {t.cta.titleLines[0]}
            <br />
            {t.cta.titleLines[1]}
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
            <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-sm font-semibold text-primary-foreground transition-transform duration-500 hover:-translate-y-0.5"
            >
              {t.cta.primary}
              <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const columns = t.footer.columns;

  return (
    <footer className="border-t border-hairline-invert bg-ink text-ink-foreground">
      <div className="shell grid gap-14 py-20 lg:grid-cols-[1.2fr_2fr] lg:py-24">
        <div>
          <img
            src={logoAsset}
            alt="VolunSport Morocco logo"
            width={200}
            height={112}
            loading="lazy"
            className="h-16 w-auto"
          />
          <p className="mt-4 font-display text-2xl font-semibold tracking-tight">VolunSport</p>
          <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.28em] text-ink-foreground/45">
            {t.nav.tagline}
          </p>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-ink-foreground/60">
            {t.footer.blurb}
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email) setSent(true);
            }}
            className="mt-9 max-w-sm"
          >
            <label
              htmlFor="newsletter"
              className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ink-foreground/45"
            >
              {t.footer.newsletter}
            </label>
            <div className="mt-3 flex items-center gap-2 rounded-full border border-hairline-invert bg-ink-foreground/5 p-1.5 pl-5">
              <input
                id="newsletter"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.footer.placeholder}
                className="w-full bg-transparent text-sm text-ink-foreground outline-none placeholder:text-ink-foreground/35"
              />
              <button
                type="submit"
                aria-label={t.footer.subscribe}
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-500 hover:-translate-y-0.5"
              >
                <ArrowRight className="size-4" />
              </button>
            </div>
            {sent && (
              <p className="mt-3 text-xs text-primary">{t.footer.sent}</p>
            )}
          </form>
        </div>

        <div className="grid gap-10 sm:grid-cols-3">
          {columns.map((c) => (
            <div key={c.title}>
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ink-foreground/45">
                {c.title}
              </p>
              <ul className="mt-5 space-y-3">
                {c.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#top"
                      className="text-sm text-ink-foreground/70 transition-colors hover:text-ink-foreground"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-hairline-invert">
        <div className="shell flex flex-wrap items-center justify-between gap-3 py-6 text-xs text-ink-foreground/45">
          <p>
            © {new Date().getFullYear()} VolunSport Morocco. {t.footer.rights}
          </p>
          <p>{t.footer.built}</p>
        </div>
      </div>
    </footer>
  );
}
