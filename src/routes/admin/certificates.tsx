import { createFileRoute } from "@tanstack/react-router";
import { AdminCertificatesPage } from "@/components/admin/AdminPages";
export const Route = createFileRoute("/admin/certificates")({ component: AdminCertificatesPage });
