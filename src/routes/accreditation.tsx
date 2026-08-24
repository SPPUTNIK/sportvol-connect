import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  IdCard,
  MapPin,
  QrCode,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { AppShell } from "@/components/app/AppShell";

import {
  VSBadge,
  VSButton,
  VSCard,
  VSCardContent,
  VSPageHeader,
} from "@/components/design-system";

import {
  accreditationService,
  type AccreditationRecord,
} from "@/services/accreditationService";

export const Route = createFileRoute("/accreditation")({
  component: Accreditation,
  head: () => ({
    meta: [
      {
        title: "Accreditation | VolunSport Morocco",
      },
      {
        name: "description",
        content:
          "View your VolunSport volunteer accreditation and event assignment.",
      },
    ],
  }),
});

function Accreditation() {
  const [accreditation, setAccreditation] =
    useState<AccreditationRecord | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    accreditationService
      .getAccreditation()
      .then(setAccreditation)
      .catch((err: unknown) =>
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load accreditation.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const status = accreditation?.status?.toLowerCase() ?? "";

  const isActive =
    status === "active" ||
    status === "approved";

  const isPending =
    status === "pending";

  return (
    <AppShell title="Accreditation">
      <main>
        <div className="relative z-10 mx-auto max-w-7xl space-y-8">

          {/* =====================================================
              HEADER
          ===================================================== */}

          <VSPageHeader
            eyebrow="Event access"
            title="Your accreditation"
            description="Keep your volunteer credentials ready for event arrival, check-in and assignment verification."
            action={
              accreditation ? (
                <VSBadge variant="soft">
                  <span
                    className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${
                      isActive
                        ? "bg-emerald-500"
                        : isPending
                          ? "bg-amber-500"
                          : "bg-muted-foreground"
                    }`}
                  />

                  {isActive
                    ? "Accreditation active"
                    : isPending
                      ? "Accreditation pending"
                      : accreditation.status}
                </VSBadge>
              ) : undefined
            }
          />

          {/* =====================================================
              LOADING
          ===================================================== */}

          {loading && (
            <VSCard className="rounded-[2rem] border-border bg-card/90">
              <VSCardContent className="flex min-h-[320px] items-center justify-center p-8">
                <div className="text-center">

                  <div className="mx-auto flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <IdCard className="h-6 w-6" />
                  </div>

                  <p className="mt-5 text-sm font-semibold text-foreground">
                    Loading your accreditation…
                  </p>

                  <p className="mt-2 text-xs text-muted-foreground">
                    Preparing your volunteer credentials.
                  </p>

                </div>
              </VSCardContent>
            </VSCard>
          )}

          {/* =====================================================
              ERROR
          ===================================================== */}

          {!loading && error && (
            <VSCard className="mx-auto max-w-2xl rounded-[2rem] border-border">
              <VSCardContent className="p-8 text-center sm:p-12">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-600">
                  <ShieldCheck className="h-7 w-7" />
                </div>

                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Something went wrong
                </p>

                <h2 className="mt-3 text-2xl font-semibold text-foreground">
                  Unable to load accreditation
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                  {error}
                </p>

              </VSCardContent>
            </VSCard>
          )}

          {/* =====================================================
              EMPTY
          ===================================================== */}

          {!loading &&
            !error &&
            !accreditation && (
              <VSCard className="mx-auto max-w-2xl overflow-hidden rounded-[2rem] border-border">
                <VSCardContent className="relative p-8 text-center sm:p-12">

                  <div className="relative z-10">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <ShieldCheck className="h-7 w-7" />
                    </div>

                    <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Not available yet
                    </p>

                    <h2 className="mt-3 text-2xl font-semibold text-foreground">
                      No accreditation assigned
                    </h2>

                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                      Once your volunteer accreditation is
                      created for an approved event assignment,
                      your event access credentials will appear
                      here.
                    </p>

                  </div>

                </VSCardContent>
              </VSCard>
            )}

          {/* =====================================================
              ACCREDITATION
          ===================================================== */}

          {!loading &&
            !error &&
            accreditation && (
              <div className="mx-auto max-w-6xl">

                <VSCard className="overflow-hidden rounded-[2rem] border-border shadow-[var(--shadow-float)]">

                  {/* =================================================
                      CREDENTIAL HEADER
                  ================================================= */}

                  <div className="relative overflow-hidden bg-ink px-6 py-8 text-white sm:px-10 sm:py-10">

                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-primary/20 blur-3xl"
                    />

                    <div className="relative z-10">

                      <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">

                        {/* BRAND + EVENT */}

                        <div className="min-w-0">

                          <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
                              <img
                                src="/logo.png"
                                alt="VolunSport Morocco"
                                className="h-full w-full object-contain"
                              />
                            </div>

                            <div>
                              <p className="font-display text-lg font-semibold tracking-tight">
                                VOLUNSPORT
                              </p>

                              <p className="font-mono text-[0.58rem] uppercase tracking-[0.3em] text-primary">
                                Morocco
                              </p>
                            </div>

                          </div>

                          <div className="mt-8">

                            <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.25em] text-white/45">
                              Volunteer accreditation
                            </p>

                            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                              {accreditation.role_name}
                            </h2>

                            <p className="mt-2 text-sm text-white/55">
                              {accreditation.event_title}
                            </p>

                          </div>

                        </div>

                        {/* STATUS */}

                        <div
                          className={`flex shrink-0 items-center gap-2 self-start rounded-full border px-4 py-2 text-xs font-semibold ${
                            isActive
                              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                              : isPending
                                ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
                                : "border-white/10 bg-white/5 text-white/60"
                          }`}
                        >

                          <CheckCircle2 className="h-3.5 w-3.5" />

                          {isActive
                            ? "Approved"
                            : isPending
                              ? "Pending"
                              : accreditation.status}

                        </div>

                      </div>

                      {/* VOLUNTEER ID */}

                      <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-end sm:justify-between">

                        <div>

                          <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/40">
                            Volunteer ID
                          </p>

                          <p className="mt-1 font-mono text-lg font-semibold tracking-[0.08em] text-white">
                            {accreditation.profile_id.slice(0, 8).toUpperCase()}
                          </p>

                        </div>

                        <div className="flex items-center gap-2 text-xs text-white/40">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Official event credential
                        </div>

                      </div>

                    </div>
                  </div>

                  {/* =================================================
                      CONTENT
                  ================================================= */}

                  <VSCardContent className="p-6 sm:p-8 lg:p-10">

                    {/* =================================================
                        INFO CARDS
                    ================================================= */}

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                      <InfoCard
                        icon={UserRound}
                        label="Volunteer"
                        value={accreditation.volunteer_name}
                      />

                      <InfoCard
                        icon={IdCard}
                        label="Role"
                        value={accreditation.role_name}
                      />

                      <InfoCard
                        icon={MapPin}
                        label="Access zone"
                        value={
                          accreditation.zone ||
                          "General access"
                        }
                      />

                      <InfoCard
                        icon={ShieldCheck}
                        label="Status"
                        value={
                          isActive
                            ? "Approved"
                            : isPending
                              ? "Pending"
                              : accreditation.status
                        }
                        accent={isActive}
                      />

                    </div>

                    {/* =================================================
                        EVENT ASSIGNMENT
                    ================================================= */}

                    <div className="mt-8 rounded-[1.75rem] border border-border bg-background/70 p-6 sm:p-7">

                      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                          <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            Assignment
                          </p>

                          <h3 className="mt-2 text-xl font-semibold text-foreground">
                            {accreditation.event_title}
                          </h3>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {accreditation.event_venue},{" "}
                            {accreditation.event_city}
                          </p>

                        </div>

                        <VSBadge variant="soft">
                          <CalendarDays className="mr-1.5 h-3.5 w-3.5" />

                          {accreditation.assignment_status ===
                          "assigned"
                            ? "Confirmed assignment"
                            : accreditation.assignment_status ||
                              "Accredited"}
                        </VSBadge>

                      </div>

                      <div className="mt-6 grid gap-4 sm:grid-cols-2">

                        <DetailRow
                          icon={CalendarDays}
                          label="Event date"
                          value={formatEventDate(
                            accreditation.event_start_date,
                            accreditation.event_end_date,
                          )}
                        />

                        <DetailRow
                          icon={MapPin}
                          label="Venue"
                          value={`${accreditation.event_venue}, ${accreditation.event_city}`}
                        />

                        <DetailRow
                          icon={Clock3}
                          label="Shift"
                          value={
                            accreditation.shift_title
                              ? accreditation.shift_title
                              : "No shift assigned"
                          }
                        />

                        <DetailRow
                          icon={MapPin}
                          label="Shift location"
                          value={
                            accreditation.shift_location ||
                            accreditation.zone ||
                            "General event area"
                          }
                        />

                      </div>

                    </div>

                    {/* =================================================
                        SHIFT TIME
                    ================================================= */}

                    {accreditation.shift_title && (
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">

                        <DetailRow
                          icon={Clock3}
                          label="Shift start"
                          value={
                            accreditation.shift_start_time
                              ? formatTime(
                                  accreditation.shift_start_time,
                                )
                              : "Not available"
                          }
                        />

                        <DetailRow
                          icon={Clock3}
                          label="Shift end"
                          value={
                            accreditation.shift_end_time
                              ? formatTime(
                                  accreditation.shift_end_time,
                                )
                              : "Not available"
                          }
                        />

                      </div>
                    )}

                    {/* =================================================
                        QR SECTION
                    ================================================= */}

                    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px] lg:items-center">

                      <div>

                        <div className="flex items-center gap-3">

                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <QrCode className="h-5 w-5" />
                          </div>

                          <div>

                            <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                              Event check-in
                            </p>

                            <h3 className="mt-1 text-xl font-semibold text-foreground">
                              Show your accreditation
                            </h3>

                          </div>

                        </div>

                        <p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground">
                          Present this credential to event staff
                          when you arrive. Your accreditation
                          confirms your approved volunteer
                          assignment and access level.
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3">

                          <VSButton
                            type="button"
                            onClick={handlePrint}
                          >
                            <Download className="h-4 w-4" />
                            Save credential
                          </VSButton>

                        </div>

                        {accreditation.qr_code_data && (
                          <div className="mt-4 rounded-2xl border border-border bg-muted/30 p-4">

                            <p className="text-xs font-semibold text-foreground">
                              Credential code
                            </p>

                            <p className="mt-2 break-all font-mono text-xs text-muted-foreground">
                              {accreditation.qr_code_data}
                            </p>

                          </div>
                        )}

                        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/10 bg-primary/[0.04] p-4">

                          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                          <p className="text-xs leading-5 text-muted-foreground">
                            Keep your accreditation private and
                            only show it to authorized event staff
                            when required.
                          </p>

                        </div>

                      </div>

                      {/* QR */}

                      <div className="rounded-[1.75rem] border border-border bg-background p-5">

                        <div className="flex aspect-square items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40">

                          <div className="text-center">

                            <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-2xl bg-card shadow-sm ring-1 ring-border">

                              <QrCode className="h-24 w-24 text-foreground/80" />

                            </div>

                            <p className="mt-4 text-xs font-semibold text-foreground">
                              Scan at check-in
                            </p>

                            <p className="mt-1 text-[0.65rem] text-muted-foreground">
                              Volunteer credential
                            </p>

                          </div>

                        </div>

                      </div>

                    </div>

                  </VSCardContent>

                </VSCard>

              </div>
            )}

        </div>
      </main>
    </AppShell>
  );
}

/* ===============================================================
   HELPERS
================================================================ */

function formatEventDate(
  startDate: string,
  endDate: string,
): string {
  const start = new Date(
    `${startDate}T00:00:00`,
  );

  const end = new Date(
    `${endDate}T00:00:00`,
  );

  const startText = start.toLocaleDateString(
    "en-US",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );

  const endText = end.toLocaleDateString(
    "en-US",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );

  if (startDate === endDate) {
    return startText;
  }

  return `${startText} – ${endText}`;
}

function formatTime(
  value: string,
): string {
  const [hours, minutes] =
    value.split(":");

  const date = new Date();

  date.setHours(
    Number(hours),
    Number(minutes),
    0,
    0,
  );

  return date.toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  );
}

/* ===============================================================
   INFO CARD
================================================================ */

type InfoCardProps = {
  icon: typeof UserRound;
  label: string;
  value: string;
  accent?: boolean;
};

function InfoCard({
  icon: Icon,
  label,
  value,
  accent = false,
}: InfoCardProps) {
  return (
    <div className="group rounded-[1.5rem] border border-border bg-card/80 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm">

      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          accent
            ? "bg-emerald-500/10 text-emerald-600"
            : "bg-muted text-muted-foreground"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <p className="mt-5 text-xs font-medium text-muted-foreground">
        {label}
      </p>

      <p
        className={`mt-1 truncate text-sm font-semibold ${
          accent
            ? "text-emerald-600"
            : "text-foreground"
        }`}
      >
        {value}
      </p>

    </div>
  );
}

/* ===============================================================
   DETAIL ROW
================================================================ */

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">

        <p className="text-xs text-muted-foreground">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-semibold text-foreground">
          {value}
        </p>

      </div>

    </div>
  );
}
