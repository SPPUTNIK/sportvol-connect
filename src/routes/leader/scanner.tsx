import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  Clock3,
  QrCode,
  Camera,
  CameraOff,
  UserCheck,
  UserRoundCheck,
  LogOut,
  ShieldCheck,
  ScanLine,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
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
import { type LeaderScannerVolunteer } from "@/services/leader/leaderService";
import { leaderService } from "@/services/leader/leaderService";

const formatDisplayStatus = (
  status: LeaderScannerVolunteer["attendanceStatus"],
) => {
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

export const Route = createFileRoute("/leader/scanner")({
  component: LeaderScannerPage,
  head: () => ({
    meta: [{ title: "QR Scanner | SportVol Connect" }],
  }),
});

function VolunteerAttendanceModal({
  volunteer,
  currentStatus,
  canCheckIn,
  canCheckOut,
  isCheckedOut,
  processingAction,
  onCheckIn,
  onCheckOut,
  onClose,
}: {
  volunteer: LeaderScannerVolunteer;
  currentStatus:
    | "not_checked_in"
    | "checked_in"
    | "checked_out";
  canCheckIn: boolean;
  canCheckOut: boolean;
  isCheckedOut: boolean;
  processingAction:
    | "check-in"
    | "check-out"
    | null;
  onCheckIn: () => void;
  onCheckOut: () => void;
  onClose: () => void;
}) {
  const statusLabel = formatDisplayStatus(currentStatus);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
      <div className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[2rem] border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="border-b border-border px-5 py-5 sm:px-7">
          <button
            type="button"
            onClick={onClose}
            disabled={processingAction !== null}
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-lg text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            aria-label="Close"
          >
            ×
          </button>

          <div className="flex items-center gap-2 pr-12">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Accreditation
              </p>

              <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Volunteer verified
              </h2>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-7">
          {/* Volunteer identity */}
          <div className="rounded-2xl border border-border bg-background p-4 sm:p-5">
            <div className="flex items-center gap-4">
              <VSAvatar
                name={`${volunteer.firstName} ${volunteer.lastName}`}
                src={volunteer.avatar}
                size="lg"
              />

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-semibold text-foreground sm:text-xl">
                  {volunteer.firstName} {volunteer.lastName}
                </h3>

                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {volunteer.role}
                </p>
              </div>

              <VSStatusBadge status={statusLabel} />
            </div>
          </div>

          {/* Assignment */}
          <div>
            <p className="mb-3 text-sm font-semibold text-foreground">
              Assignment
            </p>

            <div className="overflow-hidden rounded-2xl border border-border">
              <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                <div className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Committee
                  </p>

                  <p className="mt-1.5 truncate text-sm font-semibold text-foreground">
                    {volunteer.committeeName ??
                      "Assigned committee"}
                  </p>
                </div>

                <div className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Role
                  </p>

                  <p className="mt-1.5 truncate text-sm font-semibold text-foreground">
                    {volunteer.role}
                  </p>
                </div>

                <div className="border-t border-border p-4 sm:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Event
                  </p>

                  <p className="mt-1.5 text-sm font-semibold text-foreground">
                    {volunteer.eventTitle ??
                      "Assigned event"}
                  </p>
                </div>

                <div className="border-t border-border p-4 sm:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Shift
                  </p>

                  <p className="mt-1.5 text-sm font-semibold text-foreground">
                    {volunteer.shiftTitle ??
                      "Assigned shift"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance state */}
          <div>
            <p className="mb-3 text-sm font-semibold text-foreground">
              Attendance
            </p>

            {isCheckedOut ? (
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-semibold text-foreground">
                    Attendance completed
                  </p>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    This volunteer has already checked out
                    from this shift.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-3 flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4">
                  <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Assigned shift validation
                    </p>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Attendance is checked against this
                      volunteer&apos;s exact assigned shift,
                      including its date and time window.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <VSButton
                    className="h-12 w-full"
                    onClick={onCheckIn}
                    disabled={
                      processingAction !== null ||
                      !canCheckIn
                    }
                  >
                    <UserCheck className="mr-2 h-4 w-4" />

                    {processingAction === "check-in"
                      ? "Checking in..."
                      : "Check in"}
                  </VSButton>

                  <VSButton
                    variant="outline"
                    className="h-12 w-full"
                    onClick={onCheckOut}
                    disabled={
                      processingAction !== null ||
                      !canCheckOut
                    }
                  >
                    <LogOut className="mr-2 h-4 w-4" />

                    {processingAction === "check-out"
                      ? "Checking out..."
                      : "Check out"}
                  </VSButton>
                </div>
              </>
            )}
          </div>

          {/* Close */}
          <VSButton
            variant="outline"
            className="h-11 w-full"
            onClick={onClose}
            disabled={processingAction !== null}
          >
            Close
          </VSButton>
        </div>
      </div>
    </div>
  );
}

