import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PortalShell } from "@/components/portal-shell";
import { ProductOrderLink } from "@/components/product-order-link";
import { getPublishedCatalog, getPublishedCategory, getPublishedProduct } from "@/lib/shop";
import { formatKoboAsNaira } from "@/lib/shop-format";
import type { ShopCategory, ShopProduct } from "@/lib/shop-types";

function ProductStatus({ status }: { status: ShopProduct["status"] }) {
  const label =
    status === "available"
      ? "AVAILABLE"
      : status === "sold_out"
        ? "SOLD OUT"
        : "COMING SOON";
  return <span className={`product-status product-status-${status}`}>{label}</span>;
}

function ProductCard({ product }: { product: ShopProduct }) {
  const image = product.images[0];
  return (
    <article className="product-card">
      <Link
        className="product-card-image"
        href={`/malak/products/${product.slug}`}
        aria-label={`View ${product.name}`}
      >
        {image ? (
          <Image
            alt={image.alt_text || product.name}
            fill
            loading="lazy"
            quality={65}
            sizes="(max-width: 600px) 90vw, (max-width: 900px) 45vw, 30vw"
            src={image.src}
          />
        ) : (
          <span className="product-image-empty">IMAGE COMING SOON</span>
        )}
      </Link>
      <div className="product-card-copy">
        <p className="product-card-category">{product.category.name}</p>
        <h2>
          <Link href={`/malak/products/${product.slug}`}>{product.name}</Link>
        </h2>
        <div className="product-card-meta">
          <ProductStatus status={product.status} />
          {product.price_kobo !== null && (
            <span className="product-price">
              {formatKoboAsNaira(product.price_kobo)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function CatalogFailure({ message }: { message: string }) {
  return (
    <div className="shop-message" role="status">
      <p className="portal-eyebrow">MALAK / CATALOGUE</p>
      <h2>{message}</h2>
      <p>The catalog is temporarily unavailable. Please try again later.</p>
    </div>
  );
}

function CatalogChips({
  categories,
  selectedSlug,
}: {
  categories: ShopCategory[];
  selectedSlug?: string;
}) {
  return (
    <nav className="catalog-filters" aria-label="Product categories">
      <Link
        className={`catalog-filter${selectedSlug ? "" : " is-selected"}`}
        href="/malak/products"
      >
        ALL
      </Link>
      {categories.map((category) => (
        <Link
          className={`catalog-filter${selectedSlug === category.slug ? " is-selected" : ""}`}
          href={`/malak/category/${category.slug}`}
          key={category.id}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}

async function ProductGridContent({
  categorySlug,
}: {
  categorySlug?: string;
}) {
  let categories: ShopCategory[];
  let products: ShopProduct[];
  if (categorySlug) {
    const result = await getPublishedCategory(categorySlug);
    if (result.error) {
      return <CatalogFailure message="We could not load the catalog right now." />;
    }
    if (!result.category) notFound();
    categories = result.categories;
    products = result.products;
  } else {
    const result = await getPublishedCatalog();
    if (result.error) {
      return <CatalogFailure message="We could not load the catalog right now." />;
    }
    categories = result.data.categories;
    products = result.data.products;
  }

  return (
    <>
      <CatalogChips categories={categories} selectedSlug={categorySlug} />
      {products.length ? (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="shop-message" role="status">
          <p className="portal-eyebrow">MALAK / CATALOGUE</p>
          <h2>No products here yet.</h2>
          <p>New work will appear here when it is ready.</p>
        </div>
      )}
    </>
  );
}

export function ProductGrid({
  categorySlug,
}: {
  categorySlug?: string;
}) {
  return (
    <Suspense
      fallback={
        <div className="shop-message" role="status">
          <p className="portal-eyebrow">MALAK / CATALOGUE</p>
          <h2>Loading the catalog.</h2>
        </div>
      }
    >
      <ProductGridContent categorySlug={categorySlug} />
    </Suspense>
  );
}

export function CatalogFallback() {
  return (
    <PortalShell theme="malak" title="MALAK / CATEGORY">
      <div className="shop-message" role="status">
        <p className="portal-eyebrow">MALAK / CATALOGUE</p>
        <h2>Loading the catalog.</h2>
      </div>
    </PortalShell>
  );
}

export function CatalogPage({ categorySlug }: { categorySlug?: string }) {
  const title = categorySlug ? "MALAK / CATEGORY" : "MALAK / CATALOGUE";
  return (
    <PortalShell theme="malak" title={title}>
      <section className="portal-hero portal-hero-small">
        <div>
          <p className="portal-eyebrow">{title}</p>
          <h1>{categorySlug ? "A focused selection." : "Objects for daily use."}</h1>
        </div>
      </section>
      <ProductGrid categorySlug={categorySlug} />
    </PortalShell>
  );
}

export async function ProductDetailContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getPublishedProduct(slug);
  if (result.error) {
    return (
      <PortalShell theme="malak" title="MALAK / PRODUCT">
        <CatalogFailure message="We could not load this product." />
      </PortalShell>
    );
  }
  if (!result.product) notFound();

  const product = result.product;
  return (
    <PortalShell theme="malak" title="MALAK / PRODUCT">
      <section className="product-detail">
        <div className="product-gallery">
          {product.images.length ? (
            product.images.map((image, index) => (
              <div className="product-detail-image" key={image.id}>
                <Image
                  alt={image.alt_text || `${product.name}, image ${index + 1}`}
                  fill
                  loading={index === 0 ? "eager" : "lazy"}
                  priority={index === 0}
                  quality={70}
                  sizes="(max-width: 800px) 90vw, 55vw"
                  src={image.src}
                />
              </div>
            ))
          ) : (
            <div className="product-detail-image product-image-empty">
              IMAGE COMING SOON
            </div>
          )}
        </div>
        <div className="product-detail-copy">
          <p className="portal-eyebrow">{product.category.name}</p>
          <h1>{product.name}</h1>
          <ProductStatus status={product.status} />
          {product.price_kobo !== null && (
            <p className="product-detail-price">
              {formatKoboAsNaira(product.price_kobo)}
            </p>
          )}
          {product.description && <p className="product-description">{product.description}</p>}
          {product.specs.length > 0 && (
            <section className="product-specs">
              <h2>DETAILS</h2>
              <ul>
                {product.specs.map((spec, index) => (
                  <li key={`${spec}-${index}`}>{spec}</li>
                ))}
              </ul>
            </section>
          )}
          {product.status === "available" && (
            <ProductOrderLink productName={product.name} />
          )}
          <Link className="portal-button portal-button-secondary" href="/malak/products">
            BACK TO CATALOGUE
          </Link>
        </div>
      </section>
    </PortalShell>
  );
}

export function ProductDetailFallback() {
  return (
    <PortalShell theme="malak" title="MALAK / PRODUCT">
      <div className="shop-message" role="status">
        <p className="portal-eyebrow">MALAK / PRODUCT</p>
        <h2>Loading product details.</h2>
      </div>
    </PortalShell>
  );
}
