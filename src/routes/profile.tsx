import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/app/AppShell";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Input } from "@/components/ui/input";

import { profileService } from "@/services/profileService";

import type { Volunteer } from "@/lib/types";

export const Route = createFileRoute("/profile")({
  component: Profile,
  head: () => ({
    meta: [{ title: "Profile | VolunSport Morocco" }],
  }),
});

function Profile() {
  const [profile, setProfile] = useState<Volunteer | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const [formState, setFormState] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    city: "",
    country: "",
    bio: "",
    date_of_birth: "",
    experience: "",
    interests: "",
    skills: "",
    languages: "",
  });

  /*
   * ============================================================
   * LOAD MOCK PROFILE
   * ============================================================
   */

  useEffect(() => {
    profileService
      .getProfile()
      .then((data) => {
        setProfile(data);

        setFormState({
          first_name: data.first_name ?? "",
          last_name: data.last_name ?? "",
          phone: data.phone ?? "",
          city: data.city ?? "",
          country: data.country ?? "",
          bio: data.bio ?? "",
          date_of_birth: data.date_of_birth ?? "",
          experience: data.experience ?? "",
          interests: data.interests.join(", "),
          skills: data.skills.join(", "),
          languages: data.languages.join(", "),
        });
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load profile.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  /*
   * ============================================================
   * LOADING / ERROR
   * ============================================================
   */

  if (loading) {
    return (
      <AppShell title="Profile">
        <LoadingState message="Loading your profile…" />
      </AppShell>
    );
  }

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
   * UPDATE PROFILE
   * ============================================================
   */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setStatus(null);

    const updates = {
      first_name: formState.first_name,
      last_name: formState.last_name,
      phone: formState.phone,
      city: formState.city,
      country: formState.country,
      bio: formState.bio,
      date_of_birth:
        formState.date_of_birth || null,
      experience:
        formState.experience || null,

      interests: formState.interests
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),

      skills: formState.skills
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),

      languages: formState.languages
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    };

    try {
      const updatedProfile =
        await profileService.updateProfile(updates);

      setProfile(updatedProfile);

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
    }
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

            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="eyebrow">
                  Profile
                </p>

                <h1 className="display-md mt-3">
                  Complete your volunteer profile
                </h1>

                <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
                  Keep your contact details, sports
                  interests and skills up to date for
                  better volunteer role matches.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditing((value) => !value);
                  setStatus(null);
                }}
                className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                {editing ? "Cancel" : "Edit profile"}
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              {/* FIRST / LAST NAME */}

              <div className="grid gap-4 sm:grid-cols-2">

                <label className="block text-sm font-medium text-foreground">
                  First name

                  <Input
                    value={formState.first_name}
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
                    value={formState.last_name}
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

              {/* PHONE / CITY */}

              <div className="grid gap-4 sm:grid-cols-2">

                <label className="block text-sm font-medium text-foreground">
                  Phone

                  <Input
                    value={formState.phone}
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
                  City

                  <Input
                    value={formState.city}
                    disabled={!editing}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        city:
                          event.target.value,
                      }))
                    }
                  />
                </label>

              </div>

              {/* COUNTRY / LANGUAGES */}

              <div className="grid gap-4 sm:grid-cols-2">

                <label className="block text-sm font-medium text-foreground">
                  Country

                  <Input
                    value={formState.country}
                    disabled={!editing}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        country:
                          event.target.value,
                      }))
                    }
                  />
                </label>

                <label className="block text-sm font-medium text-foreground">
                  Languages

                  <Input
                    value={formState.languages}
                    disabled={!editing}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        languages:
                          event.target.value,
                      }))
                    }
                    placeholder="English, French"
                  />
                </label>

              </div>

              {/* DATE OF BIRTH */}

              <label className="block text-sm font-medium text-foreground">
                Date of birth

                <Input
                  type="date"
                  value={formState.date_of_birth}
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
                  value={formState.experience}
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
                      bio:
                        event.target.value,
                    }))
                  }
                  rows={4}
                  className="mt-2 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>

              {/* INTERESTS */}

              <label className="block text-sm font-medium text-foreground">
                Sports interests

                <Input
                  value={formState.interests}
                  disabled={!editing}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      interests:
                        event.target.value,
                    }))
                  }
                  placeholder="Running, Football"
                />
              </label>

              {/* SKILLS */}

              <label className="block text-sm font-medium text-foreground">
                Skills

                <Input
                  value={formState.skills}
                  disabled={!editing}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      skills:
                        event.target.value,
                    }))
                  }
                  placeholder="Teamwork, Communication"
                />
              </label>

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
                  className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  Save profile
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

                  <p className="mt-1 text-muted-foreground">
                    {profile.volunteer_id}
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
                    {profile.skills.length > 0 ? (
                      profile.skills.map((skill) => (
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
                    {profile.interests.length > 0 ? (
                      profile.interests.map(
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

                {profile.languages.length > 0 ? (
                  profile.languages.map(
                    (language) => (
                      <span
                        key={language}
                        className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium"
                      >
                        {language}
                      </span>
                    ),
                  )
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