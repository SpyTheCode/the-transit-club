import { createClient } from "@supabase/supabase-js";
import { connection } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

export type UpcomingEvent = {
  id: string;
  title: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  destination: string;
  status: "upcoming_view_only" | "open_for_payment";
};

export const upcomingEventsPlaceholder: UpcomingEvent = {
  id: "upcoming-events-placeholder",
  title: "Event details unavailable",
  description: "Upcoming event details will be shared here when available.",
  start_date: null,
  end_date: null,
  destination: "",
  status: "upcoming_view_only",
};

export async function getUpcomingEvents(): Promise<UpcomingEvent[]> {
  await connection();

  try {
    const config = getSupabaseConfig();
    if (!config) {
      console.error(
        "Upcoming events unavailable: Supabase configuration is missing.",
      );
      return [upcomingEventsPlaceholder];
    }

    const supabase = createClient(config.url, config.anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    const { data, error } = await supabase
      .from("events")
      .select(
        "id, title, description, start_date, end_date, destination, status",
      )
      .in("status", ["upcoming_view_only", "open_for_payment"])
      .order("start_date", { ascending: true });

    if (error) {
      console.error(
        "Upcoming events unavailable: the Supabase request failed.",
      );
      return [upcomingEventsPlaceholder];
    }

    if (!data?.length) return [upcomingEventsPlaceholder];

    return data.map((event) => ({
      ...event,
      description: event.description ?? "",
      status: event.status as UpcomingEvent["status"],
    }));
  } catch {
    console.error("Upcoming events unavailable: the Supabase request failed.");
    return [upcomingEventsPlaceholder];
  }
}
