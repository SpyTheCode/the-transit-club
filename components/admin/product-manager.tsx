"use client";

import Image from "next/image";
import { useActionState } from "react";
import {
  deleteProductAction,
  deleteProductImageAction,
  saveProductAction,
  updateProductImageAction,
  uploadProductImagesAction,
  type ShopActionState,
} from "@/app/(protected)/admin/products/actions";
import { formatKoboAsNaira } from "@/lib/shop-format";
import type { ShopCategory, ShopImage, ShopProduct } from "@/lib/shop-types";

const initialState: ShopActionState = {};

function ActionMessage({ state }: { state: ShopActionState }) {
  if (state.error) {
    return (
      <p className="admin-action-message admin-action-error" role="alert">
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p className="admin-action-message admin-action-success" role="status">
        {state.success}
      </p>
    );
  }
  return null;
}

function ProductForm({
  categories,
  product,
}: {
  categories: ShopCategory[];
  product?: ShopProduct;
}) {
  const [state, formAction, pending] = useActionState(
    saveProductAction,
    initialState,
  );

  return (
    <form action={formAction} className="admin-product-form">
      {product && <input name="id" type="hidden" value={product.id} />}
      <div className="admin-form-grid">
        <label>
          Product name
          <input
            defaultValue={product?.name ?? ""}
            maxLength={120}
            name="name"
            required
          />
        </label>
        <label>
          URL slug (lowercase, use hyphens)
          <input
            defaultValue={product?.slug ?? ""}
            maxLength={140}
            name="slug"
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            required
          />
        </label>
        <label>
          Category
          <select
            defaultValue={product?.category_id ?? categories[0]?.id ?? ""}
            name="categoryId"
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Price in naira (optional)
          <input
            defaultValue={
              product?.price_kobo == null
                ? ""
                : (product.price_kobo / 100).toFixed(2)
            }
            inputMode="decimal"
            name="priceNaira"
            placeholder="Leave blank if not set"
            step="0.01"
            type="number"
          />
        </label>
        <label>
          Status
          <select defaultValue={product?.status ?? "coming_soon"} name="status">
            <option value="available">Available</option>
            <option value="sold_out">Sold out</option>
            <option value="coming_soon">Coming soon</option>
          </select>
        </label>
        <label>
          Sort order
          <input
            defaultValue={product?.sort_order ?? 0}
            min={0}
            name="sortOrder"
            type="number"
          />
        </label>
      </div>

      <label>
        Description
        <textarea
          defaultValue={product?.description ?? ""}
          maxLength={5000}
          name="description"
          rows={4}
        />
      </label>
      <label>
        Specifications (one short line per item)
        <textarea
          defaultValue={product?.specs.join("\n") ?? ""}
          maxLength={8000}
          name="specs"
          rows={4}
        />
      </label>

      <div className="admin-checkboxes">
        <label>
          <input
            defaultChecked={product?.featured ?? false}
            name="featured"
            type="checkbox"
          />
          Featured
        </label>
        <label>
          <input
            defaultChecked={product?.published ?? false}
            name="published"
            type="checkbox"
          />
          Published
        </label>
      </div>
      <ActionMessage state={state} />
      <button className="button button-primary" disabled={pending}>
        {pending ? "Saving..." : product ? "SAVE PRODUCT" : "ADD PRODUCT"}
      </button>
    </form>
  );
}

function ImageUploadForm({ product }: { product: ShopProduct }) {
  const [state, formAction, pending] = useActionState(
    uploadProductImagesAction,
    initialState,
  );
  return (
    <form action={formAction} className="admin-image-upload">
      <input name="productId" type="hidden" value={product.id} />
      <label>
        Upload images
        <input
          accept="image/jpeg,image/png,image/webp"
          multiple
          name="images"
          type="file"
        />
      </label>
      <p className="admin-field-help">
        JPG, PNG, or WebP. Up to five images per upload, 5 MB each. New image
        alt text starts with the product name and can be edited below.
      </p>
      <ActionMessage state={state} />
      <button className="button button-secondary" disabled={pending}>
        {pending ? "Uploading..." : "UPLOAD IMAGES"}
      </button>
    </form>
  );
}

