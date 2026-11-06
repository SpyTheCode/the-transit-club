import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

type SignInPageProps = {
  searchParams: Promise<{ error?: string; password?: string }>;
};

export default async function SignInPage({
  searchParams,
}: SignInPageProps) {
  return (
    <main className="auth-page">
      <Suspense fallback={<AuthForm mode="sign-in" />}>
        <SignInContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function SignInContent({
  searchParams,
}: {
  searchParams: SignInPageProps["searchParams"];
}) {
  const params = await searchParams;
  const notice =
    params.password === "updated"
      ? "Your password has been updated. Sign in with the new one."
      : params.error === "config"
        ? "Supabase is not configured yet. Add your project URL and anon key to .env.local."
        : params.error === "verification"
          ? "That verification link is invalid or expired. Sign in or request another email."
          : params.error === "profile"
            ? "Your account profile could not be found. Contact the site administrator."
            : undefined;

  return <AuthForm mode="sign-in" notice={notice} />;
}
