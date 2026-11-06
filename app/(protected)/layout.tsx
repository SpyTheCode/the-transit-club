import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { signOutAction } from "@/app/auth/actions";
import { requireProfile } from "@/lib/supabase/server";

export default async function ProtectedLayout({
  children,
}: LayoutProps<"/">) {
  await connection();
  const { user, role } = await requireProfile();

  return (
    <div className="private-shell">
      <header className="private-header">
        <Link aria-label="The Transit Club home" className="brand" href="/">
          <Image
            alt=""
            height={64}
            priority
            src="/logo/logo.png"
            width={100}
          />
          <span>THE TRANSIT CLUB</span>
        </Link>
        <div className="private-user">
          <span>{user.email}</span>
          <span className="role-pill">{role.replace("_", " ")}</span>
          <form action={signOutAction}>
            <button className="text-button">Sign out</button>
          </form>
        </div>
      </header>
      <main className="private-main">{children}</main>
      <footer className="private-footer">
        <Link href="/">← Back to The Transit Club</Link>
      </footer>
    </div>
  );
}
