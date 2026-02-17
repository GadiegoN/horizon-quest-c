import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SecurityClient } from "./security-client";

export default async function SecurityPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return (
      <main className="mx-auto max-w-md p-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          Você precisa estar logado.
        </div>
      </main>
    );
  }

  return <SecurityClient />;
}
