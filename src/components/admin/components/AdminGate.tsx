import type { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ShieldAlert } from "lucide-react";

import { AdminLayout } from "@/components/layouts/AdminLayout";
import { VSButton } from "@/components/design-system";
import { useAuth } from "@/lib/auth";

type AdminGateProps = {
  children: ReactNode;
  title?: string;
};

export function AdminGate({
  children,
  title = "Admin workspace",
}: AdminGateProps) {
  const navigate = useNavigate();

  const {
    user,
    isAdmin,
    loading,
  } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate({
        to: "/admin/login",
        replace: true,
      });

      return;
    }
  }, [loading, user, navigate]);

  /*
   * While Supabase restores the session/profile,
   * don't render the admin workspace.
   */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />

          <p className="mt-4 text-sm text-muted-foreground">
            Loading admin workspace...
          </p>
        </div>
      </div>
    );
  }

  /*
   * No authenticated user.
   *
   * The effect above will redirect to /admin/login.
   */
  if (!user) {
    return null;
  }

  /*
   * Authenticated user but not an admin.
   *
   * We intentionally don't render AdminLayout here.
   */
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <ShieldAlert className="h-7 w-7" />
          </div>

          <h1 className="mt-6 text-2xl font-semibold">
            Admin access required
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Your account is authenticated, but it does
            not have permission to access the admin
            workspace.
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <VSButton asChild variant="outline">
              <Link to="/dashboard">
                Back to dashboard
              </Link>
            </VSButton>

            <VSButton asChild>
              <Link to="/login">
                Sign in with another account
              </Link>
            </VSButton>
          </div>
        </div>
      </div>
    );
  }

  /*
   * Authenticated + admin.
   * Render the actual admin workspace.
   */
  return (
    <AdminLayout title={title}>
      {children}
    </AdminLayout>
  );
}