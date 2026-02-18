/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/purity */
"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTask } from "@/app/actions/tasks/create-task";
import { requireTasksUserId } from "@/app/actions/tasks/require-user";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type Difficulty = "EASY" | "MEDIUM" | "HARD" | "ELITE";

export function NewTaskForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const taskId = useMemo(() => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto)
      return crypto.randomUUID();
    return `task_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }, []);

  const [difficulty, setDifficulty] = useState<Difficulty>("EASY");
  const [valueCents, setValueCents] = useState<string>("");

  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cents = Number(valueCents);
    if (!Number.isFinite(cents) || Math.trunc(cents) !== cents || cents <= 0) {
      setError("Informe um valor inteiro em cents (> 0).");
      return;
    }

    startTransition(async () => {
      try {
        const creatorId = await requireTasksUserId();
        const result = await createTask({
          taskId,
          creatorId,
          difficulty,
          valueCents: cents,
        });

        toast({
          title: "Criada",
          message: `Tarefa ${result.task.id.slice(0, 8)} criada.`,
          tone: "success",
        });

        router.push(`/tasks/${result.task.id}`);
      } catch (err: any) {
        const msg = err?.message ?? "Falha ao criar tarefa.";
        const human =
          msg === "INSUFFICIENT_FUNDS" ? "Saldo insuficiente." : msg;
        setError(human);
        toast({ title: "Erro", message: human, tone: "danger" });
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Select
        label="Dificuldade"
        defaultValue={difficulty}
        onChange={(e: any) =>
          setDifficulty(String(e?.target?.value) as Difficulty)
        }
      >
        <option value="EASY">EASY</option>
        <option value="MEDIUM">MEDIUM</option>
        <option value="HARD">HARD</option>
        <option value="ELITE">ELITE</option>
      </Select>

      <Input
        label="Valor (cents)"
        inputMode="numeric"
        placeholder="Ex: 500"
        value={valueCents}
        onChange={(e: any) => setValueCents(String(e?.target?.value ?? ""))}
        error={error ?? undefined}
        hint="Valor inteiro em cents."
      />

      <Button type="submit" loading={isPending}>
        Criar
      </Button>

      <div className="text-xs text-muted-foreground">taskId: {taskId}</div>
    </form>
  );
}
