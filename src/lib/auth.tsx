import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "./supabase";
import type { Profile } from "./types";

interface SignUpOptions {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  phone?: string;
  city?: string;
  country?: string;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;

  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: Error | null }>;

  signUp: (
    email: string,
    password: string,
    options?: SignUpOptions,
  ) => Promise<{
    error: Error | null;
    needsEmailConfirmation: boolean;
  }>;

  signOut: () => Promise<void>;

  sendResetPasswordEmail: (
    email: string,
    next?: string,
  ) => Promise<{ error: Error | null }>;

  updateProfile: (
    updates: Partial<Profile>,
  ) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Load the profile belonging to the authenticated user.
 *
 * RLS must ensure that a user can only read their own profile.
 */
async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.warn("Unable to load profile:", error.message);
    return null;
  }

  return (data as Profile | null) ?? null;
}

/**
 * Load profile safely after authentication changes.
 */
async function loadAuthenticatedProfile(
  authUser: User | null,
  mounted: () => boolean,
  setProfile: (profile: Profile | null) => void,
) {
  if (!authUser) {
    setProfile(null);
    return;
  }

  const profile = await fetchProfile(authUser.id);

  if (mounted()) {
    setProfile(profile);
  }
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Restore existing Supabase session.
   */
  useEffect(() => {
    let mounted = true;

    const isMounted = () => mounted;

    async function restoreSession() {
      try {
        const { data, error } =
          await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.warn(
            "Supabase session restore failed:",
            error.message,
          );

          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);

          return;
        }

        const restoredSession = data.session ?? null;
        const restoredUser =
          restoredSession?.user ?? null;

        setSession(restoredSession);
        setUser(restoredUser);

        if (restoredUser) {
          await loadAuthenticatedProfile(
            restoredUser,
            isMounted,
            setProfile,
          );
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error(
          "Unexpected auth restore error:",
          error,
        );

        if (mounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    /**
     * IMPORTANT:
     *
     * We don't await Supabase queries directly inside
     * onAuthStateChange because Supabase recommends
     * keeping the callback itself synchronous.
     */
    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange(
      (_event, authSession) => {
        if (!mounted) return;

        setSession(authSession ?? null);
        setUser(authSession?.user ?? null);

        if (!authSession?.user) {
          setProfile(null);
          return;
        }

        /**
         * Defer profile query outside the auth callback.
         */
        setTimeout(() => {
          if (!mounted) return;

          loadAuthenticatedProfile(
            authSession.user,
            isMounted,
            setProfile,
          );
        }, 0);
      },
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const isAdmin = profile?.role === "admin";

  /**
   * LOGIN
   */
  const signIn = async (
    email: string,
    password: string,
  ): Promise<{ error: Error | null }> => {
    const { error, data } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (error) {
      return {
        error: new Error(error.message),
      };
    }

    if (data.session?.user) {
      setSession(data.session);
      setUser(data.session.user);

      const inboundProfile = await fetchProfile(
        data.session.user.id,
      );

      setProfile(inboundProfile);
    }

    return {
      error: null,
    };
  };

  /**
   * SIGNUP
   *
   * IMPORTANT:
   * The frontend NEVER decides the user's role.
   *
   * Every public registration starts as "volunteer".
   *
   * The database trigger creates the profile automatically.
   */
  const signUp = async (
    email: string,
    password: string,
    options?: SignUpOptions,
  ): Promise<{
    error: Error | null;
    needsEmailConfirmation: boolean;
  }> => {
    try {
      const { error, data } =
        await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
            data: {
              first_name: options?.first_name ?? null,
              last_name: options?.last_name ?? null,

              // NEW: Date of birth
              date_of_birth:
                options?.date_of_birth ?? null,

              phone: options?.phone ?? null,
              city: options?.city ?? null,
              country: options?.country ?? "Morocco",
            },
          },
        });

      if (error) {
        return {
          error: new Error(error.message),
          needsEmailConfirmation: false,
        };
      }

      /**
       * If email confirmation is enabled in Supabase,
       * session will normally be null here.
       */
      const needsEmailConfirmation =
        Boolean(data.user && !data.session);

      /**
       * If email confirmation is disabled,
       * we already have a session.
       */
      if (data.session?.user) {
        setSession(data.session);
        setUser(data.session.user);

        const inboundProfile = await fetchProfile(
          data.session.user.id,
        );

        setProfile(inboundProfile);
      }

      return {
        error: null,
        needsEmailConfirmation,
      };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error
            : new Error("Unable to create account."),
        needsEmailConfirmation: false,
      };
    }
  };

  /**
   * LOGOUT
   */
  const signOut = async () => {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      console.warn(
        "Supabase sign out failed:",
        error.message,
      );
    }

    setSession(null);
    setUser(null);
    setProfile(null);
  };

  /**
   * PASSWORD RESET
   */
  const sendResetPasswordEmail = async (
    email: string,
    next = "/login",
  ): Promise<{ error: Error | null }> => {
    const safeNext =
      next.startsWith("/") &&
      !next.startsWith("//")
        ? next
        : "/login";

    const redirectTo =
      `${window.location.origin}` +
      `/reset-password?next=${encodeURIComponent(
        safeNext,
      )}`;

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo,
        },
      );

    return {
      error: error
        ? new Error(error.message)
        : null,
    };
  };

  /**
   * UPDATE PROFILE
   *
   * Users cannot change:
   * - id
   * - role
   * - status
   *
   * The database trigger/RLS protects these fields as well.
   *
   * date_of_birth IS allowed to be updated.
   */
  const updateProfile = async (
    updates: Partial<Profile>,
  ): Promise<{ error: Error | null }> => {
    if (!user) {
      return {
        error: new Error("Not authenticated"),
      };
    }

    const {
      id: _ignoredId,
      role: _ignoredRole,
      status: _ignoredStatus,
      email: _ignoredEmail,
      created_at: _ignoredCreatedAt,
      updated_at: _ignoredUpdatedAt,
      volunteer_hours: _ignoredVolunteerHours,
      attendance_rate: _ignoredAttendanceRate,
      ...safeUpdates
    } = updates as Partial<Profile> & {
      id?: unknown;
      role?: unknown;
      status?: unknown;
      email?: unknown;
      created_at?: unknown;
      updated_at?: unknown;
      volunteer_hours?: unknown;
      attendance_rate?: unknown;
    };

    const { data, error } = await supabase
      .from("profiles")
      .update(safeUpdates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      return {
        error: new Error(error.message),
      };
    }

    if (data) {
      setProfile(data as Profile);
    }

    return {
      error: null,
    };
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      loading,
      isAdmin,
      signIn,
      signUp,
      signOut,
      sendResetPasswordEmail,
      updateProfile,
    }),
    [
      session,
      user,
      profile,
      loading,
      isAdmin,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}