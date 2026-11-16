import { Suspense } from "react";
import {
  ProductDetailContent,
  ProductDetailFallback,
} from "@/components/shop-public";

export default function MalakProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<ProductDetailFallback />}>
      <ProductDetailContent params={params} />
    </Suspense>
  );
}
