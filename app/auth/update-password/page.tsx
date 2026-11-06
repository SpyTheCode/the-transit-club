import { AuthForm } from "@/components/auth-form";
import { requireProfile } from "@/lib/supabase/server";
import { connection } from "next/server";

export const instant = false;

export default async function UpdatePasswordPage() {
  await connection();
  await requireProfile();

  return (
    <main className="auth-page">
      <AuthForm mode="update-password" />
    </main>
  );
}
