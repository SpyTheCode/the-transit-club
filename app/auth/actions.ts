"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import {
  createSupabaseServerClient,
  getProfileRole,
  roleHome,
} from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

export type AuthFormState = {
  error?: string;
  success?: string;
};

const emailSchema = z.email("Enter a valid email address.").trim().toLowerCase();
const passwordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters.")
  .max(128, "Password must be 128 characters or fewer.");

const signUpSchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name.").max(80),
  lastName: z.string().trim().min(1, "Enter your last name.").max(80),
  email: emailSchema,
  password: passwordSchema,
});

const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});

const emailFormSchema = z.object({ email: emailSchema });

const updatePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

function firstIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Check your details and try again.";
}

function isSupabaseConfigured() {
  return getSupabaseConfig() !== null;
}

function getSiteUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_SITE_URL;

  if (!url) return null;

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return null;
    }
    return parsedUrl.origin;
  } catch {
    return null;
  }
}

export async function signUpAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) {
    return {
      error: "Set SUPABASE_URL and SUPABASE_ANON_KEY before creating an account.",
    };
  }

  const redirectBase = getSiteUrl();
  if (!redirectBase) {
    return {
      error:
        "Set NEXT_PUBLIC_SITE_URL to your site's http:// or https:// address before signing up.",
    };
  }

  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const supabase = await createSupabaseServerClient({ writable: true });
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
      },
      emailRedirectTo: `${redirectBase}/auth/callback`,
    },
  });

  if (error) return { error: error.message };

  if (data.session && data.user) {
    const role = await getProfileRole(supabase, data.user.id);
    if (!role) {
      return {
        error:
          "Your account was created, but its profile is not ready yet. Please try signing in again.",
      };
    }
    redirect(roleHome(role));
  }

  return {
    success:
      "Account created. Check your email and follow the verification link before signing in.",
  };
}

export async function signInAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) {
    return {
      error: "Set SUPABASE_URL and SUPABASE_ANON_KEY before signing in.",
    };
  }

  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const supabase = await createSupabaseServerClient({ writable: true });
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) return { error: error.message };

  const role = await getProfileRole(supabase, data.user.id);
  if (!role) {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      return { error: `Profile missing; sign-out failed: ${signOutError.message}` };
    }
    return {
      error:
        "Your account profile could not be found. Contact the site administrator.",
    };
  }

  redirect(roleHome(role));
}

export async function requestPasswordResetAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) {
    return {
      error: "Set SUPABASE_URL and SUPABASE_ANON_KEY before requesting a reset.",
    };
  }

  const redirectBase = getSiteUrl();
  if (!redirectBase) {
    return {
      error:
        "Set NEXT_PUBLIC_SITE_URL to your site's http:// or https:// address before requesting a reset.",
    };
  }

  const parsed = emailFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const supabase = await createSupabaseServerClient({ writable: true });
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${redirectBase}/auth/callback?next=/auth/update-password`,
  });

  if (error) return { error: error.message };

  return {
    success:
      "If an account exists for that email, a password reset link is on its way.",
  };
}

export async function updatePasswordAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) {
    return {
      error: "Set SUPABASE_URL and SUPABASE_ANON_KEY before updating your password.",
    };
  }

  const parsed = updatePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const supabase = await createSupabaseServerClient({ writable: true });
  const { data, error: userError } = await supabase.auth.getUser();

  if (userError) return { error: userError.message };
  if (!data.user) {
    return {
      error: "This password reset link is invalid or expired. Request a new one.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) return { error: error.message };

  const { error: signOutError } = await supabase.auth.signOut();
  if (signOutError) {
    return {
      error: `Your password was changed, but we could not end the recovery session: ${signOutError.message}`,
    };
  }

  redirect("/auth/sign-in?password=updated");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient({ writable: true });
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(`Unable to sign out: ${error.message}`);
  }

  redirect("/");
}
