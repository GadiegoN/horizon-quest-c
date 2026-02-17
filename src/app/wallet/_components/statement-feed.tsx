/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listStatement } from "@/app/actions/bank/list-statement";
import { BANK_LIMITS } from "@/lib/bank/limits";
import { EntryCard } from "./entry-card";
import { EntryTable } from "./entry-table";

export type StatementEntry = {
  id: string;
  createdAt: string;
  direction: "CREDIT" | "DEBIT";
  type: "REWARD" | "PURCHASE" | "TRANSFER" | "FEE" | "REVERSAL";
  amountCents: number;
  referenceId: string;
  description: string | null;
};

type Props = {
  initialEntries: StatementEntry[];
  initialNextCursorId: string | null;
};

export function StatementFeed({ initialEntries, initialNextCursorId }: Props) {
  const [items, setItems] = React.useState<StatementEntry[]>(initialEntries);
  const [cursor, setCursor] = React.useState<string | null>(
    initialNextCursorId,
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function loadMore() {
    if (!cursor || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await listStatement({
        take: BANK_LIMITS.DEFAULT_PAGE_SIZE,
        cursorId: cursor,
      });

      if (!res.ok) throw new Error(res.error ?? "Falha ao carregar extrato.");

      const newItems = (res.items ?? []) as StatementEntry[];
      setItems((prev) => [...prev, ...newItems]);
      setCursor(res.nextCursorId ?? null);
    } catch (e: any) {
      setError(e?.message ?? "Erro ao carregar mais.");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return <Badge tone="warning">Nenhuma movimentação ainda.</Badge>;
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2 md:hidden">
        {items.map((e) => (
          <EntryCard key={e.id} entry={e} />
        ))}
      </div>

      <div className="hidden md:block">
        <EntryTable entries={items} />
      </div>

      {error ? <div className="text-sm text-danger">{error}</div> : null}

      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {cursor ? "Tem mais itens." : "Fim do extrato."}
        </div>

        {cursor ? (
          <Button variant="secondary" onClick={loadMore} loading={loading}>
            Carregar mais
          </Button>
        ) : null}
      </div>
    </div>
  );
}
