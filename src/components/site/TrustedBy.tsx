import { useI18n } from "@/lib/i18n";

import cnomLogo from "@/assets/partners/cnom le comite national.png";
import frmfLogo from "@/assets/partners/LOGO FRMF.png";
import ministryLogo from "@/assets/partners/Ministere de la Jeunesse.png";
import moroccoLogo from "@/assets/partners/Royaume du Maroc Minist.png";
import frmaLogo from "@/assets/partners/FRMA.png";

const partners = [
  {
    name: "Comité National Olympique Marocain",
    logo: cnomLogo,
  },
  {
    name: "Fédération Royale Marocaine de Football",
    logo: frmfLogo,
  },
  {
    name: "Ministère de la Jeunesse",
    logo: ministryLogo,
  },
  {
    name: "Royaume du Maroc",
    logo: moroccoLogo,
  },
  {
    name: "Fédération Royale Marocaine d'Athlétisme",
    logo: frmaLogo,
  },
];

export function TrustedBy() {
  const { t } = useI18n();

  const marqueePartners = [...partners, ...partners];

  return (
    <section className="relative overflow-hidden border-b border-border bg-ink py-8 sm:py-10 lg:py-12">
      {/* Moroccan zellij background */}
      <div
        className="pointer-events-none absolute inset-0 zellij-tile opacity-[6%] mix-blend-screen"
        aria-hidden
      />

      <div className="shell relative">
        {/* Label */}
        <div className="mb-6 flex items-center justify-center gap-3 sm:mb-8">
          <span className="h-px w-6 bg-primary/60 sm:w-10" />

          <p className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-ink-foreground/40 sm:text-[0.62rem]">
            {t.trusted.label}
          </p>

          <span className="h-px w-6 bg-primary/60 sm:w-10" />
        </div>

        {/* Logo marquee */}
        <div
          className="relative overflow-hidden"
          dir="ltr"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
          }}
        >
          <div className="marquee-track flex w-max items-center">
            {[...partners, ...partners].map((partner, index) => (
              <div
                key={`${partner.name}-${index}`}
                className="flex w-[120px] shrink-0 justify-center px-2 sm:w-[160px] sm:px-3 md:w-[190px] md:px-4 lg:w-[220px]"
              >
                <div
                  className="
                    group
                    relative
                    flex
                    size-[82px]
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/10
                    bg-white
                    p-3
                    shadow-[0_8px_30px_rgba(0,0,0,0.12)]
                    transition-all
                    duration-500
                    hover:-translate-y-1
                    hover:border-primary/50
                    hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)]
                    sm:size-[105px]
                    sm:p-4
                    md:size-[120px]
                    md:p-5
                    lg:size-[135px]
                    lg:p-6
                  "
                >
                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-1
                      rounded-full
                      border
                      border-black/[0.05]
                      transition-all
                      duration-500
                      group-hover:inset-0
                      group-hover:border-primary/20
                    "
                  />

                  <img
                    src={partner.logo}
                    alt={partner.name}
                    loading="lazy"
                    decoding="async"
                    className="
                      relative
                      z-10
                      block
                      max-h-[48px]
                      max-w-[58px]
                      object-contain
                      transition-transform
                      duration-500
                      group-hover:scale-105
                      sm:max-h-[60px]
                      sm:max-w-[72px]
                      md:max-h-[70px]
                      md:max-w-[85px]
                      lg:max-h-[78px]
                      lg:max-w-[95px]
                    "
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Small institutional caption */}
        <p className="mt-6 text-center font-mono text-[0.5rem] uppercase tracking-[0.18em] text-ink-foreground/20 sm:mt-8 sm:text-[0.55rem]">
          Moroccan sports ecosystem
        </p>
      </div>
    </section>
  );
}