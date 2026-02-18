export type TaskDifficulty = "EASY" | "MEDIUM" | "HARD" | "ELITE";
export type TaskStatus = "OPEN" | "ASSIGNED" | "DONE" | "CANCELLED";

export type TaskDTO = {
  id: string;
  creatorId: string;
  executorId: string | null;
  status: TaskStatus;
  difficulty: TaskDifficulty;

  valueCents: number;
  repRewardPoints: number;
  minLevelRequired: number;

  applyWindowEndsAt: string | null;

  assignedAt: string | null;
  doneAt: string | null;
  cancelledAt: string | null;

  createdAt: string;
  updatedAt: string;
};

export type TaskApplicationDTO = {
  id: string;
  taskId: string;
  userId: string;
  appliedAt: string;
};

export type PageResult<T> = {
  items: T[];
  nextCursor: string | null;
};
