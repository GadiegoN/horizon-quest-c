/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { ensureWalletForUser } from "@/lib/bank/ensure-wallet";
import { assertValidCents } from "@/lib/money";

type LedgerBase = {
  referenceId: string;
  description?: string | null;
  metadata?: any;
};

export async function getWalletByUserId(userId: string) {
  return ensureWalletForUser(userId);
}

export async function getLedgerByReferenceId(referenceId: string) {
  return prisma.ledgerEntry.findUnique({
    where: { referenceId },
  });
}

/**
 * CREDIT (reward): sempre adiciona saldo.
 * - idempotência por referenceId
 * - transação atômica: cria ledger + atualiza wallet
 */
export async function applyReward(
  params: {
    userId: string;
    amountCents: number;
  } & LedgerBase,
) {
  assertValidCents(params.amountCents);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.ledgerEntry.findUnique({
      where: { referenceId: params.referenceId },
    });

    const wallet = await tx.wallet.upsert({
      where: { userId: params.userId },
      update: {},
      create: { userId: params.userId, balanceCents: 0, status: "ACTIVE" },
    });

    if (existing) {
      const fresh = await tx.wallet.findUnique({ where: { id: wallet.id } });
      return {
        walletId: wallet.id,
        balanceCents: fresh?.balanceCents ?? wallet.balanceCents,
        ledgerEntryId: existing.id,
        idempotent: true,
      };
    }

    const entry = await tx.ledgerEntry.create({
      data: {
        walletId: wallet.id,
        direction: "CREDIT",
        type: "REWARD",
        amountCents: params.amountCents,
        referenceId: params.referenceId,
        description: params.description ?? null,
        metadata: params.metadata ?? null,
      },
    });

    const updated = await tx.wallet.update({
      where: { id: wallet.id },
      data: { balanceCents: { increment: params.amountCents } },
    });

    return {
      walletId: wallet.id,
      balanceCents: updated.balanceCents,
      ledgerEntryId: entry.id,
      idempotent: false,
    };
  });
}

/**
 * DEBIT (purchase): não pode deixar saldo negativo.
 * - updateMany condicional
 * - se count=0 -> insuficiente
 * - cria ledger
 * - idempotência por referenceId
 */
export async function applyPurchase(
  params: {
    userId: string;
    amountCents: number;
  } & LedgerBase,
) {
  assertValidCents(params.amountCents);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.ledgerEntry.findUnique({
      where: { referenceId: params.referenceId },
    });

    const wallet = await tx.wallet.upsert({
      where: { userId: params.userId },
      update: {},
      create: { userId: params.userId, balanceCents: 0, status: "ACTIVE" },
    });

    if (existing) {
      const fresh = await tx.wallet.findUnique({ where: { id: wallet.id } });
      return {
        walletId: wallet.id,
        balanceCents: fresh?.balanceCents ?? wallet.balanceCents,
        ledgerEntryId: existing.id,
        idempotent: true,
      };
    }

    const updatedCount = await tx.wallet.updateMany({
      where: {
        id: wallet.id,
        balanceCents: { gte: params.amountCents },
        status: "ACTIVE",
      },
      data: {
        balanceCents: { decrement: params.amountCents },
      },
    });

    if (updatedCount.count !== 1) {
      throw new Error("INSUFFICIENT_FUNDS");
    }

    const entry = await tx.ledgerEntry.create({
      data: {
        walletId: wallet.id,
        direction: "DEBIT",
        type: "PURCHASE",
        amountCents: params.amountCents,
        referenceId: params.referenceId,
        description: params.description ?? null,
        metadata: params.metadata ?? null,
      },
    });

    const fresh = await tx.wallet.findUnique({ where: { id: wallet.id } });

    return {
      walletId: wallet.id,
      balanceCents: fresh?.balanceCents ?? 0,
      ledgerEntryId: entry.id,
      idempotent: false,
    };
  });
}

export async function listStatement(params: {
  userId: string;
  take: number;
  cursorId?: string | null;
}) {
  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({
      where: { userId: params.userId },
    });

    if (!wallet) {
      return { wallet: null, entries: [], nextCursorId: null as string | null };
    }

    const entries = await tx.ledgerEntry.findMany({
      where: { walletId: wallet.id },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: params.take,
      ...(params.cursorId ? { cursor: { id: params.cursorId }, skip: 1 } : {}),
    });

    const nextCursorId =
      entries.length === params.take
        ? (entries[entries.length - 1]?.id ?? null)
        : null;

    return { wallet, entries, nextCursorId };
  });
}
