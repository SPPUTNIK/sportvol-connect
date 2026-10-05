// import { getCertificates } from "@/services/shared/mockService";
// import type { CertificateService } from "@/services/shared/contracts";

// export const certificateService: CertificateService = {
//   getCertificates,
//   async getCertificateById(id) {
//     const certificates = await getCertificates();
//     return certificates.find((item) => item.id === id) ?? null;
//   },
// };

import type { Certificate } from "@/lib/types";

export const certificateService = {
  async getCertificates(): Promise<Certificate[]> {
    return [];
  },
};
