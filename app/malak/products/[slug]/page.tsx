import { Suspense } from "react";
import { PortalComingSoon } from "@/components/portal-coming-soon";

async function ProductComingSoon({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <PortalComingSoon
      theme="malak"
      section="MALAK / PRODUCT"
      headline={slug.replace(/-/g, " ")}
      description="Product details are coming soon."
      backHref="/malak/products"
      backLabel="BACK TO THE CATALOGUE"
    />
  );
}

export default function MalakProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <PortalComingSoon
          theme="malak"
          section="MALAK / PRODUCT"
          headline="Product details."
          description="Product details are coming soon."
          backHref="/malak/products"
          backLabel="BACK TO THE CATALOGUE"
        />
      }
    >
      <ProductComingSoon params={params} />
    </Suspense>
  );
}
