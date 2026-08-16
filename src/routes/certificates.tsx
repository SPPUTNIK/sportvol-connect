import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Award, CalendarDays, Clock3 } from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import { certificateService } from "@/services/certificateService";

import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { Certificate } from "@/lib/types";

export const Route = createFileRoute("/certificates")({
  component: Certificates,

  head: () => ({
    meta: [
      {
        title: "Certificates | VolunSport Morocco",
      },
    ],
  }),
});

function Certificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    certificateService
      .getCertificates()
      .then((data) => {
        setCertificates(data);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load certificates.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <AppShell title="Certificates">
      <main className="mx-auto max-w-7xl space-y-8">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="space-y-3">
          <p className="eyebrow">
            Certificates
          </p>

          <h1 className="display-md">
            Your volunteer certificates
          </h1>

          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Download or preview certificates earned from
            your completed volunteer events.
          </p>
        </header>

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading && (
          <LoadingState
            message="Loading your certificates…"
          />
        )}

        {/* =====================================================
            ERROR
        ===================================================== */}

        {!loading && error && (
          <EmptyState
            title="Unable to load certificates"
            description={error}
          />
        )}

        {/* =====================================================
            EMPTY
        ===================================================== */}

        {!loading &&
          !error &&
          certificates.length === 0 && (
            <EmptyState
              title="No certificates yet"
              description="Complete a volunteer event to earn your first certificate."
            />
          )}

        {/* =====================================================
            CERTIFICATES
        ===================================================== */}

        {!loading &&
          !error &&
          certificates.length > 0 && (
            <div className="grid gap-6 lg:grid-cols-2">

              {certificates.map((certificate) => (
                <Card
                  key={certificate.id}
                  className="overflow-hidden rounded-[2rem] border-border bg-card shadow-[var(--shadow-lift)]"
                >

                  {/* ===========================================
                      CARD HEADER
                  =========================================== */}

                  <CardHeader className="p-6 sm:p-7">

                    <div className="flex items-start justify-between gap-4">

                      <div className="min-w-0">

                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Award className="h-5 w-5" />
                        </div>

                        <CardTitle className="text-xl">
                          {certificate.event_title}
                        </CardTitle>

                        <CardDescription className="mt-2">
                          {certificate.role_name}
                        </CardDescription>

                      </div>

                      <div className="shrink-0 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600">
                        Earned
                      </div>

                    </div>

                  </CardHeader>

                  {/* ===========================================
                      CONTENT
                  =========================================== */}

                  <CardContent className="space-y-6 px-6 pb-6 sm:px-7 sm:pb-7">

                    {/* INFO */}

                    <div className="grid gap-3 sm:grid-cols-2">
                    </div>

                    {/* DESCRIPTION */}

                    {"description" in certificate &&
                      certificate.description && (
                        <div className="rounded-2xl bg-muted/30 p-5">

                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            Certificate recognition
                          </p>

                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {String(certificate.description)}
                          </p>

                        </div>
                      )}

                    {/* FOOTER */}

                    <div className="flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">

                      <div>
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Certificate ID
                        </p>

                        <p className="mt-1 font-mono text-sm font-semibold text-foreground">
                          {certificate.certificate_id}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="
                          inline-flex
                          items-center
                          justify-center
                          gap-2
                          rounded-full
                          bg-primary
                          px-5
                          py-2.5
                          text-sm
                          font-semibold
                          text-primary-foreground
                          transition
                          hover:bg-primary/90
                        "
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>

                    </div>

                  </CardContent>
                </Card>
              ))}

            </div>
          )}

      </main>
    </AppShell>
  );
}