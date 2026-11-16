import { Suspense } from "react";
import { CatalogFallback, CatalogPage } from "@/components/shop-public";

async function CategoryCatalog({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CatalogPage categorySlug={slug} />;
}

export default function MalakCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={<CatalogFallback />}
    >
      <CategoryCatalog params={params} />
    </Suspense>
  );
}
