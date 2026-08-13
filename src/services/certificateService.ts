import { getCertificates } from "@/services/mockService";
import type { CertificateService } from "@/services/contracts";

export const certificateService: CertificateService = {
  getCertificates,
  async getCertificateById(id) {
    const certificates = await getCertificates();
    return certificates.find((item) => item.id === id) ?? null;
  },
};
