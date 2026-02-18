/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/purity */
"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { requireTasksUserId } from "@/app/actions/tasks/require-user";
import { applyToTask } from "@/app/actions/tasks/apply-to-task";
import { pickExecutor } from "@/app/actions/tasks/pick-executor";
import { cancelTask } from "@/app/actions/tasks/cancel-task";
import { completeTask } from "@/app/actions/tasks/complete-task";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

type TaskInfo = {
  id: string;
  creatorId: string;
  executorId: string | null;
  status: "OPEN" | "ASSIGNED" | "DONE" | "CANCELLED";
  difficulty: "EASY" | "MEDIUM" | "HARD" | "ELITE";
  applyWindowEndsAt: string | null;
};

type Candidate = {
  userId: string;
  reputationPoints: number;
  appliedAt: string;
};

export function TaskActions(props: {
  task: TaskInfo;
  candidates: Candidate[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [me, setMe] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    (async () => {
      try {
        const id = await requireTasksUserId();
        setMe(id);
      } catch {
        setMe(null);
      }
    })();
  }, []);

  const isCreator = me && me === props.task.creatorId;
  const isExecutor =
    me && props.task.executorId && me === props.task.executorId;

  const remaining = useMemo(() => {
    if (!props.task.applyWindowEndsAt) return null;
    const end = new Date(props.task.applyWindowEndsAt).getTime();
    const now = Date.now();
    const ms = end - now;
    if (ms <= 0) return "encerrada";
    const minutes = Math.ceil(ms / 60000);
    return `${minutes} min`;
  }, [props.task.applyWindowEndsAt]);

  function refresh() {
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">Ações</CardTitle>
            <CardDescription>
              Operações disponíveis para seu papel
            </CardDescription>
          </div>
          {props.task.applyWindowEndsAt ? (
            <Badge tone="neutral">restante: {remaining}</Badge>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {me && props.task.status === "OPEN" && !isCreator ? (
            <Button
              loading={isPending}
              onClick={() =>
                startTransition(async () => {
                  try {
                    await applyToTask({ taskId: props.task.id, userId: me });
                    toast({
                      title: "Ok",
                      message: "Candidatura registrada.",
                      tone: "success",
                    });
                    refresh();
                  } catch (e: any) {
                    toast({
                      title: "Erro",
                      message: e?.message ?? "Falha ao candidatar.",
                      tone: "danger",
                    });
                  }
                })
              }
            >
              Candidatar-se
            </Button>
          ) : null}

          {isCreator &&
          (props.task.status === "OPEN" || props.task.status === "ASSIGNED") ? (
            <Button
              variant="danger"
              loading={isPending}
              onClick={() =>
                startTransition(async () => {
                  try {
                    await cancelTask({
                      taskId: props.task.id,
                      creatorId: props.task.creatorId,
                    });
                    toast({
                      title: "Cancelada",
                      message: "Tarefa cancelada e estornada.",
                      tone: "warning",
                    });
                    refresh();
                  } catch (e: any) {
                    toast({
                      title: "Erro",
                      message: e?.message ?? "Falha ao cancelar.",
                      tone: "danger",
                    });
                  }
                })
              }
            >
              Cancelar tarefa
            </Button>
          ) : null}

          {isExecutor && props.task.status === "ASSIGNED" ? (
            <Button
              loading={isPending}
              onClick={() =>
                startTransition(async () => {
                  try {
                    await completeTask({
                      taskId: props.task.id,
                      executorId: me!,
                    });
                    toast({
                      title: "Concluída",
                      message: "Recompensa e reputação aplicadas.",
                      tone: "success",
                    });
                    refresh();
                  } catch (e: any) {
                    toast({
                      title: "Erro",
                      message: e?.message ?? "Falha ao concluir.",
                      tone: "danger",
                    });
                  }
                })
              }
            >
              Marcar como concluída
            </Button>
          ) : null}
        </div>

        {isCreator &&
        props.task.difficulty === "HARD" &&
        props.task.status === "OPEN" ? (
          <div className="space-y-2">
            <div className="text-sm font-medium">Escolher executor</div>

            {props.candidates.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Sem candidatos.
              </div>
            ) : (
              <ul className="space-y-2">
                {props.candidates.map((c) => (
                  <li
                    key={c.userId}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">
                        {c.userId}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        rep: {c.reputationPoints} • appliedAt: {c.appliedAt}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      loading={isPending}
                      disabled={c.userId === props.task.creatorId}
                      onClick={() =>
                        startTransition(async () => {
                          try {
                            await pickExecutor({
                              taskId: props.task.id,
                              creatorId: props.task.creatorId,
                              executorId: c.userId,
                            });
                            toast({
                              title: "Atribuída",
                              message: "Executor escolhido.",
                              tone: "success",
                            });
                            refresh();
                          } catch (e: any) {
                            toast({
                              title: "Erro",
                              message: e?.message ?? "Falha ao escolher.",
                              tone: "danger",
                            });
                          }
                        })
                      }
                    >
                      Escolher
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
