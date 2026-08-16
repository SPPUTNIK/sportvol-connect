// import { getCertificates } from "@/services/mockService";
// import type { CertificateService } from "@/services/contracts";

// export const certificateService: CertificateService = {
//   getCertificates,
//   async getCertificateById(id) {
//     const certificates = await getCertificates();
//     return certificates.find((item) => item.id === id) ?? null;
//   },
// };


import { demoCertificates } from "@/mocks/frontendDemo";
import type { Certificate } from "@/lib/types";

const USE_MOCK_DATA = true;

export const certificateService = {
  async getCertificates(): Promise<Certificate[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      return demoCertificates.map(
        (certificate) =>
          ({
            id: certificate.id,
            certificate_id: certificate.id,
            event_title: certificate.event,
            role_name: certificate.role,
            date: certificate.date,
            hours: certificate.hours,
            issued_to: certificate.issuedTo,
            description: certificate.description,
          }) as Certificate,
      );
    }

    // Supabase implementation will be added later.
    throw new Error(
      "Supabase certificate service is not connected yet.",
    );
  },
};