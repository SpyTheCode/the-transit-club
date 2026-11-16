import Link from "next/link";
import { connection } from "next/server";
import { AdminNavigation } from "@/app/(protected)/admin/admin-navigation";
import { getAdminWaitlist } from "@/lib/archive";
import { requireRole } from "@/lib/supabase/server";

export const instant = false;

export default async function AdminWaitlistPage() {
  await connection();
  await requireRole(["admin"]);
  const result = await getAdminWaitlist();

  return (
    <>
      <AdminNavigation />
      <section className="admin-products-page">
        <p className="portal-eyebrow">THE TRANSIT CLUB / ADMINISTRATION</p>
        <h1>Waitlist.</h1>
        <div className="admin-waitlist-heading">
          <p className="admin-products-intro">
            {result.count} {result.count === 1 ? "entry" : "entries"}.
          </p>
          <Link className="button button-primary" href="/admin/waitlist/export">
            EXPORT CSV
          </Link>
        </div>
        {result.error ? (
          <div className="admin-shop-error" role="alert">
            <h2>Waitlist data is not available.</h2>
            <p>
              Run <code>supabase/schema-archive.sql</code> in the Supabase SQL
              Editor, then reload this page.
            </p>
          </div>
        ) : result.entries.length ? (
          <div className="admin-waitlist-table-wrap">
            <table className="admin-waitlist-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Event ID</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {result.entries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.first_name} {entry.last_name}</td>
                    <td>{entry.email}</td>
                    <td>{entry.event_id ?? "Any event"}</td>
                    <td>{new Date(entry.created_at).toLocaleString("en-NG")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="club-state">
            <h2>No waitlist entries yet.</h2>
            <p>New sign-ups will appear here.</p>
          </div>
        )}
      </section>
    </>
  );
}
