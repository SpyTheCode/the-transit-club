import { NextRequest, NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  getProfileRole,
  roleHome,
} from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next");
  const redirectOrigin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ??
    request.nextUrl.origin;

  if (!code) {
    return NextResponse.redirect(
      new URL("/auth/sign-in?error=verification", redirectOrigin),
    );
  }

  const supabase = await createSupabaseServerClient({ writable: true });
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Supabase auth callback failed:", error.message);
    return NextResponse.redirect(
      new URL("/auth/sign-in?error=verification", redirectOrigin),
    );
  }

  if (!data.user) {
    return NextResponse.redirect(
      new URL("/auth/sign-in?error=verification", redirectOrigin),
    );
  }

  if (next === "/auth/update-password") {
    return NextResponse.redirect(
      new URL("/auth/update-password", redirectOrigin),
    );
  }

  const role = await getProfileRole(supabase, data.user.id);
  if (!role) {
    return NextResponse.redirect(
      new URL("/auth/sign-in?error=profile", redirectOrigin),
    );
  }

  return NextResponse.redirect(new URL(roleHome(role), redirectOrigin));
}
