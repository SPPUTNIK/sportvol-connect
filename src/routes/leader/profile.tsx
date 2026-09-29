import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { City, Country, type ICountry } from "country-state-city";
import {
  Camera,
  Check,
  ChevronDown,
  LoaderCircle,
  Mail,
  MapPin,
  Pencil,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";

import {
  VSCard,
  VSCardContent,
  VSPageHeader,
  VSAvatar,
  VSLoadingState,
} from "@/components/design-system";

import { leaderService } from "@/services/leader/leaderService";
import { profileService } from "@/services/shared/profileService";

import type {
  LeaderCommittee,
  LeaderEvent,
} from "@/lib/types";

import type { VolunteerProfile } from "@/lib/types";

export const Route = createFileRoute("/leader/profile")({
  component: LeaderProfilePage,
  head: () => ({
    meta: [{ title: "Profile | VolunSport Morocco" }],
  }),
});

/* ============================================================
   CONSTANTS
============================================================ */

const AFRICAN_COUNTRY_CODES = new Set([
  "DZ",
  "AO",
  "BJ",
  "BW",
  "BF",
  "BI",
  "CM",
  "CV",
  "CF",
  "TD",
  "KM",
  "CG",
  "CI",
  "CD",
  "DJ",
  "EG",
  "GQ",
  "ER",
  "ET",
  "GA",
  "GH",
  "GN",
  "GW",
  "KE",
  "LS",
  "LR",
  "LY",
  "MG",
  "MW",
  "ML",
  "MR",
  "MU",
  "MA",
  "MZ",
  "NA",
  "NE",
  "NG",
  "RW",
  "ST",
  "SN",
  "SC",
  "SL",
  "SO",
  "ZA",
  "SS",
  "SD",
  "SZ",
  "TZ",
  "GM",
  "TG",
  "TN",
  "UG",
  "ZM",
  "ZW",
]);

const LANGUAGES = [
  "Arabic",
  "French",
  "English",
  "Spanish",
  "Portuguese",
  "Swahili",
  "Hausa",
  "Amharic",
  "Wolof",
  "Bambara",
  "Lingala",
  "Kinyarwanda",
  "Somali",
  "Zulu",
  "Xhosa",
  "Afrikaans",
  "German",
  "Italian",
  "Turkish",
] as const;

const SPORTS_INTERESTS = [
  "Football",
  "Basketball",
  "Running",
  "Athletics",
  "Swimming",
  "Tennis",
  "Volleyball",
  "Handball",
  "Cycling",
  "Boxing",
  "Martial Arts",
  "Gymnastics",
  "Surfing",
  "Beach Games",
  "Esports",
  "Rugby",
  "Golf",
  "Table Tennis",
  "Badminton",
  "Wrestling",
  "Other",
] as const;

const SKILLS = [
  "Teamwork",
  "Communication",
  "Leadership",
  "Event Support",
  "First Aid",
  "Crowd Management",
  "Registration",
  "Logistics",
  "Photography",
  "Social Media",
  "Translation",
  "Customer Service",
  "Problem Solving",
  "Time Management",
  "Hospitality",
  "Driving",
  "Technical Support",
  "Event Coordination",
] as const;

/* ============================================================
   HELPERS
============================================================ */

function normalizeArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is string =>
          typeof item === "string",
      )
    : [];
}

function getShortLeaderId(value: string | null | undefined) {
  if (!value) return "--------";

  const clean = value
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 8)
    .toUpperCase();

  return clean.padEnd(8, "0");
}

