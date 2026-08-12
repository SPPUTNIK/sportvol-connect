import { Link, createFileRoute } from "@tanstack/react-router";
import { I18nProvider } from "@/lib/i18n";

export const Route = createFileRoute("/404")({
  component: NotFound,
  head: () => ({
    meta: [{ title: "404 | VolunSport Morocco" }],
  }),
});

function NotFound() {
  return (
    <I18nProvider>
      <div className="shell min-h-screen py-24">
        <div className="mx-auto max-w-md rounded-[2rem] border border-hairline-invert bg-card p-10 text-center shadow-[var(--shadow-lift)]">
          <h1 className="text-7xl font-bold text-foreground">404</h1>
          <p className="mt-4 text-xl font-semibold text-foreground">Page not found</p>
          <p className="mt-2 text-sm text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Go home
            </Link>
          </div>
        </div>
      </div>
    </I18nProvider>
  );
}
