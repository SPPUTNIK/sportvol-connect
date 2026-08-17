import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n";
import { PublicLayout } from "@/components/layouts/PublicLayout";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPassword,
  head: () => ({
    meta: [{ title: "Forgot Password | VolunSport Morocco" }],
  }),
});

function ForgotPassword() {
  const { sendResetPasswordEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <I18nProvider>
      <PublicLayout>
        <div className="shell min-h-screen py-24">
          <div className="mx-auto max-w-md rounded-[2rem] border border-hairline-invert bg-card p-10 shadow-[var(--shadow-lift)]">
            <h1 className="text-3xl font-semibold text-foreground">Reset your password</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Enter your email and we&apos;ll send a reset link so you can update your password.
            </p>

            <form
              className="mt-8 space-y-5"
              onSubmit={async (event) => {
                event.preventDefault();
                setError(null);
                setMessage(null);
                const { error } = await sendResetPasswordEmail(email, "/login");
                if (error) {
                  setError(error.message);
                  return;
                }
                setMessage("If your email exists, you will receive a reset link shortly.");
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

              {error && <p className="text-sm text-destructive">{error}</p>}
              {message && <p className="text-sm text-success">{message}</p>}

              <button
                type="submit"
                className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Send reset link
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Back to{" "}
              <Link to="/login" className="text-primary">
                sign in
              </Link>
            </p>
          </div>
        </div>
      </PublicLayout>
    </I18nProvider>
  );
}
