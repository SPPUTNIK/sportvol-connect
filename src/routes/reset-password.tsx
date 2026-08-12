import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { I18nProvider } from "@/lib/i18n";

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
  head: () => ({
    meta: [{ title: "Reset Password | VolunSport Morocco" }],
  }),
});

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSuccess(true);
  };

  return (
    <I18nProvider>
      <div className="shell min-h-screen py-24">
        <div className="mx-auto max-w-md rounded-[2rem] border border-hairline-invert bg-card p-10 shadow-[var(--shadow-lift)]">
          <h1 className="text-3xl font-semibold text-foreground">Reset your password</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Enter a new password for your account. This is the final step to complete password recovery.
          </p>

          {success ? (
            <div className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-foreground">
              <p className="text-lg font-semibold">Password updated</p>
              <p className="mt-3 text-sm text-muted-foreground">Your password has been reset. You can now sign in with your new password.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <label className="block text-sm font-medium text-foreground">
                New password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                  required
                  minLength={8}
                />
              </label>
              <label className="block text-sm font-medium text-foreground">
                Confirm password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="mt-2 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                  required
                />
              </label>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                type="submit"
                className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Reset password
              </button>
            </form>
          )}
        </div>
      </div>
    </I18nProvider>
  );
}
