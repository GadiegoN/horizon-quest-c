/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { z } from "zod";
import { requireUserId } from "@/lib/bank/auth";
import { BANK_LIMITS } from "@/lib/bank/limits";
import { parseHqToCents } from "@/lib/money";
import { applyPurchase } from "@/lib/bank/ledger";

const Schema = z.object({
  amount: z.string().min(1, "Informe o valor"),
  referenceId: z.string().min(8, "reference_id inválido"),
  description: z.string().max(140).optional(),
});

export type PurchaseState = {
  ok: boolean;
  fieldErrors?: Record<string, string>;
  formError?: string;
  balanceCents?: number;
  idempotent?: boolean;
};

export async function purchaseAction(
  _: PurchaseState,
  formData: FormData,
): Promise<PurchaseState> {
  const raw = {
    amount: String(formData.get("amount") ?? ""),
    referenceId: String(formData.get("referenceId") ?? ""),
    description: String(formData.get("description") ?? ""),
  };

  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    const fe: Record<string, string> = {};
    for (const i of parsed.error.issues)
      fe[String(i.path[0] ?? "form")] = i.message;
    return { ok: false, fieldErrors: fe };
  }

  const cents = parseHqToCents(parsed.data.amount);
  if (cents === null)
    return { ok: false, fieldErrors: { amount: "Valor inválido" } };
  if (cents <= 0)
    return { ok: false, fieldErrors: { amount: "Valor deve ser maior que 0" } };
  if (cents > BANK_LIMITS.MAX_OPERATION_CENTS) {
    return { ok: false, fieldErrors: { amount: "Valor acima do limite" } };
  }

  try {
    const userId = await requireUserId();

    const result = await applyPurchase({
      userId,
      amountCents: cents,
      referenceId: parsed.data.referenceId,
      description: parsed.data.description || "Compra interna",
      metadata: { source: "manual" },
    });

    return {
      ok: true,
      balanceCents: result.balanceCents,
      idempotent: result.idempotent,
    };
  } catch (e: any) {
    if (e?.message === "INSUFFICIENT_FUNDS") {
      return { ok: false, formError: "Saldo insuficiente." };
    }
    return { ok: false, formError: e?.message ?? "Falha ao realizar compra." };
  }
}
