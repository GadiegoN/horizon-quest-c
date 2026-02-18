/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import { calcLevel } from "@/lib/reputation";
import { getDifficultyConfig } from "@/lib/tasks";
import type { TaskApplicationDTO, TaskDTO } from "./types";

type ApplyToTaskInput = {
  taskId: string;
  userId: string;
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

function toAppDTO(a: any): TaskApplicationDTO {
  return {
    id: a.id,
    taskId: a.taskId,
    userId: a.userId,
    appliedAt: a.appliedAt.toISOString(),
  };
}

export async function applyToTask(input: ApplyToTaskInput): Promise<{
  idempotent: boolean;
  application: TaskApplicationDTO;
  taskAfter: TaskDTO;
  assignedNow: boolean;
}> {
  const taskId = input.taskId.trim();
  const userId = input.userId.trim();
  if (!taskId) throw new Error("taskId is required");
  if (!userId) throw new Error("userId is required");

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      creatorId: true,
      executorId: true,
      status: true,
      difficulty: true,
      valueCents: true,
      repRewardPoints: true,
      minLevelRequired: true,
      applyWindowEndsAt: true,
      assignedAt: true,
      doneAt: true,
      cancelledAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!task) throw new Error("Task not found");
  if (task.status !== "OPEN") throw new Error("Task is not open");
  if (task.creatorId === userId)
    throw new Error("creator cannot apply to own task");

  const profile = await prisma.profile.upsert({
    where: { userId },
    create: { userId, reputationPoints: 0 },
    update: {},
    select: { reputationPoints: true },
  });

  const level = calcLevel(profile.reputationPoints);
  const cfg = getDifficultyConfig(task.difficulty as any);

  if (level < task.minLevelRequired || level < cfg.minLevelRequired) {
    throw new Error("User level is below minimum required");
  }

  let application: any;
  let idempotent = false;

  try {
    application = await prisma.taskApplication.create({
      data: { taskId, userId },
    });
  } catch (err: any) {
    if (err?.code === "P2002") {
      idempotent = true;
      application = await prisma.taskApplication.findUnique({
        where: { taskId_userId: { taskId, userId } },
      });
      if (!application)
        throw new Error("Application not found after unique conflict");
    } else {
      throw err;
    }
  }

  let assignedNow = false;
  let taskAfter = task;

  if (cfg.isAutoAssignFirstCome) {
    const updated = await prisma.task.updateMany({
      where: { id: taskId, status: "OPEN", executorId: null },
      data: { executorId: userId, status: "ASSIGNED", assignedAt: new Date() },
    });

    if (updated.count === 1) {
      assignedNow = true;
      taskAfter = (await prisma.task.findUnique({
        where: { id: taskId },
      })) as any;
    }
  }

  if (!assignedNow) {
    taskAfter = (await prisma.task.findUnique({
      where: { id: taskId },
    })) as any;
  }

  return {
    idempotent,
    application: toAppDTO(application),
    taskAfter: toTaskDTO(taskAfter),
    assignedNow,
  };
}
