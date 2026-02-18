import { getDifficultyConfig, computeApplyWindowEndsAt } from "./config";

export { getDifficultyConfig, computeApplyWindowEndsAt };
export type { TaskDifficulty, DifficultyConfig } from "./config";

export type TaskStatus = "OPEN" | "ASSIGNED" | "DONE" | "CANCELLED";

export function assertExecutorNotCreator(
  creatorId: string,
  executorId: string,
) {
  if (creatorId === executorId) {
    throw new Error("executorId cannot be equal to creatorId");
  }
}
