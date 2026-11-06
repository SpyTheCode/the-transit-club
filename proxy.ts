import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

export async function proxy(request: NextRequest) {
  const config = getSupabaseConfig();

  if (!config) {
    return NextResponse.redirect(
      new URL("/auth/sign-in?error=config", request.url),
    );
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }

        response = NextResponse.next({ request });

        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error("Supabase could not verify a protected request:", error.message);
    return new NextResponse(
      "We could not verify your sign-in. Please try again shortly.",
      { status: 503 },
    );
  }

  if (!data.user) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/staff/:path*",
    "/dashboard/:path*",
    "/auth/update-password",
  ],
};
