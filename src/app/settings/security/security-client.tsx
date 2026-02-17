/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

type TotpFactor = {
  id: string;
  status?: string;
  friendly_name?: string | null;
  created_at?: string;
};

function svgToDataUrl(svg: string) {
  const encoded = encodeURIComponent(svg);
  return `data:image/svg+xml;utf8,${encoded}`;
}

export function SecurityClient() {
  const { toast } = useToast();

  const [loading, setLoading] = React.useState(true);
  const [aal, setAal] = React.useState<{
    currentLevel: string;
    nextLevel: string;
  } | null>(null);

  const [totpFactors, setTotpFactors] = React.useState<TotpFactor[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  // Enrollment state
  const [enrolling, setEnrolling] = React.useState(false);
  const [factorId, setFactorId] = React.useState<string | null>(null);
  const [qrSvg, setQrSvg] = React.useState<string | null>(null);
  const [secret, setSecret] = React.useState<string | null>(null);
  const [verifyCode, setVerifyCode] = React.useState("");

  const supabase = React.useMemo(() => createBrowserSupabaseClient(), []);

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      const a = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (a.error) throw a.error;

      setAal({
        currentLevel: String(a.data.currentLevel),
        nextLevel: String(a.data.nextLevel),
      });

      const factors = await supabase.auth.mfa.listFactors();
      if (factors.error) throw factors.error;

      setTotpFactors((factors.data.totp ?? []) as any);
    } catch (e: any) {
      setError(e?.message ?? "Falha ao carregar status de segurança.");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startEnroll() {
    setError(null);
    setEnrolling(true);
    setFactorId(null);
    setQrSvg(null);
    setSecret(null);
    setVerifyCode("");

    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Authenticator",
      });
      if (error) throw error;

      setFactorId(data.id);
      setQrSvg(data.totp.qr_code);
      setSecret(data.totp.secret);

      toast({
        title: "Quase lá",
        message: "Escaneie o QR no autenticador e confirme com o código.",
        tone: "warning",
      });
    } catch (e: any) {
      setError(e?.message ?? "Falha ao iniciar o enrolment.");
      setEnrolling(false);
    }
  }

  async function confirmEnroll() {
    if (!factorId) return;

    setError(null);
    setLoading(true);

    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: verifyCode.trim(),
      });
      if (verify.error) throw verify.error;

      toast({
        title: "Ativado",
        message: "2FA (TOTP) foi habilitado.",
        tone: "success",
      });

      setEnrolling(false);
      setFactorId(null);
      setQrSvg(null);
      setSecret(null);
      setVerifyCode("");

      await refresh();
    } catch (e: any) {
      setError(e?.message ?? "Código inválido.");
    } finally {
      setLoading(false);
    }
  }

  async function cancelEnroll() {
    setError(null);
    try {
      // Se criou factor unverified, remove para não acumular
      if (factorId) {
        await supabase.auth.mfa.unenroll({ factorId });
      }
    } catch {
      // ignore
    } finally {
      setEnrolling(false);
      setFactorId(null);
      setQrSvg(null);
      setSecret(null);
      setVerifyCode("");
      await refresh();
    }
  }

  async function disableFactor(id: string) {
    setError(null);
    setLoading(true);
    try {
      const res = await supabase.auth.mfa.unenroll({ factorId: id });
      if ((res as any).error) throw (res as any).error;

      toast({ title: "Desativado", message: "2FA removido.", tone: "success" });
      await refresh();
    } catch (e: any) {
      setError(
        e?.message ?? "Falha ao desativar 2FA. Verifique se você está em AAL2.",
      );
    } finally {
      setLoading(false);
    }
  }

  const needsChallenge =
    aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2";

  return (
    <main className="mx-auto w-full max-w-md space-y-3 p-4">
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
          <CardTitle>Segurança</CardTitle>
          <CardDescription>
            Gerencie a verificação em duas etapas (TOTP).
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {error ? <Badge tone="danger">{error}</Badge> : null}

          {loading ? (
            <Badge tone="warning">Carregando…</Badge>
          ) : (
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-semibold">AAL atual:</span>{" "}
                {aal?.currentLevel ?? "—"}{" "}
                <span className="font-semibold">Próximo:</span>{" "}
                {aal?.nextLevel ?? "—"}
              </div>

              {needsChallenge ? (
                <Badge tone="warning">
                  Sua sessão precisa ser elevada para AAL2. Vá em{" "}
                  <Link className="underline" href="/mfa">
                    /mfa
                  </Link>
                  .
                </Badge>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2FA (TOTP)</CardTitle>
          <CardDescription>
            Ative usando um app autenticador (Google Authenticator, Authy, etc).
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {totpFactors.length > 0 ? (
            <div className="space-y-2">
              <div className="text-sm font-semibold">Fatores cadastrados</div>

              <div className="space-y-2">
                {totpFactors.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between rounded-xl border border-border p-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">
                        {f.friendly_name ?? "TOTP"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ID: {f.id}
                      </div>
                      {f.status ? (
                        <div className="text-xs text-muted-foreground">
                          Status: {f.status}
                        </div>
                      ) : null}
                    </div>

                    <Button
                      variant="danger"
                      onClick={() => disableFactor(f.id)}
                      disabled={loading}
                      title="Para remover um fator verificado, sua sessão precisa estar em AAL2."
                    >
                      Desativar
                    </Button>
                  </div>
                ))}
              </div>

              <div className="text-xs text-muted-foreground">
                Para desativar, você precisa estar com sessão em <b>AAL2</b>{" "}
                (verificado).
              </div>
            </div>
          ) : (
            <Badge tone="warning">Nenhum 2FA ativo ainda.</Badge>
          )}

          {!enrolling ? (
            <Button onClick={startEnroll} disabled={loading} className="w-full">
              Ativar 2FA (TOTP)
            </Button>
          ) : (
            <div className="space-y-3 rounded-2xl border border-border p-3">
              <div className="text-sm font-semibold">Ativação</div>

              {qrSvg ? (
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={svgToDataUrl(qrSvg)}
                    alt="QR Code TOTP"
                    className="h-48 w-48 rounded-xl border border-border bg-white p-2"
                  />
                  {secret ? (
                    <div className="w-full rounded-xl border border-border p-2">
                      <div className="text-xs font-semibold text-muted-foreground">
                        Secret (manual)
                      </div>
                      <div className="break-all font-mono text-sm">
                        {secret}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <Badge tone="warning">Gerando QR…</Badge>
              )}

              <Input
                label="Código (6 dígitos)"
                inputMode="numeric"
                placeholder="123456"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
              />

              <div className="flex gap-2">
                <Button
                  onClick={confirmEnroll}
                  loading={loading}
                  className="flex-1"
                >
                  Confirmar
                </Button>
                <Button
                  variant="ghost"
                  onClick={cancelEnroll}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
