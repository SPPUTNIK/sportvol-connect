import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ChevronRight, Clock3, QrCode, ShieldAlert, Sparkles, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  VSAvatar,
  VSButton,
  VSCard,
  VSCardContent,
  VSPageHeader,
  VSSectionHeader,
  VSStatusBadge,
} from "@/components/design-system";
import { type LeaderScannerVolunteer } from "@/mocks/leaderDemo";
import { leaderService } from "@/services/leader/leaderService";

const formatDisplayStatus = (status: LeaderScannerVolunteer["attendanceStatus"]) => {
  switch (status) {
    case "not_checked_in":
      return "Not checked in";
    case "checked_in":
      return "Checked in";
    case "checked_out":
      return "Checked out";
    default:
      return "Unknown";
  }
};

const getVolunteerStatusTone = (status: LeaderScannerVolunteer["attendanceStatus"]) => {
  switch (status) {
    case "not_checked_in":
      return "pending";
    case "checked_in":
      return "approved";
    case "checked_out":
      return "completed";
    default:
      return "draft";
  }
};

export const Route = createFileRoute("/leader/scanner")({
  component: LeaderScannerPage,
  head: () => ({ meta: [{ title: "QR Scanner | SportVol Connect" }] }),
});

function LeaderScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<LeaderScannerVolunteer | null>(null);
  const [processingAction, setProcessingAction] = useState<"check-in" | "check-out" | null>(null);
  const [recentScans, setRecentScans] = useState(leaderService.getRecentScans());

  const authorizedVolunteer = useMemo(() => leaderService.getAuthorizedVolunteers(), []);

  const handleSimulatedScan = () => {
    setIsScanning(true);

    window.setTimeout(() => {
      const volunteer =
        leaderService.getScannerVolunteers()[
          Math.floor(Math.random() * leaderService.getScannerVolunteers().length)
        ];
      setSelectedVolunteer(volunteer ?? authorizedVolunteer[0] ?? null);
      setIsScanning(false);
    }, 900);
  };

  const isUnauthorized =
    selectedVolunteer && selectedVolunteer.committeeId !== leaderService.getCommittee().id;

  const handleAttendanceAction = async (action: "check-in" | "check-out") => {
    if (!selectedVolunteer) return;

    setProcessingAction(action);

    await new Promise((resolve) => window.setTimeout(resolve, 600));

    const nextVolunteer = leaderService.updateAttendanceStatus(selectedVolunteer, action);

    setSelectedVolunteer(nextVolunteer);

    setRecentScans((current) => [leaderService.createRecentScan(nextVolunteer, action), ...current].slice(0, 5));

    toast.success(
      `${nextVolunteer.firstName} ${nextVolunteer.lastName} checked ${
        action === "check-in" ? "in" : "out"
      } successfully.`,
    );
    setProcessingAction(null);
  };

  const currentStatus = selectedVolunteer?.attendanceStatus ?? "not_checked_in";
  const canCheckIn = selectedVolunteer && selectedVolunteer.attendanceStatus === "not_checked_in";
  const canCheckOut = selectedVolunteer && selectedVolunteer.attendanceStatus === "checked_in";

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <VSPageHeader
        eyebrow="Operations"
        title="QR Scanner"
        description="Scan a volunteer accreditation to check them in or out."
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <VSCard className="rounded-[2rem] border-border bg-card shadow-[var(--shadow-float)]">
          <VSCardContent className="p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="eyebrow">Scan accreditation</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                  Demo scanner
                </h2>
              </div>
              <div className="rounded-full border border-border bg-background px-3 py-2 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                Mock mode
              </div>
            </div>

            <div className="mt-6 rounded-[2rem] border border-dashed border-border bg-muted/30 p-6">
              <div className="mx-auto flex max-w-[220px] flex-col items-center justify-center rounded-[1.75rem] border border-border bg-background p-8 shadow-[var(--shadow-soft)]">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 text-primary">
                  <QrCode className="h-10 w-10" aria-hidden="true" />
                </div>
                <div className="mt-5 h-14 w-full rounded-xl border border-dashed border-primary/20 bg-primary/5" />
                <p className="mt-4 text-center text-sm leading-6 text-muted-foreground">
                  Point the camera at a volunteer’s accreditation QR code.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <VSButton
                onClick={handleSimulatedScan}
                className="h-11 flex-1"
                aria-label="Simulate QR scan"
                disabled={isScanning}
              >
                {isScanning ? "Scanning accreditation..." : "Simulate QR Scan"}
              </VSButton>
            </div>
          </VSCardContent>
        </VSCard>

        <VSCard className="rounded-[2rem] border-border bg-card shadow-[var(--shadow-float)]">
          <VSCardContent className="p-6 sm:p-8">
            {selectedVolunteer ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                    <p className="text-base font-semibold text-foreground">Volunteer found</p>
                  </div>
                  <VSStatusBadge status={formatDisplayStatus(currentStatus)} />
                </div>

                <div className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex items-start gap-4">
                    <VSAvatar
                      name={`${selectedVolunteer.firstName} ${selectedVolunteer.lastName}`}
                      src={selectedVolunteer.avatar}
                      size="lg"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xl font-semibold text-foreground">
                        {selectedVolunteer.firstName} {selectedVolunteer.lastName}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{selectedVolunteer.role}</p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 p-3">
                      <span className="text-muted-foreground">Committee</span>
                      <span className="font-medium text-foreground">{leaderService.getCommittee().name}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 p-3">
                      <span className="text-muted-foreground">Event</span>
                      <span className="font-medium text-foreground">{leaderService.getEvent().title}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 p-3">
                      <span className="text-muted-foreground">Attendance</span>
                      <span className="font-medium text-foreground">
                        {formatDisplayStatus(currentStatus)}
                      </span>
                    </div>
                  </div>
                </div>

                {isUnauthorized ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="mt-0.5 h-5 w-5" aria-hidden="true" />
                      <div>
                        <p className="font-semibold">Volunteer not assigned to your committee</p>
                        <p className="mt-1 text-sm leading-6">
                          This accreditation belongs to a volunteer outside your committee.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {currentStatus === "checked_out" ? (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-5 w-5" aria-hidden="true" />
                          <div>
                            <p className="font-semibold">Checked out</p>
                            <p className="mt-1 text-sm leading-6">Today at 16:32</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <VSButton
                        className="h-11 w-full"
                        onClick={() =>
                          void handleAttendanceAction(
                            currentStatus === "checked_in" ? "check-out" : "check-in",
                          )
                        }
                        disabled={processingAction !== null || currentStatus === "checked_out"}
                      >
                        {processingAction === "check-in" && currentStatus === "not_checked_in"
                          ? "Checking in..."
                          : processingAction === "check-out" && currentStatus === "checked_in"
                            ? "Checking out..."
                            : currentStatus === "checked_in"
                              ? "Check out"
                              : "Check in"}
                      </VSButton>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                No volunteer scanned yet.
              </div>
            )}
          </VSCardContent>
        </VSCard>
      </div>

      <div className="space-y-4">
        <VSSectionHeader
          title="Recent scans"
          description="Latest attendance updates from your committee team."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recentScans.map((item) => (
            <VSCard key={item.id} className="rounded-[1.75rem] border-border">
              <VSCardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-foreground">{item.volunteerName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.role}</p>
                  </div>
                  <VSStatusBadge status={item.status === "checked_in" ? "approved" : "completed"} />
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock3 className="h-4 w-4" aria-hidden="true" />
                  <span>{item.timestamp}</span>
                </div>
              </VSCardContent>
            </VSCard>
          ))}
        </div>
      </div>
    </div>
  );
}
