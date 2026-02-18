/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import { clampNonNegativeInt, toReputationSnapshot } from "@/lib/reputation";
import type { ReputationEntryDTO, ReputationProfileDTO } from "./types";

type ReverseReputationInput = {
  userId: string;
  originalReferenceId: string;
  referenceId: string;
  description?: string | null;
  metadata?: unknown | null;
};

type ReverseReputationResult = {
  idempotent: boolean;
  entry: ReputationEntryDTO;
  profile: ReputationProfileDTO;
};

function toEntryDTO(e: {
  id: string;
  userId: string;
  deltaPoints: number;
  type: "REVERSAL";
  referenceId: string;
  description: string | null;
  metadata: unknown | null;
  createdAt: Date;
}): ReputationEntryDTO {
  return {
    id: e.id,
    userId: e.userId,
    deltaPoints: e.deltaPoints,
    type: e.type,
    referenceId: e.referenceId,
    description: e.description,
    metadata: e.metadata ?? null,
    createdAt: e.createdAt.toISOString(),
  };
}

export async function reverseReputation(
  input: ReverseReputationInput,
): Promise<ReverseReputationResult> {
  const userId = input.userId.trim();
  const originalReferenceId = input.originalReferenceId.trim();
  const referenceId = input.referenceId.trim();

  if (!userId) throw new Error("userId is required");
  if (!originalReferenceId) throw new Error("originalReferenceId is required");
  if (!referenceId) throw new Error("referenceId is required");

  try {
    const result = await prisma.$transaction(async (tx) => {
      const original = await tx.reputationEntry.findFirst({
        where: { userId, referenceId: originalReferenceId },
        select: { deltaPoints: true, referenceId: true },
      });

      if (!original) throw new Error("Original reputation entry not found");

      const profile = await tx.profile.upsert({
        where: { userId },
        create: { userId, reputationPoints: 0 },
        update: {},
        select: { userId: true, reputationPoints: true, updatedAt: true },
      });

      const reversalDelta = -Math.trunc(original.deltaPoints);

      const entry = await tx.reputationEntry.create({
        data: {
          userId,
          deltaPoints: reversalDelta,
          type: "REVERSAL",
          referenceId,
          description:
            input.description ?? `Reversal of ${original.referenceId}`,
          metadata: (input.metadata ?? { originalReferenceId }) as any,
        },
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

      const current = clampNonNegativeInt(profile.reputationPoints);
      const next = clampNonNegativeInt(current + reversalDelta);

      const updated = await tx.profile.update({
        where: { userId },
        data: { reputationPoints: next },
        select: { userId: true, reputationPoints: true, updatedAt: true },
      });

      const snap = toReputationSnapshot(updated.reputationPoints);

      return {
        entry,
        profile: {
          userId: updated.userId,
          reputationPoints: snap.reputationPoints,
          level: snap.level,
          updatedAt: updated.updatedAt.toISOString(),
        } satisfies ReputationProfileDTO,
      };
    });

    return {
      idempotent: false,
      entry: toEntryDTO(result.entry as any),
      profile: result.profile,
    };
  } catch (err: any) {
    if (err?.code === "P2002") {
      const [entry, profile] = await Promise.all([
        prisma.reputationEntry.findUnique({
          where: { referenceId },
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
        }),
        prisma.profile.findUnique({
          where: { userId },
          select: { userId: true, reputationPoints: true, updatedAt: true },
        }),
      ]);

      if (!entry)
        throw new Error(
          "Idempotency conflict: referenceId already used, but entry not found",
        );
      if (!profile) throw new Error("Profile not found for reputation entry");

      const snap = toReputationSnapshot(profile.reputationPoints);

      return {
        idempotent: true,
        entry: {
          id: entry.id,
          userId: entry.userId,
          deltaPoints: entry.deltaPoints,
          type: entry.type as any,
          referenceId: entry.referenceId,
          description: entry.description,
          metadata: entry.metadata ?? null,
          createdAt: entry.createdAt.toISOString(),
        },
        profile: {
          userId: profile.userId,
          reputationPoints: snap.reputationPoints,
          level: snap.level,
          updatedAt: profile.updatedAt.toISOString(),
        },
      };
    }

    throw err;
  }
}
