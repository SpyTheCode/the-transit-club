import { Suspense } from "react";
import { PortalComingSoon } from "@/components/portal-coming-soon";

async function CategoryComingSoon({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <PortalComingSoon
      theme="malak"
      section="MALAK / CATEGORY"
      headline={slug.replace(/-/g, " ")}
      description="This category is being prepared. Check back soon."
      backHref="/malak/products"
      backLabel="BACK TO THE CATALOGUE"
    />
  );
}

export default function MalakCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <PortalComingSoon
          theme="malak"
          section="MALAK / CATEGORY"
          headline="Category details."
          description="This category is being prepared. Check back soon."
          backHref="/malak/products"
          backLabel="BACK TO THE CATALOGUE"
        />
      }
    >
      <CategoryComingSoon params={params} />
    </Suspense>
  );
}
