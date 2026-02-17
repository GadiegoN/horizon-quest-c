import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TBody, TD, THead, TH, TR } from "@/components/ui/table";
import { formatHqCents } from "@/lib/money";
import type { StatementEntry } from "./statement-feed";

function fmtDate(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

function canReverse(entry: StatementEntry) {
  if (entry.type === "REVERSAL") return false;
  return entry.type === "PURCHASE" || entry.type === "REWARD";
}

export function EntryTable({
  entries,
  onReverse,
}: {
  entries: StatementEntry[];
  onReverse: (id: string) => void;
}) {
  return (
    <Table>
      <THead>
        <TR>
          <TH>Data</TH>
          <TH>Tipo</TH>
          <TH>Descrição</TH>
          <TH className="text-right">Valor</TH>
          <TH className="text-right">Ações</TH>
        </TR>
      </THead>
      <TBody>
        {entries.map((e) => {
          const sign = e.direction === "DEBIT" ? "-" : "";
          const tone = e.direction === "DEBIT" ? "danger" : "success";

          return (
            <TR key={e.id}>
              <TD>{fmtDate(e.createdAt)}</TD>
              <TD>
                <Badge tone={tone}>{e.type}</Badge>
              </TD>
              <TD className="max-w-55 truncate">
                {e.description ?? "—"}
                <div className="text-xs text-muted-foreground">
                  ref: {e.referenceId}
                </div>
              </TD>
              <TD className="text-right font-semibold">
                {sign} {formatHqCents(e.amountCents)}
              </TD>
              <TD className="text-right">
                {canReverse(e) ? (
                  <Button variant="ghost" onClick={() => onReverse(e.id)}>
                    Estornar
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TD>
            </TR>
          );
        })}
      </TBody>
    </Table>
  );
}
