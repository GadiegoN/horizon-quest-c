"use client";

import * as React from "react";
import Link from "next/link";
import { AuthCard } from "@/app/(auth)/_components/auth-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  forgotPasswordAction,
  type ForgotState,
} from "@/app/actions/auth/forgot-password";

const initialState: ForgotState = { ok: false };

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = React.useActionState(
    forgotPasswordAction,
    initialState,
  );

  return (
    <AuthCard
      title="Recuperar senha"
      description="Enviaremos um link para redefinir sua senha."
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

        <Button type="submit" loading={pending} className="w-full">
          Enviar link
        </Button>
      </form>
    </AuthCard>
  );
}
