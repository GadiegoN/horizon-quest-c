/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import { applyPurchase, applyReward } from "@/lib/bank/ledger";
import { reverseLedgerEntry } from "@/lib/bank/reversal";

type BankPurchaseInput = {
  userId: string;
  amountCents: number;
  referenceId: string;
  description?: string | null;
  metadata?: unknown | null;
};

type BankRewardInput = {
  userId: string;
  amountCents: number;
  referenceId: string;
  description?: string | null;
  metadata?: unknown | null;
};

type BankReverseByReferenceInput = {
  userId: string;
  originalReferenceId: string;
  referenceId: string;
  reason?: string | null;
};

export async function bankDebitForTaskCreate(input: BankPurchaseInput) {
  return applyPurchase({
    userId: input.userId,
    amountCents: input.amountCents,
    referenceId: input.referenceId,
    description: input.description ?? "Compra interna",
    metadata: (input.metadata ?? { source: "tasks" }) as any,
  });
}

export async function bankCreditForTaskComplete(input: BankRewardInput) {
  return applyReward({
    userId: input.userId,
    amountCents: input.amountCents,
    referenceId: input.referenceId,
    description: input.description ?? "Recompensa interna",
    metadata: (input.metadata ?? { source: "tasks" }) as any,
  });
}

export async function bankReverseByReference(
  input: BankReverseByReferenceInput,
) {
  const original = await prisma.ledgerEntry.findUnique({
    where: { referenceId: input.originalReferenceId },
    select: {
      id: true,
      wallet: { select: { userId: true } },
    },
  });

  if (!original) {
    throw new Error("ENTRY_NOT_FOUND");
  }

  if (original.wallet.userId !== input.userId) {
    throw new Error("FORBIDDEN");
  }

  return reverseLedgerEntry({
    userId: input.userId,
    originalEntryId: original.id,
    referenceId: input.referenceId,
    reason: input.reason ?? null,
  });
}
