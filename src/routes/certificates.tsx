import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { I18nProvider } from "@/lib/i18n";
import { certificateService } from "@/services/certificateService";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Certificate } from "@/lib/types";

export const Route = createFileRoute("/certificates")({
  component: Certificates,
  head: () => ({
    meta: [{ title: "Certificates | VolunSport Morocco" }],
  }),
});

function Certificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    certificateService
      .getCertificates()
      .then((data) => setCertificates(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <I18nProvider>
      <div className="shell min-h-screen py-24">
        <div className="mb-8 space-y-3">
          <p className="eyebrow">Certificates</p>
          <h1 className="display-md text-ink-foreground">Your volunteer certificates</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Download or preview certificates earned from completed volunteer events.
          </p>
        </div>

        {loading ? (
          <LoadingState message="Loading certificates…" />
        ) : error ? (
          <EmptyState title="Error" description={error} />
        ) : certificates.length === 0 ? (
          <EmptyState
            title="No certificates yet"
            description="Complete a volunteer event to earn your first certificate."
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {certificates.map((certificate) => (
              <Card key={certificate.id} className="rounded-[2rem] border border-hairline-invert">
                <CardHeader>
                  <CardTitle>{certificate.event_title}</CardTitle>
                  <CardDescription>{certificate.role_name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                    <div>
                      <p className="text-foreground font-semibold">Date</p>
                      <p className="mt-1">{certificate.date}</p>
                    </div>
                    <div>
                      <p className="text-foreground font-semibold">Hours</p>
                      <p className="mt-1">{certificate.hours}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      ID: {certificate.certificate_id}
                    </p>
                    <button
                      type="button"
                      className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                    >
                      Download
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </I18nProvider>
  );
}
