/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { requireUserId } from "@/lib/bank/auth";
import { prisma } from "@/lib/prisma";
import { ensureWalletForUser } from "@/lib/bank/ensure-wallet";

export type BalanceResult = {
  ok: boolean;
  balanceCents?: number;
  walletId?: string;
  error?: string;
};

export async function getBalance(): Promise<BalanceResult> {
  try {
    const userId = await requireUserId();
    const wallet = await ensureWalletForUser(userId);

    const fresh = await prisma.wallet.findUnique({ where: { id: wallet.id } });
    return {
      ok: true,
      walletId: wallet.id,
      balanceCents: fresh?.balanceCents ?? wallet.balanceCents,
    };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Falha ao obter saldo." };
  }
}
