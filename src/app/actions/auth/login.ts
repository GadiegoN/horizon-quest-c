"use server";

import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth/paths";
import { ensureWalletForUser } from "@/lib/bank/ensure-wallet";

const Schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
  next: z.string().optional(),
});

export type LoginState = {
  ok: boolean;
  fieldErrors?: Record<string, string>;
  formError?: string;
  next?: string;
  needsMfa?: boolean;
};

export async function loginAction(
  _: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const raw = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    next: String(formData.get("next") ?? ""),
  };

  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] = issue.message;
    }
    return { ok: false, fieldErrors };
  }

  const supabase = await createServerSupabaseClient();
  const { email, password, next } = parsed.data;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, formError: error.message };

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (user?.id) {
    await ensureWalletForUser(user.id);
  }

  const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal.error) {
    return { ok: true, next: safeNextPath(next), needsMfa: false };
  }

  const needsMfa =
    aal.data.nextLevel === "aal2" && aal.data.currentLevel !== "aal2";

  return {
    ok: true,
    next: safeNextPath(next),
    needsMfa,
  };
}
