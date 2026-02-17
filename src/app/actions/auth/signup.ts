"use server";

import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const Schema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
});

export type SignupState = {
  ok: boolean;
  fieldErrors?: Record<string, string>;
  formError?: string;
  message?: string;
};

export async function signupAction(
  _: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const raw = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { email, password } = parsed.data;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?next=/wallet`,
    },
  });

  if (error) return { ok: false, formError: error.message };

  return {
    ok: true,
    message: "Conta criada. Verifique seu email para confirmar o cadastro.",
  };
}
