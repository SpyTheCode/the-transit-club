import "server-only";

import { revalidatePath } from "next/cache";

type MutationResult = {
  data: unknown;
  error: unknown;
};

export function hasAffectedRows(
  result: MutationResult,
  expectedCount = 1,
) {
  if (result.error !== null) return false;
  if (Array.isArray(result.data)) return result.data.length >= expectedCount;
  return result.data !== null && result.data !== undefined;
}

export function refreshShopPages() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/malak");
  revalidatePath("/malak/products");
  revalidatePath("/malak/products/[slug]", "page");
  revalidatePath("/malak/category/[slug]", "page");
}

export function refreshArchivePages() {
  revalidatePath("/transit-club");
  revalidatePath("/transit-club/archive");
  revalidatePath("/admin/archive");
}

export function refreshWaitlistPages() {
  revalidatePath("/admin/waitlist");
}
