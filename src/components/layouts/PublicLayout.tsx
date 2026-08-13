import { I18nProvider } from "@/lib/i18n";
import type { ReactNode } from "react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/CallToAction";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Nav />
        <main>{children}</main>
        <Footer />
      </div>
    </I18nProvider>
  );
}
