import Link from "next/link";
import { PortalShell } from "@/components/portal-shell";
import { siteConfig } from "@/lib/site-config";

const services = [
  "Curated experiences and community infrastructure",
  "Cultural archiving and storytelling",
  "Small-batch custom production",
];

export default function MalakServicesPage() {
  return (
    <PortalShell theme="malak" title="SERVICES">
      <section className="portal-hero portal-hero-small">
        <div>
          <p className="portal-eyebrow">MALAK / SERVICES</p>
          <h1>Practical work with a long view.</h1>
        </div>
      </section>

      <section className="portal-grid portal-grid-three">
        {services.map((service) => (
          <article className="portal-panel" key={service}>
            <p className="portal-eyebrow">SERVICE</p>
            <h2>{service}</h2>
            <Link
              href={`mailto:${siteConfig.contact.email}?subject=${encodeURIComponent(`Enquiry: ${service}`)}`}
              className="portal-button portal-button-secondary"
            >
              START AN ENQUIRY
            </Link>
          </article>
        ))}
      </section>
    </PortalShell>
  );
}
