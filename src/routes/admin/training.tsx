import { createFileRoute } from "@tanstack/react-router";
import { AdminTrainingPage } from "@/components/admin/AdminTrainingPage";
export const Route = createFileRoute("/admin/training")({ component: AdminTrainingPage });
