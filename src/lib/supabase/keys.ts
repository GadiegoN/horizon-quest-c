export function getSupabasePublicKey() {
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  const legacyAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const key = publishable || legacyAnon;

  if (!key) {
    throw new Error(
      "Missing Supabase public key. Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY (preferred) or NEXT_PUBLIC_SUPABASE_ANON_KEY (legacy).",
    );
  }

  return key;
}
