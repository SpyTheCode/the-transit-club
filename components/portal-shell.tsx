import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { siteConfig } from "@/lib/site-config";

export function PortalShell({
  children,
  theme,
  title,
  wide = false,
  headerHref,
}: {
  children: ReactNode;
  theme: "malak" | "club";
  title?: string;
  wide?: boolean;
  headerHref?: string;
}) {
  const isMalak = theme === "malak";
  const brandLabel = isMalak
    ? siteConfig.brands.malak
    : siteConfig.brands.transitClub;
  const logo = isMalak
    ? { src: "/logo/malak-logo.jpg", width: 1342, height: 1194 }
    : { src: "/logo/transit-club-logo.png", width: 1000, height: 628 };
  const sectionHref = headerHref ?? (isMalak ? "/malak" : "/transit-club");

  return (
    <div className="portal-shell" data-theme={theme}>
      <header className="portal-header">
        <div className="portal-header-inner">
          <Link
            className="portal-brand"
            href={sectionHref}
            aria-label={`${brandLabel} home`}
          >
            <Image
              alt=""
              className={`portal-brand-logo portal-brand-logo-${theme}`}
              height={logo.height}
              priority
              src={logo.src}
              width={logo.width}
            />
            <span>{brandLabel}</span>
          </Link>

          <nav className="portal-nav" aria-label="Portal navigation">
            <Link href="/malak">{siteConfig.brands.malak}</Link>
            <Link href="/transit-club">{siteConfig.brands.transitClub}</Link>
            <Link href="/auth/sign-in">SIGN IN</Link>
          </nav>
        </div>
      </header>

      <main className={`portal-main${wide ? " portal-main-wide" : ""}`}>
        {title && <p className="portal-page-kicker">{brandLabel}</p>}
        {children}
      </main>

      <footer className="portal-footer">
        <div className="portal-footer-inner">
          <div className="portal-footer-brand-block">
            <p className="portal-footer-label">
              {siteConfig.brands.gateway}
            </p>
            <Link href="/" className="portal-footer-brand">
              <Image
                alt=""
                className="portal-footer-logo portal-footer-logo-malak"
                height={1194}
                src="/logo/malak-logo.jpg"
                width={1342}
              />
              <span>{siteConfig.brands.malak}</span>
            </Link>
          </div>
          <div className="portal-footer-brand-block">
            <p className="portal-footer-label">COMMUNITY</p>
            <Link href="/transit-club" className="portal-footer-brand">
              <Image
                alt=""
                className="portal-footer-logo portal-footer-logo-club"
                height={628}
                src="/logo/transit-club-logo.png"
                width={1000}
              />
              <span>{siteConfig.brands.transitClub}</span>
            </Link>
          </div>
          <div className="portal-footer-links">
            <a
              href={siteConfig.links.transitClubWhatsApp}
              target="_blank"
              rel="noreferrer"
            >
              TRANSIT CLUB WHATSAPP
            </a>
            <a
              href={siteConfig.links.transitClubInstagram}
              target="_blank"
              rel="noreferrer"
            >
              TRANSIT CLUB INSTAGRAM
            </a>
            {siteConfig.links.malakInstagram ? (
              <a
                href={siteConfig.links.malakInstagram}
                target="_blank"
                rel="noreferrer"
              >
                MALAK INSTAGRAM
              </a>
            ) : null}
            {siteConfig.contact.malakOrderWhatsAppNumber ? (
              <a
                href={`https://wa.me/${siteConfig.contact.malakOrderWhatsAppNumber}`}
                target="_blank"
                rel="noreferrer"
              >
                MALAK WHATSAPP
              </a>
            ) : null}
            {siteConfig.contact.email ? (
              <a href={`mailto:${siteConfig.contact.email}`}>
                {siteConfig.contact.email}
              </a>
            ) : null}
          </div>
        </div>
      </footer>
    </div>
  );
}
