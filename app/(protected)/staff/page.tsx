import Link from "next/link";
import { connection } from "next/server";
import { requireRole } from "@/lib/supabase/server";

export const instant = false;

export default async function StaffPage() {
  await connection();
  await requireRole(["sub_admin"]);

  return (
    <section className="dashboard-panel">
      <p className="eyebrow">The Transit Club / Staff</p>
      <h1>Your staff space.</h1>
      <p>
        You are signed in as a sub-admin. Staff tools can be added here when
        their permissions and workflows are defined.
      </p>
      <Link className="button button-secondary" href="/">
        View the public site
      </Link>
    </section>
  );
}
