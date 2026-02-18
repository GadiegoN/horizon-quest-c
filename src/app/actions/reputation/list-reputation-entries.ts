/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import type { PageResult, ReputationEntryDTO } from "./types";

type ListEntriesInput = {
  userId: string;
  cursor?: string | null;
  limit?: number;
};

export async function listReputationEntries(
  input: ListEntriesInput,
): Promise<PageResult<ReputationEntryDTO>> {
  const userId = input.userId.trim();
  if (!userId) throw new Error("userId is required");

  const limit = Math.min(Math.max(input.limit ?? 20, 1), 50);

  const entries = await prisma.reputationEntry.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(input.cursor
      ? {
          cursor: { id: input.cursor },
          skip: 1,
        }
      : {}),
    select: {
      id: true,
      userId: true,
      deltaPoints: true,
      type: true,
      referenceId: true,
      description: true,
      metadata: true,
      createdAt: true,
    },
  });

  const hasMore = entries.length > limit;
  const page = entries.slice(0, limit);

  return {
    items: page.map((e) => ({
      id: e.id,
      userId: e.userId,
      deltaPoints: e.deltaPoints,
      type: e.type as any,
      referenceId: e.referenceId,
      description: e.description,
      metadata: e.metadata ?? null,
      createdAt: e.createdAt.toISOString(),
    })),
    nextCursor: hasMore ? page[page.length - 1]!.id : null,
  };
}
