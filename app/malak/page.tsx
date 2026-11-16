import Image from "next/image";
import Link from "next/link";
import { PortalShell } from "@/components/portal-shell";
import { siteConfig } from "@/lib/site-config";

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
        <div className="malak-logo-feature">
          <Image
            alt={`${siteConfig.brands.malak} logo`}
            className="malak-logo-feature-image"
            height={1194}
            priority
            sizes="(max-width: 700px) 90vw, 42vw"
            src="/logo/malak-logo.jpg"
            width={1342}
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
    </PortalShell>
  );
}
