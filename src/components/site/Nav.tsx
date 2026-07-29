import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, X, Activity } from "lucide-react";

const links = [
  { label: "Mission", href: "#mission" },
  { label: "Events", href: "#events" },
  { label: "Journey", href: "#journey" },
  { label: "Stories", href: "#stories" },
  { label: "FAQ", href: "#faq" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

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
          <a href="#top" className="flex items-center gap-2.5 text-ink-foreground">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Activity className="size-5" strokeWidth={2.4} />
            </span>
            <span className="leading-none">
              <span className="block font-display text-[1.05rem] font-semibold tracking-tight">
                SportVol
              </span>
              <span className="block font-mono text-[0.6rem] uppercase tracking-[0.28em] text-ink-foreground/55">
                Morocco
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
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-primary transition-all duration-500 group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#cta"
              className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform duration-500 hover:-translate-y-0.5 sm:inline-flex"
            >
              Join now
            </a>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
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
          </div>
        </div>
      )}
    </motion.header>
  );
}
