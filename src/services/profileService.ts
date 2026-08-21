import { supabase } from "@/lib/supabase";
import type { VolunteerProfile } from "@/lib/types";

type ProfileRow = {
  id: string;
  email: string | null;

  first_name: string | null;
  last_name: string | null;

  avatar_url: string | null;

  phone: string | null;
  city: string | null;
  country: string | null;

  nationality: string | null;
  cin_or_passport: string | null;

  bio: string | null;
  date_of_birth: string | null;
  experience: string | null;

  interests: string[] | null;
  skills: string[] | null;
  languages: string[] | null;

  volunteer_hours: number | null;
  attendance_rate: number | null;
};

/*
 * ============================================================
 * CONSTANTS
 * ============================================================
 */

const PROFILE_PHOTOS_BUCKET = "profile-photos";

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

function mapProfile(row: ProfileRow): VolunteerProfile {
  return {
    id: row.id,

    /*
     * For now the authenticated user's profile UUID
     * is also used as the volunteer ID.
     */
    volunteer_id: row.id,

    first_name: row.first_name ?? "",
    last_name: row.last_name ?? "",

    email: row.email ?? "",

    avatar_url: row.avatar_url ?? null,

    phone: row.phone ?? "",
    city: row.city ?? "",
    country: row.country ?? "",

    nationality: row.nationality ?? null,
    cin_or_passport: row.cin_or_passport ?? null,

    bio: row.bio ?? null,
    date_of_birth: row.date_of_birth ?? null,
    experience: row.experience ?? null,

    interests: normalizeArray(row.interests),
    skills: normalizeArray(row.skills),
    languages: normalizeArray(row.languages),

    volunteer_hours: Number(
      row.volunteer_hours ?? 0,
    ),

    attendance_rate: Number(
      row.attendance_rate ?? 0,
    ),
  };
}

/*
 * ============================================================
 * AUTHENTICATED USER
 * ============================================================
 */

async function getCurrentUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error("You must be signed in.");
  }

  return user.id;
}

/*
 * ============================================================
 * SELECT COLUMNS
 * ============================================================
 */

const PROFILE_COLUMNS = `
  id,
  email,
  first_name,
  last_name,
  avatar_url,
  phone,
  city,
  country,
  nationality,
  cin_or_passport,
  bio,
  date_of_birth,
  experience,
  interests,
  skills,
  languages,
  volunteer_hours,
  attendance_rate
`;

/*
 * ============================================================
 * PROFILE SERVICE
 * ============================================================
 */

