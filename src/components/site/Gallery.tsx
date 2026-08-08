import { Reveal } from "./motion";
import g1 from "@/assets/gal-1.jpg";
import g2 from "@/assets/gal-2.jpg";
import g3 from "@/assets/gal-3.jpg";
import g4 from "@/assets/gal-4.jpg";
import g5 from "@/assets/event-cycling.jpg";

const items = [
  { src: g1, alt: "Volunteer smiling at a stadium", span: "sm:col-span-4 sm:row-span-2", ratio: "aspect-[4/5]" },
  { src: g2, alt: "Volunteers preparing a finish line at dawn", span: "sm:col-span-8", ratio: "aspect-[16/9]" },
  { src: g4, alt: "Hands stacked in a team huddle", span: "sm:col-span-4", ratio: "aspect-[4/3]" },
  { src: g5, alt: "Cyclists on an Atlas mountain road", span: "sm:col-span-4", ratio: "aspect-[4/3]" },
  { src: g3, alt: "Swimmer diving into a competition pool", span: "sm:col-span-8", ratio: "aspect-[16/9]" },
];

export function Gallery() {
  return (
    <section className="bg-background/70 py-24 lg:py-32">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <div>
              <p className="eyebrow">Field notes</p>
              <h2 className="display-md mt-6 text-foreground">
                Race days, from
                <br />
                the inside.
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Twelve regions. Nine disciplines. One crew that shows up before sunrise and
              leaves after the last athlete.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-12">
          {items.map((it, i) => (
            <Reveal key={it.alt} delay={i * 0.06} className={it.span}>
              <figure
                className={`media-zoom group relative h-full overflow-hidden rounded-2xl bg-muted ${it.ratio}`}
              >
                <img
                  src={it.src}
                  alt={it.alt}
                  loading="lazy"
                  className="size-full object-cover"
                />
                <span className="pointer-events-none absolute inset-0 bg-ink/0 transition-colors duration-700 group-hover:bg-ink/20" />
              </figure>
            </Reveal>
          ))}

          <Reveal delay={0.3} className="sm:col-span-4">
            <div className="ink-panel flex h-full flex-col justify-between rounded-2xl p-8">
              <p className="eyebrow">Next season</p>
              <div className="mt-10">
                <p className="font-display text-5xl font-semibold tracking-tight text-ink-foreground">
                  42
                </p>
                <p className="mt-3 max-w-[14rem] text-sm leading-relaxed text-ink-foreground/60">
                  events already open for volunteer applications across twelve regions.
                </p>
              </div>
              <a
                href="#events"
                className="mt-10 inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform duration-500 hover:-translate-y-0.5"
              >
                Browse events
              </a>
            </div>
          </Reveal>
        </div>

      </div>
    </section>
  );
}
