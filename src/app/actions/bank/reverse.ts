/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { z } from "zod";
import { requireUserId } from "@/lib/bank/auth";
import { assertRateLimit } from "@/lib/bank/rate-limit";
import { auditLog } from "@/lib/bank/audit";
import { reverseLedgerEntry } from "@/lib/bank/reversal";

const Schema = z.object({
  originalEntryId: z.string().min(10, "entry inválida"),
  referenceId: z.string().min(8, "reference_id inválido"),
  reason: z.string().max(140).optional(),
});

export type ReverseState = {
  ok: boolean;
  fieldErrors?: Record<string, string>;
  formError?: string;
  balanceCents?: number;
  idempotent?: boolean;
};

export async function reverseAction(
  _: ReverseState,
  formData: FormData,
): Promise<ReverseState> {
  const raw = {
    originalEntryId: String(formData.get("originalEntryId") ?? ""),
    referenceId: String(formData.get("referenceId") ?? ""),
    reason: String(formData.get("reason") ?? ""),
  };

  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    const fe: Record<string, string> = {};
    for (const i of parsed.error.issues)
      fe[String(i.path[0] ?? "form")] = i.message;
    return { ok: false, fieldErrors: fe };
  }

  try {
    const userId = await requireUserId();

    await assertRateLimit({ userId, action: "reverse" });
    const requestId = auditLog("bank.reverse.request", {
      userId,
      originalEntryId: parsed.data.originalEntryId,
      referenceId: parsed.data.referenceId,
    });

    const result = await reverseLedgerEntry({
      userId,
      originalEntryId: parsed.data.originalEntryId,
      referenceId: parsed.data.referenceId,
      reason: parsed.data.reason || null,
    });

    auditLog("bank.reverse.success", {
      requestId,
      userId,
      reversalEntryId: result.reversalEntryId,
      idempotent: result.idempotent,
    });

    return {
      ok: true,
      balanceCents: result.balanceCents,
      idempotent: result.idempotent,
    };
  } catch (e: any) {
    const msg = e?.message ?? "Falha ao estornar.";
    if (msg === "FORBIDDEN")
      return {
        ok: false,
        formError: "Você não pode estornar este lançamento.",
      };
    if (msg === "ENTRY_NOT_FOUND")
      return { ok: false, formError: "Lançamento não encontrado." };
    if (msg === "CANNOT_REVERSE_REVERSAL")
      return { ok: false, formError: "Não é possível estornar um estorno." };
    if (msg === "UNSUPPORTED_REVERSAL_TYPE")
      return {
        ok: false,
        formError: "Tipo de lançamento não suportado para estorno.",
      };
    if (msg === "INSUFFICIENT_FUNDS")
      return {
        ok: false,
        formError: "Saldo insuficiente para estornar este crédito.",
      };
    return { ok: false, formError: msg };
  }
}
