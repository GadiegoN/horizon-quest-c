import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatHqCents } from "@/lib/money";
import type { StatementEntry } from "./statement-feed";

function fmtDate(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

function toneFor(entry: StatementEntry) {
  if (entry.direction === "CREDIT") return "success";
  if (entry.direction === "DEBIT") return "danger";
  return "neutral";
}

function canReverse(entry: StatementEntry) {
  if (entry.type === "REVERSAL") return false;
  return entry.type === "PURCHASE" || entry.type === "REWARD";
}

export function EntryCard({
  entry,
  onReverse,
}: {
  entry: StatementEntry;
  onReverse: (id: string) => void;
}) {
  const sign = entry.direction === "DEBIT" ? "-" : "";
  const tone = toneFor(entry);

  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold">
            {entry.description ?? entry.type}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {fmtDate(entry.createdAt)}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div className="text-sm font-semibold">
            {sign} {formatHqCents(entry.amountCents)}
          </div>
          <div className="mt-1 flex justify-end gap-2">
            <Badge tone={tone}>{entry.type}</Badge>
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="truncate text-xs text-muted-foreground">
          ref: {entry.referenceId}
        </div>

        {canReverse(entry) ? (
          <Button variant="ghost" onClick={() => onReverse(entry.id)}>
            Estornar
          </Button>
        ) : null}
      </div>
    </div>
  );
}
