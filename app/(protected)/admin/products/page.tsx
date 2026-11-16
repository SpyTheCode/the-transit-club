import { connection } from "next/server";
import { AdminNavigation } from "@/app/(protected)/admin/admin-navigation";
import { ProductManager } from "@/components/admin/product-manager";
import { getAdminCatalog } from "@/lib/shop";
import { requireRole } from "@/lib/supabase/server";

export const instant = false;

export default async function AdminProductsPage() {
  await connection();
  await requireRole(["admin"]);
  const result = await getAdminCatalog();

  return (
    <>
      <AdminNavigation />
      <section className="admin-products-page">
        <p className="portal-eyebrow">MALAK / ADMINISTRATION</p>
        <h1>Product control.</h1>
        <p className="admin-products-intro">
          Add and edit catalog entries, visibility, images, and sort order.
          Product prices are entered in naira and stored in kobo.
        </p>
        {result.error ? (
          <div className="admin-shop-error" role="alert">
            <h2>Shop data is not available.</h2>
            <p>
              Run <code>supabase/schema-shop.sql</code> in the Supabase SQL
              Editor, then reload this page.
            </p>
          </div>
        ) : (
          <ProductManager
            categories={result.data.categories}
            products={result.data.products}
          />
        )}
      </section>
    </>
  );
}
