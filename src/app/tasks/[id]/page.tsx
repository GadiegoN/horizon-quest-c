/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, THead, TH, TR } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TaskActions } from "./_components/task-actions";

export const dynamic = "force-dynamic";

function toneForDifficulty(d: string) {
  if (d === "EASY") return "success";
  if (d === "MEDIUM") return "primary";
  if (d === "HARD") return "warning";
  return "accent";
}

export default async function TaskDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      applications: {
        orderBy: { appliedAt: "asc" },
        select: {
          id: true,
          userId: true,
          appliedAt: true,
          user: { select: { reputationPoints: true } },
        },
      },
    },
  });

  if (!task) return notFound();

  return (
    <main className="mx-auto w-full max-w-3xl p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">
            Tarefa #{task.id.slice(0, 8)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Detalhes e candidatos.
          </p>
        </div>
        <Link href="/tasks">
          <Button variant="secondary">Voltar</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">Resumo</CardTitle>
              <CardDescription>Status e regras derivadas</CardDescription>
            </div>
            <Badge tone={toneForDifficulty(task.difficulty) as any}>
              {task.difficulty}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="font-semibold">{task.status}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Valor</span>
            <span className="font-semibold">{task.valueCents} cents</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Reputação</span>
            <span className="font-semibold">+{task.repRewardPoints}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Nível mínimo</span>
            <span className="font-semibold">{task.minLevelRequired}</span>
          </div>

          {task.applyWindowEndsAt ? (
            <div className="text-xs text-muted-foreground">
              Janela até: {task.applyWindowEndsAt.toISOString()}
            </div>
          ) : null}

          <div className="pt-2 text-xs text-muted-foreground">
            Criador: {task.creatorId}
            {task.executorId ? ` • Executor: ${task.executorId}` : ""}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Candidatos</CardTitle>
          <CardDescription>Ordenado por appliedAt</CardDescription>
        </CardHeader>

        <CardContent>
          {task.applications.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Nenhuma candidatura ainda.
            </div>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Usuário</TH>
                  <TH className="text-right">Rep</TH>
                  <TH className="text-right">Applied</TH>
                </TR>
              </THead>
              <TBody>
                {task.applications.map((a) => (
                  <TR key={a.id}>
                    <TD className="max-w-40 truncate">{a.userId}</TD>
                    <TD className="text-right font-semibold">
                      {a.user.reputationPoints}
                    </TD>
                    <TD className="text-right text-xs text-muted-foreground">
                      {a.appliedAt.toISOString()}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <TaskActions
        task={{
          id: task.id,
          creatorId: task.creatorId,
          executorId: task.executorId,
          status: task.status as any,
          difficulty: task.difficulty as any,
          applyWindowEndsAt: task.applyWindowEndsAt
            ? task.applyWindowEndsAt.toISOString()
            : null,
        }}
        candidates={task.applications.map((a) => ({
          userId: a.userId,
          reputationPoints: a.user.reputationPoints,
          appliedAt: a.appliedAt.toISOString(),
        }))}
      />
    </main>
  );
}
