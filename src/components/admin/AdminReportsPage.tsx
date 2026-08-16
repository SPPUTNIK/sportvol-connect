import { Download } from "lucide-react";

import { AdminGate } from "./components/AdminGate";

import {
  VSButton,
  VSCard,
  VSCardContent,
  VSPageHeader,
  VSSectionHeader,
} from "@/components/design-system";

import { adminService } from "@/services/adminService";

export function AdminReportsPage() {
  const reports = adminService.getReports();

  return (
    <AdminGate title="Reports">
      <div className="mx-auto max-w-7xl">
        <VSPageHeader
          eyebrow="Reporting"
          title="Reports"
          description="A clear operational snapshot for planning and review."
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {reports.map((item) => (
            <VSCard
              key={item.label}
              className="rounded-[1.75rem] border-border"
            >
              <VSCardContent className="p-6">
                <p className="text-sm text-muted-foreground">
                  {item.label}
                </p>

                <p className="mt-3 text-3xl font-semibold text-foreground">
                  {item.value}
                </p>

                <p className="mt-2 text-sm font-semibold text-primary">
                  {item.change}
                </p>

                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  {item.description}
                </p>
              </VSCardContent>
            </VSCard>
          ))}
        </div>

        <VSCard className="mt-6 rounded-[2rem] border-border">
          <VSCardContent className="p-6 sm:p-8">
            <VSSectionHeader
              eyebrow="Exports"
              title="Download operational reports"
            />

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {reports.map((item) => (
                <VSButton
                  key={item.label}
                  variant="outline"
                >
                  <Download className="h-4 w-4" />
                  {item.label}
                </VSButton>
              ))}
            </div>
          </VSCardContent>
        </VSCard>
      </div>
    </AdminGate>
  );
}