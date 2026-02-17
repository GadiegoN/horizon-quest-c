"use client";

import * as React from "react";
import Link from "next/link";
import { AuthCard } from "../_components/auth-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { signupAction, type SignupState } from "@/app/actions/auth/signup";
import { useToast } from "@/components/ui/toast";

const initialState: SignupState = { ok: false };

export default function SignupPage() {
  const { toast } = useToast();
  const [state, formAction, pending] = React.useActionState(
    signupAction,
    initialState,
  );

  React.useEffect(() => {
    if (state?.ok && state.message) {
      toast({
        title: "Cadastro",
        message: state.message,
        tone: "success",
        durationMs: 5000,
      });
    }
  }, [state, toast]);

  return (
    <AuthCard
      title="Criar conta"
      description="Você receberá um email para confirmar o cadastro."
      footer={
        <Link
          href="/login"
          className="text-sm font-semibold text-primary hover:underline"
        >
          Já tenho conta
        </Link>
      }
    >
      <form action={formAction} className="space-y-3">
        {state?.formError ? (
          <Badge tone="danger">{state.formError}</Badge>
        ) : null}
        {state?.ok && state?.message ? (
          <Badge tone="success">{state.message}</Badge>
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
          placeholder="Mínimo 6 caracteres"
          autoComplete="new-password"
          error={state?.fieldErrors?.password}
          required
        />

        <Button type="submit" loading={pending} className="w-full">
          Criar conta
        </Button>
      </form>
    </AuthCard>
  );
}
