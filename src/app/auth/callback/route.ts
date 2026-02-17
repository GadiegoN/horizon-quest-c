export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth/paths";
import { ensureWalletForUser } from "@/lib/bank/ensure-wallet";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"));

  if (!code) {
    const redirect = new URL("/login", url.origin);
    redirect.searchParams.set("error", "missing_code");
    return NextResponse.redirect(redirect);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const redirect = new URL("/login", url.origin);
    redirect.searchParams.set("error", "callback_failed");
    return NextResponse.redirect(redirect);
  }

  const { data } = await supabase.auth.getUser();
  if (data.user?.id) {
    await ensureWalletForUser(data.user.id);
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
