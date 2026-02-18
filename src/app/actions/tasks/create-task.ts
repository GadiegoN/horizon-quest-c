/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import { getDifficultyConfig, computeApplyWindowEndsAt } from "@/lib/tasks";
import type { TaskDifficulty } from "./types";
import { taskToDTO } from "./types";
import { bankDebitForTaskCreate } from "./bank-adapter";
import { bankCreateRef } from "./refs";
import { z } from "zod";

type CreateTaskInput = {
  taskId: string;
  creatorId: string;
  difficulty: TaskDifficulty;
  valueCents: number;

  title: string;
  description: string;
  acceptanceCriteria?: string | null;
};

const CreateTaskSchema = z.object({
  taskId: z.string().trim().min(1, "taskId is required"),
  creatorId: z.string().trim().min(1, "creatorId is required"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "ELITE"]),
  valueCents: z
    .number()
    .finite()
    .transform((v) => Math.trunc(v))
    .refine((v) => v > 0, "valueCents must be > 0"),

  title: z.string().trim().min(3).max(80),
  description: z.string().trim().min(10).max(2000),
  acceptanceCriteria: z.string().trim().max(4000).nullable().optional(),
});

export async function createTask(
  input: CreateTaskInput,
): Promise<{ idempotent: boolean; task: ReturnType<typeof taskToDTO> }> {
  const parsed = CreateTaskSchema.parse(input);

  const existing = await prisma.task.findUnique({
    where: { id: parsed.taskId },
  });
  if (existing) {
    return { idempotent: true, task: taskToDTO(existing) };
  }

  const cfg = getDifficultyConfig(parsed.difficulty);
  const applyWindowEndsAt = computeApplyWindowEndsAt(parsed.difficulty);

  await prisma.profile.upsert({
    where: { userId: parsed.creatorId },
    create: { userId: parsed.creatorId, reputationPoints: 0 },
    update: {},
    select: { userId: true },
  });

  const purchaseRef = bankCreateRef(parsed.taskId);
  await bankDebitForTaskCreate({
    userId: parsed.creatorId,
    amountCents: parsed.valueCents,
    referenceId: purchaseRef,
    description: "Task created",
    metadata: {
      kind: "TASK_CREATE",
      taskId: parsed.taskId,
      difficulty: parsed.difficulty,
    },
  });

  const task = await prisma.task.create({
    data: {
      id: parsed.taskId,
      creatorId: parsed.creatorId,
      status: "OPEN",
      difficulty: parsed.difficulty as any,
      valueCents: parsed.valueCents,
      repRewardPoints: cfg.repRewardPoints,
      minLevelRequired: cfg.minLevelRequired,
      applyWindowEndsAt,

      title: parsed.title,
      description: parsed.description,
      acceptanceCriteria: parsed.acceptanceCriteria ?? null,
    },
  });

  return { idempotent: false, task: taskToDTO(task) };
}
