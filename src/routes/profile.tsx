import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { I18nProvider } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/profile")({
  component: Profile,
  head: () => ({
    meta: [{ title: "Profile | VolunSport Morocco" }],
  }),
});

function Profile() {
  const { profile, loading, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
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
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFormState({
        first_name: profile.first_name ?? "",
        last_name: profile.last_name ?? "",
        phone: profile.phone ?? "",
        city: profile.city ?? "",
        country: profile.country ?? "",
        bio: profile.bio ?? "",
        date_of_birth: (profile as any).date_of_birth ?? "",
        experience: profile.experience ?? "",
        interests: profile.interests.join(", "),
        skills: profile.skills.join(", "),
        languages: profile.languages.join(", "),
      });
    }
  }, [profile]);

  if (loading) {
    return <LoadingState message="Loading profile…" />;
  }

  if (!profile) {
    return (
      <EmptyState
        title="Profile unavailable"
        description="Sign in or register to manage your volunteer profile."
      />
    );
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    const updates = {
      first_name: formState.first_name,
      last_name: formState.last_name,
      phone: formState.phone,
      city: formState.city,
      country: formState.country,
      bio: formState.bio,
      date_of_birth: formState.date_of_birth || null,
      experience: formState.experience || null,
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
    const { error } = await updateProfile(updates);
    if (error) {
      setStatus(error.message);
      return;
    }
    setStatus("Profile updated successfully.");
    setEditing(false);
  };

  return (
    <I18nProvider>
      <div className="shell min-h-screen py-24">
        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] border border-hairline-invert bg-card p-8 shadow-[var(--shadow-lift)]">
            <div className="mb-8 flex flex-col gap-4">
              <p className="eyebrow">Profile</p>
              <h1 className="display-md text-ink-foreground">Complete your volunteer profile</h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Keep your contact details, sports interests and skills up to date for better role
                matches.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-foreground">
                  First name
                  <Input
                    value={formState.first_name}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, first_name: event.target.value }))
                    }
                    required
                  />
                </label>
                <label className="block text-sm font-medium text-foreground">
                  Last name
                  <Input
                    value={formState.last_name}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, last_name: event.target.value }))
                    }
                    required
                  />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-foreground">
                  Phone
                  <Input
                    value={formState.phone}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, phone: event.target.value }))
                    }
                  />
                </label>
                <label className="block text-sm font-medium text-foreground">
                  City
                  <Input
                    value={formState.city}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, city: event.target.value }))
                    }
                  />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-foreground">
                  Country
                  <Input
                    value={formState.country}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, country: event.target.value }))
                    }
                  />
                </label>
                <label className="block text-sm font-medium text-foreground">
                  Languages
                  <Input
                    value={formState.languages}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, languages: event.target.value }))
                    }
                    placeholder="English, French"
                  />
                </label>
              </div>
              <label className="block text-sm font-medium text-foreground">
                Date of birth
                <Input
                  type="date"
                  value={formState.date_of_birth}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, date_of_birth: event.target.value }))
                  }
                />
              </label>
              <label className="block text-sm font-medium text-foreground">
                Experience
                <Input
                  value={formState.experience}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, experience: event.target.value }))
                  }
                  placeholder="Previous volunteer or event experience"
                />
              </label>
              <label className="block text-sm font-medium text-foreground">
                Bio
                <textarea
                  value={formState.bio}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, bio: event.target.value }))
                  }
                  rows={4}
                  className="mt-2 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                />
              </label>
              <label className="block text-sm font-medium text-foreground">
                Sports interests
                <Input
                  value={formState.interests}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, interests: event.target.value }))
                  }
                  placeholder="Running, Football"
                />
              </label>
              <label className="block text-sm font-medium text-foreground">
                Skills
                <Input
                  value={formState.skills}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, skills: event.target.value }))
                  }
                  placeholder="Teamwork, Communication"
                />
              </label>
              {status && <p className="text-sm text-foreground">{status}</p>}
              <button
                type="submit"
                className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Save profile
              </button>
            </form>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-hairline-invert bg-card p-8 shadow-[var(--shadow-lift)]">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Overview</p>
              <div className="mt-6 space-y-4 text-sm text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground">Volunteer hours</p>
                  <p>{profile.volunteer_hours}</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Attendance rate</p>
                  <p>{Math.round(profile.attendance_rate)}%</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Email</p>
                  <p>{profile.email}</p>
                </div>
              </div>
            </div>
            <div className="rounded-[2rem] border border-hairline-invert bg-card p-8 shadow-[var(--shadow-lift)]">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Volunteer history
              </p>
              <div className="mt-6 space-y-4 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Skills</p>
                <p>{profile.skills.join(", ") || "Not specified"}</p>
                <p className="font-semibold text-foreground">Interests</p>
                <p>{profile.interests.join(", ") || "Not specified"}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </I18nProvider>
  );
}
