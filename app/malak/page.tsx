import Image from "next/image";
import Link from "next/link";
import { PortalShell } from "@/components/portal-shell";

export default function MalakLandingPage() {
  return (
    <PortalShell theme="malak" title="MALAK">
      <section className="malak-landing-hero">
        <div className="malak-landing-copy">
          <p className="portal-eyebrow">RAW OBJECTS. FUNCTIONAL FORM.</p>
          <h1>Made for movement. Built to last.</h1>
          <p>
            A material-first practice for daily use. Keep the form clear. Let
            the work speak.
          </p>
          <div className="portal-hero-actions">
            <Link
              href="/malak/products"
              className="portal-button portal-button-primary"
            >
              SHOP MALAK
            </Link>
            <Link
              href="/malak/services"
              className="portal-button portal-button-secondary"
            >
              SERVICES
            </Link>
          </div>
        </div>
        <div className="malak-logo-feature malak-product-feature">
          <Image
            alt="Technical colorway reference for a MALAK bag"
            className="malak-product-feature-image"
            height={2700}
            priority
            quality={72}
            sizes="(max-width: 800px) 90vw, 48vw"
            src="/images/malak/malak-product-1.jpg"
            width={2160}
          />
        </div>
      </section>

      <section className="portal-grid portal-grid-two">
        <article className="portal-panel">
          <p className="portal-eyebrow">A PRACTICE</p>
          <h2>Utility in every line.</h2>
          <p>
            No excess. Form follows use. The catalogue is being prepared.
          </p>
          <Link
            href="/malak/products"
            className="portal-button portal-button-secondary"
          >
            VIEW THE CATALOGUE
          </Link>
        </article>
        <article className="portal-panel malak-portal-note">
          <p className="portal-eyebrow">THE TRANSIT CLUB</p>
          <h2>For the long way round.</h2>
          <p>Shared journeys, collected stories, and room to keep moving.</p>
          <Link
            href="/transit-club"
            className="portal-button portal-button-primary"
          >
            ENTER THE TRANSIT CLUB
          </Link>
        </article>
      </section>
      <section className="malak-secondary-section">
        <figure className="malak-secondary-image">
          <Image
            alt="MALAK wordmark over a close-up of a red technical bag on black"
            className="malak-secondary-image-photo"
            height={2700}
            loading="lazy"
            quality={68}
            sizes="(max-width: 800px) 90vw, 48vw"
            src="/images/malak/malak-product-2.jpg"
            width={2160}
          />
          <figcaption className="portal-eyebrow">
            MALAK / MATERIAL STUDY
          </figcaption>
        </figure>
        <div className="malak-secondary-copy">
          <p className="portal-eyebrow">FORM / DETAIL / FINISH</p>
          <h2>Objects with a point of view.</h2>
        </div>
      </section>
    </PortalShell>
  );
}
