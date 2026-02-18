import Link from "next/link";
import { prisma } from "@/lib/prisma";

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

export default async function RankingPage(props: {
  searchParams: Promise<Search>;
}) {
  const { cursor } = await props.searchParams;

  const take = 25;

  const items = await prisma.profile.findMany({
    orderBy: [{ reputationPoints: "desc" }, { userId: "asc" }],
    take: take + 1,
    ...(cursor ? { cursor: { userId: cursor }, skip: 1 } : {}),
    select: { userId: true, reputationPoints: true },
  });

  const hasMore = items.length > take;
  const page = items.slice(0, take);
  const nextCursor = hasMore ? page[page.length - 1]!.userId : null;

  return (
    <main className="mx-auto w-full max-w-3xl p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Ranking</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Top usuários por reputationPoints.
          </p>
        </div>
        <Link href="/me">
          <Button variant="secondary">Meu perfil</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top</CardTitle>
          <CardDescription>Ordenado por reputação (desc).</CardDescription>
        </CardHeader>
        <CardContent>
          {page.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Ainda não há perfis no ranking.
            </div>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Usuário</TH>
                  <TH className="text-right">Rep</TH>
                </TR>
              </THead>
              <TBody>
                {page.map((p) => (
                  <TR key={p.userId}>
                    <TD className="max-w-50 truncate">{p.userId}</TD>
                    <TD className="text-right">
                      <Badge tone="accent">{p.reputationPoints}</Badge>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}

          <div className="mt-4 flex justify-end">
            {nextCursor ? (
              <Link href={`/ranking?cursor=${encodeURIComponent(nextCursor)}`}>
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
