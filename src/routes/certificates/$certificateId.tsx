import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import {
  VSButton,
  VSCard,
  VSCardContent,
  VSEmptyState,
  VSPageHeader,
} from "@/components/design-system";
import { volunteerContentService } from "@/services/volunteerContentService";

export const Route = createFileRoute("/certificates/$certificateId")({
  component: CertificateDetailRoute,
  head: ({ params }) => ({
    meta: [{ title: `Certificate · ${params.certificateId} | VolunSport Morocco` }],
  }),
});

function CertificateDetailRoute() {
  const { certificateId } = Route.useParams();
  const certificate = volunteerContentService
    .getCertificates()
    .find((item) => item.id === certificateId);
  if (!certificate)
    return (
      <AppShell title="Certificate">
        <VSEmptyState
          title="Certificate not found"
          description="This certificate is not available in your volunteer record."
          action={
            <VSButton asChild>
              <Link to="/certificates">Back to certificates</Link>
            </VSButton>
          }
        />
      </AppShell>
    );
  return (
    <AppShell title="Certificate detail">
      <div className="mx-auto max-w-4xl">
        <VSPageHeader
          eyebrow="Proof of impact"
          title={certificate.event}
          description={certificate.description}
          action={
            <VSButton variant="outline">
              <Download className="h-4 w-4" />
              Download
            </VSButton>
          }
        />
        <VSCard className="mt-8 overflow-hidden rounded-[2rem] border-border shadow-[var(--shadow-float)]">
          <div className="bg-ink p-8 text-white sm:p-12">
            <div className="flex items-center justify-between gap-4">
              <ShieldCheck className="h-10 w-10 text-primary" />
              <span className="font-mono text-xs tracking-wider text-white/60">
                {certificate.id}
              </span>
            </div>
            <p className="mt-20 text-xs uppercase tracking-[0.25em] text-white/55">
              Certificate of contribution
            </p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-5xl">{certificate.issuedTo}</h2>
            <p className="mt-4 text-sm text-white/65">
              For contributing as {certificate.role} during {certificate.event}.
            </p>
          </div>
          <VSCardContent className="grid gap-5 p-6 sm:grid-cols-3 sm:p-8">
            <Detail label="Certificate ID" value={certificate.id} />
            <Detail label="Volunteer role" value={certificate.role} />
            <Detail label="Verified hours" value={`${certificate.hours} hours`} />
            <Detail label="Issued" value={certificate.date} />
            <div className="sm:col-span-2">
              <VSButton asChild variant="outline">
                <Link to="/certificates">
                  <ArrowLeft className="h-4 w-4" />
                  Back to certificates
                </Link>
              </VSButton>
            </div>
          </VSCardContent>
        </VSCard>
      </div>
    </AppShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
