import { requireRole, createSupabaseServerClient } from "@/lib/supabase/server";

function csvCell(value: string) {
  const safeValue = /^[\t\r\n ]*[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safeValue.replace(/"/g, '""')}"`;
}

export async function GET() {
  await requireRole(["admin"]);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("waitlist_entries")
    .select("first_name,last_name,email,event_id,created_at")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Waitlist CSV export failed: database query was rejected.");
    return new Response("Waitlist export is unavailable.", { status: 503 });
  }

  const rows = [
    ["First name", "Last name", "Email", "Event ID", "Joined at"],
    ...data.map((entry) => [
      entry.first_name,
      entry.last_name,
      entry.email,
      entry.event_id ?? "",
      entry.created_at,
    ]),
  ];
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");

  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="transit-club-waitlist.csv"',
      "Cache-Control": "no-store",
    },
  });
}
