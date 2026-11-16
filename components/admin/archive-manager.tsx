"use client";

import Image from "next/image";
import { useActionState } from "react";
import {
  deleteArchiveItemAction,
  saveArchiveItemAction,
  type ArchiveActionState,
} from "@/app/(protected)/admin/archive/actions";
import type { ArchiveItem, ArchiveKind } from "@/lib/archive";

const initialState: ArchiveActionState = {};
const kinds: ArchiveKind[] = ["lookbook", "zine", "moodboard", "retreat"];

function ActionMessage({ state }: { state: ArchiveActionState }) {
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

function ArchiveForm({ item }: { item?: ArchiveItem }) {
  const [state, formAction, pending] = useActionState(
    saveArchiveItemAction,
    initialState,
  );

  return (
    <form action={formAction} className="admin-product-form">
      {item && <input name="id" type="hidden" value={item.id} />}
      {item?.image_path && (
        <div className="admin-archive-current-image">
          {item.image_src && (
            <Image
              alt={item.alt_text || item.title}
              fill
              quality={55}
              sizes="120px"
              src={item.image_src}
            />
          )}
          <span>
            Current image: {item.image_kind === "static" ? "static file" : "uploaded"}
          </span>
        </div>
      )}
      <div className="admin-form-grid">
        <label>
          Title
          <input
            defaultValue={item?.title ?? ""}
            maxLength={160}
            name="title"
            required
          />
        </label>
        <label>
          Slug (lowercase with hyphens)
          <input
            defaultValue={item?.slug ?? ""}
            maxLength={180}
            name="slug"
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            required
          />
        </label>
        <label>
          Kind
          <select defaultValue={item?.kind ?? "lookbook"} name="kind">
            {kinds.map((kind) => (
              <option key={kind} value={kind}>
                {kind.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <label>
          Year (optional)
          <input
            defaultValue={item?.year ?? ""}
            max={3000}
            min={1000}
            name="year"
            type="number"
          />
        </label>
        <label>
          Sort order
          <input
            defaultValue={item?.sort_order ?? 0}
            min={0}
            name="sortOrder"
            type="number"
          />
        </label>
        <label>
          Image (optional; JPG, PNG, or WebP up to 5 MB)
          <input
            accept="image/jpeg,image/png,image/webp"
            name="image"
            type="file"
          />
        </label>
      </div>
      <label>
        Caption
        <textarea
          defaultValue={item?.caption ?? ""}
          maxLength={4000}
          name="caption"
          rows={3}
        />
      </label>
      <label>
        Image alt text
        <input
          defaultValue={item?.alt_text ?? ""}
          maxLength={250}
          name="altText"
        />
      </label>
      <div className="admin-checkboxes">
        <label>
          <input
            defaultChecked={item?.published ?? false}
            name="published"
            type="checkbox"
          />
          Published
        </label>
      </div>
      {item?.image_kind === "static" && (
        <p className="admin-field-help">
          Replacing a static image does not delete its original file from the project.
        </p>
      )}
      <ActionMessage state={state} />
      <button className="button button-primary" disabled={pending}>
        {pending ? "SAVING..." : item ? "SAVE ARCHIVE ITEM" : "ADD ARCHIVE ITEM"}
      </button>
    </form>
  );
}

function DeleteArchiveForm({ item }: { item: ArchiveItem }) {
  const [state, formAction, pending] = useActionState(
    deleteArchiveItemAction,
    initialState,
  );
  return (
    <div className="admin-delete-product">
      <form action={formAction}>
        <input name="itemId" type="hidden" value={item.id} />
        <button
          className="button button-danger"
          disabled={pending}
          onClick={(event) => {
            if (!window.confirm(`Delete "${item.title}" from the archive?`)) {
              event.preventDefault();
            }
          }}
        >
          {pending ? "DELETING..." : "DELETE ITEM"}
        </button>
      </form>
      <ActionMessage state={state} />
    </div>
  );
}

export function ArchiveManager({ items }: { items: ArchiveItem[] }) {
  return (
    <div className="admin-product-manager">
      <section className="admin-product-create">
        <p className="portal-eyebrow">NEW ENTRY</p>
        <h2>Add an archive item</h2>
        <ArchiveForm />
      </section>
      <section className="admin-product-list">
        <div className="admin-product-list-heading">
          <div>
            <p className="portal-eyebrow">COLLECTED STORIES</p>
            <h2>Archive ({items.length})</h2>
          </div>
          <p>Unpublished items stay out of public pages.</p>
        </div>
        {items.length ? (
          items.map((item) => (
            <details className="admin-product-editor" key={item.id}>
              <summary>
                <span>{item.title}</span>
                <span>{item.published ? "PUBLISHED" : "HIDDEN"}</span>
                <span>{item.kind.toUpperCase()}</span>
                <span>{item.year ?? "NO YEAR"}</span>
              </summary>
              <div className="admin-product-editor-body">
                <ArchiveForm item={item} />
                <DeleteArchiveForm item={item} />
              </div>
            </details>
          ))
        ) : (
          <div className="club-state">
            <h3>No archive items yet.</h3>
            <p>Add the first item above. Nothing has been seeded.</p>
          </div>
        )}
      </section>
    </div>
  );
}
