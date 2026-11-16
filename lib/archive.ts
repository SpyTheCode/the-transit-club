import "server-only";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const ARCHIVE_KINDS = [
  "lookbook",
  "zine",
  "moodboard",
  "retreat",
] as const;

export type ArchiveKind = (typeof ARCHIVE_KINDS)[number];

export type ArchiveItem = {
  id: string;
  title: string;
  slug: string;
  kind: ArchiveKind;
  caption: string;
  image_path: string | null;
  image_kind: "storage" | "static" | null;
  alt_text: string;
  year: number | null;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  image_src: string | null;
};

const archiveItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  kind: z.enum(ARCHIVE_KINDS),
  caption: z.string(),
  image_path: z.string().nullable(),
  image_kind: z.enum(["storage", "static"]).nullable(),
  alt_text: z.string(),
  year: z.number().int().nullable(),
  published: z.boolean(),
  sort_order: z.number().int(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ArchiveResult = {
  items: ArchiveItem[];
  error: boolean;
};

export async function getArchiveItems({
  admin = false,
  kind,
  limit,
  latest = false,
}: {
  admin?: boolean;
  kind?: ArchiveKind;
  limit?: number;
  latest?: boolean;
} = {}): Promise<ArchiveResult> {
  let supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  try {
    supabase = await createSupabaseServerClient();
  } catch {
    console.error("Archive unavailable: Supabase client could not be created.");
    return { items: [], error: true };
  }

  try {
    let query = supabase
      .from("archive_items")
      .select(
        "id,title,slug,kind,caption,image_path,image_kind,alt_text,year,published,sort_order,created_at,updated_at",
      );
    if (!admin) query = query.eq("published", true);
    if (kind) query = query.eq("kind", kind);
    query = latest
      ? query.order("created_at", { ascending: false })
      : query.order("sort_order").order("created_at", { ascending: false });
    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) {
      console.error("Archive unavailable: a database query failed.");
      return { items: [], error: true };
    }

    const parsed = z.array(archiveItemSchema).safeParse(data);
    if (!parsed.success) {
      console.error("Archive unavailable: database data was invalid.");
      return { items: [], error: true };
    }

    const items = parsed.data.map((item) => ({
      ...item,
      image_src:
        item.image_path && item.image_kind === "storage"
          ? supabase.storage
              .from("archive-images")
              .getPublicUrl(item.image_path).data.publicUrl
          : item.image_path,
    }));

    return { items, error: false };
  } catch {
    console.error("Archive unavailable: a database request failed.");
    return { items: [], error: true };
  }
}

export type WaitlistEntry = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  event_id: string | null;
  created_at: string;
};

const waitlistEntrySchema = z.object({
  id: z.string().uuid(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string(),
  event_id: z.string().uuid().nullable(),
  created_at: z.string(),
});

export async function getAdminWaitlist() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error, count } = await supabase
      .from("waitlist_entries")
      .select("id,first_name,last_name,email,event_id,created_at", {
        count: "exact",
      })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Waitlist unavailable: a database query failed.");
      return { entries: [] as WaitlistEntry[], count: 0, error: true };
    }
    const parsed = z.array(waitlistEntrySchema).safeParse(data);
    if (!parsed.success) {
      console.error("Waitlist unavailable: database data was invalid.");
      return { entries: [] as WaitlistEntry[], count: 0, error: true };
    }
    return {
      entries: parsed.data,
      count: count ?? parsed.data.length,
      error: false,
    };
  } catch {
    console.error("Waitlist unavailable: Supabase could not be reached.");
    return { entries: [] as WaitlistEntry[], count: 0, error: true };
  }
}
