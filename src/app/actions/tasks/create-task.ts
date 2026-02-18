/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import { getDifficultyConfig, computeApplyWindowEndsAt } from "@/lib/tasks";
import type { TaskDTO, TaskDifficulty } from "./types";
import { bankDebitForTaskCreate } from "./bank-adapter";
import { bankCreateRef } from "./refs";

type CreateTaskInput = {
  taskId: string;
  creatorId: string;
  difficulty: TaskDifficulty;
  valueCents: number;
};

function toTaskDTO(t: any): TaskDTO {
  return {
    id: t.id,
    creatorId: t.creatorId,
    executorId: t.executorId,
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

export async function createTask(
  input: CreateTaskInput,
): Promise<{ idempotent: boolean; task: TaskDTO }> {
  const taskId = input.taskId.trim();
  const creatorId = input.creatorId.trim();

  if (!taskId) throw new Error("taskId is required");
  if (!creatorId) throw new Error("creatorId is required");
  if (!Number.isFinite(input.valueCents))
    throw new Error("valueCents must be finite");

  const valueCents = Math.trunc(input.valueCents);
  if (valueCents <= 0) throw new Error("valueCents must be > 0");

  // idempotência: se task já existe, retorna
  const existing = await prisma.task.findUnique({ where: { id: taskId } });
  if (existing) {
    return { idempotent: true, task: toTaskDTO(existing) };
  }

  const cfg = getDifficultyConfig(input.difficulty);
  const applyWindowEndsAt = computeApplyWindowEndsAt(input.difficulty);

  // garante que Profile do criador existe
  await prisma.profile.upsert({
    where: { userId: creatorId },
    create: { userId: creatorId, reputationPoints: 0 },
    update: {},
    select: { userId: true },
  });

  // 1) Debita HQ$ do criador (idempotente por referenceId)
  const purchaseRef = bankCreateRef(taskId);
  await bankDebitForTaskCreate({
    userId: creatorId,
    amountCents: valueCents,
    referenceId: purchaseRef,
    description: "Task created",
    metadata: { kind: "TASK_CREATE", taskId, difficulty: input.difficulty },
  });

  // 2) Cria Task
  const task = await prisma.task.create({
    data: {
      id: taskId,
      creatorId,
      status: "OPEN",
      difficulty: input.difficulty as any,
      valueCents,
      repRewardPoints: cfg.repRewardPoints,
      minLevelRequired: cfg.minLevelRequired,
      applyWindowEndsAt,
    },
  });

  return { idempotent: false, task: toTaskDTO(task) };
}
