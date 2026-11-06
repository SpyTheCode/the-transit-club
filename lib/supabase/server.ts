import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@/lib/user-role";
import { getSupabaseConfig } from "@/lib/supabase/config";

type ServerClientOptions = {
  writable?: boolean;
};

export async function createSupabaseServerClient(
  { writable = false }: ServerClientOptions = {},
) {
  const config = getSupabaseConfig();

  if (!config) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env.local.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        if (!writable) return;

        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options);
        }
      },
    },
  });
}

export async function getProfileRole(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
): Promise<Role | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load your profile: ${error.message}`);
  }

  if (!data) return null;

  if (
    data.role !== "admin" &&
    data.role !== "sub_admin" &&
    data.role !== "member"
  ) {
    throw new Error("Your account has an unsupported role.");
  }

  return data.role;
}

export async function requireProfile() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(`Unable to verify your sign-in: ${error.message}`);
  }

  if (!data.user) {
    redirect("/auth/sign-in");
  }

  const role = await getProfileRole(supabase, data.user.id);

  if (!role) {
    throw new Error(
      "Your profile is missing. Contact the site administrator for help.",
    );
  }

  return { supabase, user: data.user, role };
}

export function roleHome(role: Role) {
  switch (role) {
    case "admin":
      return "/admin";
    case "sub_admin":
      return "/staff";
    case "member":
      return "/dashboard";
  }
}

export async function requireRole(allowedRoles: Role[]) {
  const profile = await requireProfile();

  if (!allowedRoles.includes(profile.role)) {
    redirect(roleHome(profile.role));
  }

  return profile;
}
