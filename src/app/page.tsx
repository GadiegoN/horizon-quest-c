import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabasePublicKey } from "@/lib/supabase/keys";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    redirect("/login");
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(supabaseUrl, getSupabasePublicKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });

  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  redirect("/hub");
}
