import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { PortalShell } from "@/components/portal-shell";
import { ARCHIVE_KINDS, getArchiveItems, type ArchiveKind } from "@/lib/archive";

const kindLabels: Record<ArchiveKind, string> = {
  lookbook: "LOOKBOOK",
  zine: "ZINE",
  moodboard: "MOODBOARD",
  retreat: "RETREAT",
};

function ArchiveCard({
  item,
}: {
  item: Awaited<ReturnType<typeof getArchiveItems>>["items"][number];
}) {
  return (
    <article className="archive-card">
      {item.image_src ? (
        <div className="archive-card-image">
          <Image
            alt={item.alt_text || item.title}
            fill
            loading="lazy"
            quality={65}
            sizes="(max-width: 600px) 90vw, (max-width: 900px) 45vw, 30vw"
            src={item.image_src}
          />
        </div>
      ) : (
        <div className="archive-card-image archive-image-empty">
          NO IMAGE YET
        </div>
      )}
      <div className="archive-card-copy">
        <p className="archive-card-meta">
          <span>{kindLabels[item.kind]}</span>
          {item.year && <span>{item.year}</span>}
        </p>
        <h2>{item.title}</h2>
        {item.caption && <p>{item.caption}</p>}
      </div>
    </article>
  );
}

function ArchiveLoading() {
  return (
    <div className="club-state" role="status">
      <p className="portal-eyebrow">THE TRANSIT CLUB / ARCHIVE</p>
      <h2>Loading collected stories.</h2>
    </div>
  );
}

async function ArchiveContent({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string | string[] }>;
}) {
  const search = await searchParams;
  const requestedKind = Array.isArray(search.kind)
    ? search.kind[0]
    : search.kind;
  const selectedKind = ARCHIVE_KINDS.find((kind) => kind === requestedKind);
  const result = await getArchiveItems({ kind: selectedKind });

  return (
    <>
      <nav className="archive-filters" aria-label="Filter archive by kind">
        <Link
          className={`archive-filter${selectedKind ? "" : " is-selected"}`}
          href="/transit-club/archive"
        >
          ALL
        </Link>
        {ARCHIVE_KINDS.map((kind) => (
          <Link
            className={`archive-filter${selectedKind === kind ? " is-selected" : ""}`}
            href={`/transit-club/archive?kind=${kind}`}
            key={kind}
          >
            {kindLabels[kind]}
          </Link>
        ))}
      </nav>

      {result.error ? (
        <div className="club-state" role="status">
          <h2>Stories are taking a pause.</h2>
          <p>The archive is temporarily unavailable. Please try again later.</p>
        </div>
      ) : result.items.length ? (
        <div className="archive-grid">
          {result.items.map((item) => (
            <ArchiveCard item={item} key={item.id} />
          ))}
        </div>
      ) : (
        <div className="club-state" role="status">
          <h2>Nothing collected here yet.</h2>
          <p>New stories will appear when they are ready.</p>
        </div>
      )}
    </>
  );
}

export function TransitClubArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string | string[] }>;
}) {
  return (
    <PortalShell theme="club" title="THE TRANSIT CLUB / ARCHIVE">
      <section className="portal-hero portal-hero-small">
        <div>
          <p className="portal-eyebrow">THE TRANSIT CLUB / ARCHIVE</p>
          <h1>Stories, collected.</h1>
        </div>
      </section>
      <Suspense fallback={<ArchiveLoading />}>
        <ArchiveContent searchParams={searchParams} />
      </Suspense>
    </PortalShell>
  );
}

export async function ArchivePreview() {
  const result = await getArchiveItems({ limit: 3, latest: true });

  return (
    <section className="archive-preview" aria-labelledby="archive-preview-title">
      <div className="archive-preview-heading">
        <div>
          <p className="eyebrow">Collected along the way</p>
          <h2 id="archive-preview-title">From the archive</h2>
        </div>
        <Link className="text-link" href="/transit-club/archive">
          OPEN THE ARCHIVE
        </Link>
      </div>
      {result.error ? (
        <p className="archive-preview-note" role="status">
          The archive is temporarily unavailable.
        </p>
      ) : result.items.length ? (
        <div className="archive-preview-grid">
          {result.items.map((item) => (
            <ArchiveCard item={item} key={item.id} />
          ))}
        </div>
      ) : (
        <p className="archive-preview-note">
          New stories will appear here when they are ready.
        </p>
      )}
      <Link className="portal-button portal-button-secondary" href="/transit-club/waitlist">
        JOIN THE WAITLIST
      </Link>
    </section>
  );
}
