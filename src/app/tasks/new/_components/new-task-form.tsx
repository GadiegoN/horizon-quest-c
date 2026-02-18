/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/purity */
"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTask } from "@/app/actions/tasks/create-task";
import { requireTasksUserId } from "@/app/actions/tasks/require-user";

import { z } from "zod";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type Difficulty = "EASY" | "MEDIUM" | "HARD" | "ELITE";

const FormSchema = z.object({
  title: z.string().trim().min(3).max(80),
  description: z.string().trim().min(10).max(2000),
  acceptanceCriteria: z
    .string()
    .trim()
    .max(4000)
    .optional()
    .transform((v) => {
      const s = (v ?? "").trim();
      return s.length === 0 ? null : s;
    }),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "ELITE"]),
  valueCents: z
    .string()
    .trim()
    .refine((s) => s.length > 0, "Informe um valor")
    .transform((s) => Number(s))
    .refine((n) => Number.isFinite(n), "Valor inválido")
    .transform((n) => Math.trunc(n))
    .refine((n) => n > 0, "Valor deve ser > 0"),
});

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

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState<string>("");

  const [fieldErrors, setFieldErrors] = useState<
    Partial<
      Record<
        "title" | "description" | "acceptanceCriteria" | "valueCents",
        string
      >
    >
  >({});

  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = FormSchema.safeParse({
      title,
      description,
      acceptanceCriteria,
      difficulty,
      valueCents,
    });

    if (!parsed.success) {
      const next: typeof fieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (
          key === "title" ||
          key === "description" ||
          key === "acceptanceCriteria" ||
          key === "valueCents"
        ) {
          next[key] = issue.message;
        }
      }
      setFieldErrors(next);
      setError("Revise os campos.");
      return;
    }

    setFieldErrors({});

    startTransition(async () => {
      try {
        const creatorId = await requireTasksUserId();
        const result = await createTask({
          taskId,
          creatorId,
          difficulty: parsed.data.difficulty,
          valueCents: parsed.data.valueCents,
          title: parsed.data.title,
          description: parsed.data.description,
          acceptanceCriteria: parsed.data.acceptanceCriteria,
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
      <Input
        label="Título"
        placeholder="Ex: Revisar contrato"
        value={title}
        onChange={(e: any) => setTitle(String(e?.target?.value ?? ""))}
        error={fieldErrors.title}
      />

      <Textarea
        label="Descrição"
        placeholder="Explique o que precisa ser feito, com contexto suficiente para executar."
        value={description}
        onChange={(e: any) => setDescription(String(e?.target?.value ?? ""))}
        error={fieldErrors.description}
      />

      <Textarea
        label="Critérios de aceite"
        placeholder="Opcional, mas recomendado. Ex: entregue o arquivo X, com Y validado e Z documentado."
        value={acceptanceCriteria}
        onChange={(e: any) =>
          setAcceptanceCriteria(String(e?.target?.value ?? ""))
        }
        error={fieldErrors.acceptanceCriteria}
        hint="Opcional. Use para deixar claro quando a task está pronta."
      />

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
        error={fieldErrors.valueCents ?? error ?? undefined}
        hint="Valor inteiro em cents."
      />

      <Button type="submit" loading={isPending}>
        Criar
      </Button>

      <div className="text-xs text-muted-foreground">taskId: {taskId}</div>
    </form>
  );
}
