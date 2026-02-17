"use server";

import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const Schema = z.object({
  password: z.string().min(6, "Mínimo de 6 caracteres"),
});

export type ResetState = {
  ok: boolean;
  fieldErrors?: Record<string, string>;
  formError?: string;
  message?: string;
};

export async function resetPasswordAction(
  _: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const raw = { password: String(formData.get("password") ?? "") };
  const parsed = Schema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: { password: parsed.error.issues[0]?.message ?? "Inválido" },
    };
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return { ok: false, formError: error.message };

  return {
    ok: true,
    message: "Senha atualizada. Você já pode usar o app normalmente.",
  };
}
