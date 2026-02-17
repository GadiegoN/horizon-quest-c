"use client";

import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  updatePasswordAction,
  type UpdatePasswordState,
} from "@/app/actions/auth/update-password";
import { useToast } from "@/components/ui/toast";

const initialState: UpdatePasswordState = { ok: false };

export default function UpdatePasswordPage() {
  const { toast } = useToast();
  const [state, formAction, pending] = React.useActionState(
    updatePasswordAction,
    initialState,
  );

  React.useEffect(() => {
    if (state?.ok && state.message) {
      toast({ title: "Pronto", message: state.message, tone: "success" });
    }
  }, [state, toast]);

  return (
    <main className="mx-auto w-full max-w-md p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Link
          href="/wallet"
          className="text-sm font-semibold text-primary hover:underline"
        >
          ← Voltar
        </Link>

        <form action="/logout" method="post">
          <Button variant="ghost" type="submit">
            Sair
          </Button>
        </form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Senha</CardTitle>
          <CardDescription>Altere sua senha estando logado.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {state?.formError ? (
            <Badge tone="danger">{state.formError}</Badge>
          ) : null}
          {state?.ok && state?.message ? (
            <Badge tone="success">{state.message}</Badge>
          ) : null}

          <form action={formAction} className="space-y-3">
            <Input
              name="password"
              type="password"
              label="Nova senha"
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
              error={state?.fieldErrors?.password}
              required
            />

            <Button type="submit" loading={pending} className="w-full">
              Atualizar senha
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
