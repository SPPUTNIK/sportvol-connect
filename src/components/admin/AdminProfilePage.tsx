import { Save } from "lucide-react";
import { useEffect, useState } from "react";

import { AdminGate } from "./components/AdminGate";

import {
  VSButton,
  VSCard,
  VSCardContent,
  VSInput,
  VSPageHeader,
} from "@/components/design-system";

import { adminService } from "@/services/admin/adminService";

export function AdminProfilePage() {
  const [profile, setProfile] = useState<
    Awaited<ReturnType<typeof adminService.getAdminProfile>> | null
  >(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const data = await adminService.getAdminProfile();

        if (mounted) {
          setProfile(data);

          setFirstName(data?.firstName ?? "");
          setLastName(data?.lastName ?? "");
          setEmail(data?.email ?? "");
        }
      } catch (error) {
        console.error("Failed to load admin profile:", error);

        if (mounted) {
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSave() {
    if (!profile) return;

    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanEmail = email.trim();

    if (!cleanFirstName || !cleanLastName || !cleanEmail) {
      return;
    }

    setSaving(true);

    try {
      const updated = await adminService.updateAdminProfile({
        firstName: cleanFirstName,
        lastName: cleanLastName,
        email: cleanEmail,
      });

      setProfile((current) =>
        current
          ? {
              ...current,
              firstName: updated.firstName,
              lastName: updated.lastName,
              email: updated.email,
            }
          : current,
      );

      setFirstName(updated.firstName);
      setLastName(updated.lastName);
      setEmail(updated.email);
    } catch (error) {
      console.error("Failed to save admin profile:", error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminGate title="Admin profile">
        <div className="mx-auto max-w-3xl">
          <VSPageHeader
            eyebrow="Account"
            title="Admin profile"
            description="Manage the profile details shown in the control workspace."
          />

          <VSCard className="mt-8 rounded-[2rem] border-border">
            <VSCardContent className="p-8">
              <p className="text-sm text-muted-foreground">
                Loading admin profile...
              </p>
            </VSCardContent>
          </VSCard>
        </div>
      </AdminGate>
    );
  }

  if (!profile) {
    return (
      <AdminGate title="Admin profile">
        <div className="mx-auto max-w-3xl">
          <VSPageHeader
            eyebrow="Account"
            title="Admin profile"
            description="Manage the profile details shown in the control workspace."
          />

          <VSCard className="mt-8 rounded-[2rem] border-border">
            <VSCardContent className="p-8">
              <p className="text-sm text-muted-foreground">
                Unable to load the admin profile.
              </p>
            </VSCardContent>
          </VSCard>
        </div>
      </AdminGate>
    );
  }

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <AdminGate title="Admin profile">
      <div className="mx-auto max-w-3xl">
        <VSPageHeader
          eyebrow="Account"
          title="Admin profile"
          description="Manage the profile details shown in the control workspace."
        />

        <VSCard className="mt-8 rounded-[2rem] border-border">
          <VSCardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-ink text-xl font-semibold text-white">
                {initials}
              </div>

              <div className="min-w-0">
                <p className="truncate text-lg font-semibold">
                  {firstName} {lastName}
                </p>

                <p className="text-sm text-muted-foreground">
                  Admin access · VolunSport Morocco
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-medium">
                First name

                <VSInput
                  className="mt-2"
                  value={firstName}
                  onChange={(event) =>
                    setFirstName(event.target.value)
                  }
                  disabled={saving}
                />
              </label>

              <label className="text-sm font-medium">
                Last name

                <VSInput
                  className="mt-2"
                  value={lastName}
                  onChange={(event) =>
                    setLastName(event.target.value)
                  }
                  disabled={saving}
                />
              </label>

              <label className="text-sm font-medium sm:col-span-2">
                Email

                <VSInput
                  type="email"
                  className="mt-2"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  disabled={saving}
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end">
              <VSButton
                onClick={() => void handleSave()}
                disabled={
                  saving ||
                  !firstName.trim() ||
                  !lastName.trim() ||
                  !email.trim()
                }
              >
                <Save className="h-4 w-4" />

                {saving ? "Saving..." : "Save profile"}
              </VSButton>
            </div>
          </VSCardContent>
        </VSCard>
      </div>
    </AdminGate>
  );
}