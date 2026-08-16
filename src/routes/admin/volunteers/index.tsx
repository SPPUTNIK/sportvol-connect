import { createFileRoute } from "@tanstack/react-router";
import { AdminVolunteersPage } from "@/components/admin/AdminVolunteersPage";
export const Route = createFileRoute("/admin/volunteers/")({ component: AdminVolunteersPage });
