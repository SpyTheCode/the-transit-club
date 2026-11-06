import Link from "next/link";
import { connection } from "next/server";
import { requireRole } from "@/lib/supabase/server";

export const instant = false;

export default async function DashboardPage() {
  await connection();
  await requireRole(["member"]);

  return (
    <section className="dashboard-panel">
      <p className="eyebrow">The Transit Club / Member dashboard</p>
      <h1>Your next journey starts here.</h1>
      <p>
        You are signed in. Your event bookings and tickets will appear here as
        soon as the booking experience is connected.
      </p>
      <Link className="button button-secondary" href="/#events">
        Explore upcoming events
      </Link>
    </section>
  );
}
