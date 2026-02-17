import { prisma } from "@/lib/prisma";
import { assertValidCents } from "@/lib/money";

type ReverseParams = {
  userId: string;
  originalEntryId: string;
  referenceId: string;
  reason?: string | null;
};

export async function reverseLedgerEntry(params: ReverseParams) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.ledgerEntry.findUnique({
      where: { referenceId: params.referenceId },
    });
    if (existing) {
      const wallet = await tx.wallet.findUnique({
        where: { id: existing.walletId },
      });
      return {
        idempotent: true,
        reversalEntryId: existing.id,
        balanceCents: wallet?.balanceCents ?? 0,
      };
    }

    const original = await tx.ledgerEntry.findUnique({
      where: { id: params.originalEntryId },
      include: { wallet: true },
    });
    if (!original) throw new Error("ENTRY_NOT_FOUND");

    if (original.wallet.userId !== params.userId) {
      throw new Error("FORBIDDEN");
    }

    if (original.type === "REVERSAL")
      throw new Error("CANNOT_REVERSE_REVERSAL");

    if (!(original.type === "PURCHASE" || original.type === "REWARD")) {
      throw new Error("UNSUPPORTED_REVERSAL_TYPE");
    }

    assertValidCents(original.amountCents);

    // DEBIT => reversal é CREDIT (devolve saldo)
    // CREDIT => reversal é DEBIT (remove saldo) e não pode ficar negativo
    const reversalDirection =
      original.direction === "DEBIT" ? "CREDIT" : "DEBIT";
    const reversalAmount = original.amountCents;

    if (reversalDirection === "DEBIT") {
      const dec = await tx.wallet.updateMany({
        where: {
          id: original.walletId,
          balanceCents: { gte: reversalAmount },
          status: "ACTIVE",
        },
        data: { balanceCents: { decrement: reversalAmount } },
      });
      if (dec.count !== 1) throw new Error("INSUFFICIENT_FUNDS");
    } else {
      await tx.wallet.update({
        where: { id: original.walletId },
        data: { balanceCents: { increment: reversalAmount } },
      });
    }

    const reversal = await tx.ledgerEntry.create({
      data: {
        walletId: original.walletId,
        direction: reversalDirection,
        type: "REVERSAL",
        amountCents: reversalAmount,
        referenceId: params.referenceId,
        description: params.reason ? `Estorno: ${params.reason}` : "Estorno",
        metadata: {
          originalEntryId: original.id,
          originalReferenceId: original.referenceId,
          originalType: original.type,
          originalDirection: original.direction,
        },
      },
    });

    const wallet = await tx.wallet.findUnique({
      where: { id: original.walletId },
    });

    return {
      idempotent: false,
      reversalEntryId: reversal.id,
      balanceCents: wallet?.balanceCents ?? 0,
    };
  });
}
