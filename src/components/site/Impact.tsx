import { Counter } from "./Counter";
import { Reveal } from "./motion";

const numbers = [
  { to: 12400, suffix: "+", label: "Active volunteers" },
  { to: 310, suffix: "", label: "Events organized" },
  { to: 64, suffix: "", label: "Partner organizations" },
  { to: 148, suffix: "K", label: "Volunteer hours" },
];

export function Impact() {
  return (
    <section className="ink-panel relative overflow-hidden">
      <div className="shell grid gap-0 lg:grid-cols-2">
        <div className="border-b border-hairline-invert py-20 lg:border-b-0 lg:border-r lg:py-28 lg:pr-16">
          <Reveal>
            <p className="eyebrow">Our impact</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="display-md mt-6 text-ink-foreground">
              Impact, in numbers
              <br />
              that keep moving.
            </h2>
          </Reveal>

          <dl className="mt-14 grid grid-cols-2 gap-x-8 gap-y-12">
            {numbers.map((n, i) => (
              <Reveal key={n.label} delay={0.08 * i}>
                <dt className="font-display text-5xl font-semibold tracking-tight text-ink-foreground sm:text-6xl">
                  <Counter to={n.to} suffix={n.suffix} />
                </dt>
                <dd className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ink-foreground/45">
                  {n.label}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>

        <div className="flex flex-col justify-center py-20 lg:py-28 lg:pl-16">
          <Reveal>
            <p className="eyebrow">Growth curve</p>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-foreground/70">
              Four seasons ago SportVol staffed a single city race. Today it coordinates
              crews across twelve regions, with retention above 70% year over year.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-12 h-44 w-full">
              <svg viewBox="0 0 400 140" className="size-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 128 L57 118 L114 122 L171 92 L228 98 L285 56 L342 62 L400 12 L400 140 L0 140 Z"
                  fill="url(#area)"
                />
                <path
                  d="M0 128 L57 118 L114 122 L171 92 L228 98 L285 56 L342 62 L400 12"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-6 flex justify-between font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ink-foreground/35">
              <span>2021</span>
              <span>2022</span>
              <span>2023</span>
              <span>2024</span>
              <span>2025</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
