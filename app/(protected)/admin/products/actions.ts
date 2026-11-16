"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole, createSupabaseServerClient } from "@/lib/supabase/server";

export type ShopActionState = {
  success?: string;
  error?: string;
};

const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(120),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(140)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  categoryId: z.string().uuid(),
  description: z.string().trim().max(5000),
  specs: z.array(z.string().trim().min(1).max(200)).max(40),
  priceNaira: z
    .string()
    .trim()
    .regex(/^\d+(?:\.\d{1,2})?$/)
    .optional()
    .or(z.literal("")),
  status: z.enum(["available", "sold_out", "coming_soon"]),
  featured: z.boolean(),
  published: z.boolean(),
  sortOrder: z.number().int().min(0).max(100000),
});

const productIdSchema = z.string().uuid();
const imageUpdateSchema = z.object({
  imageId: z.string().uuid(),
  altText: z.string().trim().max(250),
  sortOrder: z.number().int().min(0).max(100000),
});

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGES_PER_UPLOAD = 5;
const PRODUCT_IMAGE_BUCKET = "product-images";
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

async function getAdminClient() {
  await requireRole(["admin"]);
  return createSupabaseServerClient({ writable: true });
}

function refreshShopPages() {
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/malak");
  revalidatePath("/malak/products");
  revalidatePath("/malak/products/[slug]", "page");
  revalidatePath("/malak/category/[slug]", "page");
}

