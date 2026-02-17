"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard } from "../_components/auth-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  resetPasswordAction,
  type ResetState,
} from "@/app/actions/auth/reset-password";
import { useToast } from "@/components/ui/toast";

const initialState: ResetState = { ok: false };

export default function ResetPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [state, formAction, pending] = React.useActionState(
    resetPasswordAction,
    initialState,
  );

  React.useEffect(() => {
    if (state?.ok) {
      toast({
        title: "Senha atualizada",
        message: "Sua senha foi redefinida.",
        tone: "success",
      });
      router.replace("/wallet");
    }
  }, [state, router, toast]);

  return (
    <AuthCard
      title="Redefinir senha"
      description="Defina uma nova senha para sua conta."
      footer={
        <Link
          href="/login"
          className="text-sm font-semibold text-primary hover:underline"
        >
          Voltar para login
        </Link>
      }
    >
      <form action={formAction} className="space-y-3">
        {state?.formError ? (
          <Badge tone="danger">{state.formError}</Badge>
        ) : null}

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
          Salvar nova senha
        </Button>
      </form>
    </AuthCard>
  );
}
