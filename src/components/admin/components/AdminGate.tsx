import type { ReactNode } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";

type AdminGateProps = {
  children: ReactNode;
  title?: string;
};

export function AdminGate({
  children,
  title = "Admin workspace",
}: AdminGateProps) {
  return (
    <AdminLayout title={title}>
      {children}
    </AdminLayout>
  );
}