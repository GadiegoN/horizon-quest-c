import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicKey } from "./keys";

export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url)
    throw new Error("Missing Supabase URL. Set NEXT_PUBLIC_SUPABASE_URL.");

  return createBrowserClient(url, getSupabasePublicKey());
}
