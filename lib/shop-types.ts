export type ProductStatus = "available" | "sold_out" | "coming_soon";

export type ShopCategory = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

export type ShopImage = {
  id: string;
  product_id: string;
  kind: "storage" | "static";
  path: string;
  alt_text: string;
  sort_order: number;
  src: string;
};

export type ShopProduct = {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  description: string;
  specs: string[];
  price_kobo: number | null;
  status: ProductStatus;
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  category: ShopCategory;
  images: ShopImage[];
};

export type ShopDataResult<T> = {
  data: T;
  error: boolean;
};
