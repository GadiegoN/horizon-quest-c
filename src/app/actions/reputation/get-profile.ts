"use server";

import { prisma } from "@/lib/prisma";
import { toReputationSnapshot } from "@/lib/reputation";
import type { ReputationProfileDTO } from "./types";

export async function getReputationProfile(input: {
  userId: string;
}): Promise<ReputationProfileDTO> {
  const userId = input.userId.trim();
  if (!userId) throw new Error("userId is required");

  const profile = await prisma.profile.upsert({
    where: { userId },
    create: { userId, reputationPoints: 0 },
    update: {},
    select: { userId: true, reputationPoints: true, updatedAt: true },
  });

  const snap = toReputationSnapshot(profile.reputationPoints);

  return {
    userId: profile.userId,
    reputationPoints: snap.reputationPoints,
    level: snap.level,
    updatedAt: profile.updatedAt.toISOString(),
  };
}
