import { prisma } from "@/lib/prisma";

export async function ensureWalletForUser(userId: string) {
  if (process.env.NEXT_RUNTIME === "edge") {
    throw new Error("ensureWalletForUser cannot run on Edge runtime.");
  }

  return prisma.wallet.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      balanceCents: 0,
      status: "ACTIVE",
    },
  });
}
