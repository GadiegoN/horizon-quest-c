"use server";

import { prisma } from "@/lib/prisma";
import { bankReverseByReference } from "./bank-adapter";
import { bankCreateRef, bankCancelRef } from "./refs";

export async function cancelTask(input: { taskId: string; creatorId: string }) {
  const taskId = input.taskId.trim();
  const creatorId = input.creatorId.trim();
  if (!taskId) throw new Error("taskId is required");
  if (!creatorId) throw new Error("creatorId is required");

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("Task not found");

  if (task.creatorId !== creatorId)
    throw new Error("Only creator can cancel task");
  if (task.status === "CANCELLED")
    return { idempotent: true, taskId, status: "CANCELLED" as const };
  if (task.status === "DONE")
    throw new Error("Task already done; cannot cancel");

  await bankReverseByReference({
    userId: creatorId,
    originalReferenceId: bankCreateRef(taskId),
    referenceId: bankCancelRef(taskId),
    reason: "Task cancelled refund",
  });

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
      executorId: null,
      assignedAt: null,
    },
    select: { id: true, status: true, cancelledAt: true },
  });

  return {
    idempotent: false,
    taskId: updated.id,
    status: updated.status,
    cancelledAt: updated.cancelledAt?.toISOString(),
  };
}
