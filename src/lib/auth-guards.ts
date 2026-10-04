import { redirect } from "@tanstack/react-router";

import { supabase } from "./supabase";

export type ProtectedRole = "admin" | "leader" | "volunteer";

const PUBLIC_PATHS = new Set([
  "/",
  "/about",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/admin/login",
  "/admin/register",
  "/[.]lovable.oauth.consent",
]);

export function isPublicRoute(pathname: string): boolean {
  if (!pathname) return true;

  return (
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/admin/register") ||
    pathname.startsWith("/[.]lovable.oauth.consent")
  );
}

export function getLoginPathForRoute(pathname: string): string {
  if (pathname.startsWith("/admin")) {
    return "/admin/login";
  }

  return "/login";
}

async function getCurrentUserRole(): Promise<ProtectedRole | null> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .maybeSingle();

  if (profileError || !profile?.role) {
    return null;
  }

  return profile.role as ProtectedRole;
}

export async function enforceProtectedRoute(pathname: string, requiredRole?: ProtectedRole) {
  if (isPublicRoute(pathname)) {
    return;
  }

  const role = await getCurrentUserRole();

  if (!role) {
    throw redirect({
      to: getLoginPathForRoute(pathname),
      search: {
        next: pathname,
      },
    });
  }

  if (requiredRole && role !== requiredRole) {
    if (role === "admin") {
      throw redirect({
        to: "/admin",
      });
    }

    if (role === "leader") {
      throw redirect({
        to: "/leader/dashboard",
      });
    }

    throw redirect({
      to: "/volunteer/dashboard",
    });
  }
}
