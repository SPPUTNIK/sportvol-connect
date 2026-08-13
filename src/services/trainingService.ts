import { getTraining } from "@/services/mockService";
import type { TrainingService } from "@/services/contracts";

export const trainingService: TrainingService = {
  getTraining,
  async getTrainingById(id) {
    const training = await getTraining();
    return training.find((item) => item.id === id) ?? null;
  },
};
