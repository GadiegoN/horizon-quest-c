import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function requireUserId() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user?.id) {
    throw new Error("Not authenticated");
  }

  return user.id;
}
