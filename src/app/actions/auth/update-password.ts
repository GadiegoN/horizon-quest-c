"use server";

import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const Schema = z.object({
  password: z.string().min(6, "Mínimo de 6 caracteres"),
});

export type UpdatePasswordState = {
  ok: boolean;
  fieldErrors?: Record<string, string>;
  formError?: string;
  message?: string;
};

export async function updatePasswordAction(
  _: UpdatePasswordState,
  formData: FormData,
): Promise<UpdatePasswordState> {
  const raw = { password: String(formData.get("password") ?? "") };
  const parsed = Schema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: { password: parsed.error.issues[0]?.message ?? "Inválido" },
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { ok: false, formError: "Não autenticado." };

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return { ok: false, formError: error.message };

  return { ok: true, message: "Senha alterada com sucesso." };
}
