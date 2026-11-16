import Link from "next/link";
import { connection } from "next/server";
import { requireRole } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/site-config";
import { AdminNavigation } from "@/app/(protected)/admin/admin-navigation";

export const instant = false;

export default async function AdminPage() {
  await connection();
  await requireRole(["admin"]);

  return (
    <>
      <AdminNavigation />
      <section className="dashboard-panel">
        <p className="eyebrow">{siteConfig.brands.malak} / Administration</p>
        <h1>Welcome to your control room.</h1>
        <p>
          Manage the product catalog here. Other administration sections will be
          added in later phases.
        </p>
        <div className="admin-overview-actions">
          <Link className="button button-primary" href="/admin/products">
            Manage products
          </Link>
          <Link className="button button-outline" href="/">
            View the public site
          </Link>
        </div>
      </section>
    </>
  );
}
