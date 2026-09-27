import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Trophy,
  Users,
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import { I18nProvider, useI18n } from "@/lib/i18n";
import logoAsset from "@/assets/volunsport-logo.png";


function safeNext(value: unknown): string | null {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
    ? value
    : null;
}

export const Route = createFileRoute("/login")({
  component: Login,
  validateSearch: (search: Record<string, unknown>): { next?: string } => {
    const next = safeNext(search["next"]);
    return next ? { next } : {};
  },
  head: () => ({
    meta: [{ title: "Sign In | VolunSport Morocco" }],
  }),
});

function Login() {
  return (
    <I18nProvider>
      <LoginContent />
    </I18nProvider>
  );
}

function LoginContent() {
  const { user, profile, signIn, loading } = useAuth();
  const { next } = Route.useSearch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { t } = useI18n();
  

  useEffect(() => {
    if (loading || !user || !profile) return;

    const roleDestination =
      profile.role === "admin"
        ? "/admin"
        : profile.role === "leader"
          ? "/leader/dashboard"
          : "/volunteer/dashboard";

    window.location.href = safeNext(next) ?? roleDestination;
  }, [loading, user, profile, next]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setSuccess(false);
    setSubmitting(true);

    try {
      const result = await signIn(email, password);

      if (result.error) {
        setError(result.error.message);
        return;
      }

      setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  }

  const isBusy = loading || submitting;

  return (
  <I18nProvider>
    <div className="shell min-h-screen py-20">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-hairline-invert bg-card shadow-[var(--shadow-lift)] lg:grid-cols-[0.9fr_1.1fr]">

        {/* Left intro */}
        <div className="hidden flex-col justify-between border-r border-border p-10 lg:flex">
          <div>
            <Link
              to="/"
              aria-label="VolunSport Morocco home"
              className="hidden shrink-0 items-center gap-3 sm:flex"
            >
              <img
                src={logoAsset}
                alt="VolunSport Morocco"
                width={180}
                height={100}
                className="h-14 w-auto object-contain lg:h-16"
              />
  
              <span className="leading-none">
                <span className="block font-display text-sm font-semibold tracking-tight text-primary lg:text-[1.05rem]">
                  VolunSport
                </span>
  
                <span className="mt-1 block font-mono text-[0.48rem] uppercase tracking-[0.2em] lg:text-[0.6rem]">
                  {t.nav.tagline}
                </span>
              </span>
            </Link>

            <div className="mt-16 max-w-sm">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Welcome back
              </p>

              <h2 className="text-4xl font-bold leading-tight tracking-tight text-foreground">
                Your next
                <br />
                <span className="text-primary">impact</span> starts here.
              </h2>

              <p className="mt-5 text-sm leading-7 text-muted-foreground">
                Access your volunteer dashboard, discover sports events,
                manage your applications and keep track of your journey.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <Users className="mb-3 h-5 w-5 text-primary" />

              <div className="text-lg font-bold text-foreground">
                1,200+
              </div>

              <div className="mt-1 text-xs text-muted-foreground">
                Volunteers
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <Trophy className="mb-3 h-5 w-5 text-primary" />

              <div className="text-lg font-bold text-foreground">
                80+
              </div>

              <div className="mt-1 text-xs text-muted-foreground">
                Events
              </div>
            </div>
          </div>
        </div>

        {/* Login */}
        <div className="flex items-center justify-center p-7 sm:p-10 lg:p-14">
          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <div className="mb-8 lg:hidden">
              <Link
                to="/"
                aria-label="VolunSport Morocco home"
                className="hidden shrink-0 items-center gap-3 sm:flex"
              >
                <img
                  src={logoAsset}
                  alt="VolunSport Morocco"
                  width={180}
                  height={100}
                  className="h-14 w-auto object-contain lg:h-16"
                />
    
                <span className="leading-none">
                  <span className="block font-display text-sm font-semibold tracking-tight text-primary lg:text-[1.05rem]">
                    VolunSport
                  </span>
    
                  <span className="mt-1 block font-mono text-[0.48rem] uppercase tracking-[0.2em] lg:text-[0.6rem]">
                    {t.nav.tagline}
                  </span>
                </span>
              </Link>
            </div>

            <div className="mb-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                <LockKeyhole className="h-5 w-5 text-primary" />
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Sign in
              </h1>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Access your volunteer dashboard and apply for upcoming
                events.
              </p>
            </div>

            <form
              className="space-y-5"
              onSubmit={async (event) => {
                event.preventDefault();

                setError(null);
                setSuccess(false);
                setSubmitting(true);

                try {
                  const { error } = await signIn(email, password);

                  if (error) {
                    setError(error.message);
                    return;
                  }

                  setSuccess(true);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-foreground"
                >
                  Email
                </label>

                <div className="group relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="h-13 w-full rounded-2xl border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-foreground"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-primary transition hover:text-primary/80"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="group relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="h-13 w-full rounded-2xl border border-border bg-background pl-11 pr-12 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-2xl border border-success/20 bg-success/5 px-4 py-3 text-sm text-success">
                  Signed in successfully. Redirecting...
                </div>
              )}

              <button
                type="submit"
                disabled={loading || submitting}
                className="group flex h-13 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading || submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">
                New to VolunSport?
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <Link
              to="/register"
              search={{ next }}
              className="flex h-12 w-full items-center justify-center rounded-full border border-border bg-background text-sm font-semibold text-foreground transition hover:border-primary/40 hover:bg-primary/5"
            >
              Create a volunteer account
            </Link>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Join the VolunSport Morocco community and start volunteering.
            </p>
          </div>
        </div>
      </div>
    </div>
  </I18nProvider>
);
}