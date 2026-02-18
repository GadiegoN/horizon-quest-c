"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { Table, TBody, TD, THead, TH, TR } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

export default function UiPlaygroundPage() {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState("components");

  return (
    <main className="mx-auto w-full max-w-3xl p-4">
      <div className="mb-4">
        <h1 className="text-xl font-semibold">UI Playground</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Base do UI kit (Tailwind v4, mobile-first, sem libs de UI).
        </p>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          {
            key: "components",
            label: "Componentes",
            badge: <Badge tone="accent">novo</Badge>,
          },
          { key: "table", label: "Tabela" },
        ]}
      />

      <div className="mt-4 space-y-4">
        {tab === "components" ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Botões + Toast</CardTitle>
                <CardDescription>
                  Cores fortes e estados (loading/variants)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() =>
                      toast({ title: "Pronto", message: "Toast neutral." })
                    }
                  >
                    Toast
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      toast({
                        title: "Ok",
                        message: "Tudo certo.",
                        tone: "success",
                      })
                    }
                  >
                    Success
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      toast({
                        title: "Atenção",
                        message: "Verifique os dados.",
                        tone: "warning",
                      })
                    }
                  >
                    Warning
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() =>
                      toast({
                        title: "Erro",
                        message: "Falha ao salvar.",
                        tone: "danger",
                      })
                    }
                  >
                    Danger
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button loading>Carregando</Button>
                  <Button variant="secondary" size="sm">
                    Pequeno
                  </Button>
                  <Button size="lg">Grande</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inputs</CardTitle>
                <CardDescription>Label, hint e error</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  label="Email"
                  placeholder="voce@exemplo.com"
                  hint="Usaremos para login e avisos."
                />
                <Input
                  label="Senha"
                  type="password"
                  placeholder="••••••••"
                  error="Senha inválida (exemplo)."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Badges + Select</CardTitle>
                <CardDescription>Tons sem inventar tema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge>Neutral</Badge>
                  <Badge tone="primary">Primary</Badge>
                  <Badge tone="accent">Accent</Badge>
                  <Badge tone="success">Success</Badge>
                  <Badge tone="warning">Warning</Badge>
                  <Badge tone="danger">Danger</Badge>
                </div>

                <Select label="Status" defaultValue="active">
                  <option value="active">Ativo</option>
                  <option value="blocked">Bloqueado</option>
                  <option value="readonly">Somente leitura</option>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Modal/Drawer (Sheet)</CardTitle>
                <CardDescription>Mobile = drawer / md+ = modal</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setOpen(true)}>Abrir</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skeleton</CardTitle>
                <CardDescription>Loading simples</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>

            <Sheet
              open={open}
              onOpenChange={setOpen}
              title="Ação genérica"
              description="Exemplo de drawer/modal para formulários rápidos."
              footer={
                <Button onClick={() => setOpen(false)} variant="primary">
                  Confirmar
                </Button>
              }
            >
              <div className="space-y-3">
                <Input
                  label="Descrição"
                  placeholder="Ex: recompensa / compra interna"
                />
                <Input
                  label="Valor (texto)"
                  placeholder="Ex: HQ$ 10,00"
                  hint="Na Etapa 6 entra zod + cents."
                />
              </div>
            </Sheet>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Tabela</CardTitle>
              <CardDescription>Base para extrato paginado</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <THead>
                  <TR>
                    <TH>Data</TH>
                    <TH>Tipo</TH>
                    <TH className="text-right">Valor</TH>
                  </TR>
                </THead>
                <TBody>
                  <TR>
                    <TD>2026-02-17</TD>
                    <TD>
                      <Badge tone="success">REWARD</Badge>
                    </TD>
                    <TD className="text-right font-semibold">HQ$ 10,00</TD>
                  </TR>
                  <TR>
                    <TD>2026-02-17</TD>
                    <TD>
                      <Badge tone="danger">PURCHASE</Badge>
                    </TD>
                    <TD className="text-right font-semibold">- HQ$ 2,50</TD>
                  </TR>
                </TBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