function ProductImageEditor({
  image,
}: {
  image: ShopImage;
}) {
  const [state, formAction, pending] = useActionState(
    updateProductImageAction,
    initialState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteProductImageAction,
    initialState,
  );

  return (
    <div className="admin-image-row">
      <div className="admin-image-preview">
        <Image
          alt=""
          fill
          quality={55}
          sizes="96px"
          src={image.src}
        />
      </div>
      <div className="admin-image-controls">
        <form action={formAction} className="admin-image-edit-form">
          <input name="imageId" type="hidden" value={image.id} />
          <label>
            Alt text
            <input
              defaultValue={image.alt_text}
              maxLength={250}
              name="altText"
            />
          </label>
          <label>
            Order
            <input
              defaultValue={image.sort_order}
              min={0}
              name="sortOrder"
              type="number"
            />
          </label>
          <button className="button button-secondary" disabled={pending}>
            SAVE IMAGE
          </button>
        </form>
        <form action={deleteAction}>
          <input name="imageId" type="hidden" value={image.id} />
          <button
            className="button button-danger"
            disabled={deletePending}
            onClick={(event) => {
              if (!window.confirm("Delete this image record?")) {
                event.preventDefault();
              }
            }}
          >
            {deletePending ? "Deleting..." : "DELETE IMAGE"}
          </button>
        </form>
        <p className="admin-field-help">
          {image.kind === "static"
            ? "Static image: deleting removes only its database record, not the file in /public."
            : "Uploaded image: deleting removes the storage file and database record."}
        </p>
        <ActionMessage state={state} />
        <ActionMessage state={deleteState} />
      </div>
    </div>
  );
}

function DeleteProductForm({ product }: { product: ShopProduct }) {
  const [state, formAction, pending] = useActionState(
    deleteProductAction,
    initialState,
  );
  return (
    <div className="admin-delete-product">
      <form action={formAction}>
        <input name="productId" type="hidden" value={product.id} />
        <button
          className="button button-danger"
          disabled={pending}
          onClick={(event) => {
            if (
              !window.confirm(
                `Delete "${product.name}" and its uploaded images? Static files in /public will remain.`,
              )
            ) {
              event.preventDefault();
            }
          }}
        >
          {pending ? "Deleting..." : "DELETE PRODUCT"}
        </button>
      </form>
      <ActionMessage state={state} />
    </div>
  );
}

function ProductEditor({
  categories,
  product,
}: {
  categories: ShopCategory[];
  product: ShopProduct;
}) {
  return (
    <details className="admin-product-editor">
      <summary>
        <span>{product.name}</span>
        <span>{product.published ? "PUBLISHED" : "HIDDEN"}</span>
        <span>{product.status.replace("_", " ")}</span>
        <span>
          {product.price_kobo == null
            ? "NO PRICE"
            : formatKoboAsNaira(product.price_kobo)}
        </span>
      </summary>
      <div className="admin-product-editor-body">
        <ProductForm categories={categories} product={product} />
        <section className="admin-product-images">
          <h3>PRODUCT IMAGES</h3>
          <p>
            Deleting a starter image removes it from the site and its database
            record, but the original file stays in the project under /public.
          </p>
          <ImageUploadForm product={product} />
          {product.images.map((image) => (
            <ProductImageEditor image={image} key={image.id} />
          ))}
          {!product.images.length && (
            <p className="admin-field-help">No images have been added.</p>
          )}
        </section>
        <DeleteProductForm product={product} />
      </div>
    </details>
  );
}

export function ProductManager({
  categories,
  products,
}: {
  categories: ShopCategory[];
  products: ShopProduct[];
}) {
  return (
    <div className="admin-product-manager">
      <section className="admin-product-create">
        <p className="portal-eyebrow">NEW ENTRY</p>
        <h2>Add a product</h2>
        {categories.length ? (
          <ProductForm categories={categories} />
        ) : (
          <p className="admin-action-message admin-action-error" role="alert">
            No categories are available. Run the shop schema setup first.
          </p>
        )}
      </section>

      <section className="admin-product-list">
        <div className="admin-product-list-heading">
          <div>
            <p className="portal-eyebrow">CATALOGUE CONTROL</p>
            <h2>Products ({products.length})</h2>
          </div>
          <p>Unpublished products are visible here but hidden from public pages.</p>
        </div>
        {products.length ? (
          products.map((product) => (
            <ProductEditor
              categories={categories}
              key={product.id}
              product={product}
            />
          ))
        ) : (
          <p className="admin-field-help">
            No products yet. Add one above or run the starter seed in the shop
            schema.
          </p>
        )}
      </section>
    </div>
  );
}
