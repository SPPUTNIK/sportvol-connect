import { createFileRoute } from "@tanstack/react-router";
import { AdminAnalyticsPage } from "@/components/admin/AdminPages";
export const Route = createFileRoute("/admin/analytics")({ component: AdminAnalyticsPage });
