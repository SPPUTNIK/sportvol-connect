import { useRef } from "react";
import { ArrowLeft, ArrowRight, MapPin, Users } from "lucide-react";
import { Reveal } from "./motion";
import { useI18n } from "@/lib/i18n";
import { Link } from "@tanstack/react-router";
import marathon from "@/assets/event-marathon.jpg";
import cycling from "@/assets/event-cycling.jpg";
import football from "@/assets/event-football.jpg";
import basketball from "@/assets/event-basketball.jpg";

const eventMeta = [
  { filled: 84, needed: 120, img: marathon },
  { filled: 52, needed: 80, img: football },
  { filled: 38, needed: 60, img: cycling },
  { filled: 21, needed: 40, img: basketball },
];

export function Events() {
  const { t, dir } = useI18n();
  const events = t.events.items.map((e, i) => ({ ...e, ...eventMeta[i] }));
  const scroller = useRef<HTMLDivElement>(null);

  const scrollBy = (delta: number) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({
      left: (dir === "rtl" ? -delta : delta) * (el.clientWidth * 0.6),
      behavior: "smooth",
    });
  };

  return (
    <section id="events" className="ink-panel relative overflow-hidden py-24 lg:py-32">
      <div className="absolute inset-0 hairline-grid opacity-30" aria-hidden />
      <div className="pointer-events-none absolute inset-0 zellij-tile opacity-[9%] mix-blend-screen" aria-hidden />
      <div className="relative">
        <div className="shell flex flex-wrap items-end justify-between gap-8">
          <div>
            <Reveal>
              <h2 className="display-lg mt-6 text-ink-foreground">
                {t.events.titleLines[0]}
                <br />
                {t.events.titleLines[1]}
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => scrollBy(-1)}
                aria-label={t.events.prev}
                className="flex size-11 items-center justify-center rounded-full border border-hairline-invert text-ink-foreground transition-colors duration-500 hover:bg-ink-foreground/10"
              >
                <ArrowLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollBy(1)}
                aria-label={t.events.next}
                className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-500 hover:-translate-y-0.5"
              >
                <ArrowRight className="size-4" />
              </button>
            </div>
          </Reveal>
        </div>

        <div
          ref={scroller}
          className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 lg:px-12"
        >
          {events.map((e, i) => (
            <Reveal
              key={e.title}
              delay={i * 0.06}
              className="w-[78vw] shrink-0 snap-start sm:w-[52vw] lg:w-[27rem]"
            >
              <article className="lift group h-full overflow-hidden rounded-[1.5rem] bg-card">
                <div className="media-zoom relative aspect-[16/10]">
                  <img
                    src={e.img}
                    alt={e.title}
                    loading="lazy"
                    width={1200}
                    height={900}
                    className="size-full object-cover"
                  />
                  <span className="absolute start-4 top-4 rounded-full bg-primary px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-primary-foreground">
                    {e.tag}
                  </span>
                  <span className="absolute bottom-4 end-4 rounded-xl bg-card px-3 py-2 text-center leading-none">
                    <span className="block font-display text-xl font-semibold text-foreground">
                      {e.date.split(" ")[0]}
                    </span>
                    <span className="mt-1 block font-mono text-[0.55rem] uppercase tracking-[0.16em] text-muted-foreground">
                      {e.date.split(" ")[1]}
                    </span>
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="font-display text-xl font-semibold tracking-tight text-card-foreground">
                    {e.title}
                  </h3>
                  <div className="mt-3 flex items-center gap-5 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-3.5" /> {e.city}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="size-3.5" /> {e.needed} {t.events.needed}
                    </span>
                  </div>

                  <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(e.filled / e.needed) * 100}%` }}
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{e.filled}</span> / {e.needed}{" "}
                      {t.events.registered}
                    </p>
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
                    >
                      {t.events.apply}
                      <ArrowRight className="size-3.5 transition-transform duration-500 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
