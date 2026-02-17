"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthCard } from "@/app/(auth)/_components/auth-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { loginAction, type LoginState } from "@/app/actions/auth/login";
import { useToast } from "@/components/ui/toast";

const initialState: LoginState = { ok: false };

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const { toast } = useToast();

  const next = sp.get("next") ?? "";
  const error = sp.get("error");

  const [state, formAction, pending] = React.useActionState(
    loginAction,
    initialState,
  );

  React.useEffect(() => {
    if (error) {
      toast({
        title: "Atenção",
        message: "Não foi possível concluir a autenticação.",
        tone: "warning",
      });
    }
  }, [error, toast]);

  React.useEffect(() => {
    if (!state?.ok) return;

    if (state.needsMfa) {
      router.replace(
        `/mfa?next=${encodeURIComponent(state.next ?? "/wallet")}`,
      );
      toast({
        title: "Verificação necessária",
        message: "Digite o código do seu autenticador para continuar.",
        tone: "warning",
      });
      return;
    }

    router.replace(state.next ?? "/wallet");
    toast({
      title: "Logado",
      message: "Sessão iniciada com sucesso.",
      tone: "success",
    });
  }, [state, router, toast]);

  return (
    <AuthCard
      title="Entrar"
      description="Acesse sua conta para continuar."
      footer={
        <div className="flex items-center justify-between">
          <Link
            href="/signup"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Criar conta
          </Link>
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-accent hover:underline"
          >
            Esqueci a senha
          </Link>
        </div>
      }
    >
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="next" value={next} />
        {state?.formError ? (
          <Badge tone="danger">{state.formError}</Badge>
        ) : null}

        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="voce@exemplo.com"
          autoComplete="email"
          error={state?.fieldErrors?.email}
          required
        />
        <Input
          name="password"
          type="password"
          label="Senha"
          placeholder="••••••••"
          autoComplete="current-password"
          error={state?.fieldErrors?.password}
          required
        />

        <Button type="submit" loading={pending} className="w-full">
          Entrar
        </Button>
      </form>
    </AuthCard>
  );
}
