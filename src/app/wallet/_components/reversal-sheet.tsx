"use client";

import * as React from "react";
import { Sheet } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { reverseAction, type ReverseState } from "@/app/actions/bank/reverse";

const initialState: ReverseState = { ok: false };

function newRef() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
}

export function ReversalSheet({
  open,
  onOpenChange,
  originalEntryId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  originalEntryId: string | null;
  onSuccess: (newBalanceCents?: number) => void;
}) {
  const { toast } = useToast();
  const [refId, setRefId] = React.useState(() => newRef());

  const [state, formAction, pending] = React.useActionState(
    reverseAction,
    initialState,
  );
  const prevOk = React.useRef(false);

  React.useEffect(() => {
    if (state?.ok && !prevOk.current) {
      prevOk.current = true;

      toast({
        title: "Estorno criado",
        message: state.idempotent
          ? "Operação idempotente (já existia)."
          : "Lançamento REVERSAL registrado.",
        tone: "success",
      });

      onOpenChange(false);
      onSuccess(state.balanceCents);
      setRefId(newRef());
      return;
    }

    if (!state?.ok) prevOk.current = false;
  }, [state, toast, onOpenChange, onSuccess]);

  React.useEffect(() => {
    if (open) prevOk.current = false;
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
      title="Estornar lançamento"
      description="Cria um lançamento REVERSAL inverso (imutável)."
      footer={
        <Button
          type="submit"
          form="reversal-form"
          loading={pending}
          disabled={!originalEntryId}
        >
          Confirmar estorno
        </Button>
      }
    >
      <form id="reversal-form" action={formAction} className="space-y-3">
        {state?.formError ? (
          <Badge tone="danger">{state.formError}</Badge>
        ) : null}

        <input type="hidden" name="referenceId" value={refId} />
        <input
          type="hidden"
          name="originalEntryId"
          value={originalEntryId ?? ""}
        />

        <Input
          name="reason"
          label="Motivo (opcional)"
          placeholder="Ex: operação duplicada"
          error={state?.fieldErrors?.reason}
        />

        <div className="text-xs text-muted-foreground">
          entry: <span className="font-mono">{originalEntryId ?? "—"}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          reference_id: <span className="font-mono">{refId}</span>
        </div>
      </form>
    </Sheet>
  );
}
