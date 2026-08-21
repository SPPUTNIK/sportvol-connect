import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createFileRoute } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import {
  QrCode,
  Download,
  Check,
  ChevronDown,
  Camera,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  Country,
  City,
  type ICountry,
  type ICity,
} from "country-state-city";

import { AppShell } from "@/components/app/AppShell";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Input } from "@/components/ui/input";

import { profileService } from "@/services/profileService";

import type { VolunteerProfile } from "@/lib/types";

export const Route = createFileRoute("/profile")({
  component: Profile,
  head: () => ({
    meta: [{ title: "Profile | VolunSport Morocco" }],
  }),
});

/*
 * ============================================================
 * CONSTANTS
 * ============================================================
 */

const AVATAR_BUCKET = "profile-photos";

const AFRICAN_COUNTRY_CODES = new Set([
  "DZ",
  "AO",
  "BJ",
  "BW",
  "BF",
  "BI",
  "CV",
  "CM",
  "CF",
  "TD",
  "KM",
  "CD",
  "CG",
  "CI",
  "DJ",
  "EG",
  "GQ",
  "ER",
  "SZ",
  "ET",
  "GA",
  "GM",
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
  "TZ",
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

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

function normalizeArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string =>
      typeof item === "string" &&
      item.trim().length > 0,
  );
}

function getShortVolunteerId(
  value: string | null | undefined,
) {
  if (!value) {
    return "--------";
  }

  return value
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 8)
    .toUpperCase()
    .padEnd(8, "0");
}

/*
 * ============================================================
 * MULTI SELECT
 * ============================================================
 */

type MultiSelectProps = {
  label: string;
  placeholder: string;
  options: readonly string[];
  values: string[];
  disabled?: boolean;
  onChange: (values: string[]) => void;
};

