import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Hero } from "@/components/site/Hero";
import { TrustedBy } from "@/components/site/TrustedBy";
import { Mission } from "@/components/site/Mission";
import { WhyVolunteer } from "@/components/site/WhyVolunteer";
import { Journey } from "@/components/site/Journey";
import { Impact } from "@/components/site/Impact";
import { Gallery } from "@/components/site/Gallery";
import { Faq } from "@/components/site/Faq";
import { CallToAction } from "@/components/site/CallToAction";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { I18nProvider } from "@/lib/i18n";
import { JoinDialog } from "@/components/site/JoinDialog";

const title = "SportVol Morocco — Sports Volunteer Platform";
const description =
  "Join thousands of volunteers creating unforgettable sporting events across Morocco. Find events, get certified hours and build your sports career.";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "SportVol Morocco",
          description,
          areaServed: "MA",
        }),
      },
    ],
  }),
});

function Index() {
  useEffect(() => {
    let lenis: { destroy: () => void; raf: (t: number) => void } | null = null;
    let raf = 0;
    let cancelled = false;

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      import("lenis").then(({ default: Lenis }) => {
        if (cancelled) return;
        lenis = new Lenis({ duration: 1.1, smoothWheel: true });
        const loop = (time: number) => {
          lenis?.raf(time);
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
      });
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      lenis?.destroy();
    };
  }, []);

  return (
  <I18nProvider>
    <PublicLayout>
      <div className="relative overflow-hidden bg-background">
        {/* Global Zellij Texture */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            zellij-tile
            opacity-[10%]
            mix-blend-multiply
          "
        />

        {/* Soft paper-like overlay */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-b
            from-background/10
            via-background/30
            to-background/10
          "
        />

        {/* Landing page content */}
        <div className="relative z-10">
          <Hero />
          <TrustedBy />
          <Mission />
          <WhyVolunteer />
          <Journey />
          <Impact />
          <Gallery />
          <Faq />
          <CallToAction />
          <JoinDialog />
        </div>
      </div>
    </PublicLayout>
  </I18nProvider>
);
}
