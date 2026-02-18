/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import type { TaskDTO } from "./types";
import { assertExecutorNotCreator } from "@/lib/tasks";

type PickExecutorInput = {
  taskId: string;
  creatorId: string;
  executorId: string;
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

export async function pickExecutor(input: PickExecutorInput): Promise<TaskDTO> {
  const taskId = input.taskId.trim();
  const creatorId = input.creatorId.trim();
  const executorId = input.executorId.trim();

  if (!taskId) throw new Error("taskId is required");
  if (!creatorId) throw new Error("creatorId is required");
  if (!executorId) throw new Error("executorId is required");

  assertExecutorNotCreator(creatorId, executorId);

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("Task not found");

  if (task.creatorId !== creatorId)
    throw new Error("Only creator can pick executor");
  if (task.status !== "OPEN") throw new Error("Task is not open");
  if (task.difficulty !== "HARD")
    throw new Error("pickExecutor is only allowed for HARD");
  if (task.executorId) throw new Error("Task already assigned");

  const app = await prisma.taskApplication.findUnique({
    where: { taskId_userId: { taskId, userId: executorId } },
    select: { id: true },
  });
  if (!app) throw new Error("Executor must have applied to the task");

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { executorId, status: "ASSIGNED", assignedAt: new Date() },
  });

  return toTaskDTO(updated);
}