function LeaderScannerPage() {
  const [isScanning, setIsScanning] = useState(false);

  const [selectedVolunteer, setSelectedVolunteer] =
    useState<LeaderScannerVolunteer | null>(null);

  const [processingAction, setProcessingAction] =
    useState<"check-in" | "check-out" | null>(null);

  const [recentScans, setRecentScans] = useState<
    Awaited<ReturnType<typeof leaderService.getRecentScans>>
  >([]);

  const [loading, setLoading] = useState(true);

  const [cameraError, setCameraError] = useState<string | null>(
    null,
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const qrReaderRef =
    useRef<BrowserMultiFormatReader | null>(null);

  const scanHandledRef = useRef(false);

  const controlsRef = useRef<{
    stop: () => void;
  } | null>(null);

  const [scanMessage, setScanMessage] =
    useState("Point the camera at the QR code");

  // ============================================================
  // LOAD RECENT SCANS
  // ============================================================

  useEffect(() => {
    let mounted = true;

    async function loadScannerData() {
      try {
        setLoading(true);

        const scans = await leaderService.getRecentScans();

        if (!mounted) return;

        setRecentScans(Array.isArray(scans) ? scans : []);
      } catch (error) {
        console.error(
          "Failed to load scanner data:",
          error,
        );

        if (mounted) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to load scanner data.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadScannerData();

    return () => {
      mounted = false;
    };
  }, []);

  // ============================================================
  // STOP CAMERA
  // ============================================================

  const stopScanner = () => {
    console.log("[QR] Stopping scanner...");

    try {
      controlsRef.current?.stop();
    } catch (error) {
      console.error(
        "[QR] Failed to stop ZXing:",
        error,
      );
    }

    controlsRef.current = null;
    qrReaderRef.current = null;

    const video = videoRef.current;

    if (
      video?.srcObject instanceof
      MediaStream
    ) {
      video.srcObject
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      video.srcObject = null;
    }

    scanHandledRef.current = false;

    setIsScanning(false);
  };

  // ============================================================
  // REAL QR SCANNER
  // ============================================================

  const startScanner = async () => {
    if (isScanning) {
      return;
    }

    const video = videoRef.current;

    if (!video) {
      const message =
        "Camera preview is not ready.";

      setCameraError(message);
      toast.error(message);
      return;
    }

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      const message =
        "Camera access is not supported in this browser.";

      setCameraError(message);
      toast.error(message);
      return;
    }

    try {
      console.log("[QR] Starting camera...");

      setCameraError(null);
      setSelectedVolunteer(null);
      scanHandledRef.current = false;
      setIsScanning(true);

      // ----------------------------------------------------------
      // 1. Open camera ourselves
      // ----------------------------------------------------------

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: {
              ideal: "environment",
            },
            width: {
              ideal: 1280,
            },
            height: {
              ideal: 720,
            },
          },
          audio: false,
        });

      console.log("[QR] Camera stream opened.");

      setScanMessage(
        "Point the camera at the QR code",
      );

      const videoTrack =
        stream.getVideoTracks()[0];

      console.log(
        "[QR] Camera track:",
        videoTrack?.label,
      );

      console.log(
        "[QR] Camera settings:",
        videoTrack?.getSettings(),
      );

      // ----------------------------------------------------------
      // 2. Attach stream to video
      // ----------------------------------------------------------

      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;

      await video.play();

      console.log("[QR] Video started.");

      console.log(
        "[QR] Video dimensions:",
        {
          width: video.videoWidth,
          height: video.videoHeight,
        },
      );

      // ----------------------------------------------------------
      // 3. Start ZXing from the actual video element
      // ----------------------------------------------------------

      const reader =
        new BrowserMultiFormatReader();

      qrReaderRef.current = reader;

      const controls =
        await reader.decodeFromVideoElement(
          video,
          async (result, error) => {
            // No QR in this frame.
            // This is normal and happens continuously.
            if (!result) {
              return;
            }

            if (scanHandledRef.current) {
              return;
            }

            const qrData =
              result.getText()?.trim();

            if (!qrData) {
              return;
            }

            console.log(
              "=================================",
            );

            console.log(
              "[QR] QR DETECTED:",
              qrData,
            );

            setScanMessage(
              "QR detected — checking...",
            );

            console.log(
              "[QR] FORMAT:",
              result.getBarcodeFormat(),
            );

            console.log(
              "=================================",
            );

            scanHandledRef.current = true;

            try {
              toast.loading(
                "Checking accreditation...",
                {
                  id: "qr-lookup",
                },
              );

              console.log(
                "[QR] Calling getVolunteerByQrCode with:",
                qrData,
              );

              const lookupResult =
                await leaderService.getVolunteerByQrCode(
                  qrData,
                );

              toast.dismiss("qr-lookup");

              if (!lookupResult.ok) {
                console.warn(
                  "[QR] Rejected:",
                  lookupResult.reason,
                );

                setScanMessage(
                  `QR rejected: ${lookupResult.reason}`,
                );

                toast.error(
                  `QR rejected: ${lookupResult.reason}`,
                  {
                    duration: 8000,
                  },
                );

                // Keep the QR handled so the same code
                // is not repeatedly processed.
                return;
              }

              const volunteer =
                lookupResult.volunteer;

              console.log(
                "[QR] VOLUNTEER VERIFIED:",
                volunteer,
              );

              setScanMessage(
                "Volunteer verified.",
              );

              // Stop ZXing
              try {
                controls.stop();
              } catch (stopError) {
                console.error(
                  "[QR] Failed to stop ZXing:",
                  stopError,
                );
              }

              controlsRef.current = null;

              // Stop camera
              const currentStream =
                video.srcObject;

              if (
                currentStream instanceof
                MediaStream
              ) {
                currentStream
                  .getTracks()
                  .forEach((track) => {
                    track.stop();
                  });
              }

              video.srcObject = null;

              setIsScanning(false);

              setSelectedVolunteer(
                volunteer,
              );

              toast.success(
                "Accreditation verified.",
              );
            } catch (lookupError) {
              console.error(
                "[QR] Lookup failed:",
                lookupError,
              );

              toast.dismiss("qr-lookup");

              scanHandledRef.current = false;

              toast.error(
                lookupError instanceof Error
                  ? lookupError.message
                  : "Failed to verify this QR code.",
              );
            }
          },
        );

      controlsRef.current =
        controls;

      console.log(
        "[QR] ZXing decoder started.",
      );
    } catch (error) {
      console.error(
        "[QR] Scanner failed:",
        error,
      );

      const video =
        videoRef.current;

      if (
        video?.srcObject instanceof
        MediaStream
      ) {
        video.srcObject
          .getTracks()
          .forEach((track) => {
            track.stop();
          });

        video.srcObject = null;
      }

      controlsRef.current = null;
      qrReaderRef.current = null;

      setIsScanning(false);

      let message =
        "Unable to access the camera.";

      if (error instanceof DOMException) {
        if (
          error.name ===
          "NotAllowedError"
        ) {
          message =
            "Camera permission was denied. Allow camera access and try again.";
        } else if (
          error.name ===
          "NotFoundError"
        ) {
          message =
            "No camera was found on this device.";
        } else if (
          error.name ===
          "NotReadableError"
        ) {
          message =
            "The camera is already being used by another application.";
        } else if (
          error.name ===
          "SecurityError"
        ) {
          message =
            "Camera access requires HTTPS or localhost.";
        }
      } else if (
        error instanceof Error
      ) {
        message = error.message;
      }

      setCameraError(message);

      toast.error(message);
    }
  };

  // ============================================================
  // CLEANUP CAMERA ON UNMOUNT
  // ============================================================

  useEffect(() => {
    return () => {
      try {
        controlsRef.current?.stop();
      } catch {
        // Ignore cleanup errors.
      }

      const video = videoRef.current;

      if (
        video?.srcObject instanceof
        MediaStream
      ) {
        video.srcObject
          .getTracks()
          .forEach((track) => {
            track.stop();
          });
      }
    };
  }, []);

  // ============================================================
  // ATTENDANCE
  // ============================================================

  const handleAttendanceAction = async (
  action: "check-in" | "check-out",
) => {
  console.log("[ATTENDANCE] BUTTON CLICKED:", action);
  console.log("[ATTENDANCE] selectedVolunteer:", selectedVolunteer);
  console.log("[ATTENDANCE] processingAction:", processingAction);
  console.log("[ATTENDANCE] currentStatus:", currentStatus);
  console.log("[ATTENDANCE] canCheckIn:", canCheckIn);
  console.log("[ATTENDANCE] canCheckOut:", canCheckOut);

  if (!selectedVolunteer) {
    console.error("[ATTENDANCE] No volunteer selected");

    setScanMessage("ERROR: No volunteer selected.");

    toast.error("No volunteer selected.", {
      duration: 6000,
    });

    return;
  }

  if (processingAction !== null) {
    console.warn(
      "[ATTENDANCE] Action already processing:",
      processingAction,
    );

    return;
  }

  setProcessingAction(action);

  const actionLabel =
    action === "check-in"
      ? "Check-in"
      : "Check-out";

  const volunteerName =
    `${selectedVolunteer.firstName} ${selectedVolunteer.lastName}`;

  try {
    console.log(
      "[ATTENDANCE] Calling updateAttendanceStatus...",
    );

    setScanMessage(
      "1/4 — Starting attendance...",
    );

    if (!selectedVolunteer.shiftId) {
      throw new Error(
        "No shift ID found for this volunteer.",
      );
    }

    console.log(
      "[ATTENDANCE] shiftId:",
      selectedVolunteer.shiftId,
    );

    const nextVolunteer =
      await leaderService.updateAttendanceStatus(
        selectedVolunteer,
        action,
      );

    console.log(
      "[ATTENDANCE] SUCCESS:",
      nextVolunteer,
    );

    setSelectedVolunteer(nextVolunteer);

    const newScan =
      leaderService.createRecentScan(
        nextVolunteer,
        action,
      );

    setRecentScans((current) =>
      [newScan, ...current].slice(0, 5),
    );

    setScanMessage(
      "4/4 — Attendance completed successfully.",
    );

    toast.success(
      `${actionLabel} successful`,
      {
        description:
          `${volunteerName} has been successfully ${
            action === "check-in"
              ? "checked in"
              : "checked out"
          } for the assigned shift.`,
        duration: 6000,
      },
    );
  } catch (error) {
    console.error(
      "[ATTENDANCE] FAILED:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unknown attendance error.";

    setScanMessage(
      `ERROR: ${message}`,
    );

    toast.error(
      `${actionLabel} failed`,
      {
        description: message,
        duration: 10000,
      },
    );
  } finally {
    console.log(
      "[ATTENDANCE] FINISHED:",
      action,
    );

    setProcessingAction(null);
  }
};


  // ============================================================
  // DERIVED STATE
  // ============================================================

  const currentStatus =
    selectedVolunteer?.attendanceStatus ??
    "not_checked_in";

  const canCheckIn =
    selectedVolunteer !== null &&
    currentStatus === "not_checked_in";

  const canCheckOut =
    selectedVolunteer !== null &&
    currentStatus === "checked_in";

  const isCheckedOut =
    currentStatus === "checked_out";

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <VSPageHeader
        eyebrow="Operations"
        title="QR Scanner"
        description="Scan a volunteer accreditation to verify their identity and manage attendance."
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        {/* ======================================================
            SCANNER
        ====================================================== */}

        <VSCard className="overflow-hidden rounded-[2rem] border-border bg-card shadow-[var(--shadow-float)]">
          <VSCardContent className="p-0">
            {/* Scanner header */}
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-5 sm:px-7">
              <div>
                <p className="eyebrow">
                  Attendance
                </p>

                <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                  Scan accreditation
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Use the camera to scan a volunteer QR code.
                </p>
              </div>

              <div
                className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${
                  isScanning
                    ? "border-primary/20 bg-primary/5 text-primary"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isScanning
                      ? "animate-pulse bg-primary"
                      : "bg-muted-foreground/40"
                  }`}
                />

                {isScanning
                  ? "Camera live"
                  : "Camera off"}
              </div>
            </div>

            <div className="p-3 sm:p-5 lg:p-7">
              {/* Camera */}
              <div className="relative overflow-hidden rounded-2xl border border-border bg-black shadow-[var(--shadow-float)] sm:rounded-[1.75rem]">
                <div className="relative aspect-[4/5] w-full xs:aspect-[4/3] sm:aspect-video">
                  {/* Camera */}
                  <video
                    ref={videoRef}
                    className={`h-full w-full object-cover transition-all duration-500 ${
                      isScanning
                        ? "scale-100 opacity-100"
                        : "scale-[1.02] opacity-0"
                    }`}
                    muted
                    playsInline
                    autoPlay
                  />

                  {/* Empty state */}
                  {!isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background px-4 py-6 sm:px-6 sm:py-8">
                      <div className="flex w-full max-w-sm flex-col items-center text-center">
                        {/* Icon */}
                        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-[1rem] border border-primary/20 bg-primary/10 text-primary shadow-sm sm:h-20 sm:w-20 sm:rounded-[1.5rem]">
                          <div className="absolute inset-1.5 rounded-[0.7rem] border border-primary/10 sm:inset-2 sm:rounded-xl" />

                          <QrCode className="relative h-6 w-6 sm:h-9 sm:w-9" />
                        </div>

                        {/* Text */}
                        <div className="mt-4 w-full sm:mt-6">
                          <h3 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                            Ready to scan
                          </h3>

                          <p className="mx-auto mt-2 max-w-[270px] text-xs leading-5 text-muted-foreground sm:max-w-sm sm:text-sm sm:leading-6">
                            Start the camera and position the volunteer&apos;s accreditation
                            QR code inside the frame.
                          </p>
                        </div>

                        {/* Status */}
                        <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-[10px] font-medium text-muted-foreground shadow-sm sm:mt-5 sm:px-3.5 sm:py-2 sm:text-xs">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50 sm:h-2 sm:w-2" />

                          <span className="truncate">
                            Camera is off
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Active scanner */}
                  {isScanning && (
                    <>
                      {/* Cinematic overlay */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />

                      {/* Top status */}
                      <div className="absolute left-3 right-3 top-3 flex items-center justify-between gap-2 sm:left-4 sm:right-4 sm:top-4">
                        {/* Live */}
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/55 px-2.5 py-1.5 text-[10px] font-medium text-white shadow-lg backdrop-blur-xl sm:gap-2 sm:px-3.5 sm:py-2 sm:text-xs">
                          <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />

                            <span className="relative inline-flex h-full w-full rounded-full bg-primary" />
                          </span>

                          Live camera
                        </div>

                        {/* Scan badge */}
                        <div className="hidden rounded-full border border-white/10 bg-black/55 px-3 py-1.5 text-[10px] font-medium text-white backdrop-blur-xl xs:block sm:px-3.5 sm:py-2 sm:text-xs">
                          Scan accreditation
                        </div>
                      </div>

                      {/* Scanner frame */}
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-5 sm:px-6">
                        <div
                          className="
                            relative
                            aspect-square
                            w-[min(72vw,17rem)]
                            max-w-[17rem]
                            rounded-[1.5rem]
                            border
                            border-white/20
                            sm:w-60
                            sm:rounded-[2rem]
                          "
                        >
                          {/* Soft glow */}
                          <div className="absolute -inset-2.5 rounded-[1.75rem] border border-primary/10 sm:-inset-3 sm:rounded-[2.25rem]" />

                          {/* Top left */}
                          <span className="absolute -left-px -top-px h-8 w-8 rounded-tl-[1.4rem] border-l-[3px] border-t-[3px] border-primary shadow-[-2px_-2px_12px_rgba(139,216,208,0.25)] sm:h-11 sm:w-11 sm:rounded-tl-[1.9rem] sm:border-l-[4px] sm:border-t-[4px]" />

                          {/* Top right */}
                          <span className="absolute -right-px -top-px h-8 w-8 rounded-tr-[1.4rem] border-r-[3px] border-t-[3px] border-primary shadow-[2px_-2px_12px_rgba(139,216,208,0.25)] sm:h-11 sm:w-11 sm:rounded-tr-[1.9rem] sm:border-r-[4px] sm:border-t-[4px]" />

                          {/* Bottom left */}
                          <span className="absolute -bottom-px -left-px h-8 w-8 rounded-bl-[1.4rem] border-b-[3px] border-l-[3px] border-primary shadow-[-2px_2px_12px_rgba(139,216,208,0.25)] sm:h-11 sm:w-11 sm:rounded-bl-[1.9rem] sm:border-b-[4px] sm:border-l-[4px]" />

                          {/* Bottom right */}
                          <span className="absolute -bottom-px -right-px h-8 w-8 rounded-br-[1.4rem] border-b-[3px] border-r-[3px] border-primary shadow-[2px_2px_12px_rgba(139,216,208,0.25)] sm:h-11 sm:w-11 sm:rounded-br-[1.9rem] sm:border-b-[4px] sm:border-r-[4px]" />

                          {/* Scan line */}
                          <div className="absolute left-5 right-5 top-1/2 h-px -translate-y-1/2 bg-primary shadow-[0_0_14px_currentColor] animate-pulse sm:left-6 sm:right-6 sm:h-[2px]" />

                          {/* Center indicator */}
                          <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_12px_currentColor] sm:h-2 sm:w-2 sm:shadow-[0_0_14px_currentColor]" />
                        </div>
                      </div>

                      {/* Bottom message */}
                      <div className="absolute bottom-3 left-3 right-3 flex justify-center sm:bottom-4 sm:left-4 sm:right-4">
                        <div className="inline-flex max-w-[calc(100%-1rem)] items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-2 text-[10px] font-medium text-white shadow-xl backdrop-blur-xl sm:gap-2.5 sm:px-4 sm:py-2.5 sm:text-xs">
                          <ScanLine className="h-3 w-3 shrink-0 text-primary sm:h-3.5 sm:w-3.5" />

                          <span className="truncate">
                            {scanMessage}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Message / error */}
              {cameraError ? (
                <div className="mt-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-3.5 sm:mt-4 sm:p-4">
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 sm:h-9 sm:w-9 sm:rounded-xl">
                      <CameraOff className="h-4 w-4 text-destructive sm:h-5 sm:w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-destructive sm:text-sm">
                        Camera unavailable
                      </p>

                      <p className="mt-1 text-xs leading-5 text-destructive/80 sm:text-sm sm:leading-6">
                        {cameraError}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex min-w-0 items-start gap-2 rounded-xl bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground sm:mt-4 sm:items-center sm:rounded-none sm:bg-transparent sm:px-0 sm:py-0 sm:text-sm">
                  <QrCode className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary sm:mt-0 sm:h-4 sm:w-4" />

                  <span className="min-w-0 leading-5">
                    {isScanning
                      ? scanMessage
                      : "The scanner is ready when you are."}
                  </span>
                </div>
              )}

              {/* Controls */}
              <div className="mt-4 sm:mt-5">
                {!isScanning ? (
                  <VSButton
                    onClick={() => {
                      void startScanner();
                    }}
                    className="h-11 w-full rounded-xl text-sm sm:h-12"
                    disabled={loading}
                  >
                    <Camera className="mr-2 h-4 w-4" />

                    {loading
                      ? "Loading scanner..."
                      : "Start QR Scanner"}
                  </VSButton>
                ) : (
                  <VSButton
                    onClick={stopScanner}
                    variant="outline"
                    className="h-11 w-full rounded-xl text-sm sm:h-12"
                  >
                    <CameraOff className="mr-2 h-4 w-4" />
                    Stop Scanner
                  </VSButton>
                )}
              </div>

              {/* Tips */}
              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:mt-5 sm:grid-cols-3 sm:gap-3">
                <div className="group rounded-xl border border-border bg-muted/20 p-3 transition-colors hover:bg-muted/30 sm:rounded-2xl sm:p-3.5">
                  <div className="flex items-center gap-2 sm:block">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[10px] font-bold text-primary sm:h-auto sm:w-auto sm:justify-start sm:rounded-none sm:bg-transparent sm:text-xs">
                      01
                    </span>

                    <p className="text-xs font-medium text-muted-foreground sm:mt-1 sm:leading-5">
                      Start the camera
                    </p>
                  </div>
                </div>

                <div className="group rounded-xl border border-border bg-muted/20 p-3 transition-colors hover:bg-muted/30 sm:rounded-2xl sm:p-3.5">
                  <div className="flex items-center gap-2 sm:block">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[10px] font-bold text-primary sm:h-auto sm:w-auto sm:justify-start sm:rounded-none sm:bg-transparent sm:text-xs">
                      02
                    </span>

                    <p className="text-xs font-medium text-muted-foreground sm:mt-1 sm:leading-5">
                      Center the QR code
                    </p>
                  </div>
                </div>

                <div className="group rounded-xl border border-border bg-muted/20 p-3 transition-colors hover:bg-muted/30 sm:rounded-2xl sm:p-3.5">
                  <div className="flex items-center gap-2 sm:block">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[10px] font-bold text-primary sm:h-auto sm:w-auto sm:justify-start sm:rounded-none sm:bg-transparent sm:text-xs">
                      03
                    </span>

                    <p className="text-xs font-medium text-muted-foreground sm:mt-1 sm:leading-5">
                      Confirm attendance
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </VSCardContent>
        </VSCard>

        {/* ======================================================
            SCANNER INFO
        ====================================================== */}

        <VSCard className="rounded-[2rem] border-border bg-card shadow-[var(--shadow-float)]">
          <VSCardContent className="flex h-full flex-col p-5 sm:p-7">
            <div>
              <p className="eyebrow">
                Workflow
              </p>

              <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                Attendance control
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Verify a volunteer first, then record their
                attendance for the assigned shift.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex gap-4 rounded-2xl border border-border bg-background p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <QrCode className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-foreground">
                    1. Scan accreditation
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Scan the QR code printed on the
                    volunteer accreditation.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 rounded-2xl border border-border bg-background p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <UserRoundCheck className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-foreground">
                    2. Verify volunteer
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Review their identity, committee, role
                    and assigned shift.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 rounded-2xl border border-border bg-background p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-foreground">
                    3. Record attendance
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Check the volunteer in or out from
                    their assigned shift.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6">
              <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Verified attendance
                    </p>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Each successful action is recorded
                      against the volunteer&apos;s assigned shift.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </VSCardContent>
        </VSCard>
      </div>

      {/* ========================================================
          RECENT SCANS
      ======================================================== */}

      <div className="space-y-4">
        <VSSectionHeader
          title="Recent scans"
          description="Latest attendance updates from your committee team."
        />

        {recentScans.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recentScans.map((item) => (
              <VSCard
                key={item.id}
                className="rounded-[1.5rem] border-border transition-shadow hover:shadow-[var(--shadow-float)]"
              >
                <VSCardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      {item.status === "checked_in" ? (
                        <UserCheck className="h-5 w-5" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {item.volunteerName}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {item.role}
                      </p>
                    </div>

                    <VSStatusBadge
                      status={
                        item.status === "checked_in"
                          ? "approved"
                          : "completed"
                      }
                    />
                  </div>

                  <div className="mt-4 flex items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" />

                    <span>{item.timestamp}</span>
                  </div>
                </VSCardContent>
              </VSCard>
            ))}
          </div>
        ) : (
          <VSCard className="rounded-[1.75rem] border-border">
            <VSCardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <QrCode className="h-7 w-7" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-foreground">
                No scans yet
              </h3>

              <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
                Successful attendance scans will appear here.
              </p>
            </VSCardContent>
          </VSCard>
        )}
      </div>

      {selectedVolunteer && (
        <VolunteerAttendanceModal
          volunteer={selectedVolunteer}
          currentStatus={currentStatus}
          canCheckIn={canCheckIn}
          canCheckOut={canCheckOut}
          isCheckedOut={isCheckedOut}
          processingAction={processingAction}
          onCheckIn={() => {
            void handleAttendanceAction("check-in");
          }}
          onCheckOut={() => {
            void handleAttendanceAction("check-out");
          }}
          onClose={() => {
            if (processingAction !== null) {
              return;
            }

            setSelectedVolunteer(null);

            setScanMessage(
              "Point the camera at the QR code",
            );
          }}
        />
      )}
    </div>
  );
}