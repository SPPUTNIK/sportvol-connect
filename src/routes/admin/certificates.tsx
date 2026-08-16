import { createFileRoute } from "@tanstack/react-router";
import { AdminCertificatesPage } from "@/components/admin/AdminCertificatesPage";
export const Route = createFileRoute("/admin/certificates")({ component: AdminCertificatesPage });


