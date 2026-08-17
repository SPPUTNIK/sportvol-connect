import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Menu, X, ArrowRight } from "lucide-react";

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
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    const onResize = () => {
      if (window.innerWidth >= 1024) {
        setOpen(false);
      }
    };

    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.2,
      }}
      className="fixed inset-x-0 top-0 z-50"
    >
      {/* ======================================================
          NAV BAR
      ====================================================== */}
      <div
        className={`transition-all duration-500 ${
          scrolled
            ? "border-b border-hairline-invert/60 bg-ink/85 shadow-[0_8px_40px_rgba(0,0,0,0.12)] backdrop-blur-2xl"
            : "border-b border-transparent bg-ink/70 backdrop-blur-md"
        }`}
      >
        <nav
          aria-label="Main navigation"
          className="shell relative flex h-[4.5rem] items-center justify-between gap-4 sm:h-20"
        >
          {/* Mobile logo — centered */}
          <Link
            to="/"
            aria-label="VolunSport Morocco home"
            onClick={closeMenu}
            className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 sm:hidden"
          >
            <img
              src={logoAsset}
              alt="VolunSport Morocco"
              width={180}
              height={100}
              className="h-11 w-auto object-contain"
            />
          </Link>

          {/* Desktop / tablet logo */}
          <Link
            to="/"
            aria-label="VolunSport Morocco home"
            onClick={closeMenu}
            className="hidden shrink-0 items-center gap-3 sm:flex"
          >
            <img
              src={logoAsset}
              alt="VolunSport Morocco"
              width={180}
              height={100}
              className="h-14 w-auto object-contain lg:h-16"
            />

            <span className="leading-none">
              <span className="block font-display text-sm font-semibold tracking-tight text-primary lg:text-[1.05rem]">
                VolunSport
              </span>

              <span className="mt-1 block font-mono text-[0.48rem] uppercase tracking-[0.2em] text-ink-foreground/50 lg:text-[0.6rem]">
                {t.nav.tagline}
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden flex-1 items-center justify-center lg:flex">
            <div className="flex items-center gap-5 xl:gap-8 2xl:gap-10">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="group relative whitespace-nowrap px-1 py-2 text-[0.8rem] font-medium text-ink-foreground/65 transition-colors duration-300 hover:text-ink-foreground xl:text-sm"
                >
                  {link.label}

                  <span className="absolute inset-x-1 bottom-0 h-px origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
                </a>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>

            <Link
              to="/register"
              className="hidden items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg md:inline-flex lg:px-5 lg:text-sm"
            >
              {t.nav.join}
              <ArrowRight className="size-3.5 lg:size-4" />
            </Link>

            {/* Mobile menu */}
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? "Close menu" : t.nav.menu}
              aria-expanded={open}
              aria-controls="mobile-navigation"
              className="flex size-10 items-center justify-center rounded-full border border-hairline-invert/70 bg-white/[0.03] text-ink-foreground transition-all duration-300 hover:border-primary/60 hover:bg-white/[0.06] sm:size-11 lg:hidden"
            >
              {open ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* ======================================================
          MOBILE MENU
      ====================================================== */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.button
              type="button"
              aria-label="Close navigation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMenu}
              className="fixed inset-0 top-[4.5rem] -z-10 bg-black/40 backdrop-blur-sm sm:top-20 lg:hidden"
            />

            {/* Menu */}
            <motion.div
              id="mobile-navigation"
              initial={{
                opacity: 0,
                y: -12,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: -12,
                scale: 0.98,
              }}
              transition={{
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="border-b border-hairline-invert/60 bg-ink/95 shadow-2xl backdrop-blur-2xl lg:hidden"
            >
              <div className="shell max-h-[calc(100vh-4.5rem)] overflow-y-auto py-5 sm:max-h-[calc(100vh-5rem)] sm:py-7">
                {/* Links */}
                <div className="divide-y divide-hairline-invert/30">
                  {links.map((link, index) => (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      onClick={closeMenu}
                      initial={{
                        opacity: 0,
                        x: -12,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay: 0.04 * index,
                        duration: 0.3,
                      }}
                      className="group flex items-center justify-between py-4 text-lg font-medium text-ink-foreground/80 transition-colors hover:text-primary sm:py-5 sm:text-2xl"
                    >
                      <span>{link.label}</span>

                      <ArrowRight className="size-4 -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 sm:size-5" />
                    </motion.a>
                  ))}
                </div>

                {/* Mobile actions */}
                <div className="mt-6 grid gap-3 border-t border-hairline-invert/30 pt-6 sm:mt-8 sm:pt-8">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-medium uppercase tracking-[0.16em] text-ink-foreground/40">
                      Language
                    </span>

                    <LanguageSwitcher />
                  </div>

                  <Link
                    to="/register"
                    onClick={closeMenu}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition-transform duration-300 active:scale-[0.98]"
                  >
                    {t.nav.join}
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}