import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  CalendarDays,
  HeartHandshake,
  MapPin,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
import { I18nProvider } from "@/lib/i18n";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      { title: "About | VolunSport Morocco" },
      {
        name: "description",
        content:
          "Discover VolunSport, Morocco's platform connecting passionate volunteers with sports events and organizations.",
      },
    ],
  }),
});

const values = [
  {
    icon: HeartHandshake,
    title: "Community first",
    description:
      "We believe great sporting events are built by people who care about their communities.",
  },
  {
    icon: ShieldCheck,
    title: "Reliable volunteering",
    description:
      "Clear roles, schedules and accreditation help volunteers show up prepared and confident.",
  },
  {
    icon: Award,
    title: "Recognized impact",
    description:
      "Volunteers can track their contribution, build experience and earn certificates.",
  },
];

const steps = [
  {
    number: "01",
    title: "Discover",
    description:
      "Find sporting events and opportunities that match your interests, skills and availability.",
  },
  {
    number: "02",
    title: "Get involved",
    description:
      "Apply for a role and receive the information you need before event day.",
  },
  {
    number: "03",
    title: "Make an impact",
    description:
      "Show up, contribute to the team and build a record of your volunteering experience.",
  },
];

const stats = [
  ["12,400+", "Active volunteers"],
  ["310", "Events supported"],
  ["64", "Partner organizations"],
  ["148K", "Volunteer hours"],
];

const communities = [
  {
    icon: Users,
    title: "Volunteers",
    text: "Find meaningful opportunities and grow through experience.",
  },
  {
    icon: CalendarDays,
    title: "Organizers",
    text: "Build dependable teams for every event.",
  },
  {
    icon: Trophy,
    title: "Sports clubs",
    text: "Connect your community with new opportunities.",
  },
  {
    icon: MapPin,
    title: "Communities",
    text: "Create stronger local sporting ecosystems.",
  },
];

