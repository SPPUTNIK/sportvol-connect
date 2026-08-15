import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Reveal } from "./motion";
import { useI18n } from "@/lib/i18n";

export function Faq() {
  const { t } = useI18n();
  const faqs = t.faq.items;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-sand/60 py-24 lg:py-32">
      <div className="shell grid gap-14 lg:grid-cols-[0.6fr_1.4fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Reveal>
            <p className="eyebrow">{t.faq.eyebrow}</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="display-md mt-6 text-foreground">
              {t.faq.titleLines[0]}
              <br />
              {t.faq.titleLines[1]}
            </h2>
          </Reveal>
        </div>

        <div className="divide-y divide-border border-y border-border">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={i * 0.04}>
                <div>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-8 py-7 text-start"
                  >
                    <span className="font-display text-lg font-medium tracking-tight text-foreground lg:text-xl">
                      {f.q}
                    </span>
                    <span
                      className={`flex size-9 shrink-0 items-center justify-center rounded-full border border-border transition-all duration-500 ${
                        isOpen ? "rotate-45 bg-primary text-primary-foreground" : "text-foreground"
                      }`}
                    >
                      <Plus className="size-4" />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-2xl pb-8 text-sm leading-relaxed text-muted-foreground">
                          {f.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
