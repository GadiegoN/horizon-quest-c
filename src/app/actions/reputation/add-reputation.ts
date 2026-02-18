/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import { clampNonNegativeInt, toReputationSnapshot } from "@/lib/reputation";
import type {
  ReputationEntryType,
  ReputationEntryDTO,
  ReputationProfileDTO,
} from "./types";

type AddReputationInput = {
  userId: string;
  deltaPoints: number;
  type: ReputationEntryType;
  referenceId: string;
  description?: string | null;
  metadata?: unknown | null;
};

type AddReputationResult = {
  idempotent: boolean;
  entry: ReputationEntryDTO;
  profile: ReputationProfileDTO;
};

function normalizeString(v: string) {
  return v.trim();
}

function toEntryDTO(e: {
  id: string;
  userId: string;
  deltaPoints: number;
  type: ReputationEntryType;
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

export async function addReputation(
  input: AddReputationInput,
): Promise<AddReputationResult> {
  const userId = normalizeString(input.userId);
  const referenceId = normalizeString(input.referenceId);

  if (!userId) throw new Error("userId is required");
  if (!referenceId) throw new Error("referenceId is required");
  if (!Number.isFinite(input.deltaPoints))
    throw new Error("deltaPoints must be a finite number");

  const deltaPoints = Math.trunc(input.deltaPoints);
  if (deltaPoints === 0) throw new Error("deltaPoints cannot be 0");

  const type = input.type;
  const description = input.description ?? null;
  const metadata = input.metadata ?? null;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const profile = await tx.profile.upsert({
        where: { userId },
        create: { userId, reputationPoints: 0 },
        update: {},
        select: { userId: true, reputationPoints: true, updatedAt: true },
      });

      const entry = await tx.reputationEntry.create({
        data: {
          userId,
          deltaPoints,
          type,
          referenceId,
          description,
          metadata: metadata as any,
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
      const next = clampNonNegativeInt(current + deltaPoints);

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
      if (!profile) {
        throw new Error("Profile not found for reputation entry");
      }

      const snap = toReputationSnapshot(profile.reputationPoints);

      return {
        idempotent: true,
        entry: toEntryDTO(entry as any),
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
