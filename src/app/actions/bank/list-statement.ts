/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { z } from "zod";
import { requireUserId } from "@/lib/bank/auth";
import { BANK_LIMITS } from "@/lib/bank/limits";
import { listStatement as listStatementDb } from "@/lib/bank/ledger";

const Schema = z.object({
  take: z.coerce
    .number()
    .int()
    .min(1)
    .max(BANK_LIMITS.MAX_PAGE_SIZE)
    .default(BANK_LIMITS.DEFAULT_PAGE_SIZE),
  cursorId: z.string().optional(),
});

export type StatementItem = {
  id: string;
  createdAt: string;
  direction: "CREDIT" | "DEBIT";
  type: "REWARD" | "PURCHASE" | "TRANSFER" | "FEE" | "REVERSAL";
  amountCents: number;
  referenceId: string;
  description: string | null;
};

export type StatementResult = {
  ok: boolean;
  balanceCents?: number;
  items?: StatementItem[];
  nextCursorId?: string | null;
  error?: string;
};

export async function listStatement(input?: {
  take?: number;
  cursorId?: string | null;
}): Promise<StatementResult> {
  try {
    const userId = await requireUserId();
    const parsed = Schema.parse({
      take: input?.take,
      cursorId: input?.cursorId ?? undefined,
    });

    const { wallet, entries, nextCursorId } = await listStatementDb({
      userId,
      take: parsed.take,
      cursorId: parsed.cursorId ?? null,
    });

    return {
      ok: true,
      balanceCents: wallet?.balanceCents ?? 0,
      nextCursorId,
      items: entries.map((e) => ({
        id: e.id,
        createdAt: e.createdAt.toISOString(),
        direction: e.direction as any,
        type: e.type as any,
        amountCents: e.amountCents,
        referenceId: e.referenceId,
        description: e.description ?? null,
      })),
    };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Falha ao listar extrato." };
  }
}
