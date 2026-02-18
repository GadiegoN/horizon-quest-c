"use server";

import { prisma } from "@/lib/prisma";

export async function closeExpiredWindows(input?: { nowISO?: string }) {
  const now = input?.nowISO ? new Date(input.nowISO) : new Date();

  const tasks = await prisma.task.findMany({
    where: {
      status: "OPEN",
      executorId: null,
      applyWindowEndsAt: { not: null, lte: now },
      difficulty: { in: ["MEDIUM", "ELITE"] },
    },
    select: { id: true },
    orderBy: { applyWindowEndsAt: "asc" },
    take: 100,
  });

  let processed = 0;
  let assigned = 0;
  let skippedNoApplicants = 0;

  for (const t of tasks) {
    processed++;

    await prisma.$transaction(async (tx) => {
      const current = await tx.task.findUnique({
        where: { id: t.id },
        select: { status: true, executorId: true },
      });

      if (!current || current.status !== "OPEN" || current.executorId) return;

      const winner = await tx.taskApplication.findFirst({
        where: { taskId: t.id },
        orderBy: [{ user: { reputationPoints: "desc" } }, { appliedAt: "asc" }],
        select: { userId: true, appliedAt: true },
      });

      if (!winner) {
        skippedNoApplicants++;
        return;
      }

      const updated = await tx.task.updateMany({
        where: { id: t.id, status: "OPEN", executorId: null },
        data: {
          executorId: winner.userId,
          status: "ASSIGNED",
          assignedAt: new Date(),
        },
      });

      if (updated.count === 1) assigned++;
    });
  }

  return { now: now.toISOString(), processed, assigned, skippedNoApplicants };
}
