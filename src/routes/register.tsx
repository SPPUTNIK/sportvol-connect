import { useEffect, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe2,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  UserRound,
  Users,
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import { I18nProvider, useI18n } from "@/lib/i18n";
import logoAsset from "@/assets/volunsport-logo.png";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Country, City, type ICountry, type ICity } from "country-state-city";

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
    meta: [
      {
        title: "Create Account | VolunSport Morocco",
      },
      {
        name: "description",
        content: "Create your VolunSport Morocco volunteer account.",
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
    country: "",
  });

  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);

  const [cities, setCities] = useState<ICity[]>([]);

  const [error, setError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const [success, setSuccess] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);

  const [countdown, setCountdown] = useState(5);

  const { t } = useI18n();
  

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
            search: next ? { next } : undefined,
          });

          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [success, navigate, next]);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);

    /*
     * Basic frontend validation for date of birth.
     */
    if (!form.dateOfBirth) {
      setError("Please enter your date of birth.");
      return;
    }

    const selectedDate = new Date(`${form.dateOfBirth}T00:00:00`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(selectedDate.getTime()) || selectedDate > today) {
      setError("Date of birth cannot be in the future.");
      return;
    }

    setSubmitting(true);

    const result = await signUp(form.email, form.password, {
      first_name: form.firstName,
      last_name: form.lastName,

      // NEW
      date_of_birth: form.dateOfBirth,

      phone: form.phone,
      city: form.city,
      country: form.country,
    });

    setSubmitting(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setNeedsEmailConfirmation(result.needsEmailConfirmation);

    setSuccess(true);
  };

  return (
    <I18nProvider>
      <div className="shell min-h-screen py-16 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-5xl">
          <div className="grid overflow-hidden rounded-[2rem] border border-border bg-card shadow-[var(--shadow-lift)] lg:grid-cols-[0.72fr_1.28fr]">

            {/* =========================
                LEFT INTRO
            ========================== */}
            <aside className="hidden border-r border-border p-9 lg:flex lg:flex-col lg:justify-between xl:p-11">
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

                <div className="mt-16">
                  <p className="eyebrow">
                    Join the community
                  </p>

                  <h2 className="mt-3 text-4xl font-semibold leading-[1.05] tracking-tight text-foreground">
                    Start your
                    <br />
                    volunteer
                    <br />
                    <span className="text-primary">journey.</span>
                  </h2>

                  <p className="mt-6 max-w-sm text-sm leading-7 text-muted-foreground">
                    Create your VolunSport account and discover opportunities
                    to contribute to Morocco's sports community.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/60 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Discover opportunities
                    </p>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Events across Morocco
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/60 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Meet your community
                    </p>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Connect through sport
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            {/* =========================
                FORM
            ========================== */}
            <section className="p-6 sm:p-9 lg:p-11 xl:p-12">
              <div className="mx-auto max-w-xl">

                {/* Mobile brand */}
                <div className="mb-8 flex items-center gap-3 lg:hidden">
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

                {/* Header */}
                <div>
                  <p className="eyebrow">
                    Become a volunteer
                  </p>

                  <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    Create your account
                  </h1>

                  <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                    Join the Moroccan sports volunteering community, discover
                    events and build your experience.
                  </p>
                </div>

                {/* Progress indicator */}
                <div className="mt-7 flex items-center gap-3">
                  <div className="h-1.5 flex-1 rounded-full bg-primary" />
                  <div className="h-1.5 flex-1 rounded-full bg-primary/20" />
                  <div className="h-1.5 flex-1 rounded-full bg-primary/20" />
                </div>

                <p className="mt-2 text-right text-[11px] text-muted-foreground">
                  Personal information
                </p>

                <form
                  onSubmit={handleSubmit}
                  className="mt-7 space-y-5"
                >
                  {/* =========================
                      NAME
                  ========================== */}
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <UserRound className="h-4 w-4 text-primary" />

                      <p className="text-sm font-semibold text-foreground">
                        Personal details
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block text-sm font-medium text-foreground">
                        First name

                        <input
                          type="text"
                          value={form.firstName}
                          onChange={(event) =>
                            updateField("firstName", event.target.value)
                          }
                          required
                          autoComplete="given-name"
                          placeholder="First name"
                          className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                        />
                      </label>

                      <label className="block text-sm font-medium text-foreground">
                        Last name

                        <input
                          type="text"
                          value={form.lastName}
                          onChange={(event) =>
                            updateField("lastName", event.target.value)
                          }
                          required
                          autoComplete="family-name"
                          placeholder="Last name"
                          className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                        />
                      </label>
                    </div>
                  </div>

                  {/* =========================
                      DATE OF BIRTH
                  ========================== */}
                  <label className="block text-sm font-medium text-foreground">
                    <span className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      Date of birth
                    </span>

                    <div className="relative mt-2">
                      <input
                        type="date"
                        value={form.dateOfBirth}
                        onChange={(event) =>
                          updateField("dateOfBirth", event.target.value)
                        }
                        required
                        max={new Date().toISOString().split("T")[0]}
                        autoComplete="bday"
                        className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                      />
                    </div>

                    <span className="mt-2 block text-xs text-muted-foreground">
                      Please enter your real date of birth.
                    </span>
                  </label>

                  {/* =========================
                      CONTACT
                  ========================== */}
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />

                      <p className="text-sm font-semibold text-foreground">
                        Contact information
                      </p>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-foreground">
                        Email

                        <div className="group relative">
                          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition group-focus-within:text-primary" />

                          <input
                            type="email"
                            value={form.email}
                            onChange={(event) =>
                              updateField("email", event.target.value)
                            }
                            required
                            autoComplete="email"
                            placeholder="you@example.com"
                            className="mt-2 h-12 w-full rounded-2xl border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                          />
                        </div>
                      </label>

                      <label className="block text-sm font-medium text-foreground">
                        <span className="flex items-center gap-2">
                          Phone
                          <span className="text-xs font-normal text-muted-foreground">
                            Optional
                          </span>
                        </span>

                        <div className="group relative">
                          <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition group-focus-within:text-primary" />

                          <input
                            type="tel"
                            value={form.phone}
                            onChange={(event) =>
                              updateField("phone", event.target.value)
                            }
                            autoComplete="tel"
                            placeholder="+212 ..."
                            className="mt-2 h-12 w-full rounded-2xl border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                          />
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* =========================
                      PASSWORD
                  ========================== */}
                  <label className="block text-sm font-medium text-foreground">
                    <span className="flex items-center gap-2">
                      <LockKeyhole className="h-4 w-4 text-primary" />
                      Password
                    </span>

                    <div className="group relative">
                      <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition group-focus-within:text-primary" />

                      <input
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(event) =>
                          updateField("password", event.target.value)
                        }
                        required
                        minLength={8}
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        className="mt-2 h-12 w-full rounded-2xl border border-border bg-background pl-11 pr-12 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((previous) => !previous)
                        }
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <span className="mt-2 block text-xs text-muted-foreground">
                      Use at least 8 characters.
                    </span>
                  </label>

                  {/* =========================
                      LOCATION
                  ========================== */}
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <Globe2 className="h-4 w-4 text-primary" />

                      <p className="text-sm font-semibold text-foreground">
                        Location
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Country */}
                      <label className="block text-sm font-medium text-foreground">
                        Country

                        <select
                          value={selectedCountry?.isoCode ?? ""}
                          onChange={(event) => {
                            const country = Country.getCountryByCode(
                              event.target.value,
                            );

                            setSelectedCountry(country ?? null);

                            const nextCities = country
                              ? (City.getCitiesOfCountry(
                                  country.isoCode,
                                ) ?? [])
                              : [];

                            setCities(nextCities);

                            setForm((previous) => ({
                              ...previous,
                              country: country?.name ?? "",
                              city: "",
                            }));
                          }}
                          autoComplete="country-name"
                          className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                        >
                          <option value="">Select country</option>

                          {Country.getAllCountries().map((country) => (
                            <option
                              key={country.isoCode}
                              value={country.isoCode}
                            >
                              {country.name}
                            </option>
                          ))}
                        </select>
                      </label>

                      {/* City */}
                      <label className="block text-sm font-medium text-foreground">
                        City

                        <select
                          value={form.city}
                          onChange={(event) =>
                            updateField("city", event.target.value)
                          }
                          disabled={!selectedCountry}
                          autoComplete="address-level2"
                          className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">
                            {selectedCountry
                              ? "Select city"
                              : "Select country first"}
                          </option>

                          {cities.map((city) => (
                            <option
                              key={`${city.name}-${city.stateCode ?? ""}`}
                              value={city.name}
                            >
                              {city.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div
                      role="alert"
                      className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm leading-6 text-destructive"
                    >
                      {error}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="group flex h-13 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md disabled:pointer-events-none disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Creating account…
                      </>
                    ) : (
                      <>
                        Create volunteer account
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs leading-5 text-muted-foreground">
                    By creating an account, you join the VolunSport Morocco
                    volunteer community.
                  </p>
                </form>

                {/* Login */}
                <div className="mt-7 flex items-center gap-4">
                  <div className="h-px flex-1 bg-border" />

                  <span className="text-xs text-muted-foreground">
                    Already a member?
                  </span>

                  <div className="h-px flex-1 bg-border" />
                </div>

                <Link
                  to="/login"
                  search={next ? { next } : undefined}
                  className="mt-5 flex h-12 w-full items-center justify-center rounded-full border border-border bg-background text-sm font-semibold text-foreground transition hover:border-primary/40 hover:bg-primary/5"
                >
                  Sign in to your account
                </Link>
              </div>
            </section>
          </div>
        </div>

        {/* =========================
            SUCCESS DIALOG
        ========================== */}
        <Dialog open={success} onOpenChange={() => {}}>
          <DialogContent className="max-w-md [&>button]:hidden">
            <DialogHeader>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                {needsEmailConfirmation ? (
                  <Mail className="h-7 w-7 text-primary" />
                ) : (
                  <CheckCircle2 className="h-7 w-7 text-primary" />
                )}
              </div>

              <DialogTitle className="mt-5 text-center text-2xl font-semibold">
                {needsEmailConfirmation
                  ? "Check your email"
                  : "Account created successfully"}
              </DialogTitle>

              <DialogDescription className="mt-3 text-center text-sm leading-6 text-muted-foreground">
                {needsEmailConfirmation ? (
                  <>
                    We sent a confirmation link to{" "}
                    <strong className="text-foreground">
                      {form.email}
                    </strong>
                    . Confirm your email before signing in.
                  </>
                ) : (
                  <>
                    Your volunteer account is ready. You will be redirected
                    to the sign-in page in{" "}
                    <strong className="text-foreground">
                      {countdown}s
                    </strong>
                    .
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
                    search: next ? { next } : undefined,
                  })
                }
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Continue to sign in

                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </I18nProvider>
  );
}