function getProductFields(formData: FormData) {
  const rawId = String(formData.get("id") ?? "").trim();
  const rawSpecs = String(formData.get("specs") ?? "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
  const rawPrice = String(formData.get("priceNaira") ?? "").trim();
  return productSchema.safeParse({
    id: rawId || undefined,
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    description: String(formData.get("description") ?? ""),
    specs: rawSpecs,
    priceNaira: rawPrice,
    status: String(formData.get("status") ?? ""),
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  });
}

export async function saveProductAction(
  _previousState: ShopActionState,
  formData: FormData,
): Promise<ShopActionState> {
  const supabase = await getAdminClient();
  const parsed = getProductFields(formData);
  if (!parsed.success) {
    return {
      error:
        "Check the product details. Use a lowercase hyphenated slug and a valid price in naira.",
    };
  }

  const fields = parsed.data;
  const priceKobo = fields.priceNaira
    ? Math.round(Number(fields.priceNaira) * 100)
    : null;
  if (priceKobo !== null && !Number.isSafeInteger(priceKobo)) {
    return { error: "The price is too large. Enter a smaller naira amount." };
  }

  const values = {
    name: fields.name,
    slug: fields.slug,
    category_id: fields.categoryId,
    description: fields.description,
    specs: fields.specs,
    price_kobo: priceKobo,
    status: fields.status,
    featured: fields.featured,
    published: fields.published,
    sort_order: fields.sortOrder,
  };

  const result = fields.id
    ? await supabase
        .from("products")
        .update(values)
        .eq("id", fields.id)
        .select("id")
        .maybeSingle()
    : await supabase.from("products").insert(values).select("id").maybeSingle();

  if (result.error || !result.data) {
    console.error("Shop product save failed: database write was rejected.");
    return {
      error:
        "The product could not be saved. Check that the shop database setup is complete and the slug is unique.",
    };
  }

  refreshShopPages();
  return { success: "Product saved." };
}

export async function deleteProductAction(
  _previousState: ShopActionState,
  formData: FormData,
): Promise<ShopActionState> {
  const supabase = await getAdminClient();
  const parsedId = productIdSchema.safeParse(
    String(formData.get("productId") ?? ""),
  );
  if (!parsedId.success) return { error: "This product could not be identified." };

  const { data: imageRows, error: imageReadError } = await supabase
    .from("product_images")
    .select("kind,path")
    .eq("product_id", parsedId.data);
  if (imageReadError || !imageRows) {
    console.error("Shop product delete failed: image records could not load.");
    return { error: "Product images could not be checked. Nothing was deleted." };
  }

  const storagePaths = imageRows
    .filter((image) => image.kind === "storage")
    .map((image) => image.path);
  if (storagePaths.length) {
    const { error: storageError } = await supabase.storage
      .from(PRODUCT_IMAGE_BUCKET)
      .remove(storagePaths);
    if (storageError) {
      console.error("Shop product delete failed: storage removal was rejected.");
      return {
        error: "Uploaded images could not be removed. The product was not deleted.",
      };
    }
  }

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", parsedId.data);
  if (error) {
    console.error("Shop product delete failed: database deletion was rejected.");
    return {
      error:
        storagePaths.length > 0
          ? "The product could not be deleted after its uploaded files were removed. Refresh and retry."
          : "The product could not be deleted. Please try again.",
    };
  }

  refreshShopPages();
  return {
    success:
      "Product and its database image records were deleted. Static files in /public were not removed.",
  };
}

function hasExpectedImageSignature(bytes: Uint8Array, mimeType: string) {
  if (mimeType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mimeType === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }
  return (
    mimeType === "image/webp" &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  );
}

export async function uploadProductImagesAction(
  _previousState: ShopActionState,
  formData: FormData,
): Promise<ShopActionState> {
  const supabase = await getAdminClient();
  const productId = productIdSchema.safeParse(
    String(formData.get("productId") ?? ""),
  );
  if (!productId.success) return { error: "Select a valid product first." };

  const files = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (!files.length) return { error: "Choose at least one image to upload." };
  if (files.length > MAX_IMAGES_PER_UPLOAD) {
    return { error: "Upload no more than five images at a time." };
  }
  if (files.some((file) => file.size > MAX_FILE_BYTES)) {
    return { error: "Each image must be 5 MB or smaller." };
  }
  if (files.some((file) => !allowedMimeTypes.has(file.type))) {
    return { error: "Use JPG, PNG, or WebP images only." };
  }

  const bytes = await Promise.all(files.map((file) => file.arrayBuffer()));
  if (
    files.some(
      (file, index) =>
        !hasExpectedImageSignature(new Uint8Array(bytes[index]), file.type),
    )
  ) {
    return { error: "One or more files are not valid JPG, PNG, or WebP images." };
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id,name")
    .eq("id", productId.data)
    .maybeSingle();
  if (productError || !product) {
    return { error: "The selected product could not be found." };
  }

  const { data: lastImage, error: sortError } = await supabase
    .from("product_images")
    .select("sort_order")
    .eq("product_id", product.id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (sortError) {
    console.error("Shop image upload failed: current image order could not load.");
    return { error: "Current product images could not be checked." };
  }

  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const uploadedPaths: string[] = [];
  const imageRecords = [];

  for (const [index, file] of files.entries()) {
    const path = `${product.id}/${crypto.randomUUID()}.${extensions[file.type]}`;
    const { error: uploadError } = await supabase.storage
      .from(PRODUCT_IMAGE_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) {
      if (uploadedPaths.length) {
        const { error: cleanupError } = await supabase.storage
          .from(PRODUCT_IMAGE_BUCKET)
          .remove(uploadedPaths);
        if (cleanupError) {
          console.error("Shop image upload cleanup was incomplete.");
        }
      }
      console.error("Shop image upload failed: storage rejected a file.");
      return { error: "An image could not be uploaded. Check the bucket setup and retry." };
    }
    uploadedPaths.push(path);
    imageRecords.push({
      product_id: product.id,
      kind: "storage",
      path,
      alt_text: `${product.name}, product image ${index + 1}`,
      sort_order: (lastImage?.sort_order ?? 0) + (index + 1) * 10,
    });
  }

  const { error: insertError } = await supabase
    .from("product_images")
    .insert(imageRecords);
  if (insertError) {
    const { error: cleanupError } = await supabase.storage
      .from(PRODUCT_IMAGE_BUCKET)
      .remove(uploadedPaths);
    if (cleanupError) {
      console.error("Shop image database rollback cleanup was incomplete.");
    }
    console.error("Shop image upload failed: image records could not be saved.");
    return { error: "Images uploaded but could not be attached to the product. Please retry." };
  }

  refreshShopPages();
  return { success: "Product images uploaded." };
}

export async function updateProductImageAction(
  _previousState: ShopActionState,
  formData: FormData,
): Promise<ShopActionState> {
  const supabase = await getAdminClient();
  const parsed = imageUpdateSchema.safeParse({
    imageId: String(formData.get("imageId") ?? ""),
    altText: String(formData.get("altText") ?? ""),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  });
  if (!parsed.success) {
    return { error: "Enter alt text (up to 250 characters) and a valid image order." };
  }

  const { error } = await supabase
    .from("product_images")
    .update({
      alt_text: parsed.data.altText,
      sort_order: parsed.data.sortOrder,
    })
    .eq("id", parsed.data.imageId);
  if (error) {
    console.error("Shop image update failed: database write was rejected.");
    return { error: "The image details could not be saved." };
  }

  refreshShopPages();
  return { success: "Image details saved." };
}

export async function deleteProductImageAction(
  _previousState: ShopActionState,
  formData: FormData,
): Promise<ShopActionState> {
  const supabase = await getAdminClient();
  const imageId = productIdSchema.safeParse(
    String(formData.get("imageId") ?? ""),
  );
  if (!imageId.success) return { error: "This image could not be identified." };

  const { data: image, error: imageReadError } = await supabase
    .from("product_images")
    .select("kind,path")
    .eq("id", imageId.data)
    .maybeSingle();
  if (imageReadError || !image) return { error: "The image could not be found." };

  if (image.kind === "storage") {
    const { error } = await supabase.storage
      .from(PRODUCT_IMAGE_BUCKET)
      .remove([image.path]);
    if (error) {
      console.error("Shop image deletion failed: storage removal was rejected.");
      return { error: "The uploaded file could not be removed. Nothing was deleted." };
    }
  }

  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId.data);
  if (error) {
    console.error("Shop image deletion failed: database row could not be removed.");
    return {
      error:
        image.kind === "storage"
          ? "The database record remains, but its uploaded file was removed. Refresh before retrying."
          : "The image record could not be removed.",
    };
  }

  refreshShopPages();
  return {
    success:
      image.kind === "static"
        ? "Image record deleted. The original file in /public was not removed."
        : "Uploaded image and its record deleted.",
  };
}
