import { useEffect, useState } from "react";
import {
  Link,
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  Mail,
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n";
import { PublicLayout } from "@/components/layouts/PublicLayout";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

function safeNext(value: unknown): string | null {
  return (
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
  )
    ? value
    : null;
}

export const Route = createFileRoute("/register")({
  component: Register,

  validateSearch: (
    search: Record<string, unknown>,
  ): { next?: string } => {
    const next = safeNext(search["next"]);

    return next ? { next } : {};
  },

  head: () => ({
    meta: [
      {
        title: "Create Account | VolunSport Morocco",
      },
      {
        name: "description",
        content:
          "Create your VolunSport Morocco volunteer account.",
      },
    ],
  }),
});

function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { next } = Route.useSearch();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    country: "Morocco",
  });

  const [error, setError] =
    useState<string | null>(null);

  const [submitting, setSubmitting] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [
    needsEmailConfirmation,
    setNeedsEmailConfirmation,
  ] = useState(false);

  const [countdown, setCountdown] =
    useState(5);

  /**
   * Redirect after successful registration.
   */
  useEffect(() => {
    if (!success) return;

    const timer = window.setInterval(() => {
      setCountdown((previous) => {
        if (previous <= 1) {
          window.clearInterval(timer);

          navigate({
            to: "/login",
            search: next
              ? { next }
              : undefined,
          });

          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () =>
      window.clearInterval(timer);
  }, [success, navigate, next]);

  const updateField = (
    field: keyof typeof form,
    value: string,
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError(null);

    /*
     * Basic frontend validation for date of birth.
     */
    if (!form.dateOfBirth) {
      setError("Please enter your date of birth.");
      return;
    }

    const selectedDate = new Date(
      `${form.dateOfBirth}T00:00:00`,
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (
      Number.isNaN(selectedDate.getTime()) ||
      selectedDate > today
    ) {
      setError(
        "Date of birth cannot be in the future.",
      );
      return;
    }

    setSubmitting(true);

    const result = await signUp(
      form.email,
      form.password,
      {
        first_name: form.firstName,
        last_name: form.lastName,

        // NEW
        date_of_birth: form.dateOfBirth,

        phone: form.phone,
        city: form.city,
        country: form.country,
      },
    );

    setSubmitting(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setNeedsEmailConfirmation(
      result.needsEmailConfirmation,
    );

    setSuccess(true);
  };

  return (
    <I18nProvider>
      <PublicLayout>
        <div className="shell min-h-screen py-24 sm:py-28">
          <div className="mx-auto max-w-lg">
            <div className="rounded-[2rem] border border-border bg-card p-6 shadow-[var(--shadow-lift)] sm:p-9">
              {/* Header */}
              <div className="text-center">
                <p className="eyebrow">
                  Join VolunSport
                </p>

                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Create your account
                </h1>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                  Join the Moroccan sports
                  volunteering community, discover
                  events and build your experience.
                </p>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
              >
                {/* Name */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-foreground">
                    First name

                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(event) =>
                        updateField(
                          "firstName",
                          event.target.value,
                        )
                      }
                      required
                      autoComplete="given-name"
                      className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </label>

                  <label className="block text-sm font-medium text-foreground">
                    Last name

                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(event) =>
                        updateField(
                          "lastName",
                          event.target.value,
                        )
                      }
                      required
                      autoComplete="family-name"
                      className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </label>
                </div>

                {/* Date of Birth */}
                <label className="block text-sm font-medium text-foreground">
                  Date of birth

                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(event) =>
                      updateField(
                        "dateOfBirth",
                        event.target.value,
                      )
                    }
                    required
                    max={
                      new Date()
                        .toISOString()
                        .split("T")[0]
                    }
                    autoComplete="bday"
                    className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />

                  <span className="mt-2 block text-xs text-muted-foreground">
                    Please enter your real date of birth.
                  </span>
                </label>

                {/* Email */}
                <label className="block text-sm font-medium text-foreground">
                  Email

                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateField(
                        "email",
                        event.target.value,
                      )
                    }
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </label>

                {/* Password */}
                <label className="block text-sm font-medium text-foreground">
                  Password

                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) =>
                      updateField(
                        "password",
                        event.target.value,
                      )
                    }
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />

                  <span className="mt-2 block text-xs text-muted-foreground">
                    Use at least 8 characters.
                  </span>
                </label>

                {/* Phone */}
                <label className="block text-sm font-medium text-foreground">
                  Phone
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    Optional
                  </span>

                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      updateField(
                        "phone",
                        event.target.value,
                      )
                    }
                    autoComplete="tel"
                    placeholder="+212 ..."
                    className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </label>

                {/* Location */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-foreground">
                    City

                    <input
                      type="text"
                      value={form.city}
                      onChange={(event) =>
                        updateField(
                          "city",
                          event.target.value,
                        )
                      }
                      autoComplete="address-level2"
                      placeholder="Rabat"
                      className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </label>

                  <label className="block text-sm font-medium text-foreground">
                    Country

                    <input
                      type="text"
                      value={form.country}
                      onChange={(event) =>
                        updateField(
                          "country",
                          event.target.value,
                        )
                      }
                      autoComplete="country-name"
                      className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </label>
                </div>

                

                {/* Error */}
                {error && (
                  <div
                    role="alert"
                    className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive"
                  >
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Creating account…
                    </>
                  ) : (
                    <>
                      Create volunteer account
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Login */}
              <p className="mt-7 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  search={
                    next
                      ? { next }
                      : undefined
                  }
                  className="font-semibold text-primary hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Success dialog */}
        <Dialog
          open={success}
          onOpenChange={() => {}}
        >
          <DialogContent className="max-w-md [&>button]:hidden">
            <DialogHeader>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                {needsEmailConfirmation ? (
                  <Mail className="h-7 w-7 text-emerald-600" />
                ) : (
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                )}
              </div>

              <DialogTitle className="mt-4 text-center text-2xl font-semibold">
                {needsEmailConfirmation
                  ? "Check your email"
                  : "Account created successfully"}
              </DialogTitle>

              <DialogDescription className="mt-3 text-center text-sm leading-6 text-muted-foreground">
                {needsEmailConfirmation ? (
                  <>
                    We sent a confirmation link
                    to{" "}
                    <strong className="text-foreground">
                      {form.email}
                    </strong>
                    . Confirm your email before
                    signing in.
                  </>
                ) : (
                  <>
                    Your volunteer account is ready.
                    You will be redirected to the
                    sign-in page in{" "}
                    {countdown} second
                    {countdown !== 1
                      ? "s"
                      : ""}.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6">
              <button
                type="button"
                onClick={() =>
                  navigate({
                    to: "/login",
                    search: next
                      ? { next }
                      : undefined,
                  })
                }
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Continue to sign in
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </PublicLayout>
    </I18nProvider>
  );
}