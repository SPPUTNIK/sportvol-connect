// import { getTraining } from "@/services/mockService";
// import type { TrainingService } from "@/services/contracts";

// export const trainingService: TrainingService = {
//   getTraining,
//   async getTrainingById(id) {
//     const training = await getTraining();
//     return training.find((item) => item.id === id) ?? null;
//   },
// };


import { demoTraining } from "@/mocks/frontendDemo";
import type { Training } from "@/lib/types";

const USE_MOCK_DATA = true;

export const trainingService = {
  async getTraining(): Promise<Training[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      return demoTraining.map(
        (module) =>
          ({
            id: module.id,
            title: module.title,
            description: module.description,
            completed: module.complete,
            resources: module.resources,
          }) as unknown as Training,
      );
    }

    // Supabase implementation will be connected later.
    throw new Error(
      "Supabase training service is not connected yet.",
    );
  },
};