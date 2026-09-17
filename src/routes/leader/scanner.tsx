import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  Clock3,
  QrCode,
  ScanLine,
  Camera,
  CameraOff,
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
import { type LeaderScannerVolunteer } from "@/mocks/leaderDemo";
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
    console.log(
      "[QR] Stopping scanner...",
    );

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

      console.log(
        "[QR] Camera stream opened.",
      );

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

      console.log(
        "[QR] Video started.",
      );

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

              const volunteer =
                await leaderService.getVolunteerByQrCode(
                  qrData,
                );

              toast.dismiss(
                "qr-lookup",
              );

              if (!volunteer) {
                console.warn(
                  "[QR] Detected but not authorized:",
                  qrData,
                );

                scanHandledRef.current =
                  false;

                toast.error(
                  "QR detected, but this volunteer is not assigned to your committee, role, and shift.",
                );

                return;
              }

              console.log(
                "[QR] VOLUNTEER VERIFIED:",
                volunteer,
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

              controlsRef.current =
                null;

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

              toast.dismiss(
                "qr-lookup",
              );

              scanHandledRef.current =
                false;

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

      if (video?.srcObject instanceof MediaStream) {
        video.srcObject.getTracks().forEach((track) => {
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
    if (!selectedVolunteer) return;

    if (processingAction !== null) return;

    setProcessingAction(action);

    try {
      const nextVolunteer =
        await leaderService.updateAttendanceStatus(
          selectedVolunteer,
          action,
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

      toast.success(
        `${nextVolunteer.firstName} ${
          nextVolunteer.lastName
        } checked ${
          action === "check-in" ? "in" : "out"
        } successfully.`,
      );
    } catch (error) {
      console.error(
        "Attendance update failed:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update attendance.",
      );
    } finally {
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
        description="Scan a volunteer accreditation to check them in or out."
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        {/* ======================================================
            REAL SCANNER
        ====================================================== */}

        <VSCard className="rounded-[2rem] border-border bg-card shadow-[var(--shadow-float)]">
          <VSCardContent className="p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="eyebrow">
                  Scan accreditation
                </p>

                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                  QR Scanner
                </h2>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {isScanning ? (
                  <>
                    <Camera className="h-3.5 w-3.5 text-primary" />
                    Live camera
                  </>
                ) : (
                  <>
                    <CameraOff className="h-3.5 w-3.5" />
                    Camera off
                  </>
                )}
              </div>
            </div>

            {/* Camera viewport */}

            <div className="mt-6 overflow-hidden rounded-[2rem] border border-border bg-black">
              <div className="relative aspect-video w-full">
                <video
                  ref={videoRef}
                  className={`h-full w-full object-cover ${
                    isScanning
                      ? "opacity-100"
                      : "opacity-0"
                  }`}
                  muted
                  playsInline
                  autoPlay
                />

                {!isScanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/30 p-6 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 text-primary">
                      <QrCode
                        className="h-10 w-10"
                        aria-hidden="true"
                      />
                    </div>

                    <p className="mt-5 text-sm leading-6 text-muted-foreground">
                      Start the camera and point it at
                      the volunteer's accreditation QR
                      code.
                    </p>
                  </div>
                )}

                {isScanning && (
                  <>
                    {/* Scanner frame */}

                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="relative h-56 w-56 rounded-3xl border-2 border-primary">
                        <span className="absolute left-0 top-0 h-8 w-8 border-l-4 border-t-4 border-primary" />
                        <span className="absolute right-0 top-0 h-8 w-8 border-r-4 border-t-4 border-primary" />
                        <span className="absolute bottom-0 left-0 h-8 w-8 border-b-4 border-l-4 border-primary" />
                        <span className="absolute bottom-0 right-0 h-8 w-8 border-b-4 border-r-4 border-primary" />

                        <div className="absolute left-4 right-4 top-1/2 h-0.5 animate-pulse bg-primary" />
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-xs font-medium text-white backdrop-blur">
                      {scanHandledRef.current
                        ? "QR detected — checking..." 
                        : "Point the camera at the QR code"}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Camera error */}

            {cameraError && (
              <div className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                {cameraError}
              </div>
            )}

            {/* Controls */}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {!isScanning ? (
                <VSButton
                  onClick={() => {
                    void startScanner();
                  }}
                  className="h-11 flex-1"
                  disabled={loading}
                >
                  <Camera
                    className="mr-2 h-4 w-4"
                    aria-hidden="true"
                  />

                  {loading
                    ? "Loading scanner..."
                    : "Start QR Scanner"}
                </VSButton>
              ) : (
                <VSButton
                  onClick={stopScanner}
                  variant="outline"
                  className="h-11 flex-1"
                >
                  <CameraOff
                    className="mr-2 h-4 w-4"
                    aria-hidden="true"
                  />

                  Stop Scanner
                </VSButton>
              )}
            </div>
          </VSCardContent>
        </VSCard>

        {/* ======================================================
            VOLUNTEER RESULT
        ====================================================== */}

        <VSCard className="rounded-[2rem] border-border bg-card shadow-[var(--shadow-float)]">
          <VSCardContent className="p-6 sm:p-8">
            {selectedVolunteer ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2
                      className="h-5 w-5 text-emerald-600"
                      aria-hidden="true"
                    />

                    <p className="text-base font-semibold text-foreground">
                      Volunteer found
                    </p>
                  </div>

                  <VSStatusBadge
                    status={formatDisplayStatus(
                      currentStatus,
                    )}
                  />
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
                        {selectedVolunteer.firstName}{" "}
                        {selectedVolunteer.lastName}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {selectedVolunteer.role}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 p-3">
                      <span className="text-muted-foreground">
                        Committee
                      </span>

                      <span className="text-right font-medium text-foreground">
                        {selectedVolunteer.committeeName ??
                          "Assigned committee"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 p-3">
                      <span className="text-muted-foreground">
                        Event
                      </span>

                      <span className="text-right font-medium text-foreground">
                        {selectedVolunteer.eventTitle ??
                          "Assigned event"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 p-3">
                      <span className="text-muted-foreground">
                        Attendance
                      </span>

                      <span className="font-medium text-foreground">
                        {formatDisplayStatus(
                          currentStatus,
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {isCheckedOut ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                    <div className="flex items-start gap-3">
                      <CheckCircle2
                        className="mt-0.5 h-5 w-5"
                        aria-hidden="true"
                      />

                      <div>
                        <p className="font-semibold">
                          Checked out
                        </p>

                        <p className="mt-1 text-sm leading-6">
                          Attendance has already been
                          checked out for this volunteer.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <VSButton
                    className="h-11 w-full"
                    onClick={() => {
                      if (canCheckOut) {
                        void handleAttendanceAction(
                          "check-out",
                        );
                        return;
                      }

                      if (canCheckIn) {
                        void handleAttendanceAction(
                          "check-in",
                        );
                      }
                    }}
                    disabled={
                      processingAction !== null ||
                      (!canCheckIn && !canCheckOut)
                    }
                  >
                    {processingAction === "check-in"
                      ? "Checking in..."
                      : processingAction === "check-out"
                        ? "Checking out..."
                        : canCheckOut
                          ? "Check out"
                          : "Check in"}
                  </VSButton>
                )}
              </div>
            ) : (
              <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                {loading
                  ? "Loading scanner..."
                  : "No volunteer scanned yet."}
              </div>
            )}
          </VSCardContent>
        </VSCard>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-xs font-medium text-white backdrop-blur">
        {scanMessage}
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
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recentScans.map((item) => (
              <VSCard
                key={item.id}
                className="rounded-[1.75rem] border-border"
              >
                <VSCardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-foreground">
                        {item.volunteerName}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
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

                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock3
                      className="h-4 w-4"
                      aria-hidden="true"
                    />

                    <span>{item.timestamp}</span>
                  </div>
                </VSCardContent>
              </VSCard>
            ))}
          </div>
        ) : (
          <VSCard className="rounded-[1.75rem] border-border">
            <VSCardContent className="p-6 text-center text-sm text-muted-foreground">
              No recent scans yet.
            </VSCardContent>
          </VSCard>
        )}
      </div>
    </div>
  );
}