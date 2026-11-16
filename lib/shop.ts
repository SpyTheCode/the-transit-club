import "server-only";

import { z } from "zod";
import {
  createSupabaseServerClient,
} from "@/lib/supabase/server";
import type {
  ShopCategory,
  ShopDataResult,
  ShopImage,
  ShopProduct,
} from "@/lib/shop-types";

const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  sort_order: z.number().int(),
});

const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  category_id: z.string().uuid(),
  description: z.string(),
  specs: z.array(z.string()),
  price_kobo: z.number().int().nonnegative().nullable(),
  status: z.enum(["available", "sold_out", "coming_soon"]),
  featured: z.boolean(),
  published: z.boolean(),
  sort_order: z.number().int(),
  created_at: z.string(),
  updated_at: z.string(),
});

const imageSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  kind: z.enum(["storage", "static"]),
  path: z.string(),
  alt_text: z.string(),
  sort_order: z.number().int(),
});

const PRODUCT_IMAGE_BUCKET = "product-images";

type CatalogRows = {
  categories: ShopCategory[];
  products: ShopProduct[];
};

async function readCatalogRows(
  includeUnpublished: boolean,
): Promise<ShopDataResult<CatalogRows>> {
  let supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  try {
    supabase = await createSupabaseServerClient();
  } catch {
    console.error("Shop catalog unavailable: Supabase client could not be created.");
    return { data: { categories: [], products: [] }, error: true };
  }

  try {
    const [categoryResult, productResult] = await Promise.all([
      supabase
        .from("categories")
        .select("id,name,slug,sort_order")
        .order("sort_order")
        .order("name"),
      (() => {
        let query = supabase
          .from("products")
          .select(
            "id,name,slug,category_id,description,specs,price_kobo,status,featured,published,sort_order,created_at,updated_at",
          )
          .order("featured", { ascending: false })
          .order("sort_order")
          .order("name");
        if (!includeUnpublished) query = query.eq("published", true);
        return query;
      })(),
    ]);

    if (categoryResult.error || productResult.error) {
      console.error("Shop catalog unavailable: a database query failed.");
      return { data: { categories: [], products: [] }, error: true };
    }

    const parsedCategories = z.array(categorySchema).safeParse(categoryResult.data);
    const parsedProducts = z.array(productSchema).safeParse(productResult.data);
    if (!parsedCategories.success || !parsedProducts.success) {
      console.error("Shop catalog unavailable: database data was invalid.");
      return { data: { categories: [], products: [] }, error: true };
    }

    const categories = parsedCategories.data;
    const products = parsedProducts.data;
    if (products.length === 0) {
      return { data: { categories, products: [] }, error: false };
    }

    const { data: imageRows, error: imageError } = await supabase
      .from("product_images")
      .select("id,product_id,kind,path,alt_text,sort_order")
      .in(
        "product_id",
        products.map((product) => product.id),
      )
      .order("sort_order")
      .order("id");

    if (imageError) {
      console.error("Shop catalog unavailable: product images could not load.");
      return { data: { categories: [], products: [] }, error: true };
    }

    const parsedImages = z.array(imageSchema).safeParse(imageRows);
    if (!parsedImages.success) {
      console.error("Shop catalog unavailable: image data was invalid.");
      return { data: { categories: [], products: [] }, error: true };
    }

    const categoryById = new Map(categories.map((category) => [category.id, category]));
    const imagesByProduct = new Map<string, ShopImage[]>();
    for (const image of parsedImages.data) {
      const src =
        image.kind === "static"
          ? image.path
          : supabase.storage
              .from(PRODUCT_IMAGE_BUCKET)
              .getPublicUrl(image.path).data.publicUrl;
      const item: ShopImage = { ...image, src };
      const existing = imagesByProduct.get(image.product_id) ?? [];
      existing.push(item);
      imagesByProduct.set(image.product_id, existing);
    }

    const joinedProducts: ShopProduct[] = [];
    for (const product of products) {
      const category = categoryById.get(product.category_id);
      if (!category) {
        console.error("Shop catalog unavailable: a product category is missing.");
        return { data: { categories: [], products: [] }, error: true };
      }
      joinedProducts.push({
        ...product,
        category,
        images: imagesByProduct.get(product.id) ?? [],
      });
    }

    return {
      data: { categories, products: joinedProducts },
      error: false,
    };
  } catch {
    console.error("Shop catalog unavailable: a database request failed.");
    return { data: { categories: [], products: [] }, error: true };
  }
}

export async function getPublishedCatalog() {
  return readCatalogRows(false);
}

export async function getAdminCatalog() {
  return readCatalogRows(true);
}

export async function getPublishedCategory(slug: string) {
  const result = await getPublishedCatalog();
  if (result.error) {
    return { category: null, categories: [], products: [], error: true };
  }
  const category = result.data.categories.find((item) => item.slug === slug) ?? null;
  return {
    category,
    categories: result.data.categories,
    products: category
      ? result.data.products.filter((product) => product.category_id === category.id)
      : [],
    error: false,
  };
}

export async function getPublishedProduct(slug: string) {
  const result = await getPublishedCatalog();
  if (result.error) {
    return { product: null, error: true };
  }
  return {
    product: result.data.products.find((item) => item.slug === slug) ?? null,
    error: false,
  };
}
