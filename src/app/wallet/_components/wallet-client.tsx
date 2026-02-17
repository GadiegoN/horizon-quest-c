"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatHqCents } from "@/lib/money";
import { RewardSheet } from "./reward-sheet";
import { PurchaseSheet } from "./purchase-sheet";
import { ReversalSheet } from "./reversal-sheet";
import { StatementFeed, type StatementEntry } from "./statement-feed";

type Props = {
  initialBalanceCents: number;
  initialEntries: StatementEntry[];
  initialNextCursorId: string | null;
};

export function WalletClient({
  initialBalanceCents,
  initialEntries,
  initialNextCursorId,
}: Props) {
  const router = useRouter();

  const [rewardOpen, setRewardOpen] = React.useState(false);
  const [purchaseOpen, setPurchaseOpen] = React.useState(false);

  const [balanceCents, setBalanceCents] = React.useState(initialBalanceCents);

  const [reversalOpen, setReversalOpen] = React.useState(false);
  const [reversalTargetId, setReversalTargetId] = React.useState<string | null>(
    null,
  );

  function openReversal(entryId: string) {
    setReversalTargetId(entryId);
    setReversalOpen(true);
  }

  function onAfterOperation(newBalanceCents?: number) {
    if (typeof newBalanceCents === "number") setBalanceCents(newBalanceCents);
    router.refresh();
  }

  return (
    <main className="mx-auto w-full max-w-3xl space-y-3 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-semibold">Wallet</div>
          <div className="text-sm text-muted-foreground">
            Moeda interna: Horizon Quest (HQ$)
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/settings/security"
            className="text-sm font-semibold text-accent hover:underline"
          >
            Segurança
          </Link>
          <form action="/logout" method="post">
            <Button variant="ghost" type="submit">
              Sair
            </Button>
          </form>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Saldo</span>
            <Badge tone="primary">HQ$</Badge>
          </CardTitle>
          <CardDescription>Saldo disponível (cache do ledger)</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="rounded-2xl border border-border bg-muted p-4">
            <div className="text-xs font-semibold text-muted-foreground">
              Disponível
            </div>
            <div className="mt-1 text-2xl font-semibold">
              {formatHqCents(balanceCents)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => setRewardOpen(true)} className="w-full">
              Ganhar HQ$
            </Button>
            <Button
              variant="secondary"
              onClick={() => setPurchaseOpen(true)}
              className="w-full"
            >
              Gastar HQ$
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            Regras: valores em centavos, ledger imutável, idempotência por{" "}
            <b>reference_id</b>, e compra não permite saldo negativo.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Extrato</CardTitle>
          <CardDescription>Movimentações (paginado por cursor)</CardDescription>
        </CardHeader>
        <CardContent>
          <StatementFeed
            initialEntries={initialEntries}
            initialNextCursorId={initialNextCursorId}
            onReverse={(entryId) => openReversal(entryId)}
          />
        </CardContent>
      </Card>

      <RewardSheet
        open={rewardOpen}
        onOpenChange={setRewardOpen}
        onSuccess={(newBalanceCents) => onAfterOperation(newBalanceCents)}
      />

      <PurchaseSheet
        open={purchaseOpen}
        onOpenChange={setPurchaseOpen}
        onSuccess={(newBalanceCents) => onAfterOperation(newBalanceCents)}
      />

      <ReversalSheet
        open={reversalOpen}
        onOpenChange={(v) => {
          setReversalOpen(v);
          if (!v) setReversalTargetId(null);
        }}
        originalEntryId={reversalTargetId}
        onSuccess={(newBalanceCents) => onAfterOperation(newBalanceCents)}
      />
    </main>
  );
}
