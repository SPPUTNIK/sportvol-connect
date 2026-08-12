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

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  sendResetPasswordEmail: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from<Profile>("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.warn("Unable to load profile", error.message);
    return null;
  }

  return data;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;
      if (error) {
        console.warn("Supabase auth session restore failed", error.message);
      }
      const sessionValue = data.session;
      setSession(sessionValue);
      setUser(sessionValue?.user ?? null);
      if (sessionValue?.user) {
        const inboundProfile = await fetchProfile(sessionValue.user.id);
        if (mounted) {
          setProfile(inboundProfile);
        }
      }
      setLoading(false);
    }

    restoreSession();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (_, authSession) => {
        if (!mounted) return;
        setSession(authSession ?? null);
        setUser(authSession?.user ?? null);
        if (authSession?.user) {
          const inboundProfile = await fetchProfile(authSession.user.id);
          if (mounted) {
            setProfile(inboundProfile);
          }
        } else {
          setProfile(null);
        }
      },
    );

    return () => {
      mounted = false;
      subscription?.subscription.unsubscribe();
    };
  }, []);

  const isAdmin = profile?.role === "admin";

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error && data.session?.user) {
      const inboundProfile = await fetchProfile(data.session.user.id);
      setProfile(inboundProfile);
    }
    return { error: error ?? null };
  };

  const signUp = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window?.location.origin },
    });

    if (!error && data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email,
        role: "volunteer",
      });
    }
    return { error: error ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const sendResetPasswordEmail = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error ?? null };
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: new Error("Not authenticated") };
    }

    const payload = {
      ...updates,
      id: user.id,
    };

    const { error, data } = await supabase
      .from<Profile>("profiles")
      .upsert(payload, { onConflict: "id" });

    if (!error && data?.[0]) {
      setProfile(data[0] as Profile);
    }

    return { error: error ?? null };
  };

  const value = useMemo(
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
    [session, user, profile, loading, isAdmin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