function formatDate(value?: string | null) {
  if (!value) return "Not provided";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ============================================================
   MULTI SELECT
============================================================ */

function MultiSelect({
  label,
  placeholder,
  options,
  values,
  disabled,
  onChange,
}: {
  label: string;
  placeholder: string;
  options: readonly string[];
  values: string[];
  disabled?: boolean;
  onChange: (values: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  function toggleOption(option: string) {
    if (values.includes(option)) {
      onChange(
        values.filter(
          (value) => value !== option,
        ),
      );
    } else {
      onChange([...values, option]);
    }
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-foreground">
        {label}

        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((value) => !value)}
          className="mt-2 flex min-h-12 w-full items-center justify-between rounded-2xl border border-border bg-background px-4 py-3 text-left text-sm outline-none transition hover:border-primary/50 focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span
            className={
              values.length
                ? "text-foreground"
                : "text-muted-foreground"
            }
          >
            {values.length
              ? `${values.length} selected`
              : placeholder}
          </span>

          <ChevronDown
            className={`h-4 w-4 shrink-0 text-muted-foreground transition ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </label>

      {open && !disabled && (
        <>
          <button
            type="button"
            aria-label="Close options"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div className="absolute left-0 right-0 z-50 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-border bg-card p-2 shadow-xl">
            {options.map((option) => {
              const selected =
                values.includes(option);

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    toggleOption(option)
                  }
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-muted"
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border"
                    }`}
                  >
                    {selected && (
                      <Check className="h-3.5 w-3.5" />
                    )}
                  </span>

                  <span className="text-foreground">
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ============================================================
   INFO ITEM
============================================================ */

function InfoItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </div>

      <p className="mt-2 break-words text-sm font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   PAGE
============================================================ */

export function LeaderProfilePage() {
  const [profile, setProfile] =
    useState<VolunteerProfile | null>(null);

  const [leaderRole, setLeaderRole] =
    useState("leader");

  const [event, setEvent] =
    useState<LeaderEvent | null>(null);

  const [committee, setCommittee] =
    useState<LeaderCommittee | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [editing, setEditing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [uploadingPhoto, setUploadingPhoto] =
    useState(false);

  const [status, setStatus] =
    useState<string | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [formState, setFormState] =
    useState({
      first_name: "",
      last_name: "",
      phone: "",
      city: "",
      country: "",
      nationality: "",
      cin_or_passport: "",
      bio: "",
      date_of_birth: "",
      experience: "",
      interests: [] as string[],
      skills: [] as string[],
      languages: [] as string[],
    });

  /* ==========================================================
     COUNTRIES
  ========================================================== */

  const africanCountries =
    useMemo<ICountry[]>(() => {
      return Country.getAllCountries()
        .filter((country) =>
          AFRICAN_COUNTRY_CODES.has(
            country.isoCode,
          ),
        )
        .sort((a, b) =>
          a.name.localeCompare(b.name),
        );
    }, []);

  const selectedCountry = useMemo(() => {
    if (!formState.country) return null;

    return (
      africanCountries.find(
        (country) =>
          country.name ===
            formState.country ||
          country.isoCode ===
            formState.country,
      ) ?? null
    );
  }, [
    africanCountries,
    formState.country,
  ]);

  const cities = useMemo(() => {
    if (!selectedCountry) return [];

    return City.getCitiesOfCountry(
      selectedCountry.isoCode,
    ).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [selectedCountry]);

  /* ==========================================================
     RESET FORM
  ========================================================== */

  function resetFormFromProfile(
    currentProfile: VolunteerProfile,
  ) {
    setFormState({
      first_name:
        currentProfile.first_name ?? "",
      last_name:
        currentProfile.last_name ?? "",
      phone:
        currentProfile.phone ?? "",
      city:
        currentProfile.city ?? "",
      country:
        currentProfile.country ?? "",
      nationality:
        currentProfile.nationality ?? "",
      cin_or_passport:
        currentProfile.cin_or_passport ?? "",
      bio:
        currentProfile.bio ?? "",
      date_of_birth:
        currentProfile.date_of_birth ?? "",
      experience:
        currentProfile.experience ?? "",
      interests:
        normalizeArray(
          currentProfile.interests,
        ),
      skills:
        normalizeArray(
          currentProfile.skills,
        ),
      languages:
        normalizeArray(
          currentProfile.languages,
        ),
    });
  }

  /* ==========================================================
     LOAD
  ========================================================== */

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [
          currentProfile,
          currentLeader,
          currentCommittee,
          currentEvent,
        ] = await Promise.all([
          profileService.getProfile(),
          leaderService.getCurrentLeaderProfile(),
          leaderService.getCurrentCommittee(),
          leaderService.getCurrentEvent(),
        ]);

        if (ignore) return;

        if (!currentProfile) {
          setError(
            "Profile unavailable.",
          );
          return;
        }

        setProfile(currentProfile);

        setLeaderRole(
          currentLeader?.role ??
            "leader",
        );

        setCommittee(
          currentCommittee,
        );

        setEvent(currentEvent);

        resetFormFromProfile(
          currentProfile,
        );
      } catch (loadError) {
        console.error(
          "Failed to load leader profile:",
          loadError,
        );

        if (!ignore) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load profile.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      ignore = true;
    };
  }, []);

  /* ==========================================================
     SAVE
  ========================================================== */

  async function handleSubmit(
    eventObject: React.FormEvent<HTMLFormElement>,
  ) {
    eventObject.preventDefault();

    if (!profile || saving) return;

    setSaving(true);
    setError(null);
    setStatus(null);

    try {
      const updates = {
        first_name:
          formState.first_name.trim(),

        last_name:
          formState.last_name.trim(),

        phone:
          formState.phone.trim(),

        city:
          formState.city.trim(),

        country:
          formState.country.trim(),

        nationality:
          formState.nationality.trim(),

        cin_or_passport:
          formState.cin_or_passport.trim(),

        bio:
          formState.bio.trim(),

        date_of_birth:
          formState.date_of_birth || null,

        experience:
          formState.experience.trim() ||
          null,

        interests:
          normalizeArray(
            formState.interests,
          ),

        skills:
          normalizeArray(
            formState.skills,
          ),

        languages:
          normalizeArray(
            formState.languages,
          ),
      };

      const result =
        await profileService.updateProfile(
          updates,
        );

      /*
       * Supports the existing profileService
       * response shape used by the volunteer profile.
       */
      if (result?.error) {
        throw result.error;
      }

      const updatedProfile =
        await profileService.getProfile();

      if (updatedProfile) {
        setProfile(updatedProfile);
        resetFormFromProfile(
          updatedProfile,
        );
      }

      setEditing(false);

      setStatus(
        "Profile updated successfully.",
      );
    } catch (saveError) {
      console.error(
        "Failed to update leader profile:",
        saveError,
      );

      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to update profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  /* ==========================================================
     CANCEL
  ========================================================== */

  function handleCancel() {
    if (profile) {
      resetFormFromProfile(profile);
    }

    setEditing(false);
    setError(null);
    setStatus(null);
  }

  /* ==========================================================
     PHOTO UPLOAD
  ========================================================== */

  async function handlePhotoChange(
    eventObject: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      eventObject.target.files?.[0];

    if (!file) return;

    setError(null);
    setStatus(null);

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select an image file.",
      );
      eventObject.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError(
        "Profile photo must be smaller than 2 MB.",
      );
      eventObject.target.value = "";
      return;
    }

    try {
      setUploadingPhoto(true);

      await profileService.uploadProfilePhoto(
        file,
      );

      const updatedProfile =
        await profileService.getProfile();

      if (updatedProfile) {
        setProfile(updatedProfile);
      }

      setStatus(
        "Profile photo updated successfully.",
      );
    } catch (photoError) {
      console.error(
        "Failed to upload profile photo:",
        photoError,
      );

      setError(
        photoError instanceof Error
          ? photoError.message
          : "Failed to upload profile photo.",
      );
    } finally {
      setUploadingPhoto(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  /* ==========================================================
     PHOTO DELETE
  ========================================================== */

  async function handleRemovePhoto() {
    if (!profile?.avatar_url) return;

    try {
      setUploadingPhoto(true);
      setError(null);
      setStatus(null);

      await profileService.deleteProfilePhoto();

      const updatedProfile =
        await profileService.getProfile();

      if (updatedProfile) {
        setProfile(updatedProfile);
      }

      setStatus(
        "Profile photo removed successfully.",
      );
    } catch (photoError) {
      console.error(
        "Failed to remove profile photo:",
        photoError,
      );

      setError(
        photoError instanceof Error
          ? photoError.message
          : "Failed to remove profile photo.",
      );
    } finally {
      setUploadingPhoto(false);
    }
  }

  /* ==========================================================
     DERIVED
  ========================================================== */

  const fullName = useMemo(() => {
    if (!profile) return "Leader";

    return `${profile.first_name} ${profile.last_name}`
      .trim();
  }, [profile]);

  const leaderId = useMemo(
    () =>
      getShortLeaderId(
        profile?.volunteer_id ??
          profile?.id,
      ),
    [profile],
  );

  const countryLabel = useMemo(() => {
    if (!profile?.country) {
      return "Not provided";
    }

    const country =
      africanCountries.find(
        (item) =>
          item.name === profile.country ||
          item.isoCode === profile.country,
      );

    return country
      ? `${country.flag ?? ""} ${country.name}`.trim()
      : profile.country;
  }, [
    africanCountries,
    profile?.country,
  ]);

  if (loading) {
    return (
      <VSLoadingState message="Loading leader profile…" />
    );
  }

  if (error && !profile) {
    return (
      <div className="mx-auto max-w-7xl space-y-8">
        <VSPageHeader
          eyebrow="Account"
          title="Profile"
          description="Manage your leader profile and operational information."
        />

        <VSCard className="rounded-[2rem] border-border">
          <VSCardContent className="p-8 text-center sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <ShieldCheck className="h-7 w-7" />
            </div>

            <h2 className="mt-6 text-xl font-semibold text-foreground">
              Unable to load profile
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {error}
            </p>
          </VSCardContent>
        </VSCard>
      </div>
    );
  }

  if (!profile) {
    return (
      <VSLoadingState message="Profile unavailable." />
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <VSPageHeader
        eyebrow="Account"
        title="Leader Profile"
        description="Manage your personal information, leader identity, committee assignment and event details."
        action={
          !editing ? (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setStatus(null);
                setEditing(true);
              }}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              <Pencil className="h-4 w-4" />
              Edit profile
            </button>
          ) : undefined
        }
      />

      <div className="flex flex-wrap gap-2">
        <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
          Leader account
        </span>

        {event && (
          <span className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            Assigned to an event
          </span>
        )}
      </div>

      {status && (
        <div className="flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
          <Check className="h-4 w-4 shrink-0 text-primary" />
          {status}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {/* =====================================================
            LEFT — PROFILE
        ====================================================== */}

        <VSCard className="rounded-[2rem] border-border">
          <VSCardContent className="p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Personal profile
                </p>

                <h2 className="mt-2 text-2xl font-semibold text-foreground">
                  {fullName}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {leaderRole}
                </p>
              </div>

              {editing && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:border-primary/50 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* PHOTO */}

            <div className="mt-8 flex flex-col items-center gap-4 rounded-[1.7rem] border border-border bg-background p-6 sm:flex-row">
              <div className="relative shrink-0">
                <VSAvatar
                  src={profile.avatar_url}
                  name={fullName}
                  size="xl"
                />

                {editing && (
                  <button
                    type="button"
                    disabled={uploadingPhoto}
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground shadow-lg transition hover:bg-primary/90 disabled:opacity-50"
                    aria-label="Change profile photo"
                  >
                    {uploadingPhoto ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  key={profile.avatar_url ?? "photo"}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              <div className="min-w-0 flex-1 text-center sm:text-left">
                <p className="text-sm font-semibold text-foreground">
                  Profile photo
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  JPG, PNG or WebP. Maximum 2 MB.
                </p>

                {editing && (
                  <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                    <button
                      type="button"
                      disabled={uploadingPhoto}
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary/50 disabled:opacity-50"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      Change photo
                    </button>

                    {profile.avatar_url && (
                      <button
                        type="button"
                        disabled={uploadingPhoto}
                        onClick={handleRemovePhoto}
                        className="inline-flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs font-semibold text-destructive transition hover:bg-destructive/10 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-6"
            >
              {/* NAME */}

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium text-foreground">
                  First name

                  <input
                    value={formState.first_name}
                    disabled={!editing || saving}
                    onChange={(eventObject) =>
                      setFormState((current) => ({
                        ...current,
                        first_name:
                          eventObject.target.value,
                      }))
                    }
                    className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </label>

                <label className="block text-sm font-medium text-foreground">
                  Last name

                  <input
                    value={formState.last_name}
                    disabled={!editing || saving}
                    onChange={(eventObject) =>
                      setFormState((current) => ({
                        ...current,
                        last_name:
                          eventObject.target.value,
                      }))
                    }
                    className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </label>
              </div>

              {/* ROLE + EMAIL */}

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium text-foreground">
                  Leader role

                  <input
                    value={leaderRole}
                    disabled
                    className="mt-2 h-12 w-full rounded-2xl border border-border bg-muted/40 px-4 text-sm capitalize text-muted-foreground"
                  />
                </label>

                <label className="block text-sm font-medium text-foreground">
                  Email

                  <input
                    value={profile.email}
                    disabled
                    type="email"
                    className="mt-2 h-12 w-full rounded-2xl border border-border bg-muted/40 px-4 text-sm text-muted-foreground"
                  />
                </label>
              </div>

              {/* PHONE */}

              <label className="block text-sm font-medium text-foreground">
                Phone

                <input
                  value={formState.phone}
                  disabled={!editing || saving}
                  type="tel"
                  autoComplete="tel"
                  onChange={(eventObject) =>
                    setFormState((current) => ({
                      ...current,
                      phone:
                        eventObject.target.value,
                    }))
                  }
                  className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </label>

              {/* COUNTRY / CITY */}

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium text-foreground">
                  Country

                  <select
                    value={
                      selectedCountry?.isoCode ??
                      ""
                    }
                    disabled={!editing || saving}
                    onChange={(eventObject) => {
                      const country =
                        africanCountries.find(
                          (item) =>
                            item.isoCode ===
                            eventObject.target.value,
                        );

                      setFormState((current) => ({
                        ...current,
                        country:
                          country?.name ?? "",
                        city: "",
                      }));
                    }}
                    className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <option value="">
                      Select country
                    </option>

                    {africanCountries.map(
                      (country) => (
                        <option
                          key={country.isoCode}
                          value={country.isoCode}
                        >
                          {country.flag}{" "}
                          {country.name}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label className="block text-sm font-medium text-foreground">
                  City

                  {cities.length > 0 ? (
                    <select
                      value={formState.city}
                      disabled={
                        !editing ||
                        saving ||
                        !selectedCountry
                      }
                      onChange={(eventObject) =>
                        setFormState(
                          (current) => ({
                            ...current,
                            city:
                              eventObject.target
                                .value,
                          }),
                        )
                      }
                      className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <option value="">
                        Select city
                      </option>

                      {cities.map((city) => (
                        <option
                          key={`${city.name}-${city.stateCode}`}
                          value={city.name}
                        >
                          {city.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={formState.city}
                      disabled={!editing || saving}
                      onChange={(eventObject) =>
                        setFormState(
                          (current) => ({
                            ...current,
                            city:
                              eventObject.target
                                .value,
                          }),
                        )
                      }
                      placeholder={
                        selectedCountry
                          ? "Enter city"
                          : "Select country first"
                      }
                      className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-70"
                    />
                  )}
                </label>
              </div>

              {/* NATIONALITY / ID */}

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium text-foreground">
                  Nationality

                  <input
                    value={formState.nationality}
                    disabled={!editing || saving}
                    onChange={(eventObject) =>
                      setFormState((current) => ({
                        ...current,
                        nationality:
                          eventObject.target.value,
                      }))
                    }
                    className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </label>

                <label className="block text-sm font-medium text-foreground">
                  CIN / ID / Passport

                  <input
                    value={
                      formState.cin_or_passport
                    }
                    disabled={!editing || saving}
                    onChange={(eventObject) =>
                      setFormState((current) => ({
                        ...current,
                        cin_or_passport:
                          eventObject.target.value,
                      }))
                    }
                    className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </label>
              </div>

              {/* DOB / EXPERIENCE */}

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium text-foreground">
                  Date of birth

                  <input
                    type="date"
                    value={
                      formState.date_of_birth
                    }
                    disabled={!editing || saving}
                    onChange={(eventObject) =>
                      setFormState((current) => ({
                        ...current,
                        date_of_birth:
                          eventObject.target.value,
                      }))
                    }
                    className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </label>

                <label className="block text-sm font-medium text-foreground">
                  Experience

                  <input
                    value={formState.experience}
                    disabled={!editing || saving}
                    onChange={(eventObject) =>
                      setFormState((current) => ({
                        ...current,
                        experience:
                          eventObject.target.value,
                      }))
                    }
                    placeholder="e.g. 3 years"
                    className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </label>
              </div>

              {/* BIO */}

              <label className="block text-sm font-medium text-foreground">
                Bio

                <textarea
                  value={formState.bio}
                  disabled={!editing || saving}
                  rows={5}
                  onChange={(eventObject) =>
                    setFormState((current) => ({
                      ...current,
                      bio:
                        eventObject.target.value,
                    }))
                  }
                  className="mt-2 w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-6 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </label>

              {/* MULTI SELECTS */}

              <div className="grid gap-5">
                <MultiSelect
                  label="Sports interests"
                  placeholder="Select sports interests"
                  options={SPORTS_INTERESTS}
                  values={formState.interests}
                  disabled={!editing || saving}
                  onChange={(values) =>
                    setFormState((current) => ({
                      ...current,
                      interests: values,
                    }))
                  }
                />

                <MultiSelect
                  label="Skills"
                  placeholder="Select your skills"
                  options={SKILLS}
                  values={formState.skills}
                  disabled={!editing || saving}
                  onChange={(values) =>
                    setFormState((current) => ({
                      ...current,
                      skills: values,
                    }))
                  }
                />

                <MultiSelect
                  label="Languages"
                  placeholder="Select languages"
                  options={LANGUAGES}
                  values={formState.languages}
                  disabled={!editing || saving}
                  onChange={(values) =>
                    setFormState((current) => ({
                      ...current,
                      languages: values,
                    }))
                  }
                />
              </div>

              {/* SAVE */}

              {editing && (
                <button
                  type="submit"
                  disabled={saving}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Saving changes…
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Save changes
                    </>
                  )}
                </button>
              )}
            </form>
          </VSCardContent>
        </VSCard>

        {/* =====================================================
            RIGHT SIDEBAR
        ====================================================== */}

        <aside className="space-y-6">
          {/* OVERVIEW */}

          <VSCard className="rounded-[2rem] border-border">
            <VSCardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Overview
                  </p>

                  <h3 className="mt-1 text-lg font-semibold text-foreground">
                    Leader identity
                  </h3>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <InfoItem
                  label="Leader ID"
                  value={leaderId}
                />

                <InfoItem
                  label="Email"
                  value={
                    profile.email ||
                    "Not provided"
                  }
                  icon={
                    <Mail className="h-3.5 w-3.5" />
                  }
                />

                <InfoItem
                  label="Role"
                  value={leaderRole}
                />

                <InfoItem
                  label="Phone"
                  value={
                    profile.phone ||
                    "Not provided"
                  }
                />

                <InfoItem
                  label="Location"
                  value={
                    profile.city &&
                    profile.country
                      ? `${profile.city}, ${countryLabel}`
                      : countryLabel
                  }
                  icon={
                    <MapPin className="h-3.5 w-3.5" />
                  }
                />
              </div>
            </VSCardContent>
          </VSCard>

          {/* EVENT */}

          <VSCard className="rounded-[2rem] border-border">
            <VSCardContent className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Current assignment
                  </p>

                  <h3 className="mt-2 text-xl font-semibold text-foreground">
                    Current event
                  </h3>
                </div>

                {event && (
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                    {event.status}
                  </span>
                )}
              </div>

              {event ? (
                <div className="mt-6">
                  {event.coverImage && (
                    <div className="mb-5 overflow-hidden rounded-2xl">
                      <img
                        src={event.coverImage}
                        alt={event.title}
                        className="h-44 w-full object-cover"
                      />
                    </div>
                  )}

                  <h4 className="text-lg font-semibold text-foreground">
                    {event.title}
                  </h4>

                  <div className="mt-4 space-y-3">
                    <InfoItem
                      label="Location"
                      value={event.location}
                      icon={
                        <MapPin className="h-3.5 w-3.5" />
                      }
                    />

                    <div className="grid gap-3 sm:grid-cols-2">
                      <InfoItem
                        label="Starts"
                        value={formatDate(
                          event.startDate,
                        )}
                      />

                      <InfoItem
                        label="Ends"
                        value={formatDate(
                          event.endDate,
                        )}
                      />
                    </div>

                    <InfoItem
                      label="Committee"
                      value={
                        event.committeeName ||
                        committee?.name ||
                        "Committee"
                      }
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-border p-6 text-center">
                  <p className="text-sm font-semibold text-foreground">
                    No current event
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    No event is currently assigned to your leader account.
                  </p>
                </div>
              )}
            </VSCardContent>
          </VSCard>

          {/* COMMITTEE */}

          <VSCard className="rounded-[2rem] border-border">
            <VSCardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Leadership
                  </p>

                  <h3 className="mt-1 text-lg font-semibold text-foreground">
                    Committee
                  </h3>
                </div>
              </div>

              {committee ? (
                <div className="mt-6 space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-foreground">
                      {committee.name}
                    </h4>

                    {committee.description && (
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {committee.description}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <InfoItem
                      label="Members"
                      value={String(
                        committee.memberCount,
                      )}
                    />

                    <InfoItem
                      label="Status"
                      value={committee.status}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-border p-6 text-center">
                  <p className="text-sm font-semibold text-foreground">
                    No committee assigned
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Your committee assignment will appear here.
                  </p>
                </div>
              )}
            </VSCardContent>
          </VSCard>

          {/* SKILLS & INTERESTS */}

          <VSCard className="rounded-[2rem] border-border">
            <VSCardContent className="p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Profile
              </p>

              <h3 className="mt-2 text-lg font-semibold text-foreground">
                Skills & interests
              </h3>

              <div className="mt-5">
                <p className="text-xs font-semibold text-muted-foreground">
                  Skills
                </p>

                {profile.skills.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {profile.skills.map(
                      (skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground"
                        >
                          {skill}
                        </span>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    No skills added yet.
                  </p>
                )}
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold text-muted-foreground">
                  Sports interests
                </p>

                {profile.interests.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {profile.interests.map(
                      (interest) => (
                        <span
                          key={interest}
                          className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
                        >
                          {interest}
                        </span>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    No sports interests added yet.
                  </p>
                )}
              </div>
            </VSCardContent>
          </VSCard>

          {/* LANGUAGES */}

          <VSCard className="rounded-[2rem] border-border">
            <VSCardContent className="p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Communication
              </p>

              <h3 className="mt-2 text-lg font-semibold text-foreground">
                Languages
              </h3>

              {profile.languages.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {profile.languages.map(
                    (language) => (
                      <span
                        key={language}
                        className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground"
                      >
                        {language}
                      </span>
                    ),
                  )}
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  No languages added yet.
                </p>
              )}
            </VSCardContent>
          </VSCard>
        </aside>
      </div>
    </div>
  );
}