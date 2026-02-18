/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { requireTasksUserId } from "@/app/actions/tasks/require-user";
import { getReputationProfile } from "@/app/actions/reputation/get-profile";
import { listReputationEntries } from "@/app/actions/reputation/list-reputation-entries";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Table, TBody, TD, THead, TH, TR } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type Search = { cursor?: string };

export default async function MePage(props: { searchParams: Promise<Search> }) {
  const { cursor } = await props.searchParams;

  const userId = await requireTasksUserId();

  const [profile, entriesPage] = await Promise.all([
    getReputationProfile({ userId }),
    listReputationEntries({ userId, cursor: cursor ?? null, limit: 20 }),
  ]);

  return (
    <main className="mx-auto w-full max-w-3xl p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Meu perfil</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Reputação e histórico.
          </p>
        </div>
        <Link href="/ranking">
          <Button variant="secondary">Ranking</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumo</CardTitle>
          <CardDescription>Snapshot derivado do ledger</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border border-border p-3">
            <div className="text-xs text-muted-foreground">userId</div>
            <div className="mt-1 truncate text-sm font-semibold">
              {profile.userId}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-border p-3">
              <div className="text-xs text-muted-foreground">
                Reputation Points
              </div>
              <div className="mt-1 text-lg font-semibold">
                {profile.reputationPoints}
              </div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <div className="text-xs text-muted-foreground">Level</div>
              <div className="mt-1 text-lg font-semibold">{profile.level}</div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Atualizado em: {profile.updatedAt}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">Histórico</CardTitle>
              <CardDescription>ReputationEntry (paginado)</CardDescription>
            </div>
            <Link href="/tasks">
              <Button size="sm" variant="secondary">
                Tarefas
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent>
          {entriesPage.items.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Sem movimentações de reputação.
            </div>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Tipo</TH>
                  <TH className="text-right">Delta</TH>
                </TR>
              </THead>
              <TBody>
                {entriesPage.items.map((e) => (
                  <TR key={e.id}>
                    <TD>
                      <div className="text-sm font-semibold">{e.type}</div>
                      <div className="mt-1 text-xs text-muted-foreground truncate">
                        {e.description ?? "—"} • {e.createdAt}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground truncate">
                        ref: {e.referenceId}
                      </div>
                    </TD>
                    <TD className="text-right">
                      <Badge
                        tone={
                          e.deltaPoints >= 0
                            ? ("success" as any)
                            : ("danger" as any)
                        }
                      >
                        {e.deltaPoints >= 0
                          ? `+${e.deltaPoints}`
                          : e.deltaPoints}
                      </Badge>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}

          <div className="mt-4 flex justify-end">
            {entriesPage.nextCursor ? (
              <Link
                href={`/me?cursor=${encodeURIComponent(entriesPage.nextCursor)}`}
              >
                <Button>Próxima página</Button>
              </Link>
            ) : (
              <div className="text-sm text-muted-foreground">Fim.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
