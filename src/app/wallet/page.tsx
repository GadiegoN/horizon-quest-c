import { requireUserId } from "@/lib/bank/auth";
import { listStatement as listStatementDb } from "@/lib/bank/ledger";
import { BANK_LIMITS } from "@/lib/bank/limits";
import { WalletClient } from "./_components/wallet-client";

export const runtime = "nodejs";

export default async function WalletPage() {
  const userId = await requireUserId();

  const { wallet, entries, nextCursorId } = await listStatementDb({
    userId,
    take: BANK_LIMITS.DEFAULT_PAGE_SIZE,
    cursorId: null,
  });

  return (
    <WalletClient
      initialBalanceCents={wallet?.balanceCents ?? 0}
      initialEntries={entries.map((e) => ({
        id: e.id,
        createdAt: e.createdAt.toISOString(),
        direction: e.direction,
        type: e.type,
        amountCents: e.amountCents,
        referenceId: e.referenceId,
        description: e.description ?? null,
      }))}
      initialNextCursorId={nextCursorId}
    />
  );
}
