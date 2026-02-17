import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabasePublicKey } from "./lib/supabase/keys";

export default async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, getSupabasePublicKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        response = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp)$).*)",
  ],
};
