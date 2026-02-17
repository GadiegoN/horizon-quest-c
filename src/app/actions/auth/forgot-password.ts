"use server";

import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const Schema = z.object({
  email: z.string().email("Email inválido"),
});

export type ForgotState = {
  ok: boolean;
  fieldErrors?: Record<string, string>;
  formError?: string;
  message?: string;
};

export async function forgotPasswordAction(
  _: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  const raw = { email: String(formData.get("email") ?? "") };

  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: { email: parsed.error.issues[0]?.message ?? "Inválido" },
    };
  }

  const supabase = await createServerSupabaseClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
    },
  );

  if (error) return { ok: false, formError: error.message };

  return {
    ok: true,
    message: "Se esse email existir, enviaremos um link de recuperação.",
  };
}
