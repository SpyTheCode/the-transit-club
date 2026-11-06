import { createClient } from "@supabase/supabase-js";
import { connection } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

export type UpcomingEvent = {
  id: string;
  title: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  date_label?: string;
  destination: string;
  status: "upcoming_view_only" | "open_for_payment";
};

export const retreatPlaceholder: UpcomingEvent = {
  id: "the-retreat",
  title: "The Retreat",
  description:
    "A gathering for explorers and the in-between. Details will be shared when dates are confirmed.",
  start_date: null,
  end_date: null,
  date_label: "22ND - 23RD JAN, 0000",
  destination: "Epe, Lagos State",
  status: "upcoming_view_only",
};

export async function getUpcomingEvents(): Promise<UpcomingEvent[]> {
  await connection();

  const config = getSupabaseConfig();
  if (!config) return [retreatPlaceholder];

  const supabase = createClient(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  const { data, error } = await supabase
    .from("events")
    .select("id, title, description, start_date, end_date, destination, status")
    .in("status", ["upcoming_view_only", "open_for_payment"])
    .order("start_date", { ascending: true });

  if (error) {
    throw new Error(`Unable to load upcoming events: ${error.message}`);
  }

  if (!data.length) return [retreatPlaceholder];

  return data.map((event) => ({
    ...event,
    description: event.description ?? "",
    status: event.status as UpcomingEvent["status"],
  }));
}
