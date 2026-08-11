import { useI18n } from "@/lib/i18n";

const partners = [
  "Fédération Atlas",
  "Course du Détroit",
  "Rabat Sport Lab",
  "Anfa Athletics",
  "Souss Basket",
  "Ligue de l'Oriental",
  "Marrakech Ride",
  "Océan Swim Club",
];

export function TrustedBy() {
  const { t } = useI18n();
  return (
    <section className="border-b border-border bg-ink py-10">
      <div className="shell flex items-center gap-10">
        <p className="hidden shrink-0 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-ink-foreground/40 md:block">
          {t.trusted.label}
        </p>
        <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className="marquee-track flex w-max items-center gap-14">
            {[...partners, ...partners].map((p, i) => (
              <span
                key={`${p}-${i}`}
                className="whitespace-nowrap font-display text-lg font-medium tracking-tight text-ink-foreground/45 transition-colors duration-500 hover:text-ink-foreground"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
