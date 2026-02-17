/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { AuthCard } from "@/app/(auth)/_components/auth-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

function safeNext(next: string | null) {
  if (!next) return "/wallet";
  if (!next.startsWith("/")) return "/wallet";
  if (next.startsWith("//")) return "/wallet";
  return next;
}

export default function MFAPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const { toast } = useToast();

  const next = safeNext(sp.get("next"));

  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const supabase = createBrowserSupabaseClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) router.replace(`/login?next=${encodeURIComponent(next)}`);
    })();
  }, [router, next]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createBrowserSupabaseClient();

      const factors = await supabase.auth.mfa.listFactors();
      if (factors.error) throw factors.error;

      const totpFactor = factors.data.totp?.[0];
      if (!totpFactor)
        throw new Error("Nenhum fator TOTP encontrado para este usuário.");

      const factorId = totpFactor.id;

      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: code.trim(),
      });
      if (verify.error) throw verify.error;

      toast({
        title: "Verificado",
        message: "2FA confirmado com sucesso.",
        tone: "success",
      });
      router.replace(next);
    } catch (err: any) {
      setError(err?.message ?? "Falha ao verificar o código.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Verificação em duas etapas"
      description="Digite o código do seu app autenticador (TOTP)."
      footer={
        <div className="flex items-center justify-between">
          <Link
            href="/login"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Voltar
          </Link>
          <form action="/logout" method="post">
            <Button variant="ghost" type="submit">
              Sair
            </Button>
          </form>
        </div>
      }
    >
      <form onSubmit={onSubmit} className="space-y-3">
        {error ? <Badge tone="danger">{error}</Badge> : null}

        <Input
          name="code"
          inputMode="numeric"
          label="Código (6 dígitos)"
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={8}
          required
        />

        <Button type="submit" loading={loading} className="w-full">
          Confirmar
        </Button>

        <div className="text-xs text-muted-foreground">
          Dica: se estiver falhando, tente novamente com o próximo código do app
          (troca a cada ~30s).
        </div>
      </form>
    </AuthCard>
  );
}
