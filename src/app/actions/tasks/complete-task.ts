"use server";

import { prisma } from "@/lib/prisma";
import { bankCreditForTaskComplete } from "./bank-adapter";
import { bankCompleteRef, repCompleteRef } from "./refs";
import { addReputation } from "@/app/actions/reputation/add-reputation";

export async function completeTask(input: {
  taskId: string;
  executorId: string;
}) {
  const taskId = input.taskId.trim();
  const executorId = input.executorId.trim();
  if (!taskId) throw new Error("taskId is required");
  if (!executorId) throw new Error("executorId is required");

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("Task not found");

  if (task.status === "DONE") {
    return { idempotent: true, taskId, status: "DONE" as const };
  }

  if (task.status !== "ASSIGNED") throw new Error("Task is not assigned");
  if (!task.executorId) throw new Error("Task has no executor");
  if (task.executorId !== executorId)
    throw new Error("Only assigned executor can complete task");

  await bankCreditForTaskComplete({
    userId: executorId,
    amountCents: task.valueCents,
    referenceId: bankCompleteRef(taskId),
    description: "Task completed",
    metadata: { kind: "TASK_COMPLETE", taskId },
  });

  await addReputation({
    userId: executorId,
    deltaPoints: task.repRewardPoints,
    type: "EARN",
    referenceId: repCompleteRef(taskId),
    description: "Task completion reputation",
    metadata: {
      kind: "TASK_COMPLETE",
      taskId,
      repRewardPoints: task.repRewardPoints,
    },
  });

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { status: "DONE", doneAt: new Date() },
    select: { id: true, status: true, doneAt: true },
  });

  return {
    idempotent: false,
    taskId: updated.id,
    status: updated.status,
    doneAt: updated.doneAt?.toISOString(),
  };
}
