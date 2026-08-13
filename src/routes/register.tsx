import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { PublicLayout } from "@/components/layouts/PublicLayout";

function safeNext(value: unknown): string | null {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : null;
}

export const Route = createFileRoute("/register")({
  component: Register,
  validateSearch: (search: Record<string, unknown>): { next?: string } => {
    const next = safeNext(search["next"]);
    return next ? { next } : {};
  },
  head: () => ({
    meta: [{ title: "Register | VolunSport Morocco" }],
  }),
});

function Register() {
  const { t } = useI18n();
  const { signUp } = useAuth();
  const { next } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  return (
    <I18nProvider>
      <PublicLayout>
        <div className="shell min-h-screen py-24">
          <div className="mx-auto max-w-md rounded-[2rem] border border-hairline-invert bg-card p-10 shadow-[var(--shadow-lift)]">
            <h1 className="text-3xl font-semibold text-foreground">Create your account</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Sign up to discover events, apply for roles, manage your schedule and track your
              volunteer hours.
            </p>

            <form
              className="mt-8 space-y-5"
              onSubmit={async (event) => {
                event.preventDefault();
                setError(null);
                const { error } = await signUp(email, password);
                if (error) {
                  setError(error.message);
                  return;
                }
                setSuccess(true);
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
                  minLength={8}
                  className="mt-2 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                />
              </label>

              {error && <p className="text-sm text-destructive">{error}</p>}
              {success ? (
                <p className="text-sm text-success">
                  Registration successful. Check your inbox for the verification email and then sign
                  in.
                </p>
              ) : (
                <button
                  type="submit"
                  className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  Create account
                </button>
              )}
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already registered?{" "}
              <Link to="/login" search={{ next }} className="text-primary">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </PublicLayout>
    </I18nProvider>
  );
}
