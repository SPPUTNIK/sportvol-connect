import { createFileRoute } from "@tanstack/react-router";
import { AdminVolunteersPage } from "@/components/admin/AdminPages";
export const Route = createFileRoute("/admin/volunteers")({ component: AdminVolunteersPage });
