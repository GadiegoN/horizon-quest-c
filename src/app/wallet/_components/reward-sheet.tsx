"use client";

import * as React from "react";
import { Sheet } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { rewardAction, type RewardState } from "@/app/actions/bank/reward";
import { useToast } from "@/components/ui/toast";

const initialState: RewardState = { ok: false };

function newRef() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
}

export function RewardSheet({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: (newBalanceCents?: number) => void;
}) {
  const { toast } = useToast();
  const [refId, setRefId] = React.useState(() => newRef());

  const [state, formAction, pending] = React.useActionState(
    rewardAction,
    initialState,
  );

  const prevOk = React.useRef(false);

  React.useEffect(() => {
    if (state?.ok && !prevOk.current) {
      prevOk.current = true;

      toast({
        title: "Recompensa aplicada",
        message: state.idempotent
          ? "Operação idempotente (já existia)."
          : "Crédito registrado no ledger.",
        tone: "success",
      });

      onOpenChange(false);
      onSuccess(state.balanceCents);

      setRefId(newRef());
      return;
    }

    if (!state?.ok) {
      prevOk.current = false;
    }
  }, [state, toast, onOpenChange, onSuccess]);

  React.useEffect(() => {
    if (open) {
      prevOk.current = false;
    }
  }, [open]);

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          prevOk.current = false;
          setRefId(newRef());
        }
      }}
      title="Ganhar HQ$"
      description="Cria um lançamento CREDIT/REWARD no ledger."
      footer={
        <Button type="submit" form="reward-form" loading={pending}>
          Confirmar
        </Button>
      }
    >
      <form id="reward-form" action={formAction} className="space-y-3">
        {state?.formError ? (
          <Badge tone="danger">{state.formError}</Badge>
        ) : null}

        <input type="hidden" name="referenceId" value={refId} />

        <Input
          name="amount"
          label="Valor"
          placeholder="Ex: 10,50"
          hint="Formato pt-BR: 10,50 (convertido para centavos no server)."
          error={state?.fieldErrors?.amount}
          required
        />

        <Input
          name="description"
          label="Descrição (opcional)"
          placeholder="Recompensa interna"
          error={state?.fieldErrors?.description}
        />

        <div className="text-xs text-muted-foreground">
          reference_id: <span className="font-mono">{refId}</span>
        </div>
      </form>
    </Sheet>
  );
}