function MultiSelect({
  label,
  placeholder,
  options,
  values,
  disabled = false,
  onChange,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  const toggleValue = (value: string) => {
    if (values.includes(value)) {
      onChange(
        values.filter((item) => item !== value),
      );
      return;
    }

    onChange([...values, value]);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-foreground">
        {label}
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
        className="mt-2 flex min-h-12 w-full items-center justify-between gap-3 rounded-3xl border border-border bg-background px-4 py-3 text-left text-sm text-foreground outline-none transition hover:bg-muted/40 focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
          {values.length > 0 ? (
            values.map((value) => (
              <span
                key={value}
                className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
              >
                {value}
              </span>
            ))
          ) : (
            <span className="text-muted-foreground">
              {placeholder}
            </span>
          )}
        </div>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && !disabled && (
        <>
          <button
            type="button"
            aria-label="Close menu"
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
                    toggleValue(option)
                  }
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-muted"
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background"
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

/*
 * ============================================================
 * PROFILE PAGE
 * ============================================================
 */

function Profile() {
  const [profile, setProfile] =
    useState<VolunteerProfile | null>(null);

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

  const [photoInputKey, setPhotoInputKey] =
    useState(0);

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

  /*
   * ============================================================
   * COUNTRIES
   * ============================================================
   */

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

  /*
   * ============================================================
   * SELECTED COUNTRY
   * ============================================================
   *
   * IMPORTANT:
   *
   * profileService stores country as country NAME.
   * Therefore we resolve the ISO code from the
   * stored country name.
   */

  const selectedCountry = useMemo(() => {
    if (!formState.country) {
      return undefined;
    }

    return africanCountries.find(
      (country) =>
        country.name === formState.country ||
        country.isoCode === formState.country,
    );
  }, [
    africanCountries,
    formState.country,
  ]);

  /*
   * ============================================================
   * CITIES
   * ============================================================
   */

  const cities = useMemo<ICity[]>(() => {
    if (!selectedCountry) {
      return [];
    }

    return (
      City.getCitiesOfCountry(
        selectedCountry.isoCode,
      ) ?? []
    ).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [selectedCountry]);

  /*
   * ============================================================
   * LOAD PROFILE
   * ============================================================
   */

  useEffect(() => {
    let mounted = true;

    profileService
      .getProfile()
      .then((data) => {
        if (!mounted) return;

        setProfile(data);

        setFormState({
          first_name:
            data.first_name ?? "",

          last_name:
            data.last_name ?? "",

          phone:
            data.phone ?? "",

          city:
            data.city ?? "",

          country:
            data.country ?? "",

          nationality:
            data.nationality ?? "",

          cin_or_passport:
            data.cin_or_passport ?? "",

          bio:
            data.bio ?? "",

          date_of_birth:
            data.date_of_birth ?? "",

          experience:
            data.experience ?? "",

          interests:
            normalizeArray(
              data.interests,
            ),

          skills:
            normalizeArray(
              data.skills,
            ),

          languages:
            normalizeArray(
              data.languages,
            ),
        });
      })
      .catch((err: unknown) => {
        if (!mounted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load profile.",
        );
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * ============================================================
   * RESET FORM
   * ============================================================
   */

  const resetFormFromProfile = (
    currentProfile: VolunteerProfile,
  ) => {
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
  };

  /*
   * ============================================================
   * AVATAR UPLOAD
   * ============================================================
   */

  /*
   * ============================================================
   * REMOVE AVATAR
   * ============================================================
   */

 
  /*
   * ============================================================
   * FILE SELECT
   * ============================================================
   */


  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <AppShell title="Profile">
        <LoadingState message="Loading your profile…" />
      </AppShell>
    );
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (error) {
    return (
      <AppShell title="Profile">
        <EmptyState
          title="Profile unavailable"
          description={error}
        />
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell title="Profile">
        <EmptyState
          title="Profile unavailable"
          description="Your volunteer profile could not be loaded."
        />
      </AppShell>
    );
  }

  /*
   * ============================================================
   * SUBMIT
   * ============================================================
   */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setStatus(null);
    setSaving(true);

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
        formState.experience.trim() || null,

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

    try {
      const updatedProfile =
        await profileService.updateProfile(
          updates,
        );

      setProfile(updatedProfile);

      resetFormFromProfile(
        updatedProfile,
      );

      setStatus(
        "Profile updated successfully.",
      );

      setEditing(false);
    } catch (err: unknown) {
      setStatus(
        err instanceof Error
          ? err.message
          : "Unable to update profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * ============================================================
   * CANCEL EDIT
   * ============================================================
   */

  const handleCancel = () => {
    setEditing(false);
    setStatus(null);

    resetFormFromProfile(profile);
  };

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <AppShell title="Profile">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">

          {/* ==================================================
              PROFILE FORM
          ================================================== */}

          <section className="rounded-[2rem] border border-hairline-invert bg-card p-8 shadow-[var(--shadow-lift)]">

            {/* HEADER */}

            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="eyebrow">
                  Profile
                </p>

                <h1 className="display-md mt-3">
                  Your profile
                </h1>

                <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
                  Keep your contact details,
                  sports interests and skills
                  up to date for better volunteer
                  role matches.
                </p>
              </div>

              {!editing ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(true);
                    setStatus(null);
                  }}
                  className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
                >
                  Edit
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            </div>

            
            {/*
            * ============================================================
            * PROFILE PHOTO
            * ============================================================
            */}

            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-muted shadow-lg ring-1 ring-border">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={`${profile.first_name ?? ""} ${profile.last_name ?? ""}`}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/10 text-2xl font-bold text-primary">
                      {(profile.first_name?.[0] ?? "").toUpperCase()}
                      {(profile.last_name?.[0] ?? "").toUpperCase()}
                    </div>
                  )}
                </div>

                {editing && (
                  <label
                    htmlFor="profile-photo-input"
                    className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-md transition hover:bg-primary/90"
                    title="Change profile photo"
                  >
                    {uploadingPhoto ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}

                    <input
                      key={photoInputKey}
                      id="profile-photo-input"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      disabled={uploadingPhoto}
                      onChange={async (event) => {
                        const file = event.target.files?.[0];

                        if (!file) return;

                        /*
                        * Validate image
                        */
                        if (!file.type.startsWith("image/")) {
                          setStatus("Please select a valid image file.");
                          event.target.value = "";
                          return;
                        }

                        /*
                        * Maximum 2 MB
                        */
                        if (file.size > 2 * 1024 * 1024) {
                          setStatus("Image must be smaller than 2 MB.");
                          event.target.value = "";
                          return;
                        }

                        setStatus(null);
                        setUploadingPhoto(true);

                        try {
                          const updatedProfile =
                            await profileService.uploadProfilePhoto(file);

                          setProfile(updatedProfile);

                          resetFormFromProfile(updatedProfile);

                          setStatus(
                            "Profile photo updated successfully.",
                          );

                          setPhotoInputKey((value) => value + 1);
                        } catch (err: unknown) {
                          setStatus(
                            err instanceof Error
                              ? err.message
                              : "Unable to upload profile photo.",
                          );
                        } finally {
                          setUploadingPhoto(false);
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Profile photo
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  JPG, PNG or WebP · Maximum 2 MB
                </p>

                {uploadingPhoto && (
                  <p className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-primary">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Uploading photo...
                  </p>
                )}

                {editing &&
                  profile.avatar_url &&
                  !uploadingPhoto && (
                    <button
                      type="button"
                      onClick={async () => {
                        setStatus(null);
                        setUploadingPhoto(true);

                        try {
                          const updatedProfile =
                            await profileService.deleteProfilePhoto();

                          setProfile(updatedProfile);

                          resetFormFromProfile(updatedProfile);

                          setStatus(
                            "Profile photo removed successfully.",
                          );

                          setPhotoInputKey((value) => value + 1);
                        } catch (err: unknown) {
                          setStatus(
                            err instanceof Error
                              ? err.message
                              : "Unable to remove profile photo.",
                          );
                        } finally {
                          setUploadingPhoto(false);
                        }
                      }}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-destructive transition hover:opacity-80"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove photo
                    </button>
                  )}
              </div>
            </div>




            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-6 mt-8"
            >

              {/* FIRST / LAST NAME */}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-foreground">
                  First name

                  <Input
                    className="mt-2"
                    value={
                      formState.first_name
                    }
                    disabled={!editing}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        first_name:
                          event.target.value,
                      }))
                    }
                    required
                  />
                </label>

                <label className="block text-sm font-medium text-foreground">
                  Last name

                  <Input
                    className="mt-2"
                    value={
                      formState.last_name
                    }
                    disabled={!editing}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        last_name:
                          event.target.value,
                      }))
                    }
                    required
                  />
                </label>
              </div>

              {/* PHONE / COUNTRY */}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-foreground">
                  Phone

                  <Input
                    className="mt-2"
                    value={
                      formState.phone
                    }
                    disabled={!editing}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        phone:
                          event.target.value,
                      }))
                    }
                  />
                </label>

                <label className="block text-sm font-medium text-foreground">
                  Country

                  <select
                    value={
                      selectedCountry?.isoCode ??
                      ""
                    }
                    disabled={!editing}
                    onChange={(event) => {
                      const country =
                        africanCountries.find(
                          (item) =>
                            item.isoCode ===
                            event.target.value,
                        );

                      setFormState((prev) => ({
                        ...prev,
                        country:
                          country?.name ?? "",
                        city: "",
                      }));
                    }}
                    className="mt-2 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      Select country
                    </option>

                    {africanCountries.map(
                      (country) => (
                        <option
                          key={
                            country.isoCode
                          }
                          value={
                            country.isoCode
                          }
                        >
                          {country.flag}{" "}
                          {country.name}
                        </option>
                      ),
                    )}
                  </select>
                </label>
              </div>

              {/* CITY / NATIONALITY */}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-foreground">
                  City

                  <select
                    value={
                      cities.some(
                        (city) =>
                          city.name ===
                          formState.city,
                      )
                        ? formState.city
                        : ""
                    }
                    disabled={
                      !editing ||
                      !selectedCountry
                    }
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        city:
                          event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      {selectedCountry
                        ? cities.length > 0
                          ? "Select city"
                          : "No cities available"
                        : "Select country first"}
                    </option>

                    {cities.map((city) => (
                      <option
                        key={`${city.name}-${city.latitude}-${city.longitude}`}
                        value={city.name}
                      >
                        {city.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-medium text-foreground">
                  Nationality

                  <select
                    value={
                      formState.nationality
                    }
                    disabled={!editing}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        nationality:
                          event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      Select nationality
                    </option>

                    {africanCountries.map(
                      (country) => (
                        <option
                          key={
                            country.isoCode
                          }
                          value={country.name}
                        >
                          {country.name}
                        </option>
                      ),
                    )}
                  </select>
                </label>
              </div>

              {/* CIN / PASSPORT */}

              <label className="block text-sm font-medium text-foreground">
                CIN / ID / Passport

                <Input
                  className="mt-2"
                  value={
                    formState.cin_or_passport
                  }
                  disabled={!editing}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      cin_or_passport:
                        event.target.value,
                    }))
                  }
                  placeholder="Enter your CIN, ID or passport number"
                />
              </label>

              {/* LANGUAGES */}

              <MultiSelect
                label="Languages"
                placeholder="Select your languages"
                options={LANGUAGES}
                values={
                  formState.languages
                }
                disabled={!editing}
                onChange={(values) =>
                  setFormState((prev) => ({
                    ...prev,
                    languages: values,
                  }))
                }
              />

              {/* DATE OF BIRTH */}

              <label className="block text-sm font-medium text-foreground">
                Date of birth

                <Input
                  className="mt-2"
                  type="date"
                  value={
                    formState.date_of_birth
                  }
                  disabled={!editing}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      date_of_birth:
                        event.target.value,
                    }))
                  }
                />
              </label>

              {/* EXPERIENCE */}

              <label className="block text-sm font-medium text-foreground">
                Experience

                <Input
                  className="mt-2"
                  value={
                    formState.experience
                  }
                  disabled={!editing}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      experience:
                        event.target.value,
                    }))
                  }
                  placeholder="Previous volunteer or event experience"
                />
              </label>

              {/* BIO */}

              <label className="block text-sm font-medium text-foreground">
                Bio

                <textarea
                  value={formState.bio}
                  disabled={!editing}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      bio: event.target.value,
                    }))
                  }
                  rows={4}
                  className="mt-2 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>

              {/* SPORTS */}

              <MultiSelect
                label="Sports interests"
                placeholder="Select sports you are interested in"
                options={
                  SPORTS_INTERESTS
                }
                values={
                  formState.interests
                }
                disabled={!editing}
                onChange={(values) =>
                  setFormState((prev) => ({
                    ...prev,
                    interests: values,
                  }))
                }
              />

              {/* SKILLS */}

              <MultiSelect
                label="Skills"
                placeholder="Select your skills"
                options={SKILLS}
                values={formState.skills}
                disabled={!editing}
                onChange={(values) =>
                  setFormState((prev) => ({
                    ...prev,
                    skills: values,
                  }))
                }
              />

              {/* STATUS */}

              {status && (
                <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground">
                  {status}
                </div>
              )}

              {/* SAVE */}

              {editing && (
                <button
                  type="submit"
                  disabled={
                    saving ||
                    uploadingPhoto
                  }
                  className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    "Save profile"
                  )}
                </button>
              )}
            </form>

          </section>

          {/* ==================================================
              SIDEBAR
          ================================================== */}

          <aside className="space-y-6">

            {/* OVERVIEW */}

            <div className="rounded-[2rem] border border-hairline-invert bg-card p-8 shadow-[var(--shadow-lift)]">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Overview
              </p>

              <div className="mt-6 space-y-5 text-sm">

                <div>
                  <p className="font-semibold text-foreground">
                    Volunteer ID
                  </p>

                  <p className="mt-1 font-mono text-lg font-bold tracking-[0.18em] text-primary">
                    {getShortVolunteerId(
                      profile.volunteer_id,
                    )}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-foreground">
                    Volunteer hours
                  </p>

                  <p className="mt-1 text-muted-foreground">
                    {profile.volunteer_hours}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-foreground">
                    Attendance rate
                  </p>

                  <p className="mt-1 text-muted-foreground">
                    {Math.round(
                      profile.attendance_rate,
                    )}
                    %
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-foreground">
                    Email
                  </p>

                  <p className="mt-1 break-all text-muted-foreground">
                    {profile.email}
                  </p>
                </div>
              </div>
            </div>

            {/* QR CODE */}

            <div className="rounded-[2rem] border border-hairline-invert bg-card p-8 shadow-[var(--shadow-lift)]">
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4 text-primary" />

                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Volunteer QR code
                </p>
              </div>

              <p className="mt-4 text-sm text-muted-foreground">
                Show this code to event staff
                so they can quickly access your
                volunteer profile.
              </p>

              <div className="mt-6 flex flex-col items-center gap-4">

                <div
                  id="volunteer-qr"
                  className="rounded-2xl border border-border bg-white p-6"
                >
                  <QRCodeSVG
                    value={`${
                      typeof window !==
                      "undefined"
                        ? window.location.origin
                        : ""
                    }/admin/volunteers/${
                      profile.id
                    }`}
                    size={180}
                    level="M"
                    includeMargin={false}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const svg =
                      document
                        .getElementById(
                          "volunteer-qr",
                        )
                        ?.querySelector(
                          "svg",
                        );

                    if (!svg) return;

                    const serializer =
                      new XMLSerializer();

                    const source =
                      serializer.serializeToString(
                        svg,
                      );

                    const blob = new Blob(
                      [source],
                      {
                        type: "image/svg+xml;charset=utf-8",
                      },
                    );

                    const url =
                      URL.createObjectURL(
                        blob,
                      );

                    const link =
                      document.createElement(
                        "a",
                      );

                    link.href = url;

                    link.download = `volunteer-qr-${getShortVolunteerId(
                      profile.volunteer_id,
                    )}.svg`;

                    document.body.appendChild(
                      link,
                    );

                    link.click();

                    document.body.removeChild(
                      link,
                    );

                    URL.revokeObjectURL(url);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
                >
                  <Download className="h-4 w-4" />
                  Download QR
                </button>
              </div>
            </div>

            {/* SKILLS */}

            <div className="rounded-[2rem] border border-hairline-invert bg-card p-8 shadow-[var(--shadow-lift)]">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Skills & interests
              </p>

              <div className="mt-6 space-y-5 text-sm">

                <div>
                  <p className="font-semibold text-foreground">
                    Skills
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {normalizeArray(
                      profile.skills,
                    ).length > 0 ? (
                      normalizeArray(
                        profile.skills,
                      ).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-muted-foreground">
                        Not specified
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-foreground">
                    Interests
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {normalizeArray(
                      profile.interests,
                    ).length > 0 ? (
                      normalizeArray(
                        profile.interests,
                      ).map(
                        (interest) => (
                          <span
                            key={interest}
                            className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground"
                          >
                            {interest}
                          </span>
                        ),
                      )
                    ) : (
                      <p className="text-muted-foreground">
                        Not specified
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* LANGUAGES */}

            <div className="rounded-[2rem] border border-hairline-invert bg-card p-8 shadow-[var(--shadow-lift)]">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Languages
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {normalizeArray(
                  profile.languages,
                ).length > 0 ? (
                  normalizeArray(
                    profile.languages,
                  ).map((language) => (
                    <span
                      key={language}
                      className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium"
                    >
                      {language}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Not specified
                  </p>
                )}
              </div>
            </div>

          </aside>
        </div>
      </div>
    </AppShell>
  );
}