function About() {
  return (
    <I18nProvider>
      <PublicLayout>
        <main className="relative isolate overflow-hidden">
          {/* =========================================================
              GLOBAL MOROCCAN ZELLIJ BACKGROUND
              Covers the entire About page and continues while scrolling.
          ========================================================= */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 zellij-tile opacity-[0.05]"
          />

          {/* =========================================================
              PAGE CONTENT
          ========================================================= */}
          <div className="relative z-10">
            {/* =======================================================
                HERO
            ======================================================= */}
            <section className="relative min-h-[680px] overflow-hidden bg-ink">
              {/* Hero image */}
              <div className="absolute inset-0">
                <img
                  src="/assets/hero-B569piza.jpg"
                  alt="Volunteers supporting a sporting event in Morocco"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Dark cinematic overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/30" />

              {/* Subtle zellij over hero */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 zellij-tile opacity-[0.05]"
              />

              {/* Hero content */}
              <div className="relative z-10 flex min-h-[680px] items-end">
                <div className="shell w-full pb-20 pt-32">
                  <div className="max-w-5xl">
                    {/* Eyebrow */}
                    <div className="mb-7 flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-primary" />

                      <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
                        About VolunSport
                      </p>
                    </div>

                    {/* Heading */}
                    <h1 className="display-xl max-w-5xl text-white">
                      Sport is more than
                      <span className="block text-gradient-accent">
                        the game.
                      </span>
                    </h1>

                    {/* Description */}
                    <p className="mt-8 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
                      VolunSport connects passionate people with the sporting
                      events that bring Morocco together — creating meaningful
                      opportunities to contribute, learn and belong.
                    </p>

                    {/* CTA */}
                    <div className="mt-10 flex flex-wrap gap-3">
                      <Link
                        to="/events"
                        className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition duration-300 hover:-translate-y-0.5"
                      >
                        Explore events

                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>

                      <Link
                        to="/register"
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition duration-300 hover:bg-white/10"
                      >
                        Become a volunteer
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* =======================================================
                INTRO / OUR STORY
            ======================================================= */}
            <section className="relative bg-background/95 py-24 sm:py-32">
              <div className="shell">
                <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
                  {/* Left */}
                  <div>
                    <p className="eyebrow">
                      <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                      Our story
                    </p>

                    <h2 className="display-md mt-5 max-w-lg">
                      Building the people behind the events.
                    </h2>
                  </div>

                  {/* Right */}
                  <div className="space-y-6 text-base leading-relaxed text-muted-foreground">
                    <p>
                      Sporting events are powered by thousands of people behind
                      the scenes — welcoming participants, managing
                      information, supporting operations and creating
                      unforgettable experiences.
                    </p>

                    <p>
                      VolunSport exists to make that contribution easier to
                      discover and more meaningful. We give volunteers a place
                      to find opportunities while helping organizers build
                      reliable, prepared teams.
                    </p>

                    <p>
                      From local competitions to major sporting moments, our
                      vision is simple: make volunteering an essential part of
                      Morocco&apos;s sports ecosystem.
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-20 grid overflow-hidden rounded-[2rem] border border-border bg-card/95 sm:grid-cols-2 lg:grid-cols-4">
                  {stats.map(([value, label], index) => (
                    <div
                      key={label}
                      className={cn(
                        "p-7 sm:p-9",
                        index !== 0 &&
                          "border-t border-border sm:border-l sm:border-t-0",
                        index === 2 && "lg:border-t-0",
                      )}
                    >
                      <p className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                        {value}
                      </p>

                      <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* =======================================================
                VALUES
            ======================================================= */}
            <section className="relative overflow-hidden bg-muted/90 py-24 sm:py-32">
              <div className="shell relative z-10">
                <div className="max-w-2xl">
                  <p className="eyebrow">What we believe</p>

                  <h2 className="display-md mt-5">
                    A better experience for everyone involved.
                  </h2>

                  <p className="mt-5 text-muted-foreground">
                    VolunSport is designed around the people who make sporting
                    events possible.
                  </p>
                </div>

                {/* Value cards */}
                <div className="mt-14 grid gap-5 lg:grid-cols-3">
                  {values.map(
                    ({ icon: Icon, title, description }) => (
                      <article
                        key={title}
                        className="group rounded-[2rem] border border-border bg-card/95 p-7 transition duration-500 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-lift)]"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                          <Icon className="h-5 w-5" />
                        </div>

                        <h3 className="mt-7 text-lg font-semibold">
                          {title}
                        </h3>

                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                          {description}
                        </p>
                      </article>
                    ),
                  )}
                </div>
              </div>
            </section>

            {/* =======================================================
                HOW IT WORKS
            ======================================================= */}
            <section className="relative bg-background/95 py-24 sm:py-32">
              <div className="shell">
                <div className="grid gap-16 lg:grid-cols-[0.7fr_1.3fr]">
                  {/* Left */}
                  <div>
                    <p className="eyebrow">How it works</p>

                    <h2 className="display-md mt-5">
                      From interest to impact.
                    </h2>

                    <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
                      We make the journey simple so volunteers can focus on
                      what matters: contributing to the event.
                    </p>
                  </div>

                  {/* Steps */}
                  <div className="divide-y divide-border border-y border-border">
                    {steps.map((step) => (
                      <div
                        key={step.number}
                        className="grid gap-5 py-8 sm:grid-cols-[80px_180px_1fr] sm:items-start"
                      >
                        <span className="font-mono text-xs font-semibold tracking-[0.18em] text-primary">
                          {step.number}
                        </span>

                        <h3 className="text-lg font-semibold">
                          {step.title}
                        </h3>

                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* =======================================================
                WHO WE SERVE
            ======================================================= */}
            <section className="relative overflow-hidden bg-ink py-24 text-white sm:py-32">
              {/* Local pattern for dark section */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 zellij-tile opacity-[0.04]"
              />

              <div className="shell relative z-10">
                <div className="grid gap-12 lg:grid-cols-2 lg:items-end">
                  {/* Heading */}
                  <div>
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                      Built for Morocco
                    </p>

                    <h2 className="display-md mt-5 max-w-2xl text-white">
                      One platform.
                      <span className="block text-white/45">
                        Many communities.
                      </span>
                    </h2>
                  </div>

                  {/* Description */}
                  <p className="max-w-xl text-sm leading-relaxed text-white/55 lg:justify-self-end">
                    Volunteers, clubs, federations, organizers and communities
                    all play a role in creating successful sporting events.
                    VolunSport brings those people together.
                  </p>
                </div>

                {/* Community cards */}
                <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {communities.map(
                    ({ icon: Icon, title, text }) => (
                      <div
                        key={title}
                        className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 transition duration-300 hover:bg-white/[0.07]"
                      >
                        <Icon className="h-5 w-5 text-primary" />

                        <h3 className="mt-6 font-semibold">{title}</h3>

                        <p className="mt-2 text-sm leading-relaxed text-white/45">
                          {text}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </section>

            {/* =======================================================
                CTA
            ======================================================= */}
            <section className="relative bg-background/95 py-24 sm:py-32">
              <div className="shell">
                <div className="relative overflow-hidden rounded-[2.5rem] bg-primary px-7 py-16 text-center sm:px-12 sm:py-20">
                  {/* CTA pattern */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 zellij-tile opacity-[0.05]"
                  />

                  <div className="relative z-10 mx-auto max-w-3xl">
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-primary-foreground/60">
                      Be part of it
                    </p>

                    <h2 className="display-md mt-5 text-primary-foreground">
                      Your time can become someone&apos;s best sporting
                      memory.
                    </h2>

                    <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-primary-foreground/70">
                      Discover opportunities, meet your community and help make
                      the next event unforgettable.
                    </p>

                    {/* CTA buttons */}
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                      <Link
                        to="/events"
                        className="group inline-flex items-center gap-2 rounded-full bg-background px-6 py-3.5 text-sm font-semibold text-foreground transition duration-300 hover:-translate-y-0.5"
                      >
                        Explore events

                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>

                      <Link
                        to="/register"
                        className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 px-6 py-3.5 text-sm font-semibold text-primary-foreground transition duration-300 hover:bg-primary-foreground/10"
                      >
                        Join VolunSport
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </PublicLayout>
    </I18nProvider>
  );
}