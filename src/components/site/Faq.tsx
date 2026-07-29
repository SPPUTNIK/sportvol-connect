import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Reveal } from "./motion";

const faqs = [
  {
    q: "Do I need sports experience to volunteer?",
    a: "No. Most roles need reliability and a good attitude, not athletic background. Every event includes a short online module and an on-site briefing.",
  },
  {
    q: "How much time does a typical event take?",
    a: "Between four and ten hours, usually across a single day. You choose the shifts that match your availability when you apply.",
  },
  {
    q: "Is volunteering paid?",
    a: "Roles are unpaid, but organizers cover meals, transport in most cities and full kit. Your hours are certified and count toward the SportVol credential.",
  },
  {
    q: "Can my club or federation list an event?",
    a: "Yes. Organizers get a scheduling workspace, accreditation tools and access to the volunteer pool filtered by skill, language and city.",
  },
  {
    q: "What languages are supported?",
    a: "Darija, Arabic, French and English across briefings, the platform and event documentation.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-sand py-24 lg:py-32">
      <div className="shell grid gap-14 lg:grid-cols-[0.6fr_1.4fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Reveal>
            <p className="eyebrow">Questions</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="display-md mt-6 text-foreground">
              Everything you
              <br />
              might ask.
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
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-8 py-7 text-left"
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
