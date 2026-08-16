import { Download, Plus, ShieldCheck } from "lucide-react";

import { AdminGate } from "./components/AdminGate";
import { formatStatus } from "./components/adminHelpers";

import {
  VSButton,
  VSCard,
  VSCardContent,
  VSPageHeader,
  VSStatusBadge,
} from "@/components/design-system";

import { adminService } from "@/services/adminService";

export function AdminCertificatesPage() {
  const certificates = adminService.getCertificates();

  return (
    <AdminGate title="Certificates">
      <div className="mx-auto max-w-7xl">
        <VSPageHeader
          eyebrow="Impact"
          title="Certificates"
          description="Preview, generate, and issue proof of volunteer contribution."
          action={
            <VSButton>
              <Plus className="h-4 w-4" />
              Generate certificate
            </VSButton>
          }
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {certificates.map((item) => (
            <VSCard
              key={item.id}
              className="rounded-[1.75rem] border-border"
            >
              <VSCardContent className="p-6">
                <div className="flex items-center justify-between">
                  <ShieldCheck className="h-6 w-6 text-primary" />

                  <VSStatusBadge
                    status={formatStatus(item.status)}
                  />
                </div>

                <p className="mt-5 font-mono text-xs text-muted-foreground">
                  {item.id}
                </p>

                <h2 className="mt-2 text-lg font-semibold text-foreground">
                  {item.volunteer}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {item.event}
                </p>

                <div className="mt-5 flex justify-between text-sm">
                  <span>{item.hours} hours</span>
                  <span>{item.date || "Not issued"}</span>
                </div>

                <div className="mt-6 flex gap-2">
                  <VSButton
                    variant="outline"
                    size="sm"
                  >
                    Preview
                  </VSButton>

                  <VSButton
                    variant="ghost"
                    size="sm"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </VSButton>
                </div>
              </VSCardContent>
            </VSCard>
          ))}
        </div>
      </div>
    </AdminGate>
  );
}