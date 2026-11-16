import { connection } from "next/server";
import { AdminNavigation } from "@/app/(protected)/admin/admin-navigation";
import { ArchiveManager } from "@/components/admin/archive-manager";
import { getArchiveItems } from "@/lib/archive";
import { requireRole } from "@/lib/supabase/server";

export const instant = false;

export default async function AdminArchivePage() {
  await connection();
  await requireRole(["admin"]);
  const result = await getArchiveItems({ admin: true });

  return (
    <>
      <AdminNavigation />
      <section className="admin-products-page">
        <p className="portal-eyebrow">THE TRANSIT CLUB / ADMINISTRATION</p>
        <h1>Archive control.</h1>
        <p className="admin-products-intro">
          Create, edit, publish, reorder, and remove collected stories.
        </p>
        {result.error ? (
          <div className="admin-shop-error" role="alert">
            <h2>Archive data is not available.</h2>
            <p>
              Run <code>supabase/schema-archive.sql</code> in the Supabase SQL
              Editor, then reload this page.
            </p>
          </div>
        ) : (
          <ArchiveManager items={result.items} />
        )}
      </section>
    </>
  );
}
