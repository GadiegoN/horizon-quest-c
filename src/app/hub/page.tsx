import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

function Row(props: {
  href: string;
  title: string;
  desc: string;
  badge?: React.ReactNode;
  emphasis?: "primary" | "secondary";
}) {
  const { href, title, desc, badge, emphasis = "secondary" } = props;

  return (
    <Link
      href={href}
      className="block rounded-xl border border-border bg-background px-4 py-3 transition hover:bg-muted/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold">{title}</div>
            {badge}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{desc}</div>
        </div>

        <div className="shrink-0">
          <Button
            size="sm"
            variant={emphasis === "primary" ? "primary" : "secondary"}
          >
            Abrir
          </Button>
        </div>
      </div>
    </Link>
  );
}

export default async function HubPage() {
  return (
    <main className="mx-auto w-full max-w-3xl p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Hub</CardTitle>
          <CardDescription>Navegue pelo módulo.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Principal</CardTitle>
          <CardDescription>
            Funcionalidades centrais para o usuário.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Row
            href="/wallet"
            title="Wallet"
            desc="Saldo, compra/reward e extrato com estorno."
            badge={<Badge tone="accent">HQ$</Badge>}
            emphasis="primary"
          />
          <Row
            href="/tasks"
            title="Tasks"
            desc="Criar tarefas, candidatar, atribuir e concluir."
            badge={<Badge tone="primary">rep</Badge>}
            emphasis="primary"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Apoio</CardTitle>
          <CardDescription>Consulta e manutenção.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Row
            href="/me"
            title="Perfil"
            desc="Reputação atual, level e histórico (ledger)."
          />
          <Row
            href="/ranking"
            title="Ranking"
            desc="Top usuários por reputationPoints."
          />
          <Row
            href="/settings/password"
            title="Alterar senha"
            desc="Configurações de senha do usuário."
          />
          <Row
            href="/settings/security"
            title="Segurança"
            desc="Configurações de segurança do usuário."
          />
        </CardContent>
      </Card>
    </main>
  );
}
