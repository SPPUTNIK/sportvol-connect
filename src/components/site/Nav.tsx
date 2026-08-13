import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";
import logoAsset from "@/assets/volunsport-logo.png";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  const links = [
    { label: t.nav.mission, href: "#mission" },
    { label: t.nav.events, href: "#events" },
    { label: t.nav.journey, href: "#journey" },
    { label: t.nav.stories, href: "#stories" },
    { label: t.nav.faq, href: "#faq" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        className={`transition-all duration-700 ${
          scrolled
            ? "border-b border-hairline-invert bg-ink/80 backdrop-blur-xl"
            : "border-b border-transparent"
        }`}
      >
        <nav className="shell flex h-20 items-center justify-between">
          <a href="#top" className="flex items-center gap-3 text-ink-foreground">
            <img
              src={logoAsset}
              alt="VolunSport Morocco logo"
              width={180}
              height={100}
              className="h-16 w-auto"
            />
            <span className="leading-none">
              <span className="block font-display text-[1.05rem] font-semibold tracking-tight">
                VolunSport
              </span>
              <span className="block font-mono text-[0.6rem] uppercase tracking-[0.28em] text-ink-foreground/55">
                {t.nav.tagline}
              </span>
            </span>
          </a>

          <div className="hidden items-center gap-9 lg:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="group relative text-sm font-medium text-ink-foreground/70 transition-colors hover:text-ink-foreground"
              >
                {l.label}
                <span className="absolute -bottom-1.5 start-0 h-px w-0 bg-primary transition-all duration-500 group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            <Link
              to="/register"
              className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform duration-500 hover:-translate-y-0.5 sm:inline-flex"
            >
              {t.nav.join}
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={t.nav.menu}
              className="flex size-10 items-center justify-center rounded-full border border-hairline-invert text-ink-foreground lg:hidden"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>
      </div>

      {open && (
        <div className="border-b border-hairline-invert bg-ink/95 backdrop-blur-xl lg:hidden">
          <div className="shell flex flex-col gap-1 py-6">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-3 font-display text-2xl text-ink-foreground/80"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-4 flex flex-col gap-4 sm:hidden">
              <LanguageSwitcher />
              <Link
                to="/register"
                className="w-fit rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                {t.nav.join}
              </Link>
            </div>
          </div>
        </div>
      )}
    </motion.header>
  );
}
