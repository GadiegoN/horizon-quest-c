/* eslint-disable @typescript-eslint/no-explicit-any */
export type TaskDifficulty = "EASY" | "MEDIUM" | "HARD" | "ELITE";
export type TaskStatus = "OPEN" | "ASSIGNED" | "DONE" | "CANCELLED";

export type TaskDTO = {
  id: string;

  title: string;
  description: string;
  acceptanceCriteria: string | null;

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

export function taskToDTO(t: any): TaskDTO {
  return {
    id: t.id,

    title: t.title,
    description: t.description,
    acceptanceCriteria: t.acceptanceCriteria ?? null,

    creatorId: t.creatorId,
    executorId: t.executorId ?? null,
    status: t.status,
    difficulty: t.difficulty,

    valueCents: t.valueCents,
    repRewardPoints: t.repRewardPoints,
    minLevelRequired: t.minLevelRequired,

    applyWindowEndsAt: t.applyWindowEndsAt
      ? t.applyWindowEndsAt.toISOString()
      : null,

    assignedAt: t.assignedAt ? t.assignedAt.toISOString() : null,
    doneAt: t.doneAt ? t.doneAt.toISOString() : null,
    cancelledAt: t.cancelledAt ? t.cancelledAt.toISOString() : null,

    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}
