import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";

type OAuthResult = {
  redirect_url?: string;
  redirect_to?: string;
  client?: { name?: string; client_name?: string; redirect_uri?: string } | null;
  scope?: string;
};

type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: OAuthResult | null; error: Error | null }>;
  approveAuthorization: (id: string) => Promise<{ data: OAuthResult | null; error: Error | null }>;
  denyAuthorization: (id: string) => Promise<{ data: OAuthResult | null; error: Error | null }>;
};

const oauth = (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    authorization_id: typeof search["authorization_id"] === "string" ? search["authorization_id"] : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/login", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
    if (error) throw error;
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    const { data: session } = await supabase.auth.getUser();
    return { details: data, email: session.user?.email ?? null };
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="shell flex min-h-screen items-center justify-center py-24">
      <p className="max-w-md text-center text-sm text-muted-foreground">
        Could not load this authorization request: {String((error as Error)?.message ?? error)}
      </p>
    </main>
  ),
});

function Consent() {
  const { details, email } = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientName = details?.client?.name ?? details?.client?.client_name ?? "An app";
  const scopes = (details?.scope ?? "").split(" ").filter(Boolean);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error: decideError } = approve
      ? await oauth.approveAuthorization(authorization_id)
      : await oauth.denyAuthorization(authorization_id);
    if (decideError) {
      setBusy(false);
      setError(decideError.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="shell flex min-h-screen items-center justify-center py-24">
      <div className="w-full max-w-md rounded-[2rem] border border-hairline-invert bg-card p-10 shadow-[var(--shadow-lift)]">
        <h1 className="text-2xl font-semibold text-foreground">
          Connect {clientName} to VolunSport Morocco
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {clientName} will be able to call this app&apos;s enabled tools while you are signed in.
        </p>
        {email && (
          <p className="mt-4 text-sm text-foreground">
            Signed in as <span className="font-medium">{email}</span>
          </p>
        )}
        {details?.client?.redirect_uri && (
          <p className="mt-2 break-all text-xs text-muted-foreground">
            Redirects to {details.client.redirect_uri}
          </p>
        )}
        {scopes.length > 0 && (
          <ul className="mt-5 space-y-1 text-sm text-muted-foreground">
            {scopes.map((scope) => (
              <li key={scope}>
                {scope === "email"
                  ? "Share your email address"
                  : scope === "profile" || scope === "openid"
                    ? "Share your basic profile"
                    : `Additional permission requested: ${scope}`}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-5 text-xs text-muted-foreground">
          This does not bypass this app&apos;s permissions or backend policies.
        </p>

        {error && (
          <p role="alert" className="mt-5 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="mt-8 flex gap-3">
          <button
            disabled={busy}
            onClick={() => decide(true)}
            className="flex-1 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            Approve
          </button>
          <button
            disabled={busy}
            onClick={() => decide(false)}
            className="flex-1 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-60"
          >
            Cancel connection
          </button>
        </div>
      </div>
    </main>
  );
}
