"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { refreshWaitlistPages } from "@/lib/admin/mutations";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type WaitlistActionState = {
  success?: string;
  error?: string;
};

const waitlistSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(254),
  eventId: z.string().uuid().optional().or(z.literal("")),
  honeypot: z.string().max(200),
});

const windowMs = 15 * 60 * 1000;
const maxAttempts = 5;
const attemptsByAddress = new Map<string, { startedAt: number; count: number }>();

function isRateLimited(address: string, now: number) {
  const current = attemptsByAddress.get(address);
  if (!current || now - current.startedAt >= windowMs) {
    attemptsByAddress.set(address, { startedAt: now, count: 1 });
    if (attemptsByAddress.size > 2000) {
      for (const [key, value] of attemptsByAddress) {
        if (now - value.startedAt >= windowMs) attemptsByAddress.delete(key);
      }
      if (attemptsByAddress.size > 2000) {
        const oldestAddress = attemptsByAddress.keys().next().value;
        if (oldestAddress) attemptsByAddress.delete(oldestAddress);
      }
    }
    return false;
  }
  if (current.count >= maxAttempts) return true;
  current.count += 1;
  return false;
}

function successState(): WaitlistActionState {
  return { success: "You are on the list." };
}

export async function joinWaitlistAction(
  _previousState: WaitlistActionState,
  formData: FormData,
): Promise<WaitlistActionState> {
  const parsed = waitlistSchema.safeParse({
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    email: String(formData.get("email") ?? ""),
    eventId: String(formData.get("eventId") ?? ""),
    honeypot: String(formData.get("website") ?? ""),
  });
  if (!parsed.success) {
    return { error: "Check your name, email address, and event selection." };
  }
  if (parsed.data.honeypot) return successState();

  const requestHeaders = await headers();
  const address =
    requestHeaders.get("x-real-ip") ??
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  if (isRateLimited(address, Date.now())) {
    return { error: "Please wait a little while before trying again." };
  }

  try {
    const supabase = await createSupabaseServerClient({ writable: true });
    const eventId = parsed.data.eventId || null;

    if (eventId) {
      const { data: event, error: eventError } = await supabase
        .from("events")
        .select("id")
        .eq("id", eventId)
        .in("status", ["upcoming_view_only", "open_for_payment"])
        .gte("start_date", new Date().toISOString())
        .maybeSingle();
      if (eventError || !event) {
        return { error: "That event is no longer available. Please choose another." };
      }
    }

    const { error } = await supabase.from("waitlist_entries").insert({
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      email: parsed.data.email.toLowerCase(),
      event_id: eventId,
    });

    if (error?.code === "23505") return successState();
    if (error) {
      console.error("Waitlist submission failed: database insert was rejected.");
      return { error: "We could not add you just now. Please try again later." };
    }

    refreshWaitlistPages();
    return successState();
  } catch {
    console.error("Waitlist submission failed: Supabase could not be reached.");
    return { error: "We could not add you just now. Please try again later." };
  }
}
