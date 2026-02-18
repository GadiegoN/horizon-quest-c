/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { closeExpiredWindows } from "@/app/actions/tasks/close-expired-windows";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type Difficulty = "EASY" | "MEDIUM" | "HARD" | "ELITE";

function toneForDifficulty(d: Difficulty) {
  if (d === "EASY") return "success";
  if (d === "MEDIUM") return "primary";
  if (d === "HARD") return "warning";
  return "accent";
}

function labelForDifficulty(d: Difficulty) {
  return d;
}

function groupByDifficulty<T extends { difficulty: Difficulty }>(items: T[]) {
  const groups: Record<Difficulty, T[]> = {
    EASY: [],
    MEDIUM: [],
    HARD: [],
    ELITE: [],
  };
  for (const i of items) groups[i.difficulty].push(i);
  return groups;
}

export default async function TasksPage() {
  try {
    await closeExpiredWindows();
  } catch {}

  const tasks = await prisma.task.findMany({
    where: { status: "OPEN" },
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      difficulty: true,
      valueCents: true,
      repRewardPoints: true,
      minLevelRequired: true,
      applyWindowEndsAt: true,
      createdAt: true,
    },
    take: 200,
  });

  const groups = groupByDifficulty(tasks);

  return (
    <main className="mx-auto w-full max-w-4xl p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Tarefas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Lista de tarefas abertas por dificuldade.
          </p>
        </div>

        <Link href="/tasks/new">
          <Button> Criar tarefa </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {(["EASY", "MEDIUM", "HARD", "ELITE"] as const).map((d) => {
          const list = groups[d];

          return (
            <Card key={d}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">
                      {" "}
                      {labelForDifficulty(d)}{" "}
                    </CardTitle>
                    <Badge tone={toneForDifficulty(d) as any}>
                      {list.length}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {d === "EASY"
                      ? "Primeira candidatura válida atribui."
                      : d === "MEDIUM"
                        ? "Janela 2h, escolhe maior reputação."
                        : d === "HARD"
                          ? "Criador escolhe manualmente."
                          : "Janela 30m + nível alto + maior reputação."}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {list.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    Nenhuma tarefa aberta.
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {list.map((t) => (
                      <li
                        key={t.id}
                        className="rounded-lg border border-border bg-background p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold">
                              Tarefa #{t.id.slice(0, 8)}
                            </div>

                            <div className="mt-1 text-xs text-muted-foreground">
                              Valor: {t.valueCents} cents • Reputação: +
                              {t.repRewardPoints} • Nível mín.:{" "}
                              {t.minLevelRequired}
                            </div>

                            {t.applyWindowEndsAt ? (
                              <div className="mt-1 text-xs text-muted-foreground">
                                Janela até: {t.applyWindowEndsAt.toISOString()}
                              </div>
                            ) : null}
                          </div>

                          <Link href={`/tasks/${t.id}`}>
                            <Button variant="secondary" size="sm">
                              Ver
                            </Button>
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