export const profileService = {
  /*
   * ==========================================================
   * GET CURRENT PROFILE
   * ==========================================================
   */

  async getProfile(): Promise<VolunteerProfile> {
    const userId = await getCurrentUserId();

    const {
      data,
      error,
    } = await supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("id", userId)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error(
        "Your volunteer profile could not be found.",
      );
    }

    return mapProfile(data as ProfileRow);
  },

  /*
   * ==========================================================
   * UPDATE CURRENT PROFILE
   * ==========================================================
   */

  async updateProfile(
    updates: Partial<VolunteerProfile>,
  ): Promise<VolunteerProfile> {
    const userId = await getCurrentUserId();

    /*
     * IMPORTANT:
     *
     * We manually construct the payload.
     *
     * Protected fields are never sent.
     */

    const payload = {
      first_name:
        updates.first_name?.trim() ?? null,

      last_name:
        updates.last_name?.trim() ?? null,

      phone:
        updates.phone?.trim() ?? null,

      city:
        updates.city?.trim() ?? null,

      country:
        updates.country?.trim() ?? null,

      nationality:
        updates.nationality?.trim() ?? null,

      cin_or_passport:
        updates.cin_or_passport?.trim() ?? null,

      bio:
        updates.bio?.trim() ?? null,

      date_of_birth:
        updates.date_of_birth || null,

      experience:
        updates.experience?.trim() || null,

      interests:
        normalizeArray(updates.interests),

      skills:
        normalizeArray(updates.skills),

      languages:
        normalizeArray(updates.languages),

      /*
       * Avatar URL is only updated when explicitly provided.
       */
      ...(updates.avatar_url !== undefined
        ? {
            avatar_url:
              updates.avatar_url || null,
          }
        : {}),

      updated_at:
        new Date().toISOString(),
    };

    const {
      data,
      error,
    } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", userId)
      .select(PROFILE_COLUMNS)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error(
        "Unable to update your profile.",
      );
    }

    return mapProfile(data as ProfileRow);
  },

  /*
   * ==========================================================
   * UPLOAD PROFILE PHOTO
   * ==========================================================
   *
   * Storage path:
   *
   * profile-photos/{user-id}/avatar-{timestamp}.ext
   *
   * The returned public URL is then saved in profiles.avatar_url.
   */

  async uploadProfilePhoto(
    file: File,
  ): Promise<VolunteerProfile> {
    const userId = await getCurrentUserId();

    /*
     * Validate file type.
     */

    if (!file.type.startsWith("image/")) {
      throw new Error(
        "Please select a valid image.",
      );
    }

    /*
     * Maximum 2 MB.
     */

    const MAX_SIZE = 2 * 1024 * 1024;

    if (file.size > MAX_SIZE) {
      throw new Error(
        "Profile photo must be smaller than 2 MB.",
      );
    }

    /*
     * Get file extension.
     */

    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase() || "jpg";

    const safeExtension =
      ["jpg", "jpeg", "png", "webp"].includes(
        extension,
      )
        ? extension
        : "jpg";

    /*
     * Create unique path.
     */

    const filePath =
      `${userId}/avatar-${Date.now()}.${safeExtension}`;

    /*
     * Upload.
     */

    const {
      error: uploadError,
    } = await supabase.storage
      .from(PROFILE_PHOTOS_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      throw uploadError;
    }

    /*
     * Get public URL.
     */

    const {
      data: publicUrlData,
    } = supabase.storage
      .from(PROFILE_PHOTOS_BUCKET)
      .getPublicUrl(filePath);

    const avatarUrl =
      publicUrlData.publicUrl;

    /*
     * Save URL in profile.
     */

    const {
      data,
      error,
    } = await supabase
      .from("profiles")
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select(PROFILE_COLUMNS)
      .single();

    if (error) {
      /*
       * If DB update fails, remove the uploaded file
       * so we don't leave an orphan file.
       */

      await supabase.storage
        .from(PROFILE_PHOTOS_BUCKET)
        .remove([filePath]);

      throw error;
    }

    if (!data) {
      await supabase.storage
        .from(PROFILE_PHOTOS_BUCKET)
        .remove([filePath]);

      throw new Error(
        "Unable to save your profile photo.",
      );
    }

    return mapProfile(data as ProfileRow);
  },

  /*
   * ==========================================================
   * DELETE PROFILE PHOTO
   * ==========================================================
   */

  async deleteProfilePhoto(): Promise<VolunteerProfile> {
    const userId = await getCurrentUserId();

    /*
     * First get current profile so we know the
     * existing Storage path.
     */

    const {
      data: profileData,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", userId)
      .single();

    if (profileError) {
      throw profileError;
    }

    const avatarUrl =
      profileData?.avatar_url;

    /*
     * Remove the storage file if it belongs
     * to our profile-photos bucket.
     */

    if (avatarUrl) {
      try {
        const url = new URL(avatarUrl);

        const marker =
          `/storage/v1/object/public/${PROFILE_PHOTOS_BUCKET}/`;

        const markerIndex =
          url.pathname.indexOf(marker);

        if (markerIndex !== -1) {
          const filePath =
            decodeURIComponent(
              url.pathname.slice(
                markerIndex + marker.length,
              ),
            );

          if (
            filePath.startsWith(
              `${userId}/`,
            )
          ) {
            await supabase.storage
              .from(PROFILE_PHOTOS_BUCKET)
              .remove([filePath]);
          }
        }
      } catch {
        /*
         * Do not block profile update if the
         * old URL is malformed.
         */
      }
    }

    /*
     * Remove URL from profile.
     */

    const {
      data,
      error,
    } = await supabase
      .from("profiles")
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select(PROFILE_COLUMNS)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error(
        "Unable to remove your profile photo.",
      );
    }

    return mapProfile(data as ProfileRow);
  },

  /*
   * ==========================================================
   * DELETE CURRENT PROFILE
   * ==========================================================
   *
   * This only deletes the profile row.
   *
   * It does NOT delete the Supabase Auth user.
   */

  async deleteProfile(): Promise<void> {
    const userId = await getCurrentUserId();

    const {
      error,
    } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (error) {
      throw error;
    }
  },
};