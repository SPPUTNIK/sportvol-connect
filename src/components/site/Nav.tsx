import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  LogIn,
  Menu,
  UserRound,
  UserPlus,
  X,
} from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";

import logoAsset from "@/assets/volunsport-logo.png";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { t, lang } = useI18n();

  const isRTL = lang === "ar";

  const links = [
    { label: t.nav.mission, href: "#mission" },
    { label: t.nav.journey, href: "#journey" },
    { label: t.nav.faq, href: "#faq" },
  ];

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    const onResize = () => {
      if (window.innerWidth >= 1024) {
        setOpen(false);
      }

      if (window.innerWidth >= 768) {
        setProfileOpen(false);
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

  const closeProfile = () => setProfileOpen(false);

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.1,
      }}
      className="fixed inset-x-0 top-0 z-50"
    >
      {/* ======================================================
          NAVBAR
      ====================================================== */}

      <div
        className={[
          "relative transition-all duration-500",
          scrolled
            ? "border-b border-white/10 bg-black/5 backdrop-blur-xl"
            : "bg-transparent",
        ].join(" ")}
      >
        <nav
          aria-label="Main navigation"
          className="shell relative flex h-[4.5rem] items-center justify-between gap-3 sm:h-[4.75rem] lg:h-[5.25rem]"
        >
          {/* ==================================================
              LOGO
          ================================================== */}

          <Link
            to="/"
            aria-label="VolunSport Morocco home"
            onClick={() => {
              closeMenu();
              closeProfile();
            }}
            className="group shrink-0"
          >
       
          <div className="relative flex items-center">
            <div className="absolute -inset-3 rounded-full bg-[#045694]/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

            <img
              src={logoAsset}
              alt="VolunSport Morocco"
              width={180}
              height={100}
              className="relative h-9 w-auto object-contain transition-transform duration-500 group-hover:scale-[1.03] sm:h-10 lg:h-14"
            />

            {/* Brand text — visible on all devices */}
            <div className="ms-2 border-s border-white/20 ps-2 sm:ms-3 sm:ps-3">
              <span className="block font-display text-xs font-bold tracking-tight text-white sm:text-sm lg:text-base">
                VolunSport
              </span>

              <span className="mt-0.5 block font-mono text-[0.38rem] uppercase tracking-[0.12em] text-white/55 sm:mt-1 sm:text-[0.48rem] sm:tracking-[0.18em] lg:text-[0.56rem]">
                {t.nav.tagline}
              </span>
            </div>
          </div>

          </Link>

          {/* ==================================================
              DESKTOP NAVIGATION
          ================================================== */}

          <div className="hidden flex-1 items-center justify-center lg:flex">
            <div className="flex items-center gap-1">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="group relative px-4 py-3 text-sm font-semibold uppercase tracking-[0.04em] text-white/75 transition-colors duration-300 hover:text-white xl:px-5"
                >
                  {link.label}

                  <span className="absolute inset-x-4 bottom-1 h-[2px] origin-center scale-x-0 rounded-full bg-[#045694] transition-transform duration-300 group-hover:scale-x-100" />
                </a>
              ))}
            </div>
          </div>

          {/* ==================================================
              DESKTOP ACTIONS
          ================================================== */}

          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSwitcher />

            {/* Sign in */}
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-[#009F63] via-[#009F63] to-[#009F63] px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-[0_8px_25px_rgba(4,86,148,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(4,86,148,0.32)]"
            >
              <span>{t.nav.signIn}</span>
              <ArrowRight className="rtl-arrow size-4 transition-transform duration-300 group-hover:translate-x-1" />            </Link>


          </div>

          {/* ==================================================
              MOBILE ACTIONS
          ================================================== */}

          <div className="ms-auto flex items-center gap-2 lg:hidden">            {/* Profile */}
            <div className="relative">
              <button
                type="button"
                aria-label={t.nav.account}
                aria-expanded={profileOpen}
                onClick={() => {
                  setProfileOpen((value) => !value);
                  setOpen(false);
                }}
                className={[
                  "flex size-10 items-center justify-center rounded-md",
                  "transition-all duration-300 sm:size-11",
                  profileOpen
                    ? "text-white"
                    : "text-white  hover:border-white/50 hover:bg-white/10",
                ].join(" ")}
              >
                <UserRound className="size-[19px]" />
              </button>

              {/* Profile dropdown */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                    className="absolute end-0 top-[calc(100%+0.65rem)] w-56 overflow-hidden rounded-xl border border-white/15 bg-black/30 p-1.5 shadow-2xl backdrop-blur-2xl"
                  >
                    <div className="px-3 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/45">
                        {t.nav.account}
                      </p>

                      <p className="mt-1 text-sm text-white/70">
                        {t.nav.alreadyHaveAccount}
                      </p>
                    </div>

                    {/* Sign in */}
                    <Link
                      to="/login"
                      onClick={closeProfile}
                      className="group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <span className="flex size-8 items-center justify-center rounded-md bg-white/10">
                        <LogIn className="size-4" />
                      </span>

                      <span>{t.nav.signIn}</span>

                      <ArrowRight className="ml-auto size-4 opacity-40 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </Link>

                    {/* Join / Sign up */}
                    <Link
                      to="/register"
                      onClick={closeProfile}
                      className="group mt-1 flex items-center gap-3 rounded-lg bg-[#009F63] px-3 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0878B8]"
                    >
                      <span className="flex size-8 items-center justify-center rounded-md bg-white/10">
                        <UserPlus className="size-4" />
                      </span>

                      <span>{t.nav.joinNow}</span>

                      <ArrowRight className="ml-auto size-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Menu */}
            <button
              type="button"
              onClick={() => {
                setOpen((value) => !value);
                setProfileOpen(false);
              }}
              aria-label={open ? t.nav.closeMenu : t.nav.menu}
              aria-expanded={open}
              aria-controls="mobile-navigation"
              className={[
                "flex size-10 items-center justify-center rounded-md ",
                "transition-all duration-300 sm:size-11",
                open
                  ? " text-white"
                  : "text-white hover:border-white/50 hover:bg-white/10",
              ].join(" ")}
            >
              <AnimatePresence mode="wait" initial={false}>
                {open ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                  >
                    <X className="size-5" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                  >
                    <Menu className="size-5" />
                  </motion.span>
                )}
              </AnimatePresence>
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
              aria-label={t.nav.closeMenu}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 top-[4.5rem] -z-10 bg-black/20 backdrop-blur-md sm:top-[4.75rem] lg:hidden"
            />

            {/* Menu */}
            <motion.div
              id="mobile-navigation"
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="border-b border-white/10 bg-black/10 backdrop-blur-2xl lg:hidden"
            >
              <div className="shell max-h-[calc(100vh-5rem)] overflow-y-auto py-4 sm:py-6">
                {/* Links */}
                <div className="space-y-1">
                  {links.map((link, index) => (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      onClick={closeMenu}
                      initial={{ opacity: 0, x: isRTL ? 15 : -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: index * 0.05,
                        duration: 0.3,
                      }}
                      className="group flex items-center justify-between border-b border-white/10 px-2 py-4 text-base font-semibold text-white/85 transition-colors hover:text-white sm:py-5 sm:text-xl"
                    >
                      <span>{link.label}</span>

                      <span className="flex size-8 items-center justify-center rounded-full border border-white/20 bg-white/5 transition-all duration-300 group-hover:border-[#045694] group-hover:bg-[#045694]">
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </motion.a>
                  ))}
                </div>

                {/* Mobile language */}
                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5 sm:mt-7 sm:pt-7">
                  <span className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/45">
                    {t.nav.language}
                  </span>

                  <LanguageSwitcher />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
