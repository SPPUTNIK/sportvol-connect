import { useState, useEffect } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { CircleCheck as CheckCircle2, LoaderCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

type AccountType = "volunteer" | "admin";

function Register() {
  const { t } = useI18n();
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    city: "",
    country: "Morocco",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>("volunteer");
  const [countdown, setCountdown] = useState(3);

  const loginPath = accountType === "admin" ? "/admin/login" : "/login";

  useEffect(() => {
    if (!success) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate({ to: loginPath, search: next ? { next } : undefined });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [success, loginPath, navigate, next]);

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
                setSubmitting(true);
                const { error } = await signUp(form.email, form.password, {
                  first_name: form.firstName,
                  last_name: form.lastName,
                  phone: form.phone,
                  city: form.city,
                  country: form.country,
                });
                setSubmitting(false);
                if (error) {
                  setError(error.message);
                  return;
                }
                setSuccess(true);
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-foreground">
                  First name
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    required
                    className="mt-2 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                  />
                </label>
                <label className="block text-sm font-medium text-foreground">
                  Last name
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    required
                    className="mt-2 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                  />
                </label>
              </div>
              <label className="block text-sm font-medium text-foreground">
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="mt-2 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                />
              </label>
              <label className="block text-sm font-medium text-foreground">
                Password
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={8}
                  className="mt-2 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                />
              </label>
              <label className="block text-sm font-medium text-foreground">
                Phone
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="mt-2 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-foreground">
                  City
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="mt-2 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                  />
                </label>
                <label className="block text-sm font-medium text-foreground">
                  Country
                  <input
                    type="text"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="mt-2 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                  />
                </label>
              </div>

              {/* Account type selector */}
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Account type</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAccountType("volunteer")}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      accountType === "volunteer"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Volunteer
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType("admin")}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      accountType === "admin"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
              >
                {submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
                {submitting ? "Creating account…" : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already registered?{" "}
              <Link to="/login" search={{ next }} className="text-primary">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Success dialog */}
        <Dialog open={success} onOpenChange={() => {}}>
          <DialogContent className="max-w-md [&>button]:hidden">
            <DialogHeader>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              </div>
              <DialogTitle className="mt-4 text-center text-2xl font-semibold">
                Account created successfully
              </DialogTitle>
              <DialogDescription className="mt-2 text-center text-sm text-muted-foreground">
                Your {accountType === "admin" ? "admin" : "volunteer"} account has been created.
                You will be redirected to the {accountType === "admin" ? "admin" : "volunteer"} sign-in
                page in {countdown} second{countdown !== 1 ? "s" : ""}.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => navigate({ to: loginPath, search: next ? { next } : undefined })}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Continue to sign in
                <ArrowRight className="h-4 w-4" />
              </button>

              {accountType === "admin" && (
                <p className="text-center text-xs text-muted-foreground">
                  Admin access requires approval. If you are not redirected,
                  <Link to="/admin/login" className="ml-1 text-primary underline">
                    go to admin login
                  </Link>
                  .
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </PublicLayout>
    </I18nProvider>
  );
}
