import Link from "next/link";
import { PortalShell } from "@/components/portal-shell";

export function PortalComingSoon({
  theme,
  section,
  headline,
  description,
  backHref,
  backLabel,
}: {
  theme: "malak" | "club";
  section: string;
  headline: string;
  description: string;
  backHref: string;
  backLabel: string;
}) {
  return (
    <PortalShell theme={theme} title={section}>
      <section className="portal-hero portal-hero-small">
        <div>
          <p className="portal-eyebrow">{section}</p>
          <h1>{headline}</h1>
        </div>
      </section>
      <section className="portal-panel portal-placeholder">
        <p className="portal-coming-soon-label">COMING SOON</p>
        <p>{description}</p>
        <Link className="portal-button portal-button-primary" href={backHref}>
          {backLabel}
        </Link>
      </section>
    </PortalShell>
  );
}
