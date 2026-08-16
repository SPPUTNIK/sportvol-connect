import { createFileRoute } from "@tanstack/react-router";
import { AdminProfilePage } from "@/components/admin/AdminProfilePage";
export const Route = createFileRoute("/admin/profile")({ component: AdminProfilePage });
