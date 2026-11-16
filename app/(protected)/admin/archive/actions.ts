"use server";

import { z } from "zod";
import {
  hasAffectedRows,
  refreshArchivePages,
} from "@/lib/admin/mutations";
import {
  getAdminImageExtension,
  isValidAdminImage,
  MAX_ADMIN_IMAGE_BYTES,
} from "@/lib/admin/image-validation";
import { requireRole, createSupabaseServerClient } from "@/lib/supabase/server";

export type ArchiveActionState = {
  success?: string;
  error?: string;
};

const archiveSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(160),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  kind: z.enum(["lookbook", "zine", "moodboard", "retreat"]),
  caption: z.string().trim().max(4000),
  altText: z.string().trim().max(250),
  year: z.number().int().min(1000).max(3000).nullable(),
  sortOrder: z.number().int().min(0).max(100000),
  published: z.boolean(),
});

const idSchema = z.string().uuid();
const bucket = "archive-images";

async function getAdminClient() {
  await requireRole(["admin"]);
  return createSupabaseServerClient({ writable: true });
}

function getArchiveFields(formData: FormData) {
  const rawId = String(formData.get("id") ?? "").trim();
  const rawYear = String(formData.get("year") ?? "").trim();
  return archiveSchema.safeParse({
    id: rawId || undefined,
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    kind: String(formData.get("kind") ?? ""),
    caption: String(formData.get("caption") ?? ""),
    altText: String(formData.get("altText") ?? ""),
    year: rawYear ? Number(rawYear) : null,
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    published: formData.get("published") === "on",
  });
}

async function validateImage(file: File | null) {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_ADMIN_IMAGE_BYTES) {
    return "Each image must be 5 MB or smaller.";
  }
  if (!getAdminImageExtension(file.type)) {
    return "Use JPG, PNG, or WebP images only.";
  }
  if (!(await isValidAdminImage(file))) {
    return "The selected file is not a valid JPG, PNG, or WebP image.";
  }
  return null;
}

async function removeNewUpload(supabase: Awaited<ReturnType<typeof getAdminClient>>, path: string) {
  const result = await supabase.storage.from(bucket).remove([path]);
  if (!hasAffectedRows(result)) {
    console.error("Archive upload cleanup was incomplete.");
  }
}

export async function saveArchiveItemAction(
  _previousState: ArchiveActionState,
  formData: FormData,
): Promise<ArchiveActionState> {
  const supabase = await getAdminClient();
  const parsed = getArchiveFields(formData);
  if (!parsed.success) {
    return {
      error: "Check the title, slug, kind, year, and sort order, then try again.",
    };
  }
  const fields = parsed.data;
  const entry = formData.get("image");
  const file = entry instanceof File && entry.size > 0 ? entry : null;
  const imageError = await validateImage(file);
  if (imageError) return { error: imageError };

  let existingImage: { image_kind: "storage" | "static" | null; image_path: string | null } | null = null;
  if (fields.id) {
    const { data, error } = await supabase
      .from("archive_items")
      .select("image_kind,image_path")
      .eq("id", fields.id)
      .maybeSingle();
    if (error || !data) {
      console.error("Archive save failed: the existing item could not be loaded.");
      return { error: "This archive item could not be found. Nothing was changed." };
    }
    existingImage = data;
  }

  let uploadedPath: string | null = null;
  if (file) {
    const extension = getAdminImageExtension(file.type);
    if (!extension) return { error: "Use JPG, PNG, or WebP images only." };
    uploadedPath = `${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage
      .from(bucket)
      .upload(uploadedPath, file, { contentType: file.type, upsert: false });
    if (error) {
      console.error("Archive upload failed: storage rejected the file.");
      return { error: "The image could not be uploaded. Check the archive bucket setup." };
    }
  }

  const values = {
    title: fields.title,
    slug: fields.slug,
    kind: fields.kind,
    caption: fields.caption,
    image_path: uploadedPath ?? existingImage?.image_path ?? null,
    image_kind: uploadedPath
      ? ("storage" as const)
      : (existingImage?.image_kind ?? null),
    alt_text: fields.altText,
    year: fields.year,
    sort_order: fields.sortOrder,
    published: fields.published,
  };
  const result = fields.id
    ? await supabase
        .from("archive_items")
        .update(values)
        .eq("id", fields.id)
        .select("id")
        .maybeSingle()
    : await supabase
        .from("archive_items")
        .insert(values)
        .select("id")
        .maybeSingle();

  if (!hasAffectedRows(result)) {
    if (uploadedPath) await removeNewUpload(supabase, uploadedPath);
    console.error("Archive save failed: database write affected no row or was rejected.");
    return {
      error:
        "The archive item was not saved. Check access and confirm the slug is unique.",
    };
  }

  if (
    uploadedPath &&
    existingImage?.image_kind === "storage" &&
    existingImage.image_path
  ) {
    const cleanup = await supabase.storage
      .from(bucket)
      .remove([existingImage.image_path]);
    if (!hasAffectedRows(cleanup)) {
      console.error("Archive item was saved, but its previous image cleanup failed.");
      refreshArchivePages();
      return {
        error:
          "The archive item was saved, but its previous uploaded image could not be removed.",
      };
    }
  }

  refreshArchivePages();
  return { success: "Archive item saved." };
}

export async function deleteArchiveItemAction(
  _previousState: ArchiveActionState,
  formData: FormData,
): Promise<ArchiveActionState> {
  const supabase = await getAdminClient();
  const id = idSchema.safeParse(String(formData.get("itemId") ?? ""));
  if (!id.success) return { error: "This archive item could not be identified." };

  const { data: item, error: readError } = await supabase
    .from("archive_items")
    .select("image_kind,image_path")
    .eq("id", id.data)
    .maybeSingle();
  if (readError || !item) {
    return { error: "This archive item could not be found. Nothing was changed." };
  }

  const deleteResult = await supabase
    .from("archive_items")
    .delete()
    .eq("id", id.data)
    .select("id")
    .maybeSingle();
  if (!hasAffectedRows(deleteResult)) {
    console.error("Archive delete failed: database deletion affected no row or was rejected.");
    return { error: "The archive item was not deleted. Its image was left untouched." };
  }

  if (item.image_kind === "storage" && item.image_path) {
    const storageResult = await supabase.storage
      .from(bucket)
      .remove([item.image_path]);
    if (!hasAffectedRows(storageResult)) {
      console.error("Archive record was deleted, but its storage file cleanup failed.");
      refreshArchivePages();
      return {
        error:
          "The archive item was deleted, but its uploaded image could not be removed.",
      };
    }
  }

  refreshArchivePages();
  return {
    success:
      item.image_kind === "static"
        ? "Archive item deleted. Its original static image file was not removed."
        : "Archive item and uploaded image deleted.",
  };
}
