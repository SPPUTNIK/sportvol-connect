import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
} from "lucide-react";

import { useAuth } from "@/lib/auth";

export function AdminLoginPage() {
  const navigate = useNavigate();

  const {
    user,
    isAdmin,
    signIn,
    sendResetPasswordEmail,
    loading,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  const [submitting, setSubmitting] =
    useState(false);

  const [resetting, setResetting] =
    useState(false);

  /*
   * If an already authenticated admin opens
   * /admin/login, send them directly to admin.
   */
  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate({
        to: "/admin",
        replace: true,
      });
    }
  }, [loading, user, isAdmin, navigate]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);
    setSuccess(null);
    setSubmitting(true);

    const result = await signIn(
      email.trim(),
      password,
    );

    if (result.error) {
      setError(
        result.error.message ||
          "Unable to sign in. Please check your credentials.",
      );

      setSubmitting(false);
      return;
    }

    /*
     * signIn() loads the profile as well.
     * The auth effect will redirect the admin.
     */
    setSubmitting(false);
  }

  async function handleForgotPassword() {
    const normalizedEmail = email.trim();

    setError(null);
    setSuccess(null);

    if (!normalizedEmail) {
      setError(
        "Enter your admin email address first.",
      );
      return;
    }

    setResetting(true);

    const result =
      await sendResetPasswordEmail(
        normalizedEmail,
        "/admin/login",
        );

    if (result.error) {
      setError(
        result.error.message ||
          "Unable to send the password reset email.",
      );

      setResetting(false);
      return;
    }

    setSuccess(
      "Password reset instructions have been sent to your email.",
    );

    setResetting(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* Brand / visual side */}
        <div className="relative hidden overflow-hidden bg-ink lg:flex">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary blur-3xl" />

            <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary blur-3xl" />
          </div>

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-3"
              >
                <div className="flex h-14 w-25 items-center justify-center overflow-hidden rounded-2xl">
                  <img
                    src="/logo.png"
                    alt="VolunSport"
                    className="h-full w-full object-contain"
                  />
                </div>

                <div>
                  <p className="text-lg font-semibold text-white">
                    VolunSport
                  </p>

                  <p className="text-xs text-white/60">
                    Morocco
                  </p>
                </div>
              </Link>
            </div>

            <div className="max-w-xl">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
                Control workspace
              </p>

              <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-tight text-white xl:text-6xl">
                Manage the people behind every event.
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-white/65">
                Access volunteer operations, events,
                roles, shifts, accreditation, and
                platform reporting from one workspace.
              </p>
            </div>

            <p className="text-xs text-white/40">
              VolunSport Morocco · Administration
            </p>
          </div>
        </div>

        {/* Login side */}
        <div className="flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="mb-10 lg:hidden">
              <Link
                to="/"
                className="inline-flex items-center gap-3"
              >
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-primary">
                  <img
                    src="/logo.png"
                    alt="VolunSport"
                    className="h-full w-full object-contain"
                  />
                </div>

                <div>
                  <p className="font-semibold">
                    VolunSport
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Morocco
                  </p>
                </div>
              </Link>
            </div>

            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <LockKeyhole className="h-5 w-5" />
              </div>

              <h2 className="mt-6 text-3xl font-semibold tracking-tight">
                Admin sign in
              </h2>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Sign in to access the VolunSport
                administration workspace.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >
              {/* Email */}
              <label className="block text-sm font-medium">
                Email

                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError(null);
                    setSuccess(null);
                  }}
                  placeholder="admin@example.com"
                  autoComplete="email"
                  required
                  disabled={
                    submitting || resetting
                  }
                  className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>

              {/* Password */}
              <label className="block text-sm font-medium">
                Password

                <div className="relative mt-2">
                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) => {
                      setPassword(
                        event.target.value,
                      );
                      setError(null);
                      setSuccess(null);
                    }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    disabled={
                      submitting || resetting
                    }
                    className="h-12 w-full rounded-2xl border border-border bg-background px-4 pr-12 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current,
                      )
                    }
                    disabled={
                      submitting || resetting
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </label>

              {/* Forgot password */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={
                    loading ||
                    submitting ||
                    resetting ||
                    !email.trim()
                  }
                  className="text-sm font-medium text-primary transition hover:text-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {resetting
                    ? "Sending reset email..."
                    : "Forgot password?"}
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
                  {success}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={
                  loading ||
                  submitting ||
                  resetting ||
                  !email.trim() ||
                  !password
                }
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  "Signing in..."
                ) : (
                  <>
                    Sign in to admin
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 border-t border-border pt-6">
              <Link
                to="/login"
                className="text-sm text-muted-foreground transition hover:text-primary"
              >
                ← Back to volunteer sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}