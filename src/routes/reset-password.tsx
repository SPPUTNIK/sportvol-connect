import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, LockKeyhole } from "lucide-react";

import { I18nProvider } from "@/lib/i18n";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,

  validateSearch: (
    search: Record<string, unknown>,
  ): { next?: string } => {
    const next =
      typeof search.next === "string" &&
      search.next.startsWith("/") &&
      !search.next.startsWith("//")
        ? search.next
        : undefined;

    return next ? { next } : {};
  },

  head: () => ({
    meta: [
      {
        title:
          "Reset Password | VolunSport Morocco",
      },
    ],
  }),
});

function ResetPassword() {
  const { next } = Route.useSearch();

  const destination = next ?? "/login";
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [success, setSuccess] = useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] =
    useState(true);

  const [hasRecoverySession, setHasRecoverySession] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkRecoverySession() {
      const { data, error } =
        await supabase.auth.getSession();

      if (!mounted) return;

      if (error || !data.session) {
        setHasRecoverySession(false);
        setCheckingSession(false);
        return;
      }

      setHasRecoverySession(true);
      setCheckingSession(false);
    }

    checkRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        if (
          event === "PASSWORD_RECOVERY" &&
          session
        ) {
          setHasRecoverySession(true);
        }
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);
    setSuccess(false);

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error: updateError } =
      await supabase.auth.updateUser({
        password,
      });

    if (updateError) {
      setError(
        updateError.message ||
          "Unable to update your password.",
      );

      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  return (
    <I18nProvider>
      <PublicLayout>
        <div className="shell min-h-screen py-24">
          <div className="mx-auto max-w-md rounded-[2rem] border border-hairline-invert bg-card p-10 shadow-[var(--shadow-lift)]">
            {/* Icon */}
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {success ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <LockKeyhole className="h-5 w-5" />
              )}
            </div>

            <h1 className="mt-6 text-3xl font-semibold text-foreground">
              Reset your password
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Enter a new password for your VolunSport
              account. Your password must contain at
              least 8 characters.
            </p>

            {checkingSession ? (
              <div className="mt-8 rounded-3xl border border-border bg-muted/30 p-5">
                <p className="text-sm text-muted-foreground">
                  Checking your recovery session...
                </p>
              </div>
            ) : success ? (
              <div className="mt-8">
                <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6">
                  <p className="text-lg font-semibold text-foreground">
                    Password updated
                  </p>

                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Your password has been successfully
                    reset. You can now sign in with your
                    new password.
                  </p>
                </div>

                <Link
                  to={destination}
                  className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  Continue to sign in
                </Link>
              </div>
            ) : !hasRecoverySession ? (
              <div className="mt-8">
                <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6">
                  <p className="text-sm font-semibold text-destructive">
                    Recovery link expired or invalid
                  </p>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Please request a new password reset
                    email and use the latest link.
                  </p>
                </div>

                <Link
                  to="/login"
                  className="mt-6 flex h-12 w-full items-center justify-center rounded-full border border-border px-6 text-sm font-semibold text-foreground transition hover:bg-muted"
                >
                  Back to sign in
                </Link>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
              >
                <label className="block text-sm font-medium text-foreground">
                  New password

                  <input
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    disabled={loading}
                    required
                    minLength={8}
                    className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </label>

                <label className="block text-sm font-medium text-foreground">
                  Confirm password

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value,
                      )
                    }
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    disabled={loading}
                    required
                    className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </label>

                {error && (
                  <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !password ||
                    !confirmPassword
                  }
                  className="flex h-12 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Updating password..."
                    : "Reset password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </PublicLayout>
    </I18nProvider>
  );
}