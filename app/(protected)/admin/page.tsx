import Link from "next/link";
import { connection } from "next/server";
import { requireRole } from "@/lib/supabase/server";

export const instant = false;

export default async function AdminPage() {
  await connection();
  await requireRole(["admin"]);

  return (
    <section className="dashboard-panel">
      <p className="eyebrow">The Transit Club / Administration</p>
      <h1>Welcome to your control room.</h1>
      <p>
        Your admin account is ready. Event and fee management, member
        administration, and orders can be added here.
      </p>
      <Link className="button button-secondary" href="/">
        View the public site
      </Link>
    </section>
  );
}
