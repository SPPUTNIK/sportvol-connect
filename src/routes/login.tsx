import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { I18nProvider, useI18n } from "@/lib/i18n";

function safeNext(value: unknown): string | null {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : null;
}

export const Route = createFileRoute("/login")({
  component: Login,
  validateSearch: (search: Record<string, unknown>): { next?: string } => {
    const next = safeNext(search["next"]);
    return next ? { next } : {};
  },
  head: () => ({
    meta: [{ title: "Login | VolunSport Morocco" }],
  }),
});

function Login() {
  const { t } = useI18n();
  const { user, signIn, loading } = useAuth();
  const { next } = Route.useSearch();
  const destination = safeNext(next) ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      window.location.href = destination;
    }
  }, [user]);

  return (
    <I18nProvider>
      <div className="shell min-h-screen py-24">
        <div className="mx-auto max-w-md rounded-[2rem] border border-hairline-invert bg-card p-10 shadow-[var(--shadow-lift)]">
          <h1 className="text-3xl font-semibold text-foreground">Sign in</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Access your volunteer dashboard and apply for upcoming events.
          </p>

          <form
            className="mt-8 space-y-5"
            onSubmit={async (event) => {
              event.preventDefault();
              setError(null);
              const { error } = await signIn(email, password);
              if (error) {
                setError(error.message);
                return;
              }
              setSuccess(true);
              window.location.href = destination;
            }}
          >
            <label className="block text-sm font-medium text-foreground">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="mt-2 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
              />
            </label>
            <label className="block text-sm font-medium text-foreground">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="mt-2 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
              />
            </label>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <Link to="/forgot-password" className="text-primary hover:text-primary/80">
                Forgot password?
              </Link>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-success">Signed in successfully.</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Continue
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account? <Link to="/register" search={{ next }} className="text-primary">Create one</Link>
          </p>
        </div>
      </div>
    </I18nProvider>
  );
}
