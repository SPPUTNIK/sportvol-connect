import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { JOIN_EVENT } from "@/lib/join";

export function JoinDialog() {
  const { t, dir } = useI18n();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", city: "", role: "" });

  useEffect(() => {
    const onOpen = () => {
      setSent(false);
      setOpen(true);
    };
    window.addEventListener(JOIN_EVENT, onOpen);
    return () => window.removeEventListener(JOIN_EVENT, onOpen);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const field =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          dir={dir}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/70 px-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={t.join.title}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-[1.5rem] bg-card p-8 shadow-[var(--shadow-lift)]"
          >
            <button
              onClick={() => setOpen(false)}
              aria-label={t.join.close}
              className="absolute end-5 top-5 flex size-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
            >
              <X className="size-4" />
            </button>

            {sent ? (
              <div className="py-6 text-center">
                <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Check className="size-6" strokeWidth={2.5} />
                </span>
                <h3 className="mt-6 font-display text-2xl font-semibold text-card-foreground">
                  {t.join.successTitle}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">{t.join.successBody}</p>
              </div>
            ) : (
              <>
                <h3 className="font-display text-2xl font-semibold tracking-tight text-card-foreground">
                  {t.join.title}
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {t.join.body}
                </p>
                <form
                  className="mt-7 grid gap-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSent(true);
                  }}
                >
                  <input
                    required
                    className={field}
                    placeholder={t.join.name}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  <input
                    required
                    type="email"
                    className={field}
                    placeholder={t.join.email}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      required
                      className={field}
                      placeholder={t.join.city}
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                    />
                    <input
                      className={field}
                      placeholder={t.join.role}
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                    />
                  </div>
                  <button
                    type="submit"
                    className="mt-3 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-transform duration-500 hover:-translate-y-0.5"
                  >
                    {t.join.submit}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
