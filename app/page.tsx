import Link from "next/link";
import { PortalShell } from "@/components/portal-shell";
import { siteConfig } from "@/lib/site-config";

export default function GatewayPage() {
  return (
    <PortalShell theme="malak" headerHref="/">
      <section className="gateway-hero">
        <p className="portal-eyebrow">{siteConfig.brands.gateway} / TWO WORLDS</p>
        <h1>
          Made to move.
          <br />
          Built to connect.
        </h1>
        <p className="gateway-intro">
          Objects for the everyday. Journeys shared with others.
        </p>
        <div className="gateway-pathways">
          <Link className="gateway-pathway gateway-pathway-malak" href="/malak">
            <span className="gateway-pathway-number">01</span>
            <span className="gateway-pathway-title">SHOP MALAK</span>
            <span className="gateway-pathway-note">Objects / Services</span>
          </Link>
          <Link
            className="gateway-pathway gateway-pathway-club"
            href="/transit-club"
          >
            <span className="gateway-pathway-number">02</span>
            <span className="gateway-pathway-title">
              ENTER THE TRANSIT CLUB
            </span>
            <span className="gateway-pathway-note">Gatherings / Archive</span>
          </Link>
        </div>
        <div aria-hidden="true" className="gateway-grid-lines" />
      </section>
      <section className="gateway-statement">
        <p className="portal-eyebrow">MALAK / COMMUNITY</p>
        <p>
          One point of origin. Different ways forward.
        </p>
      </section>
    </PortalShell>
  );
}
