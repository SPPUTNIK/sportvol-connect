import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { TrustedBy } from "@/components/site/TrustedBy";
import { Mission } from "@/components/site/Mission";
import { WhyVolunteer } from "@/components/site/WhyVolunteer";
import { Events } from "@/components/site/Events";
import { Journey } from "@/components/site/Journey";
import { Impact } from "@/components/site/Impact";
import { Stories } from "@/components/site/Stories";
import { Gallery } from "@/components/site/Gallery";
import { Faq } from "@/components/site/Faq";
import { CallToAction, Footer } from "@/components/site/CallToAction";

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
    <div className="bg-background">
      <Nav />
      <main>
        <Hero />
        <TrustedBy />
        <Mission />
        <WhyVolunteer />
        <Events />
        <Journey />
        <Impact />
        <Stories />
        <Gallery />
        <Faq />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}
